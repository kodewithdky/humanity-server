import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendOtpOnMail, sendVerificationMail } from "../helpers/email.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

//genrate access and refresh token
const generateAcessAndRefreshTokens = async (userId) => {
   const user = await User.findById(userId);
   const accessToken = user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();
   user.refreshToken = refreshToken;
   await user.save({ validateBeforeSave: false });
   return { accessToken, refreshToken };
};

//cookie option
const options = {
   httpOnly: true,
   secure: true,
};

//signup
const signup = asyncHandler(async (req, res, next) => {
   const { name, email, password } = req.body;
   if (!name || !email || !password) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Name, Email and Password is required!"
         )
      );
   }
   const user = await User.findOne({
      $or: [{ email }],
   });
   if (user) {
      return next(new ApiError(StatusCodes.CONFLICT, "User already exist!"));
   }
   const newUser = await User.create({
      name,
      email,
      password,
   });
   const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
   );
   if (!createdUser) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Something went wrong while registering user!"
         )
      );
   }
   sendVerificationMail(name, email, createdUser._id);
   return res
      .status(StatusCodes.CREATED)
      .json(
         new ApiResponse(
            StatusCodes.CREATED,
            createdUser,
            "User registered successfully! Please verify your email."
         )
      );
});

//verify email
const verifyEmail = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const user = await User.findById({ _id: id });
   if (user.is_verified) {
      return next(
         new ApiError(StatusCodes.CONFLICT, "Email already verified!")
      );
   }
   await User.updateOne({ _id: id }, { $set: { is_verified: 1 } });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Email verified successfully!")
      );
});

//send verification link
const sendVerificationLink = asyncHandler(async (req, res, next) => {
   const { email } = req.body;
   if (!email) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Email is required!"));
   }
   const user = await User.findOne({ email });
   if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email!"));
   }
   if (user.is_verified != 0) {
      return next(
         new ApiError(StatusCodes.CONFLICT, "Email already verified!")
      );
   }
   sendVerificationMail(user.name, email, user._id);
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            {},
            "Email verification link send successfully to your email!"
         )
      );
});

//signin
const signin = asyncHandler(async (req, res, next) => {
   const { email, password } = req.body;
   if (!email) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Email is required!"));
   }
   if (!password) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Password is required!")
      );
   }
   const user = await User.findOne({
      $or: [{ email }],
   });
   if (!user) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials!")
      );
   }
   const isPasswordCorrect = await user.isPasswordCorrect(password);
   if (!isPasswordCorrect) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials!")
      );
   }
   const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(
      user._id
   );
   const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );
   return res
      .status(StatusCodes.OK)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            { user: loggedInUser, accessToken, refreshToken },
            "User logged in successfully!"
         )
      );
});

//logout user
const logoutUser = asyncHandler(async (req, res, next) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined || "",
         },
      },
      {
         new: true,
      }
   );
   return res
      .status(StatusCodes.OK)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(StatusCodes.OK, {}, "User logged out!"));
});

//refress access token
const refreshAccessToken = asyncHandler(async (req, res, next) => {
   const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
   if (!incomingRefreshToken) {
      return next(
         new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request!")
      );
   }
   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
      );
      if (!user) {
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token!")
         );
      }
      const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(
         user._id
      );
      return res
         .status(StatusCodes.OK)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", incomingRefreshToken, options)
         .json(
            new ApiResponse(
               StatusCodes.OK,
               {
                  user,
                  accessToken: accessToken,
                  refreshToken: incomingRefreshToken,
               },
               "Access token refreshed!"
            )
         );
   } catch (error) {
      return next(
         new ApiError(
            StatusCodes.UNAUTHORIZED,
            error?.message || "Invalid refresh token!"
         )
      );
   }
});

//send OTP
const sendOTP = asyncHandler(async (req, res, next) => {
   const { email } = req.body;
   if (!email) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Email is required!"));
   }
   const user = await User.findOne({ email });
   if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email!"));
   }
   const otp = Math.floor(1000 + Math.random() * 9000);
   await User.updateOne({ email }, { $set: { otp: otp } });
   sendOtpOnMail(email, otp);
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            {},
            "OTP sending your email successfully!"
         )
      );
});

//forgot password
const forgotPassword = asyncHandler(async (req, res, next) => {
   const { otp, password } = req.body;
   if ([otp, password].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "OTP and Password is required!")
      );
   }
   const user = await User.findOne({ otp });
   if (!user) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Incorrect OTP!"));
   }
   user.password = password;
   user.otp = "";
   await user.save({ validateBeforeSave: false });
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(StatusCodes.OK, {}, "Forgot password successfully!")
      );
});

export {
   signup,
   signin,
   verifyEmail,
   sendVerificationLink,
   logoutUser,
   refreshAccessToken,
   sendOTP,
   forgotPassword,
};

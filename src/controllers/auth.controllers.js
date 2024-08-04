import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../middlewares/error.middleware.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendOtpOnMail, sendVerificationMail } from "../helpers/email.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

//genrate access and refresh token
const generateAcessAndRefreshTokens = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
   } catch (error) {
      console.eeror(error);
   }
};

//cookie option
const options = {
   httpOnly: true,
   secure: true,
};

//signup
const signup = asyncHandler(async (req, res, next) => {
   const { name, email, phone, gender, password } = req.body;
   if (!name || !email || !password) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "Name, Email and Password is required!"
         )
      );
   }
   let avatarLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files.avatar.length > 0
   ) {
      avatarLocalPath = req.files?.avatar[0]?.path;
   }
   const user = await User.findOne({
      $or: [{ email }, { phone }],
   });
   if (user) {
      fs.unlinkSync(avatarLocalPath);
      return next(new ApiError(StatusCodes.CONFLICT, "User already exist!"));
   }
   let avatar;
   if (!avatarLocalPath) {
      avatar = await uploadOnCloudinary(avatarLocalPath);
   }
   const newUser = await User.create({
      name,
      email,
      phone,
      avatar: { public_id: avatar?.public_id, url: avatar?.secure_url },
      gender,
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
   const user = await User.findOne({
      _id: req.query.id,
   });
   if (user.is_verified) {
      return next(
         new ApiError(StatusCodes.CONFLICT, "Email already verified!")
      );
   }
   await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
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
   const { email, phone, password } = req.body;
   if (!(email || phone)) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Email or Phone is required!")
      );
   }
   if (!password) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Password is required!")
      );
   }
   const user = await User.findOne({
      $or: [{ email }, { phone }],
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
      const user = await User.findById(decodedToken?._id);
      if (!user) {
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token!")
         );
      }
      if (incomingRefreshToken !== user?.refreshToken) {
         return next(
            new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token expired!")
         );
      }
      const { accessToken, newRefreshToken } =
         await generateAcessAndRefreshTokens(user._id);
      return res
         .status(StatusCodes.OK)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
               StatusCodes.OK,
               { accessToken, refreshToken: newRefreshToken },
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
   const email = req.body.email;
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
   const { otp, password, cpassword } = req.body;
   if ([otp, password, cpassword].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(
            StatusCodes.BAD_REQUEST,
            "OTP, Password and Confirm is required!"
         )
      );
   }
   if (password != cpassword) {
      return next(
         new ApiError(
            StatusCodes.UNAUTHORIZED,
            "Password and confirm password does not match!"
         )
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

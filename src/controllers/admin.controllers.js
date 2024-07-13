import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../middlewares/error.middleware.js";
import { Volunteer } from "../models/volunteer.model.js";
import ExcelJs from "exceljs";
import { StatusCodes } from "http-status-codes";
import { cloudinary } from "../services/cloudinary.js";
import { Payment } from "../models/paymet.model.js";

//get users
const getUsers = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 20;
   const users = await User.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

   const count = await User.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         users,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//get volunteers
const getVolunteers = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 20;
   const volunteer = await Volunteer.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
         { fname: { $regex: ".*" + search + ".*", $options: "i" } },
         { mname: { $regex: ".*" + search + ".*", $options: "i" } },
         { address: { $regex: ".*" + search + ".*", $options: "i" } },
         { city: { $regex: ".*" + search + ".*", $options: "i" } },
         { pincode: { $regex: ".*" + search + ".*", $options: "i" } },
         { state: { $regex: ".*" + search + ".*", $options: "i" } },
         { gender: { $regex: ".*" + search + ".*", $options: "i" } },
         { dob: { $regex: ".*" + search + ".*", $options: "i" } },
         { qualification: { $regex: ".*" + search + ".*", $options: "i" } },
         { skills: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

   const count = await Volunteer.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
         { amount: { $regex: ".*" + search + ".*", $options: "i" } },
         {
            razorpay_payment_id: {
               $regex: ".*" + search + ".*",
               $options: "i",
            },
         },
         {
            razorpay_signature: { $regex: ".*" + search + ".*", $options: "i" },
         },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         volunteer,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//update volunter details
const updateVolunteerDetails = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const {
      name,
      email,
      phone,
      gender,
      fname,
      mname,
      dob,
      address,
      city,
      state,
      pincode,
      qualification,
      skills,
   } = req.body;
   if (
      [
         name,
         email,
         phone,
         gender,
         fname,
         mname,
         dob,
         address,
         city,
         state,
         pincode,
         qualification,
         skills,
      ].some((field) => field?.trim() === "")
   ) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "Name and email is required!")
      );
   }
   if ([name, gender, email, phone].some((field) => field?.trim() === "")) {
      return next(
         new ApiError(StatusCodes.BAD_REQUEST, "All fields are required!")
      );
   }
   const volunteer = await Volunteer.findByIdAndUpdate(
      { _id: id },
      {
         $set: {
            name,
            email,
            phone,
            gender,
            fname,
            mname,
            dob,
            address,
            city,
            state,
            pincode,
            qualification,
            skills,
         },
      },
      { new: true }
   );
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            volunteer,
            "Volunteer details updated!"
         )
      );
});

//get payments
const getPayments = asyncHandler(async (req, res, next) => {
   let search = "";
   if (req.query.search) {
      search = req.query.search;
   }
   let page = 1;
   if (req.query.page) {
      page = req.query.page;
   }
   const limit = 20;
   const payments = await Payment.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

   const count = await Payment.find({
      __v: 0,
      $or: [
         { name: { $regex: ".*" + search + ".*", $options: "i" } },
         { email: { $regex: ".*" + search + ".*", $options: "i" } },
         { mobile: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
   }).countDocuments();
   return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, {
         payments,
         totalPages: Math.ceil(count / limit),
         currentPage: page,
      })
   );
});

//delete user
const deleteUser = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const user = await User.findOne({ _id: id });
   if (user?.avatar?.public_id) {
      const avatarPublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   await User.deleteOne({ _id: id });
   return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, "User deleted!"));
});

//delete user with volunteer
const deleteVolunteer = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const user = User.findOne({ _id: id });
   if (user?.avatar?.public_id) {
      const avatarPublicId = user?.avatar?.public_id;
      await cloudinary.uploader.destroy(avatarPublicId);
   }
   await Volunteer.deleteOne({ _id: id });
   return res
      .status(200)
      .json(new ApiResponse(StatusCodes.OK, {}, "Volunteer deleted!"));
});

//change privlage
const changePrivlage = asyncHandler(async (req, res, next) => {
   const { value } = req.body;
   const { id } = req.params;
   const user = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { is_admin: value } },
      { new: true }
   ).select("-password -refreshToken");
   if (!user) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while changing user privilage!"
         )
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            user,
            "change user privilage successfully!."
         )
      );
});

//export in excel
const exportExcel = asyncHandler(async (req, res, next) => {
   const users = await User.find({ __v: 0 });
   const workbook = new ExcelJs.Workbook();
   const worksheet = workbook.addWorksheet("My Users");
   worksheet.columns = [
      { header: "S.no", key: "s_no", width: 10 },
      { header: "Name", key: "name", width: 10 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Admin", key: "is_admin", width: 10 },
      { header: "Verified", key: "is_verified", width: 10 },
   ];
   let count = 1;
   users.forEach((user) => {
      user.s_no = count;
      worksheet.addRow(user);
      count += 1;
   });
   worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
   });
   const data = await workbook.xlsx.writeFile("users.xlsx");
   return res
      .status(200)
      .json(new ApiResponse(200, { data }, "done successfully!"));
});

export {
   getUsers,
   getVolunteers,
   updateVolunteerDetails,
   getPayments,
   deleteUser,
   deleteVolunteer,
   changePrivlage,
   exportExcel,
};

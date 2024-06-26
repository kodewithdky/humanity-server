import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../middlewares/error.middleware.js";
import { Volunteer } from "../models/volunteer.model.js";
import ExcelJs from "exceljs";
import { StatusCodes } from "http-status-codes";

//get users
const getUsers = asyncHandler(async (req, res, next) => {
   let search = "";
   console.log(req.query.search);
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
   const volunteer = await Volunteer.find({ __v: 0 });
   if (!volunteer) {
      return next(
         new ApiError(StatusCodes.NOT_FOUND, "Not here any volunteer!")
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            volunteer,
            "Find volunteer successfully!."
         )
      );
});

//get volunteer details
const getVolunteerDetails = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const user = await User.find({ _id: id }).select("-password -refreshToken");
   if (!user) {
      return next(
         new ApiError(
            StatusCodes.NOT_FOUND,
            "Error while geting volunteer data!"
         )
      );
   }
   return res
      .status(StatusCodes.OK)
      .json(
         new ApiResponse(
            StatusCodes.OK,
            user,
            "Find volunteer details successfully!."
         )
      );
});

//delete user
const deleteUser = asyncHandler(async (req, res, next) => {
   const { id } = req.params;
   const deletedUser = await User.deleteOne({ _id: id });
   const volunteer = await Volunteer.findOne({ userId: id });
   let deletedVolunteer;
   if (volunteer) {
      deletedVolunteer = await Volunteer.deleteOne({ userId: id });
   }
   if (!deletedUser) {
      return next(
         new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Error while deleting user!"
         )
      );
   }
   return res.status(200).json(
      new ApiResponse(
         StatusCodes.OK,
         {
            deletedUser,
            deletedVolunteer,
         },
         "User deleted successfully!."
      )
   );
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
   getVolunteerDetails,
   deleteUser,
   changePrivlage,
   exportExcel,
};

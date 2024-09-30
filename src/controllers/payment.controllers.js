import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import Razorpay from "razorpay";
import crypto from "crypto";
import ApiError from "../middlewares/error.middleware.js";
import { Payment } from "../models/paymet.model.js";

const razorpayInstance = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID,
   key_secret: process.env.RAZORPAY_SECRET,
});

//joinus
const payment = asyncHandler(async (req, res, next) => {
   const { amount } = req.body;
   const { name, phone, email, address, pancard, purpose } = req.body;
   const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
   };
   razorpayInstance.orders.create(options, (error, donation) => {
      if (error) {
         return next(
            new ApiError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               "Something went wrong!"
            )
         );
      }
      return res.status(StatusCodes.OK).json(
         new ApiResponse(
            StatusCodes.OK,
            {
               donation,
               name,
               phone,
               email,
               address,
               pancard,
               purpose,
               amount,
            },
            ""
         )
      );
   });
});

//verify
const verify = asyncHandler(async (req, res, next) => {
   const { razorpay_order_id, razorpay_payment_id, razorpay_signature, data } =
      req.body;
   // Create Sign
   const sign = razorpay_order_id + "|" + razorpay_payment_id;
   // Create ExpectedSign
   const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");
   // Create isAuthentic
   const isAuthentic = expectedSign === razorpay_signature;
   // Condition
   if (isAuthentic) {
      const payment = new Payment({
         name: data.name,
         email: data.email,
         phone: data.phone,
         pancard: data.pancard,
         address: data.address,
         purpose: data.purpose,
         amount: data.amount,
         razorpay_order_id,
         razorpay_payment_id,
         razorpay_signature,
      });
      await payment.save();
      res.json({
         message: "Payement Successfull!",
      });
   }
});
export { payment, verify };

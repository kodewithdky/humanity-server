import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import Razorpay from "razorpay";
import crypto from "crypto";
import ApiError from "../middlewares/error.middleware.js";
import { Payment } from "../models/paymet.model.js";

const razorpayInstance = new Razorpay({
   key_id: "process.env.RAZORPAY_KEY_ID",
   key_secret: "process.env.RAZORPAY_SECRET",
});

//joinus
const joinus = asyncHandler(async (req, res, next) => {
   const { amount } = req.body;

   const options = {
      amount: Number(amount * 100),
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
   };

   razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
         return next(
            new ApiError(
               StatusCodes.INTERNAL_SERVER_ERROR,
               "Something went wrong!"
            )
         );
      }
      return res
         .status(StatusCodes.OK)
         .json(
            new ApiResponse(
               StatusCodes.OK,
               { data: order },
               "User become joinus successfully!"
            )
         );
   });
});

//verify
const verify = asyncHandler(async (req, res, next) => {
   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

   // Create Sign
   const sign = razorpay_order_id + "|" + razorpay_payment_id;

   // Create ExpectedSign
   const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign.toString())
      .digest("hex");

   // console.log(razorpay_signature === expectedSign);

   // Create isAuthentic
   const isAuthentic = expectedSign === razorpay_signature;

   // Condition
   if (isAuthentic) {
      const payment = new Payment({
         razorpay_order_id,
         razorpay_payment_id,
         razorpay_signature,
      });

      // Save Payment
      await payment.save();

      // Send Message
      res.json({
         message: "Payement Successfully",
      });
   }
});
export { joinus, verify };

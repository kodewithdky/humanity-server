import mongoose from "mongoose";
const PaymentSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
   },
   phone: {
      type: String,
      required: true,
   },
   pancard: {
      type: String,
      required: true,
   },
   address: {
      type: String,
      required: true,
   },
   purpose: {
      type: String,
      required: true,
   },
   amount: {
      type: String,
      required: true,
   },
   razorpay_order_id: {
      type: String,
      required: true,
   },
   razorpay_payment_id: {
      type: String,
      required: true,
   },
   razorpay_signature: {
      type: String,
      required: true,
   },
   date: {
      type: Date,
      default: Date.now,
   },
});

export const Payment = mongoose.model("Payment", PaymentSchema);

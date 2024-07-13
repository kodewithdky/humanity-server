import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
   {
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
      message: {
         type: String,
         required: true,
      },
   },
   { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);

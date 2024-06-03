import mongoose from "mongoose";
const JoinusSchema = new mongoose.Schema(
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
      purpose: {
         type: String,
         required: true,
      },
      amount: {
         type: String,
         required: true,
      },
   },
   { timestamps: true }
);

export const Joinus = mongoose.model("Joinus", JoinusSchema);

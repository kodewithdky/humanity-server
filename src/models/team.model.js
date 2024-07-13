import mongoose from "mongoose";
const TeamSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
      },
      role: {
         type: String,
         required: true,
      },
      avatar: {
         public_id: {
            type: String,
            required: true,
         },
         url: {
            type: String,
            required: true,
         },
      },
   },
   { timestamps: true }
);

export const Team = mongoose.model("Team", TeamSchema);

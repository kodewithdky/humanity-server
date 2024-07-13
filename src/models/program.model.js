import mongoose from "mongoose";
const ProgramSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
      },
      description: {
         type: String,
         required: true,
      },
      coverImage: {
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

export const Program = mongoose.model("Program", ProgramSchema);

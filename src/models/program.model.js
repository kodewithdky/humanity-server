import mongoose from "mongoose";
const ProgramSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: [true, "Title is required!"],
         minlength: [3, "Title must be at least 3 characters long!"],
         maxlength: [30, "Title must be less than 30 characters long!"],
      },
      description: {
         type: String,
         required: [true, "Description is required!"],
         minlength: [3, "Description must be at least 3 characters long!"],
         maxlength: [
            1000,
            "Description must be less than 1000 characters long!",
         ],
      },
      coverImage: {
         public_id: {
            type: String,
         },
         url: {
            type: String,
            required: [true, "Cover image is required!"],
         },
      },
   },
   { timestamps: true }
);

export const Program = mongoose.model("Program", ProgramSchema);

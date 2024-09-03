import mongoose from "mongoose";
const TeamSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Name is required!"],
         minlength: [3, "Name must be at least 3 characters long!"],
         maxlength: [30, "Name must be less than 30 characters long!"],
      },
      role: {
         type: String,
         required: [true, "Role is required!"],
         minlength: [3, "Role must be at least 3 characters long!"],
         maxlength: [30, "Role must be less than 30 characters long!"],
      },
      avatar: {
         public_id: {
            type: String,
         },
         url: {
            type: String,
            required: [true, "Avatar image is required!"],
         },
      },
   },
   { timestamps: true }
);

export const Team = mongoose.model("Team", TeamSchema);

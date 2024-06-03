import mongoose from "mongoose";
//volunteer schema
const VolunteerSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
      fname: {
         type: String,
         required: true,
      },
      mname: {
         type: String,
         required: true,
      },
      dob: {
         type: String,
         required: true,
      },

      address: {
         type: String,
         required: true,
      },
      qualification: {
         type: String,
         required: true,
      },
      skills: {
         type: String,
         required: true,
      },
   },
   { timestamps: true }
);

export const Volunteer = mongoose.model("Volunteer", VolunteerSchema);

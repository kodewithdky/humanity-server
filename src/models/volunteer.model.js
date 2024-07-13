import mongoose from "mongoose";
//volunteer schema
const VolunteerSchema = new mongoose.Schema(
   {
      avatar: {
         public_id: {
            type: String,
         },
         url: {
            type: String,
         },
      },
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
      gender: {
         type: String,
         required: true,
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
      city: {
         type: String,
         required: true,
      },
      state: {
         type: String,
         required: true,
      },
      pincode: {
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

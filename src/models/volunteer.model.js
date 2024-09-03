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
            required: [true, "Please select anvatar!"],
            match: [
               /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/,
               "Please select JPG Or JPEG Or PNG file!",
            ],
         },
      },
      name: {
         type: String,
         required: [true, "Name is required!"],
         minlength: [3, "Name must be at least 3 characters long!"],
         maxlength: [30, "Name must be less than 30 characters long!"],
         validate: {
            validator: function (v) {
               return /^[a-zA-Z\s]+$/.test(v); // Only allows letters and spaces
            },
            message: (props) => `${props.value} is not a valid name!`,
         },
         trim: true,
      },
      email: {
         type: String,
         required: [true, "Email is required!"],
         unique: true,
         match: [/.+\@.+\..+/, "Please enter a valid email address!"],
      },
      phone: {
         type: String,
         required: [true, "Phone number is required!"],
         match: [/^\d{10}$/, "Please enter a valid 10-digit phone number!"],
      },
      gender: {
         type: String,
         required: [true, "Gender is required!"],
      },
      fname: {
         type: String,
         required: [true, "Father name is required!"],
         minlength: [3, "Father name must be at least 3 characters long!"],
         maxlength: [30, "Father name must be less than 30 characters long!"],
         validate: {
            validator: function (v) {
               return /^[a-zA-Z\s]+$/.test(v); // Only allows letters and spaces
            },
            message: (props) => `${props.value} is not a valid father name!`,
         },
         trim: true,
      },
      mname: {
         type: String,
         required: [true, "Mother is required!"],
         minlength: [3, "Mother name must be at least 3 characters long!"],
         maxlength: [30, "Mother name must be less than 30 characters long!"],
         validate: {
            validator: function (v) {
               return /^[a-zA-Z\s]+$/.test(v); // Only allows letters and spaces
            },
            message: (props) => `${props.value} is not a valid mother name!`,
         },
         trim: true,
      },
      dob: {
         type: String,
         required: [true, "DOB is required!"],
      },
      address: {
         type: String,
         required: [true, "Address is required!"],
         minlength: [3, "Address must be at least 3 characters long!"],
         maxlength: [50, "Address must be less than 50 characters long!"],
      },
      city: {
         type: String,
         required: [true, "City is required!"],
         minlength: [3, "City must be at least 3 characters long!"],
         maxlength: [30, "City must be less than 30 characters long!"],
      },
      state: {
         type: String,
         required: [true, "State is required!"],
         minlength: [3, "State must be at least 3 characters long!"],
         maxlength: [30, "State must be less than 30 characters long!"],
         validate: {
            validator: function (v) {
               return /^[a-zA-Z\s]+$/.test(v); // Only allows letters and spaces
            },
            message: (props) => `${props.value} is not a valid state!`,
         },
         trim: true,
      },
      pincode: {
         type: String,
         required: [true, "Pincode is required!"],
         match: [/^\d{6}$/, "Please enter a valid 6-digit pincode!"],
         trim: true,
      },
      qualification: {
         type: String,
         required: [true, "Qualification is required!"],
      },
      skills: {
         type: String,
         required: [true, "Skills is required!"],
         minlength: [3, "Skills must be at least 3 characters long!"],
         maxlength: [50, "Skills must be less than 50 characters long!"],
      },
   },
   { timestamps: true }
);

export const Volunteer = mongoose.model("Volunteer", VolunteerSchema);

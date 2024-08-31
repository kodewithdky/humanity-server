import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Name is required!"],
         minlength: [3, "Name must be at least 3 characters long!"],
         maxlength: [30, "Name must be less than 30 characters long!"],
      },
      email: {
         type: String,
         required: [true, "Email is required!"],
         match: [/.+\@.+\..+/, "Please enter a valid email address!"],
      },
      phone: {
         type: String,
         required: [true, "Phone number is required!"],
         match: [/^\d{10}$/, "Please enter a valid 10-digit phone number!"],
      },
      message: {
         type: String,
         required: [true, "Message is required!"],
         minlength: [3, "Message must be at least 3 characters long!"],
         maxlength: [100, "Message must be less than 100 characters long!"],
      },
   },
   { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);

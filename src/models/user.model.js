import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
   {
      socialId: {
         type: String,
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
         match: [/.+\@.+\..+/, "Please enter a valid email address!"],
         unique: true,
         trim: true,
      },
      phone: {
         type: String,
         match: [/^\d{6}$/, "Please enter a valid 6-digit pincode!"],
         trim: true,
      },
      gender: {
         type: String,
      },
      avatar: {
         public_id: {
            type: String,
         },
         url: {
            type: String,
         },
      },
      is_admin: {
         type: Number,
         default: 0,
      },
      is_verified: {
         type: Number,
         default: 0,
      },
      password: {
         type: String,
         required: [true, "Password is required!"],
         minlength: [8, "Password must be at least 8 characters long!"],
         maxlength: [16, "Password must be less than 16 characters long!"],
         validate: {
            validator: function (v) {
               return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid password!`,
         },
      },
      refreshToken: {
         type: String,
      },
      otp: {
         type: String,
      },
   },
   { timestamps: true }
);

//bcript password
userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) return;
   this.password = await bcrypt.hash(this.password, 10);
   next();
});

//incript password
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password, this.password);
};
//genrate access token
userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
      {
         _id: this._id,
         name: this.name,
         email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
   );
};
//generate refresh token
userSchema.methods.generateRefreshToken = function () {
   return jwt.sign(
      {
         _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
   );
};

export const User = mongoose.model("User", userSchema);

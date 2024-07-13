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
         required: true,
         trim: true,
      },
      email: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
         trim: true,
      },
      phone: {
         type: String,
         unique: true,
         trim: true,
      },
      gender: {
         type: String,
         trim: true,
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
         required: true,
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
         username: this.username,
         email: this.email,
         phone: this.phone,
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

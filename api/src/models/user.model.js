import mongoose from "mongoose";
//import { type } from "os";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to make a field searchable in optimise way
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    avatar: {
      type: String, // cloudinary url used here
      //required: true,
    },
    refreshToken: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPost:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SavePost",
      },
    ]
  },
  { timestamps: true }
);

// it is a middleware in mongoose.
//it run right before data is "save"
// userSchema.pre("save", async function (next) {
//   console.log("Pre-save middleware triggered");
//   //console.log(this.isModified("password"));

//   //if (this.isModified("password")) return next();

//   try {
//     console.log("Hashing password...");
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
//   } catch (err) {
//     next(err);
//   }
// });

//custom method
userSchema.methods.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);

// //POSTGRESQL Database
// import pool from "@/backend/config/dbConnect";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   password: string;
//   avatar_public_id?: string | null;
//   avatar_url?: string | null;
//   role: string;
//   google_id?: string | null;
//   created_at: Date;
//   reset_password_token?: string | null;
//   reset_password_expire?: Date | null;
// }

// export async function createUser(user: {
//   name: string;
//   email: string;
//   password: string;
//   avatar?: { public_id?: string; url?: string };
//   role?: string;
//   googleId?: string;
// }) {
//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   const { name, email, avatar, role, googleId } = user;

//   const result = await pool.query(
//      `INSERT INTO users 
//       (name, email, password, avatar_public_id, avatar_url, role, google_id) 
//      VALUES ($1, $2, $3, $4, $5, $6, $7)
//      RETURNING *`,
//      [
//       name,
//       email,
//       hashedPassword,
//       avatar?.public_id || null,
//       avatar?.url || null,
//       role || "user",
//       googleId || null
//      ]
//   );

//   return result.rows[0] as User
// }
//  export async function comparePassword(
//   plainPassword: string,
//   hashedPassword: string 
//  ): Promise<boolean> {
//   return await bcrypt.compare(plainPassword, hashedPassword);
//  }

//  export function generateResetToken() {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   const hashedToken = crypto
//   .createHash("sha256")
//   .update(resetToken)
//   .digest("hex");

//   const expires = new Date(Date.now() + 30 * 60 * 1000);

//   return {
//     resetToken,
//     hashedToken,
//     expires
//   }
//  }

//  export async function setResetToken(userId: number) {
//   const { resetToken, hashedToken, expires} = generateResetToken();

//   await pool.query(
//     `UPDATE users
//       SET reset_password_token = $1, reset_password_expire = $2
//       WHERE id = $3`,
//       [hashedToken, expires, userId]
//   );

//   return resetToken;
//  }

//MONGODB Database

// import mongoose, { Document, Schema } from "mongoose";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   avatar: {
//     public_id: string;
//     url: string;
//   };
//   role: string;
//   googleId?: string;
//   createdAt: Date;
//   resetPasswordToken: string;
//   resetPasswordExpire: Date;
//   comparePassword(enteredPassword: string): Promise<boolean>;
//   getResetPasswordToken(): string;
// }

// const userSchema: Schema<IUser> = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please enter your name"],
//   },
//   email: {
//     type: String,
//     required: [true, "Please enter your email"],
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Please enter your password"],
//     minlength: [6, "Your password must be longer than 6 characters"],
//     select: false,
//   },
//   avatar: {
//     public_id: String,
//     url: String,
//   },
//   role: {
//     type: String,
//     default: "user",
//   },
//   googleId: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   resetPasswordToken: String,
//   resetPasswordExpire: Date,
// });

// // Encrypting password before saving the user
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
// });

// // Compare user password
// userSchema.methods.comparePassword = async function (
//   enteredPassword: string
// ): Promise<boolean> {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // Generate reset password token
// userSchema.methods.getResetPasswordToken = function (): string {
//   // Generate the token
//   const resetToken = crypto.randomBytes(20).toString("hex");

//   // Hash the token
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // Set token expire time
//   this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

//   return resetToken;
// };

// export default mongoose.models.User ||
//   mongoose.model<IUser>("User", userSchema);

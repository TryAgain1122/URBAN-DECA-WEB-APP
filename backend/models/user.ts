import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  googleId?: string;
  createdAt: Date;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [6, "Your password must be longer than 6 characters"],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    default: "user",
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Encrypting password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare user password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset password token
userSchema.methods.getResetPasswordToken = function (): string {
  // Generate the token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash the token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

// import { Pool } from 'pg';
// import db from '../config/dbConnect';

// const pool = db.pool;

// export interface IUser {
//   id: string;
//   name: string;
//   email: string;
//   password: string;
//   avatar: any; // You can replace this with a more specific type if needed
//   role: string;
//   google_id?: string;
//   created_at: Date;
//   reset_password_token?: string;
//   reset_password_expire?: Date;
// }

// const createUsersTable = async () => {
//   const usersQuery = `
//     CREATE TABLE IF NOT EXISTS users (
//       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL UNIQUE,
//       password VARCHAR(255) NOT NULL,
//       avatar JSONB,
//       role VARCHAR(50) DEFAULT 'user',
//       google_id VARCHAR(255) UNIQUE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       reset_password_token VARCHAR(255),
//       reset_password_expire TIMESTAMP
//     );
//   `;

//   try {
//     await pool.query(usersQuery);
//     console.log("✅ Users table created (or already exists)");
//   } catch (error) {
//     console.error("❌ Error creating Users table:", error);
//   }
// };

// createUsersTable();

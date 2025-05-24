import { NextRequest, NextResponse } from "next/server";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import User from "../models/user";
import ErrorHandler from "../utils/errorHandler";
import { delete_file, upload_file } from "../utils/cloudinary";
// import { resetPasswordHTMLTemplate } from "../utils/emailTemplates";
// import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import { resetPasswordHTMLTemplate } from "../utils/emailTemplate";
import sendEmail from "../utils/sendEmail";
import db from '../config/dbConnect';
import bcrypt from 'bcryptjs';

// Register user  =>  /api/auth/register
export const registerUser = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const { name, email, password } = body;

  const user = await User.create({
    name,
    email,
    password,
  });

  return NextResponse.json({
    success: true,
  });
});

// Update use profile  =>  /api/me/update
export const updateProfile = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const userData = {
    name: body.name,
    email: body.email,
  };

  const user = await User.findByIdAndUpdate(req.user._id, userData);

  return NextResponse.json({
    success: true,
    user,
  });
});

// Update password  =>  /api/me/update_password
export const updatePassword = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const user = await User.findById(req?.user?._id).select("+password");

  const isMatched = await user.comparePassword(body.oldPassword);

  if (!isMatched) {
    throw new ErrorHandler("Old password is incorrect", 400);
  }

  user.password = body.password;
  await user.save();

  return NextResponse.json({
    success: true,
  });
});

// Upload user avatar  =>  /api/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const avatarResponse = await upload_file(body?.avatar, "urban/avatars");

  // Remove avatar from cloudinary
  if (req?.user?.avatar?.public_id) {
    await delete_file(req?.user?.avatar?.public_id);
  }

  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  });

  return NextResponse.json({
    success: true,
    user,
  });
});

// Forgot password  =>  /api/password/forgot
export const forgotPassword = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const user = await User.findOne({ email: body.email });

  if (!user) {
    throw new ErrorHandler("User not found with this email", 404);
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // Create reset password url
  const resetUrl = `${process.env.API_URL}/password/reset/${resetToken}`;

  const message = resetPasswordHTMLTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Urban Deca Tower Password Recovery",
      message,
    });
  } catch (error: any) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    throw new ErrorHandler(error?.message, 500);
  }

  return NextResponse.json({
    success: true,
    user,
  });
});

// Reset password  =>  /api/password/reset/:token
export const  resetPassword = catchAsyncErrors(
  async (req: NextRequest, { params    }: { params: { token: string } }) => {
    const body = await req.json();

    // Hash the token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ErrorHandler(
        "Password reset token is invalid or has been expired",
        404
      );
    }

    if (body.password !== body.confirmPassword) {
      throw new ErrorHandler("Passwords does not match", 400);
    }

    // Set the new password
    user.password = body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
    });
  }
);

// Get all users => /api/admin/users 
export const allAdminUsers = catchAsyncErrors(async (req: NextRequest) => {
  const users = await User.find();

  return NextResponse.json({
    users,
  })

});

// Get user details => /api/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req: NextRequest, {params}: { params: {id: string} } ) => {
  const user = await User.findById(params.id);

  if (!user) {
    throw new ErrorHandler("User not found with ID", 404)
  }
  return NextResponse.json({
    user,
  })
})

// Update user details => /api/admin/users/:id
export const updateUser = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string }}) => {
  const body = await req.json();

  const newUserData = {
    name: body.name,
    email: body.email,
    role: body.role
  }

  const user = await User.findByIdAndUpdate(params.id, newUserData)

  return NextResponse.json({
    user,
  })
})

//Delete user => /api/admin/users/:id
export const deleteUser = catchAsyncErrors(
  async (req:NextRequest, { params }: {params: { id: string}}) => {
    const user = await User.findById(params.id);

    if (!user) {
      throw new ErrorHandler("User not found with this ID", 404)
    }

    //Remove avatar from cloudinary
    if (user?.avatar?.public_id) {
      await delete_file(user?.avatar?.public_id);
    }

    await user.deleteOne();

    return NextResponse.json({
      success: true
    })
  }
) 

// const pool = db.pool;

// export const registerUser = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { name, email, password } = body;

//   const result = await pool.query(
//     `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
//     [name, email, password]
//   );

//   return NextResponse.json({
//     success: true,
//     userId: result.rows[0].id,
//   });
// });

// export const updateProfile = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { name, email } = body;

//   // Assuming `req.user.id` contains the user’s ID, passed from middleware
//   const result = await pool.query(
//     `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *`,
//     [name, email, req.user.id]
//   );

//   if (result.rows.length === 0) {
//     throw new ErrorHandler("User not found", 404);
//   }

//   return NextResponse.json({
//     success: true,
//     user: result.rows[0],
//   });
// });

// export const updatePassword = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { oldPassword, password } = body;

//   // Fetch user with their password (make sure you're handling password securely)
//   const result = await pool.query(
//     `SELECT * FROM users WHERE id = $1`,
//     [req.user.id]
//   );

//   if (result.rows.length === 0) {
//     throw new ErrorHandler("User not found", 404);
//   }

//   const user = result.rows[0];

//   // Compare the provided old password with the stored hashed password
//   const isMatched = await bcrypt.compare(oldPassword, user.password);

//   if (!isMatched) {
//     throw new ErrorHandler("Old password is incorrect", 400);
//   }

//   // Hash the new password before saving it (for security)
//   const hashedPassword = await bcrypt.hash(password, 10);

//   await pool.query(
//     `UPDATE users SET password = $1 WHERE id = $2`,
//     [hashedPassword, req.user.id]
//   );

//   return NextResponse.json({
//     success: true,
//   });
// });

// export const uploadAvatar = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
  
//   const avatarResponse = await upload_file(body?.avatar, "bookit/avatars");

//   // Remove avatar from cloudinary if exists
//   if (req.user.avatar?.public_id) {
//     await delete_file(req.user.avatar?.public_id);
//   }

//   const result = await pool.query(
//     `UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *`,
//     [avatarResponse, req.user.id]
//   );

//   return NextResponse.json({
//     success: true,
//     user: result.rows[0],
//   });
// });

// export const forgotPassword = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { email } = body;

//   const result = await pool.query(
//     `SELECT * FROM users WHERE email = $1`,
//     [email]
//   );

//   if (result.rows.length === 0) {
//     throw new ErrorHandler("User not found with this email", 404);
//   }

//   const user = result.rows[0];
  
//   // Get reset token and update the user record
//   const resetToken = user.getResetPasswordToken();
//   await pool.query(
//     `UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE id = $3`,
//     [resetToken, Date.now() + 3600000, user.id] // 1 hour expiration
//   );

//   // Send email logic, etc.
//   const resetUrl = `${process.env.API_URL}/password/reset/${resetToken}`;
//   const message = resetPasswordHTMLTemplate(user.name, resetUrl);

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Password Recovery",
//       message,
//     });
//   } catch (error: any) {
//     throw new ErrorHandler(error?.message, 500);
//   }

//   return NextResponse.json({
//     success: true,
//   });
// });

// export const resetPassword = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { token: string } }) => {
//     const body = await req.json();

//     const resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(params.token)
//       .digest("hex");

//     const result = await pool.query(
//       `SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > $2`,
//       [resetPasswordToken, Date.now()]
//     );

//     if (result.rows.length === 0) {
//       throw new ErrorHandler("Password reset token is invalid or has expired", 404);
//     }

//     const user = result.rows[0];

//     if (body.password !== body.confirmPassword) {
//       throw new ErrorHandler("Passwords do not match", 400);
//     }

//     // Set the new password
//     await pool.query(
//       `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2`,
//       [body.password, user.id]
//     );

//     return NextResponse.json({
//       success: true,
//     });
//   }
// );

// export const allAdminUsers = catchAsyncErrors(async (req: NextRequest) => {
//   const result = await pool.query(`SELECT * FROM users`);

//   return NextResponse.json({
//     users: result.rows,
//   });
// });

// export const getUserDetails = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const result = await pool.query(
//     `SELECT * FROM users WHERE id = $1`,
//     [params.id]
//   );

//   if (result.rows.length === 0) {
//     throw new ErrorHandler("User not found with this ID", 404);
//   }

//   return NextResponse.json({
//     user: result.rows[0],
//   });
// });

// export const updateUser = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const body = await req.json();

//   const newUserData = {
//     name: body.name,
//     email: body.email,
//     role: body.role,
//   };

//   const result = await pool.query(
//     `UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *`,
//     [newUserData.name, newUserData.email, newUserData.role, params.id]
//   );

//   if (result.rows.length === 0) {
//     throw new ErrorHandler("User not found", 404);
//   }

//   return NextResponse.json({
//     user: result.rows[0],
//   });
// });

// export const deleteUser = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const result = await pool.query(
//       `SELECT * FROM users WHERE id = $1`,
//       [params.id]
//     );

//     if (result.rows.length === 0) {
//       throw new ErrorHandler("User not found with this ID", 404);
//     }

//     const user = result.rows[0];

//     // Remove avatar from cloudinary if exists
//     if (user.avatar?.public_id) {
//       await delete_file(user.avatar.public_id);
//     }

//     await pool.query(
//       `DELETE FROM users WHERE id = $1`,
//       [params.id]
//     );

//     return NextResponse.json({
//       success: true,
//     });
//   }
// );
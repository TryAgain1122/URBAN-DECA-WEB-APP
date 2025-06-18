// import mongoose, { Document, Schema } from "mongoose";
// import { IUser } from "./user";
// import { IRoom } from "./room";

// export interface IBooking extends Document {
//   _id: string;
//   room: IRoom;
//   user: IUser;
//   checkInDate: Date;
//   checkOutDate: Date;
//   amountPaid: number;
//   daysOfStay: number;
//   paymentInfo: {
//     id: string;
//     status: "pending" | "paid" | "failed";
//   };
//   paidAt: Date;
//   createdAt: Date;
//   status: "pending" | "confirmed" | "cancelled";
//   cancellationConfirmed: boolean;
// }

// const bookingSchema: Schema<IBooking> = new mongoose.Schema({
//   room: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "Room",
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: "User",
//   },
//   checkInDate: {
//     type: Date,
//     required: true,
//   },
//   checkOutDate: {
//     type: Date,
//     required: true,
//   },
//   amountPaid: {
//     type: Number,
//     required: true,
//   },
//   daysOfStay: {
//     type: Number,
//     required: true,
//   },
//   paymentInfo: {
//     id: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       required: true,
//     },
//   },
//   paidAt: {
//     type: Date,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   status: {
//     type: String,
//     enum: ["pending", "confirmed", "cancelled"],
//     default: "pending"
//   },
//   cancellationConfirmed: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.models.Booking ||
//   mongoose.model<IBooking>("Booking", bookingSchema);

// import db from '../config/dbConnect';
// const pool = db.pool;

// const createBookingsTable = async () => {
//   const query = `
//     CREATE TABLE IF NOT EXISTS bookings (
//       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//       room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
//       user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//       check_in_date DATE NOT NULL,
//       check_out_date DATE NOT NULL,
//       amount_paid NUMERIC NOT NULL,
//       days_of_stay INTEGER NOT NULL,
//       payment_id TEXT NOT NULL,
//       payment_status VARCHAR(10) NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed')),
//       paid_at TIMESTAMP NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
//       cancellation_confirmed BOOLEAN DEFAULT FALSE
//     );
//   `;

//   try {
//     await pool.query(query);
//     console.log("✅ Bookings table created (or already exists)");
//   } catch (error) {
//     console.error("❌ Error creating bookings table:", error);
//   }
// };

// createBookingsTable();

// import { NextRequest, NextResponse } from "next/server";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
// import Booking, { IBooking } from "../models/booking";
// import Moment from "moment";
// import { extendMoment } from "moment-range";
// import ErrorHandler from "../utils/errorHandler";
// import Room from '../models/room'
// const moment = extendMoment(Moment);

// // Create new Booking   =>  /api/bookings
// export const newBooking = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();

//   const {
//     room,
//     checkInDate,
//     checkOutDate,
//     daysOfStay,
//     amountPaid,
//     paymentInfo,
//   } = body;

//   const booking = await Booking.create({
//     room,
//     user: req.user._id,
//     checkInDate,
//     checkOutDate,
//     daysOfStay,
//     amountPaid,
//     paymentInfo,
//     paidAt: Date.now(),
//     status: 'pending',
//   });

//   return NextResponse.json({
//     booking,
//   });
// });

// // Check Room Booking Availability   =>  /api/bookings/check
// export const checkRoomBookingAvailability = catchAsyncErrors(
//   async (req: NextRequest) => {
//     const { searchParams } = new URL(req.url);
//     const roomId = searchParams.get("roomId");

//     const checkInDate: Date = new Date(
//       searchParams.get("checkInDate") as string
//     );
//     const checkOutDate: Date = new Date(
//       searchParams.get("checkOutDate") as string
//     );

//     const bookings: IBooking[] = await Booking.find({
//       room: roomId,
//       $and: [
//         { checkInDate: { $lte: checkOutDate } },
//         { checkOutDate: { $gte: checkInDate } },
//       ],
//     });

//     const isAvailable: boolean = bookings.length === 0;

//     return NextResponse.json({
//       isAvailable,
//     });
//   }
// );

// // Get room booked dates   =>  /api/bookings/get_booked_dates
// export const getRoomBookedDates = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId");

//   const bookings = await Booking.find({ room: roomId }).sort({ createdAt: -1 });

//   const bookedDates = bookings.flatMap((booking) =>
//     Array.from(
//       moment
//         .range(moment(booking.checkInDate), moment(booking.checkOutDate))
//         .by("day")
//     )
//   );

//   return NextResponse.json({
//     bookedDates,
//   });
// });

// // Get current user bookings   =>  /api/bookings/me
// export const myBookings = catchAsyncErrors(async (req: NextRequest) => {
//   const bookings = await Booking.find({ user: req.user._id })
//     .populate("room") // ✅ This is the fix
//     .sort({ createdAt: -1 });

//   return NextResponse.json({
//     bookings,
//   });
// });

// // Get booking details   =>  /api/bookings/:id
// export const getBookingDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const booking = await Booking.findById(params.id).populate("user room");

//     if (booking.user?._id?.toString() !== req.user._id && req?.user?.role !== 'admin') {
//       throw new ErrorHandler("You can not view this booking", 403);
//     }

//     return NextResponse.json({
//       booking,
//     });
//   }
// );

// const updateBookingStatus = async (bookingId: string, newStatus: string) => {
//   const booking = await Booking.findById(bookingId);

//   if (!booking) {
//     throw new ErrorHandler("Booking not found with this ID", 404);
//   }

//   booking.status = newStatus;
//   await booking.save();
// }

// // Cancel booking => /api/bookings/:id/cancel
// export const cancelBooking = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const booking = await Booking.findById(params.id);

//     // Check if booking exists
//     if (!booking) {
//       throw new ErrorHandler("Booking not found with this ID", 404);
//     }

//     // Check if the user owns the booking
//     if (!req.user || (booking.user._id?.toString() !== req.user._id && req.user.role !== 'admin')) {
//       throw new ErrorHandler("You are not authorized to cancel this booking", 403);
//     }

//     // Only allow cancellation if the status is pending
//     if (booking.status !== 'pending') {
//       throw new ErrorHandler("Only pending bookings can be cancelled", 400)
//     }

//     // Update booking status to canceled
//     await updateBookingStatus(params.id, 'cancelled');
//     booking.status = "cancelled";
//     booking.cancellationConfirmed = true;
//     await booking.save();

//     // Update the room's availability for the canceled booking date range
//     await updateRoomAvailability(
//       booking.room._id, // Assuming room is an ObjectId
//       booking.checkInDate,
//       booking.checkOutDate
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Booking has been cancelled",
//     });
//   }
// );

// export const confirmBooking = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string} }) => {
//   const booking = await Booking.findById(params.id);

//   //Ensure booking exists
//   if (!booking) {
//     throw new ErrorHandler("Booking not found", 404);
//   }

//   //Only an admin can confirm bookings
//   if (req.user.role !== 'admin') {
//     throw new ErrorHandler("Only Admins can confirm bookings", 403)
//   }

//   //Check if the booking status is pending before confirming
//   if (booking.status !== 'pending') {
//     throw new ErrorHandler("Only pending bookings can be confirmed", 404)
//   }

//   //Change status to 'confirmed'
//   await updateBookingStatus(params.id, 'confirmed');

//   return NextResponse.json({
//     success: true,
//     message: "Booking has been confirmed"
//   })
// })

// // Function to update room availability
// const updateRoomAvailability = async (roomId: string, checkInDate: Date, checkOutDate: Date) => {
//   const room = await Room.findById(roomId);

//   if (!room) {
//     throw new ErrorHandler("Room not found", 404);
//   }

//   if (room.unavailableDates) {
//     room.unavailableDates = room.unavailableDates.filter(
//       (dateRange: { startDate: Date; endDate: Date }) =>
//         !(dateRange.startDate <= checkInDate && dateRange.endDate >= checkOutDate)
//     );
//   } else {
//     room.unavailableDates = [];
//   }

//   room.unavailableDates.push({
//     startDate: checkInDate,
//     endDate: checkOutDate,
//   });

//   await room.save();
// };

// const getLastSixMonthsSales = async () => {
//   const last6MonthsSales: any = [];

//   // Get Current date
//   const currentDate = moment();

//   async function fetchSalesForMonth(
//     startDate: moment.Moment,
//     endDate: moment.Moment
//   ) {
//     const result = await Booking.aggregate([
//       // Stage 1 => Filter the data
//       {
//         $match: {
//           createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
//         },
//       },
//       // Stage 2: Grouping the data
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: "$amountPaid" },
//           numOfBookings: { $sum: 1 },
//         },
//       },
//     ]);

//     const { totalSales, numOfBookings } =
//       result?.length > 0 ? result[0] : { totalSales: 0, numOfBookings: 0 };

//     last6MonthsSales.push({
//       monthName: startDate.format("MMMM"),
//       totalSales,
//       numOfBookings,
//     });
//   }

//   for (let i = 0; i < 6; i++) {
//     const startDate = moment(currentDate).startOf("month");
//     const endDate = moment(currentDate).endOf("month");

//     await fetchSalesForMonth(startDate, endDate);

//     currentDate.subtract(1, "months");
//   }

//   return last6MonthsSales;
// };

// const getTopPerformingRooms = async (startDate: Date, endDate: Date) => {
//   const topRooms = await Booking.aggregate([
//     // Stage 1: Filter documents within start and end date
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },
//     // Stage 2: Group documents by room
//     {
//       $group: {
//         _id: "$room",
//         bookingsCount: { $sum: 1 },
//       },
//     },

//     // Stage 3: Sort documents by bookingsCount in descending order
//     {
//       $sort: { bookingsCount: -1 },
//     },
//     // Stage 4: Limit the documents
//     {
//       $limit: 3,
//     },
//     // Stage 5: Retrieve additional data from rooms collection like room name
//     {
//       $lookup: {
//         from: "rooms",
//         localField: "_id",
//         foreignField: "_id",
//         as: "roomData",
//       },
//     },
//     // Stage 6: Takes roomData and deconstructs into documents
//     {
//       $unwind: "$roomData",
//     },
//     // Stage 7: Shape the output document (include or exclude the fields)
//     {
//       $project: {
//         _id: 0,
//         roomName: "$roomData.name",
//         bookingsCount: 1,
//       },
//     },
//   ]);

//   return topRooms;
// };

// // Get sales stats   =>  /api/admin/sales_stats
// export const getSalesStats = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);

//   const startDate = new Date(searchParams.get("startDate") as string);
//   const endDate = new Date(searchParams.get("endDate") as string);
//   startDate.setHours(0, 0, 0, 0);
//   endDate.setHours(23, 59, 59, 999);

//   const bookings = await Booking.find({
//     createdAt: { $gte: startDate, $lte: endDate },
//   });

//   const numberOfBookings = bookings.length;
//   const totalSales = bookings.reduce(
//     (acc, booking) => acc + booking.amountPaid,
//     0
//   );

//   const sixMonthSalesData = await getLastSixMonthsSales();
//   const topRooms = await getTopPerformingRooms(startDate, endDate);

//   return NextResponse.json({
//     numberOfBookings,
//     totalSales,
//     sixMonthSalesData,
//     topRooms,
//   });
// });

// //Get admin Bookings  => api/admin/bookings
// export const allAdminBookings = catchAsyncErrors(async (req: NextRequest) => {
//   const bookings = await Booking.find().sort({ createdAt: -1 }).populate("room");

//   return NextResponse.json({
//     bookings,
//   })
// })

// // Delete booking   =>  /api/admin/bookings/:id
// export const deleteBooking = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const booking = await Booking.findById(params.id);

//     if (!booking) {
//       throw new ErrorHandler("Booking not found with this ID", 404);
//     }

//     await booking?.deleteOne();

//     return NextResponse.json({
//       success: true,
//     }, { status: 200 });
//   }
// );

//PostGreSQL
// import { NextRequest, NextResponse } from "next/server";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
// import pool from "../config/dbConnect";
// import moment from "moment";
// import ErrorHandler from "../utils/errorHandler";

import { NextRequest, NextResponse } from "next/server";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import Moment from "moment";
import { extendMoment } from "moment-range";
import ErrorHandler from "../utils/errorHandler";
import pool from "../config/dbConnect";

const moment = extendMoment(Moment);

interface SalesData {
  month: string; // The month in 'YYYY-MM-DD' format
  total_sales: number; // The total sales for the month
}

// Create new Booking => /api/bookings
export const newBooking = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const {
    room_id,
    check_in_date,
    check_out_date,
    days_of_stay,
    amount_paid,
    payment_info,
  } = body;

  const payment_id = payment_info?.id;
  const payment_status = payment_info?.status || "unpaid";

  const query = `
    INSERT INTO bookings (
      room_id, 
      user_id, 
      check_in_date, 
      check_out_date, 
      days_of_stay, 
      amount_paid, 
      payment_info, 
      payment_id,
      payment_status,
      paid_at, 
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'pending') 
    RETURNING *;
  `;

  const values = [
    room_id,
    req.user.id,
    check_in_date,
    check_out_date,
    days_of_stay,
    amount_paid,
    JSON.stringify(payment_info),
    payment_id,
    payment_status,
  ];

  const result = await pool.query(query, values);
  const newBooking = result.rows[0];

  // ✅ Notify admin about the new pending booking
  await pool.query(
    `
      INSERT INTO notifications (
        id,
        user_id,
        room_id,
        type,
        message,
        is_read,
        created_at
      )
      VALUES (
        gen_random_uuid(),
        $1,
        $2,
        'booking',
        $3,
        FALSE,
        NOW()
      );
    `,
    [
      req.user.id,
      room_id,
      `New booking request from user ${req.user.name} for Room ID: ${room_id}`,
    ]
  );

  console.log("✅ Incoming booking payload:", body);
  console.log("✅ User info from request:", req.user);

  return NextResponse.json({
    booking: newBooking,
  });
});

// Check Room Booking Availability => /api/bookings/check
export const checkRoomBookingAvailability = catchAsyncErrors(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("room_id");

    const checkInDate: Date = new Date(
      searchParams.get("check_in_date") as string
    );
    const checkOutDate: Date = new Date(
      searchParams.get("check_out_date") as string
    );

    const query = `
    SELECT * FROM bookings WHERE room_id = $1 AND
      (check_in_date <= $2 AND check_out_date >= $3);
  `;
    const values = [roomId, checkOutDate, checkInDate];
    const result = await pool.query(query, values);

    const isAvailable = result.rows.length === 0;

    return NextResponse.json({
      isAvailable,
    });
  }
);

//Get all admin notifications => /api/admin/notifications
export const getAdminNotifications = catchAsyncErrors(
  async (req: NextRequest) => {
    try {
      console.log("➡️ Fetching admin notifications...");

      const { rows } = await pool.query(
        `
        SELECT 
          n.id,
          b.status,
          n.created_at,
          u.name AS user_name,
          r.name AS room_name
        FROM 
          notifications n
        JOIN users u ON n.user_id = u.id
        JOIN rooms r ON n.room_id = r.id
        LEFT JOIN LATERAL (
          SELECT status
          FROM bookings
          WHERE bookings.user_id = n.user_id
            AND bookings.room_id = n.room_id
          ORDER BY bookings.created_at DESC
          LIMIT 1
        ) b ON true
        ORDER BY n.created_at DESC
        `
      );

      console.log("✅ Notifications fetched:", rows.length, "rows");
      console.log(rows);

      return NextResponse.json({
        success: true,
        notifications: rows,
      });
    } catch (error: any) {
      console.error("❌ Error fetching admin notifications:", error.message);
      return NextResponse.json(
        { success: false, message: "Failed to fetch notifications" },
        { status: 500 }
      );
    }
  }
);

// export const getAdminNotifications = catchAsyncErrors(async (req: NextRequest) => {
//   const user = req.user;

//   if (!user || user.role !== "admin") {
//     throw new ErrorHandler("Unauthorized access", 403);
//   }

//   const query = `
//     SELECT n.*, u.name AS user_name, r.name AS room_name
//     FROM notifications n
//     JOIN users u ON n.user_id = u.id
//     LEFT JOIN bookings b ON n.booking_id = b.id
//     LEFT JOIN rooms r ON b.room_id = r.id
//     WHERE n.type = 'booking'
//     ORDER BY n.created_at DESC
//   `;

//   const { rows } = await pool.query(query);

//   return NextResponse.json({
//     success: true,
//     notifications: rows,
//   });
// });

// export const getAdminNotifications = catchAsyncErrors(
//   async (req: NextRequest) => {
//     const { rows } = await pool.query(
//       `SELECT * FROM notifications ORDER BY created_at DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       notifications: rows,
//     });
//   }
// );

// Get room booked dates => /api/bookings/get_booked_dates
// export const getRoomBookedDates = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("room_id");

//   const query = `
//     SELECT check_in_date, check_out_date FROM bookings WHERE room = $1 ORDER BY created_at DESC;
//   `;
//   const values = [roomId];
//   const result = await pool.query(query, values);

//   const bookedDates = result.rows.flatMap((booking: any) =>
//     Array.from(
//       moment
//         .range(moment(booking.check_in_date), moment(booking.check_out_date))
//         .by("day")
//     )
//   );

//   return NextResponse.json({
//     bookedDates,
//   });
// });

export const getRoomBookedDates = catchAsyncErrors(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("room_id");

    if (!roomId) {
      return NextResponse.json({ error: "Missing room_id" }, { status: 400 });
    }

    const query = `
      SELECT check_in_date, check_out_date 
      FROM bookings 
      WHERE room_id = $1 
      ORDER BY created_at DESC;
    `;
    const values = [roomId];
    const result = await pool.query(query, values);

    const bookedDates = result.rows.flatMap((booking: any) =>
      Array.from(
        moment
          .range(moment(booking.check_in_date), moment(booking.check_out_date))
          .by("day")
      )
    );

    return NextResponse.json({ bookedDates });
  } catch (error: any) {
    console.error("Error fetching booked dates:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
});

// Get current user bookings => /api/bookings/me
export const myBookings = catchAsyncErrors(async (req: NextRequest) => {
  const query = `
    SELECT 
      bookings.*, 
      rooms.name AS room_name
    FROM bookings
    LEFT JOIN rooms ON bookings.room_id = rooms.id
    WHERE bookings.user_id = $1
    ORDER BY bookings.created_at DESC;
  `;
  const values = [req.user.id];
  const result = await pool.query(query, values);

  const bookingsWithRoom = result.rows.map((row: any) => ({
    ...row,
    room: {
      name: row.room_name,
    },
  }));

  return NextResponse.json({
    bookings: bookingsWithRoom,
  });
});
// Get booking details => /api/bookings/:id
export const getBookingDetails = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const client = await pool.connect();

    try {
      const bookingId = params.id;
      console.log("Fetching booking with ID:", bookingId);

      const result = await client.query(
        `
        SELECT 
          b.*, 
          u.id AS user_id, u.name AS user_name, u.email AS user_email, u.role AS user_role,
          r.id AS room_id, r.name AS room_name, r.price_per_night, r.images
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN rooms r ON b.room_id = r.id
        WHERE b.id = $1;
        `,
        [bookingId]
      );

      if (result.rows.length === 0) {
        console.log("No booking found for ID:", bookingId);
        throw new ErrorHandler("Booking not found", 404);
      }

      const row = result.rows[0];
      console.log("Raw booking row:", row);

      const booking = {
        id: row.id,
        room_id: row.room_id,
        user_id: row.user_id,
        check_in_date: row.check_in_date,
        check_out_date: row.check_out_date,
        amount_paid: row.amount_paid,
        days_of_stay: row.days_of_stay,
        payment_info: row.payment_info,
        paid_at: row.paid_at,
        created_at: row.created_at,
        status: row.status,
        cancellation_confirmed: row.cancellation_confirmed,
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          role: row.user_role,
        },
        room: {
          id: row.room_id,
          name: row.room_name,
          price_per_night: row.price_per_night,
          images: row.images
        },
      };

      console.log("Formatted booking object:", booking);

      // Authorization check
      if (
        booking.user.id.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        console.log("Unauthorized access attempt by user:", req.user.id);
        throw new ErrorHandler("You cannot view this booking", 403);
      }

      return NextResponse.json({ booking });
    } catch (error) {
      console.error("Booking fetch error:", error);
      throw error;
    } finally {
      client.release();
    }
  }
);

// export const getBookingDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const query = `
//     SELECT * FROM bookings WHERE id = $1;
//   `;
//     const values = [params.id];
//     const result = await pool.query(query, values);

//     const booking = result.rows[0];
//     if (
//       !booking ||
//       (booking.user_id !== req.user.id && req.user.role !== "admin")
//     ) {
//       throw new ErrorHandler("You cannot view this booking", 403);
//     }

//     return NextResponse.json({
//       booking,
//     });
//   }
// );

// Cancel booking => /api/bookings/:id/cancel
export const cancelBooking = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const query = `SELECT * FROM bookings WHERE id = $1;`;
    const values = [params.id];
    const result = await pool.query(query, values);

    const booking = result.rows[0];

    if (!booking) {
      throw new ErrorHandler("Booking not found with this ID", 404);
    }

    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      throw new ErrorHandler(
        "You are not authorized to cancel this booking",
        403
      );
    }

    if (booking.status !== "pending") {
      throw new ErrorHandler("Only pending bookings can be cancelled", 400);
    }

    // Update booking status to canceled
    const cancelQuery = `UPDATE bookings SET status = 'cancelled' WHERE id = $1;`;
    await pool.query(cancelQuery, values);

    // Update room availability
    await updateRoomAvailability(
      booking.room_id,
      booking.check_in_date,
      booking.check_out_date
    );

    return NextResponse.json({
      success: true,
      message: "Booking has been cancelled",
    });
  }
);

// Function to update room availability
const updateRoomAvailability = async (
  roomId: string,
  checkInDate: Date,
  checkOutDate: Date
) => {
  const query = `
    SELECT * FROM rooms WHERE id = $1;
  `;
  const values = [roomId];
  const result = await pool.query(query, values);

  const room = result.rows[0];

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  // Assuming there's a field `unavailable_dates` in rooms table
  const unavailableDatesQuery = `
    UPDATE rooms SET unavailable_dates = array_append(unavailable_dates, $1)
    WHERE id = $2;
  `;
  const dateRange = { startDate: checkInDate, endDate: checkOutDate };
  await pool.query(unavailableDatesQuery, [dateRange, roomId]);
};

// Get sales stats => /api/admin/sales_stats

export const getSalesStats = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = new Date(searchParams.get("startDate") as string);
    const endDate = new Date(searchParams.get("endDate") as string);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("📆 Getting sales stats between:", startDate, endDate);

    const { rows } = await pool.query(
      `SELECT amount_paid FROM bookings WHERE created_at BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    const numberOfBookings = rows.length;
    const totalSales = rows.reduce(
      (acc: any, b: any) => acc + parseFloat(b.amount_paid),
      0
    );

    const sixMonthSalesData = await getLastSixMonthsSales();
    const topRooms = await getTopPerformingRooms(startDate, endDate);

    return NextResponse.json({
      numberOfBookings,
      totalSales,
      sixMonthSalesData,
      topRooms,
    });
  } catch (error) {
    console.error("❌ Error in getSalesStats handler:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales stats" },
      { status: 500 }
    );
  }
};
// export const getSalesStats = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);

//   const startDate = new Date(searchParams.get("startDate") as string);
//   const endDate = new Date(searchParams.get("endDate") as string);
//   startDate.setHours(0, 0, 0, 0);
//   endDate.setHours(23, 59, 59, 999);

//   const query = `
//     SELECT * FROM bookings WHERE created_at BETWEEN $1 AND $2;
//   `;
//   const values = [startDate, endDate];
//   const result = await pool.query(query, values);

//   const numberOfBookings = result.rows.length;
//   const totalSalesQuery = `
//     SELECT SUM(amount_paid) AS total_sales FROM bookings WHERE created_at BETWEEN $1 AND $2;
//   `;
//   const totalSalesResult = await pool.query(totalSalesQuery, values);
//   const totalSales = totalSalesResult.rows[0].total_sales || 0;

//   // Fetch last 6 months sales data
//   const sixMonthSalesData = await getLastSixMonthsSales();

//   // Fetch top performing rooms
//   const topRooms = await getTopPerformingRooms(startDate, endDate);

//   return NextResponse.json({
//     numberOfBookings,
//     totalSales,
//     sixMonthSalesData,
//     topRooms,
//   });
// });

// Get top performing rooms based on bookings

export const getTopPerformingRooms = async (startDate: Date, endDate: Date) => {
  try {
    console.log("🔍 Getting top performing rooms between:", startDate, endDate);

    const { rows } = await pool.query(
      `SELECT 
         r.name AS room_name,
         COUNT(b.id) AS bookings_count
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.created_at BETWEEN $1 AND $2
       GROUP BY r.name
       ORDER BY bookings_count DESC
       LIMIT 3`,
      [startDate, endDate]
    );

    return rows.map((row: any) => ({
      roomName: row.room_name,
      bookingsCount: parseInt(row.bookings_count),
    }));
  } catch (error) {
    console.error("❌ Error getting top performing rooms:", error);
    return [];
  }
};

// const getTopPerformingRooms = async (startDate: Date, endDate: Date) => {
//   const query = `
//     SELECT room_id, COUNT(*) AS booking_count
//     FROM bookings
//     WHERE created_at BETWEEN $1 AND $2
//     GROUP BY room_id
//     ORDER BY booking_count DESC
//     LIMIT 3;
//   `;
//   const values = [startDate, endDate];
//   const result = await pool.query(query, values);

//   return result.rows;
// };

// Fetch sales data for the last 6 months

export const getLastSixMonthsSales = async () => {
  const last6MonthsSales: any = [];
  const currentDate = moment();

  for (let i = 0; i < 6; i++) {
    const startDate = moment(currentDate).startOf("month").toDate();
    const endDate = moment(currentDate).endOf("month").toDate();

    try {
      console.log(`Fetching sales from ${startDate} to ${endDate}`);

      const { rows } = await pool.query(
        `SELECT 
           COALESCE(SUM(amount_paid), 0) AS total_sales,
           COUNT(*) AS num_of_bookings
         FROM bookings
         WHERE created_at >= $1 AND created_at <= $2`,
        [startDate, endDate]
      );

      const { total_sales, num_of_bookings } = rows[0];

      last6MonthsSales.push({
        monthName: moment(startDate).format("MMMM"),
        totalSales: parseFloat(total_sales),
        numOfBookings: parseInt(num_of_bookings),
      });
    } catch (error) {
      console.error(`❌ Error fetching month: ${startDate}`, error);
    }

    currentDate.subtract(1, "months");
  }

  return last6MonthsSales;
};

// const getLastSixMonthsSales = async () => {
//   const query = `
//     SELECT
//       DATE_TRUNC('month', created_at) AS month,
//       SUM(amount_paid) AS total_sales
//     FROM bookings
//     WHERE created_at >= NOW() - INTERVAL '6 months'
//     GROUP BY month
//     ORDER BY month DESC;
//   `;
//   const result = await pool.query(query);

//   // If there are months with no sales, fill them in as 0
//   const salesData = result.rows;
//   const lastSixMonths = [];
//   let currentMonth = moment().startOf("month");

//   for (let i = 0; i < 6; i++) {
//     const monthData = salesData.find((sale: any) =>
//       moment(sale.month).isSame(currentMonth, "month")
//     );

//     lastSixMonths.push({
//       month: currentMonth.format("MMMM YYYY"),
//       total_sales: monthData ? monthData.total_sales : 0,
//     });

//     currentMonth = currentMonth.subtract(1, "month");
//   }

//   return lastSixMonths;
// };

// Delete booking   =>  /api/admin/bookings/:id

export const deleteBooking = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    // Ensure booking exists by querying it using the provided id
    const query = `SELECT * FROM bookings WHERE id = $1`;
    const { rows } = await pool.query(query, [params.id]);

    if (rows.length === 0) {
      throw new ErrorHandler("Booking not found with this ID", 404);
    }

    // Proceed to delete the booking
    const deleteQuery = `DELETE FROM bookings WHERE id = $1 RETURNING *`;
    const deleteResult = await pool.query(deleteQuery, [params.id]);

    // If the booking was deleted successfully, send response
    if (deleteResult.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Booking has been deleted successfully",
      });
    }

    // In case deletion failed for some reason
    throw new ErrorHandler("Failed to delete booking", 500);
  }
);

// Get all admin bookings  =>  /api/admin/bookings
export const allAdminBookings = catchAsyncErrors(async (req: NextRequest) => {
  const query = `
   SELECT 
      b.id,
      r.name AS room_name,
      b.check_in_date,
      b.check_out_date,
      b.amount_paid,
      b.status
  FROM bookings b
  JOIN rooms r ON b.room_id = r.id
  ORDER BY b.created_at DESC;
    `;

  const { rows } = await pool.query(query);
  console.log("All Rooms Fetched: ", rows);

  const bookings = rows.map((row: any) => ({
    id: row.id,
    check_in_date: row.check_in_date,
    check_out_date: row.check_out_date,
    amount_paid: row.amount_paid,
    status: row.status,
    room: {
      name: row.room_name,
    },
  }));

  return NextResponse.json({
    bookings
  });
});

// export const confirmBooking = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const bookingId = params.id;
//     const userRole = req.user.role;

//     if (userRole !== "admin") {
//       throw new ErrorHandler("Only admins can confirm bookings", 403);
//     }

//     const result = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
//       bookingId,
//     ]);

//     const booking = result.rows[0];

//     if (!booking) {
//       throw new ErrorHandler("Booking not found", 404);
//     }

//     if (booking.status !== "pending") {
//       throw new ErrorHandler("Only pending bookings can be confirmed", 400);
//     }

//     await pool.query(`UPDATE bookings SET status = 'confirmed' WHERE id = $1`, [
//       bookingId,
//     ]);

//     await pool.query(
//       `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
//       [
//         booking.user_id, // assuming 'user_id' is in the booking row
//         `Your booking for Room ${booking.room_name} has been accepted by the admin.`,
//       ]
//     );

//     return NextResponse.json({
//       success: true,
//       message: "Booking has been confirmed",
//     });
//   }
// );

export const confirmBooking = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const bookingId = params.id;
      const userRole = req.user.role;

      console.log("🔒 User Role:", userRole);
      console.log("📌 Booking ID to confirm:", bookingId);

      if (userRole !== "admin") {
        throw new ErrorHandler("Only admins can confirm bookings", 404);
      }

      const result = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
        bookingId,
      ]);

      const booking = result.rows[0];

      if (!booking) {
        console.warn("Booking not found for ID:", bookingId);
        throw new ErrorHandler("Booking not found", 404);
      }

      if (booking.status !== "pending") {
        console.warn("Booking status is not pending:", booking.status);
        throw new ErrorHandler("Only pending bookings can be confirmed", 404);
      }

      await pool.query(
        `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
        [bookingId]
      );
      console.log("✅ Booking confirmed successfully");

      //Fetch room name
      const roomRes = await pool.query(`SELECT name FROM rooms WHERE id = $1`, [
        booking.room_id,
      ]);
      const roomName = roomRes.rows[0]?.name || "your room";

      console.log("Room name: ", roomName);

      //Insert notifications for the user
      await pool.query(
        `
          INSERT INTO notifications (
            id,
            user_id,
            room_id,
            type,
            message,
            status,
            is_read,
            created_at
          )
          VALUES (
            gen_random_uuid(),
            $1,
            $2,
            'booking-update',
            $3,
            'confirmed',
            FALSE,
            NOW()
          )
          `,
        [
          booking.user_id,
          booking.room_id,
          `Your booking for "${roomName}" has been accepted by the admin.`,
        ]
      );

      console.log("Notification sent to user ID: ", booking.user_id);

      return NextResponse.json({
        success: true,
        message: "Booking has been confirmed",
      });
    } catch (error: any) {
      console.error("❌ Error in confirmBooking:", error.message);
      return NextResponse.json({
        success: false,
        message: error.message,
        status: 500,
      });
    }
  }
);

// //Create a new Booking and notify admin => /api/bookings
// export const creteBooking = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();

//   const {
//     user_id,
//     room_id,
//     check_in_date,
//     check_out_date,
//     amount_paid,
//     days_of_stay
//   } = body;

//   //Optional: validate required fields
//   if (!user_id || !room_id || !check_in_date || !check_out_date || !amount_paid) {
//     throw new ErrorHandler("All fields are required", 400)
//   }

//   await pool.query(
//     `INSERT INTO bookings (
//       id,
//       user_id,
//       room_id,
//       check_in_date,
//       check_out_date,
//       amount_paid,
//       days_of_stay
//     ) VALUES (
//         gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'pending'
//     )`
//   );

//   await pool.query(
//     `INSERT INTO notifications (id, user_id, type, message)
//     VALUES (gen_random_uuid(), $1, 'booking', 'New booking request pending approval')
//     `,[user_id]
//   );

//   return NextResponse.json({
//     success: true,
//     message: "Booking Submitted and admin notified"
//   });
// });

export const getUserNotifications = catchAsyncErrors(
  async (req: NextRequest) => {
    const userId = req.user.id;

    const query = `
      SELECT 
        n.id,
        n.message,
        n.type,
        n.is_read,
        n.created_at,
        r.name AS room_name,
        b.status
      FROM notifications n
      LEFT JOIN rooms r ON n.room_id = r.id
      LEFT JOIN bookings b ON n.user_id = b.user_id AND n.room_id = b.room_id
      WHERE n.user_id = $1 AND b.status = 'confirmed'
      ORDER BY n.created_at DESC
    `;

    const values = [userId];

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      notifications: result.rows,
    });
  }
);


export const markNotificationAsRead = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const notificationId = params.id;

    const checkQuery = `SELECT * FROM notifications WHERE id = $1`;
    const { rows } = await pool.query(checkQuery, [notificationId]);

    if (rows.length === 0) {
      throw new ErrorHandler("Notification not found", 404);
    }

    const updateQuery = `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING`;
    const result = await pool.query(updateQuery, [notificationId]);

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification: result.rows[0],
    });
  }
);

import { NextRequest, NextResponse } from "next/server";   
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import Booking, { IBooking } from "../models/booking";
import Moment from "moment";
import { extendMoment } from "moment-range";
import ErrorHandler from "../utils/errorHandler";
import Room from '../models/room'
const moment = extendMoment(Moment);


// Create new Booking   =>  /api/bookings
export const newBooking = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  const {
    room,
    checkInDate,
    checkOutDate,
    daysOfStay,
    amountPaid,
    paymentInfo,
  } = body;

  const booking = await Booking.create({
    room,
    user: req.user._id,
    checkInDate,
    checkOutDate,
    daysOfStay,
    amountPaid,
    paymentInfo,
    paidAt: Date.now(),
    status: 'pending',
  });

  return NextResponse.json({
    booking,
  });
});


// Check Room Booking Availability   =>  /api/bookings/check
export const checkRoomBookingAvailability = catchAsyncErrors(
  async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    const checkInDate: Date = new Date(
      searchParams.get("checkInDate") as string
    );
    const checkOutDate: Date = new Date(
      searchParams.get("checkOutDate") as string
    );

    const bookings: IBooking[] = await Booking.find({
      room: roomId,
      $and: [
        { checkInDate: { $lte: checkOutDate } },
        { checkOutDate: { $gte: checkInDate } },
      ],
    });

    const isAvailable: boolean = bookings.length === 0;

    return NextResponse.json({
      isAvailable,
    });
  }
);

// Get room booked dates   =>  /api/bookings/get_booked_dates
export const getRoomBookedDates = catchAsyncErrors(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  const bookings = await Booking.find({ room: roomId }).sort({ createdAt: -1 });

  const bookedDates = bookings.flatMap((booking) =>
    Array.from(
      moment
        .range(moment(booking.checkInDate), moment(booking.checkOutDate))
        .by("day")
    )
  );

  return NextResponse.json({
    bookedDates,
  });
});

// Get current user bookings   =>  /api/bookings/me
export const myBookings = catchAsyncErrors(async (req: NextRequest) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("room") // ✅ This is the fix
    .sort({ createdAt: -1 });

  return NextResponse.json({
    bookings,
  });
});

// Get booking details   =>  /api/bookings/:id
export const getBookingDetails = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const booking = await Booking.findById(params.id).populate("user room");

    if (booking.user?._id?.toString() !== req.user._id && req?.user?.role !== 'admin') {
      throw new ErrorHandler("You can not view this booking", 403);
    }

    return NextResponse.json({
      booking,
    });
  }
);

const updateBookingStatus = async (bookingId: string, newStatus: string) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new ErrorHandler("Booking not found with this ID", 404);
  }

  booking.status = newStatus;
  await booking.save();
}

// Cancel booking => /api/bookings/:id/cancel
export const cancelBooking = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const booking = await Booking.findById(params.id);

    // Check if booking exists
    if (!booking) {
      throw new ErrorHandler("Booking not found with this ID", 404);
    }

    // Check if the user owns the booking
    if (!req.user || (booking.user._id?.toString() !== req.user._id && req.user.role !== 'admin')) {
      throw new ErrorHandler("You are not authorized to cancel this booking", 403);
    }

    // Only allow cancellation if the status is pending
    if (booking.status !== 'pending') {
      throw new ErrorHandler("Only pending bookings can be cancelled", 400)
    }

    // Update booking status to canceled
    await updateBookingStatus(params.id, 'cancelled');
    booking.status = "cancelled";
    booking.cancellationConfirmed = true;
    await booking.save();

    // Update the room's availability for the canceled booking date range
    await updateRoomAvailability(
      booking.room._id, // Assuming room is an ObjectId
      booking.checkInDate, 
      booking.checkOutDate
    );

    return NextResponse.json({
      success: true,
      message: "Booking has been cancelled",
    });
  }
);

export const confirmBooking = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string} }) => {
  const booking = await Booking.findById(params.id);

  //Ensure booking exists
  if (!booking) {
    throw new ErrorHandler("Booking not found", 404);
  }

  //Only an admin can confirm bookings 
  if (req.user.role !== 'admin') {
    throw new ErrorHandler("Only Admins can confirm bookings", 403)
  }

  //Check if the booking status is pending before confirming
  if (booking.status !== 'pending') {
    throw new ErrorHandler("Only pending bookings can be confirmed", 404)
  }

  //Change status to 'confirmed'
  await updateBookingStatus(params.id, 'confirmed');

  return NextResponse.json({
    success: true,
    message: "Booking has been confirmed"
  })
})

// Function to update room availability 
const updateRoomAvailability = async (roomId: string, checkInDate: Date, checkOutDate: Date) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (room.unavailableDates) {
    room.unavailableDates = room.unavailableDates.filter(
      (dateRange: { startDate: Date; endDate: Date }) => 
        !(dateRange.startDate <= checkInDate && dateRange.endDate >= checkOutDate)
    );
  } else {
    room.unavailableDates = [];
  }

  room.unavailableDates.push({
    startDate: checkInDate,
    endDate: checkOutDate,
  });

  await room.save();
};




const getLastSixMonthsSales = async () => {
  const last6MonthsSales: any = [];

  // Get Current date
  const currentDate = moment();

  async function fetchSalesForMonth(
    startDate: moment.Moment,
    endDate: moment.Moment
  ) {
    const result = await Booking.aggregate([
      // Stage 1 => Filter the data
      {
        $match: {
          createdAt: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        },
      },
      // Stage 2: Grouping the data
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amountPaid" },
          numOfBookings: { $sum: 1 },
        },
      },
    ]);

    const { totalSales, numOfBookings } =
      result?.length > 0 ? result[0] : { totalSales: 0, numOfBookings: 0 };

    last6MonthsSales.push({
      monthName: startDate.format("MMMM"),
      totalSales,
      numOfBookings,
    });
  }

  for (let i = 0; i < 6; i++) {
    const startDate = moment(currentDate).startOf("month");
    const endDate = moment(currentDate).endOf("month");

    await fetchSalesForMonth(startDate, endDate);

    currentDate.subtract(1, "months");
  }

  return last6MonthsSales;
};

const getTopPerformingRooms = async (startDate: Date, endDate: Date) => {
  const topRooms = await Booking.aggregate([
    // Stage 1: Filter documents within start and end date
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    // Stage 2: Group documents by room
    {
      $group: {
        _id: "$room",
        bookingsCount: { $sum: 1 },
      },
    },

    // Stage 3: Sort documents by bookingsCount in descending order
    {
      $sort: { bookingsCount: -1 },
    },
    // Stage 4: Limit the documents
    {
      $limit: 3,
    },
    // Stage 5: Retrieve additional data from rooms collection like room name
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "_id",
        as: "roomData",
      },
    },
    // Stage 6: Takes roomData and deconstructs into documents
    {
      $unwind: "$roomData",
    },
    // Stage 7: Shape the output document (include or exclude the fields)
    {
      $project: {
        _id: 0,
        roomName: "$roomData.name",
        bookingsCount: 1,
      },
    },
  ]);

  return topRooms;
};

// Get sales stats   =>  /api/admin/sales_stats
export const getSalesStats = catchAsyncErrors(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const startDate = new Date(searchParams.get("startDate") as string);
  const endDate = new Date(searchParams.get("endDate") as string);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const numberOfBookings = bookings.length;
  const totalSales = bookings.reduce(
    (acc, booking) => acc + booking.amountPaid,
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
});

//Get admin Bookings  => api/admin/bookings
export const allAdminBookings = catchAsyncErrors(async (req: NextRequest) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });

  return NextResponse.json({
    bookings,
  })
})

// Delete booking   =>  /api/admin/bookings/:id
export const deleteBooking = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const booking = await Booking.findById(params.id);

    if (!booking) {
      throw new ErrorHandler("Booking not found with this ID", 404);
    }

    await booking?.deleteOne();

    return NextResponse.json({
      success: true,
    }, { status: 200 });
  }
);

// import { NextRequest, NextResponse } from "next/server";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
// import db from '../config/dbConnect'
// import moment from "moment";
// import ErrorHandler from "../utils/errorHandler";

// interface SalesData {
//   month: string; // The month in 'YYYY-MM-DD' format
//   total_sales: number; // The total sales for the month
// }


// const pool = db.pool;

// // Create new Booking => /api/bookings
// export const newBooking = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();

//   const { room, checkInDate, checkOutDate, daysOfStay, amountPaid, paymentInfo } = body;

//   const query = `
//     INSERT INTO bookings (room, user_id, check_in_date, check_out_date, days_of_stay, amount_paid, payment_info, paid_at, status)
//     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending') RETURNING *;
//   `;
//   const values = [room, req.user.id, checkInDate, checkOutDate, daysOfStay, amountPaid, paymentInfo];
//   const result = await db.pool.query(query, values);

//   return NextResponse.json({
//     booking: result.rows[0],
//   });
// });

// // Check Room Booking Availability => /api/bookings/check
// export const checkRoomBookingAvailability = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId");

//   const checkInDate: Date = new Date(searchParams.get("checkInDate") as string);
//   const checkOutDate: Date = new Date(searchParams.get("checkOutDate") as string);

//   const query = `
//     SELECT * FROM bookings WHERE room = $1 AND
//       (check_in_date <= $2 AND check_out_date >= $3);
//   `;
//   const values = [roomId, checkOutDate, checkInDate];
//   const result = await db.pool.query(query, values);

//   const isAvailable = result.rows.length === 0;

//   return NextResponse.json({
//     isAvailable,
//   });
// });

// // Get room booked dates => /api/bookings/get_booked_dates
// export const getRoomBookedDates = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId");

//   const query = `
//     SELECT check_in_date, check_out_date FROM bookings WHERE room = $1 ORDER BY created_at DESC;
//   `;
//   const values = [roomId];
//   const result = await db.pool.query(query, values);

//   const bookedDates = result.rows.flatMap((booking: any) =>
//     Array.from(moment.range(moment(booking.check_in_date), moment(booking.check_out_date)).by("day"))
//   );

//   return NextResponse.json({
//     bookedDates,
//   });
// });

// // Get current user bookings => /api/bookings/me
// export const myBookings = catchAsyncErrors(async (req: NextRequest) => {
//   const query = `
//     SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC;
//   `;
//   const values = [req.user.id];
//   const result = await db.pool.query(query, values);

//   return NextResponse.json({
//     bookings: result.rows,
//   });
// });

// // Get booking details => /api/bookings/:id
// export const getBookingDetails = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const query = `
//     SELECT * FROM bookings WHERE id = $1;
//   `;
//   const values = [params.id];
//   const result = await db.pool.query(query, values);

//   const booking = result.rows[0];
//   if (!booking || (booking.user_id !== req.user.id && req.user.role !== "admin")) {
//     throw new ErrorHandler("You cannot view this booking", 403);
//   }

//   return NextResponse.json({
//     booking,
//   });
// });

// // Cancel booking => /api/bookings/:id/cancel
// export const cancelBooking = catchAsyncErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
//   const query = `SELECT * FROM bookings WHERE id = $1;`;
//   const values = [params.id];
//   const result = await db.pool.query(query, values);

//   const booking = result.rows[0];

//   if (!booking) {
//     throw new ErrorHandler("Booking not found with this ID", 404);
//   }

//   if (booking.user_id !== req.user.id && req.user.role !== "admin") {
//     throw new ErrorHandler("You are not authorized to cancel this booking", 403);
//   }

//   if (booking.status !== "pending") {
//     throw new ErrorHandler("Only pending bookings can be cancelled", 400);
//   }

//   // Update booking status to canceled
//   const cancelQuery = `UPDATE bookings SET status = 'cancelled' WHERE id = $1;`;
//   await db.pool.query(cancelQuery, values);

//   // Update room availability
//   await updateRoomAvailability(booking.room_id, booking.check_in_date, booking.check_out_date);

//   return NextResponse.json({
//     success: true,
//     message: "Booking has been cancelled",
//   });
// });

// // Function to update room availability 
// const updateRoomAvailability = async (roomId: string, checkInDate: Date, checkOutDate: Date) => {
//   const query = `
//     SELECT * FROM rooms WHERE id = $1;
//   `;
//   const values = [roomId];
//   const result = await db.pool.query(query, values);

//   const room = result.rows[0];

//   if (!room) {
//     throw new ErrorHandler("Room not found", 404);
//   }

//   // Assuming there's a field `unavailable_dates` in rooms table
//   const unavailableDatesQuery = `
//     UPDATE rooms SET unavailable_dates = array_append(unavailable_dates, $1)
//     WHERE id = $2;
//   `;
//   const dateRange = { startDate: checkInDate, endDate: checkOutDate };
//   await db.pool.query(unavailableDatesQuery, [dateRange, roomId]);
// };

// // Get sales stats => /api/admin/sales_stats
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
//   const result = await db.pool.query(query, values);

//   const numberOfBookings = result.rows.length;
//   const totalSalesQuery = `
//     SELECT SUM(amount_paid) AS total_sales FROM bookings WHERE created_at BETWEEN $1 AND $2;
//   `;
//   const totalSalesResult = await db.pool.query(totalSalesQuery, values);
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

// // Get top performing rooms based on bookings
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
//   const result = await db.pool.query(query, values);

//   return result.rows;
// };

// // Fetch sales data for the last 6 months
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
//   const result = await db.pool.query(query);

//   // If there are months with no sales, fill them in as 0
//   const salesData = result.rows;
//   const lastSixMonths = [];
//   let currentMonth = moment().startOf('month');

//   for (let i = 0; i < 6; i++) {
//     const monthData = salesData.find((sale: any) =>
//       moment(sale.month).isSame(currentMonth, 'month')
//     );
    
//     lastSixMonths.push({
//       month: currentMonth.format('MMMM YYYY'),
//       total_sales: monthData ? monthData.total_sales : 0,
//     });

//     currentMonth = currentMonth.subtract(1, 'month');
//   }

//   return lastSixMonths;
// };

// // Delete booking   =>  /api/admin/bookings/:id
// export const deleteBooking = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     // Ensure booking exists by querying it using the provided id
//     const query = `SELECT * FROM bookings WHERE id = $1`;
//     const { rows } = await db.pool.query(query, [params.id]);

//     if (rows.length === 0) {
//       throw new ErrorHandler("Booking not found with this ID", 404);
//     }

//     // Proceed to delete the booking
//     const deleteQuery = `DELETE FROM bookings WHERE id = $1 RETURNING *`;
//     const deleteResult = await db.pool.query(deleteQuery, [params.id]);

//     // If the booking was deleted successfully, send response
//     if (deleteResult.rowCount > 0) {
//       return NextResponse.json({
//         success: true,
//         message: "Booking has been deleted successfully",
//       });
//     }

//     // In case deletion failed for some reason
//     throw new ErrorHandler("Failed to delete booking", 500);
//   }
// );

// // Get all admin bookings  =>  /api/admin/bookings
// export const allAdminBookings = catchAsyncErrors(async (req: NextRequest) => {
//   // Query to get all bookings, sorted by createdAt in descending order
//   const query = `SELECT * FROM bookings ORDER BY created_at DESC`;

//   const { rows } = await db.pool.query(query);

//   // Return the bookings data in JSON format
//   return NextResponse.json({
//     bookings: rows,
//   });
// });



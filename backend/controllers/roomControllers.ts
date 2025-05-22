import { NextRequest, NextResponse } from "next/server";
import Room, { IImage, IRoom } from "../models/room";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import APIFilters from "../utils/apiFilters";
import { IReview } from "../models/room";
import Booking from "../models/booking";
import { delete_file, upload_file } from "../utils/cloudinary";

// Get all rooms  =>  /api/rooms
export const allRooms = catchAsyncErrors(async (req: NextRequest) => {
  const resPerPage: number = 4;

  const { searchParams } = new URL(req.url);

  const queryStr: any = {};
  searchParams.forEach((value, key) => {
    queryStr[key] = value;
  });

  const apiFilters = new APIFilters(Room, queryStr).search().filter();

  let rooms: IRoom[] = await apiFilters.query;
  const filteredRoomsCount: number = rooms.length;

  apiFilters.pagination(resPerPage);
  rooms = await apiFilters.query.clone();

  return NextResponse.json({
    success: true,
    filteredRoomsCount,
    resPerPage,
    rooms,
  });
});

// Create new room  =>  /api/admin/rooms
export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  // Ensure images are valid strings
  if (!body?.images || !Array.isArray(body.images)) {
    throw new Error("Images must be an array.");
  }

  if (body.images.some((img: string) => typeof img !== "string")) {
    throw new Error("Each image must be a string (file path or base64).");
  }

  // Process image uploads
  const imageLinks: { public_id: string; url: string }[] = [];
  try {
    const uploadResults = await Promise.all(
      body.images.map(async (image: string) => {
        const result = await upload_file(image, "urban/rooms");
        return { public_id: result.public_id, url: result.url };
      })
    );
    imageLinks.push(...uploadResults);
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload images.");
  }

  body.images = imageLinks; // Attach uploaded images
  body.user = req.user._id; // Attach user

  // Create the room
  const room = await Room.create(body);

  return NextResponse.json({
    success: true,
    room,
  });
});


// export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   let imageLinks: { public_id: string; url: string }[] = []; // Declare imageLinks here
//   body.user = req.user._id;

//   const room = await Room.create(body);

//   // Function to upload each image
//   const uploader = async (image: string) => upload_file(image, "urban/rooms");

//   // Check if images are provided and upload them
//   if (body?.images && Array.isArray(body.images)) {
//     // Map through each image and upload it
//     const uploadResults = await Promise.all(
//       body.images.map(async (image: string) => {
//         const result = await uploader(image); // Await the result of upload
//         return {
//           public_id: result.public_id,
//           url: result.url,
//         };
//       })
//     );

//     console.log("Error", uploadResults);

//     imageLinks.push(...uploadResults);

//     room.images.push(...imageLinks);
    
//     await room.save();
//   }

//   return NextResponse.json({
//     success: true,
//     room,
//   });
// });


// Get room details  =>  /api/rooms/:id
export const getRoomDetails = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const room = await Room.findById(params.id).populate("reviews.user");

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }

    return NextResponse.json({
      success: true,
      room,
    });
  }
);

// Update room details  =>  /api/admin/rooms/:id
export const updateRoom = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    let room = await Room.findById(params.id);
    const body = await req.json();

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }

    room = await Room.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    return NextResponse.json({
      success: true,
      room,
    });
  }
);

//Upload room images => /api/admin/rooms/:id/upload_images
export const uploadRoomImages = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string}}) => {
    const room = await Room.findById(params.id);
    const body = await req.json();

    if (!room) {
      throw new ErrorHandler("Room not found", 404)
    }

    const uploader = async (image: string) => upload_file(image, "urban/rooms");

    const urls = await Promise.all((body?.images).map(uploader) );

    room?.images.push(...urls);

    await room.save();
    return NextResponse.json({
      success: true,
      room,
    })
  }
)

// Delete room image  =>  /api/admin/rooms/:id/delete_image
export const deleteRoomImage = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const room = await Room.findById(params.id);
    const body = await req.json();

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }

    const isDeleted = await delete_file(body?.imgId);

    if (isDeleted) {
      room.images = room?.images.filter(
        (img: IImage) => img.public_id !== body.imgId
      );
    }

    await room.save();

    return NextResponse.json({
      success: true,
      room,
    });
  }
);

// Delete room details  =>  /api/admin/rooms/:id
export const deleteRoom = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const room = await Room.findById(params.id);

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }

    // Delete images associated with the room
    for (let i = 0; i < room?.images?.length; i++) {
      await delete_file(room?.images[i].public_id);
    }

    await room.deleteOne();

    return NextResponse.json({
      success: true,
    });
  }
);

// Create/Update room review  =>  /api/reviews
export const createRoomReview = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();
  const { rating, comment, roomId } = body;

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment, 
  };

  const room = await Room.findById(roomId);

  const isReviewed = room?.reviews?.find(
    (r: IReview) => r.user?.toString() === req?.user?._id?.toString()
  );

  if (isReviewed) {
    room?.reviews?.forEach((review: IReview) => {
      if (review.user?.toString() === req?.user?._id?.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    room.reviews.push(review);
    room.numOfReviews = room.reviews.length;
  }

  room.ratings =
    room?.reviews?.reduce(
      (acc: number, item: { rating: number }) => item.rating + acc,
      0
    ) / room?.reviews?.length;

  await room.save();

  return NextResponse.json({
    success: true,
  });
});

// Can user review room  =>  /api/reviews/can_review
export const canReview = catchAsyncErrors(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  const bookings = await Booking.find({ user: req.user._id, room: roomId });

  const canReview = bookings?.length > 0 ? true : false;

  return NextResponse.json({
    canReview,
  });
});

// Get all rooms - ADMIN => /api/admin/rooms 
export const allAdminRooms = catchAsyncErrors(async (req: NextRequest) => {
  const rooms = await Room.find().sort({ createdAt: - 1 })

  return NextResponse.json({
      rooms,
  })
})

// import { NextRequest, NextResponse} from 'next/server';
// import db from '../config/dbConnect';
// import { catchAsyncErrors } from '../middlewares/catchAsyncErrors'; 
// import APIFilters from '../utils/apiFilters';
// import { delete_file, upload_file } from '../utils/cloudinary';

// // Get all rooms => /api/rooms
// export const allRooms = catchAsyncErrors(async (req: NextRequest) => {
//   const resPerPage: number = 4;
//   const { searchParams } = new URL(req.url);

//   const queryStr: any = {};
//   searchParams.forEach((value, key) => {
//     queryStr[key] = value;
//   });

//   const apiFilters = new APIFilters("rooms", queryStr).search().filter().pagination(resPerPage);

//   // Adjust query to use apiFilters.query
//   const roomsQuery = `
//     SELECT * FROM rooms
//     ${apiFilters.query ? 'WHERE ' + apiFilters.query : ''}
//     LIMIT $1 OFFSET $2
//   `;
//   const rooms = await db.pool.query(roomsQuery, [resPerPage, apiFilters.queryStr?.page]);

//   const filteredRoomsCountQuery = `
//     SELECT COUNT(*) FROM rooms ${apiFilters.query ? 'WHERE ' + apiFilters.query : ''}
//   `;
//   const filteredRoomsCountResult = await db.pool.query(filteredRoomsCountQuery);
//   const filteredRoomsCount = parseInt(filteredRoomsCountResult.rows[0].count);

//   return NextResponse.json({
//     success: true,
//     filteredRoomsCount,
//     resPerPage,
//     rooms: rooms.rows,
//   });
// });

// export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();

//   if (!body?.images || !Array.isArray(body.images)) {
//     throw new Error("Images must be an array.");
//   }

//   if (body.images.some((img: string) => typeof img !== "string")) {
//     throw new Error("Each image must be a string (file path or base64).");
//   }

//   const imageLinks: { public_id: string; url: string }[] = [];
//   try {
//     const uploadResults = await Promise.all(
//       body.images.map(async (image: string) => {
//         const result = await upload_file(image, "urban/rooms");
//         return { public_id: result.public_id, url: result.url };
//       })
//     );
//     imageLinks.push(...uploadResults);
//   } catch (error) {
//     console.error("Image upload failed:", error);
//     throw new Error("Failed to upload images.");
//   }

//   const insertRoomQuery = `
//     INSERT INTO rooms (name, description, price_per_night, address, location_type, 
//       location_coordinates, formatted_address, city, state, zip_code, country, guest_capacity, 
//       num_of_beds, is_internet, is_breakfast, is_air_conditioned, is_pets_allowed, 
//       is_room_cleaning, ratings, num_of_reviews, category, is_available, user_id)
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
//     RETURNING *;
//   `;
//   const roomResult = await db.pool.query(insertRoomQuery, [
//     body.name, body.description, body.price_per_night, body.address, body.location_type,
//     body.location_coordinates, body.formatted_address, body.city, body.state, body.zip_code,
//     body.country, body.guest_capacity, body.num_of_beds, body.is_internet, body.is_breakfast,
//     body.is_air_conditioned, body.is_pets_allowed, body.is_room_cleaning, body.ratings,
//     body.num_of_reviews, body.category, body.is_available, req.user.id
//   ]);
  
//   const room = roomResult.rows[0];

//   const insertImageQuery = `
//     INSERT INTO room_images (room_id, public_id, url)
//     VALUES ($1, $2, $3) RETURNING *;
//   `;
//   for (const image of imageLinks) {
//     await db.pool.query(insertImageQuery, [room.id, image.public_id, image.url]);
//   }

//   return NextResponse.json({
//     success: true,
//     room,
//   });
// });

// // Get room details => /api/rooms/:id
// export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomQuery = `
//       SELECT * FROM rooms WHERE id = $1
//     `;
//     const roomResult = await db.pool.query(roomQuery, [params.id]);

//     if (!roomResult.rows.length) {
//       throw new Error("Room not found");
//     }

//     const room = roomResult.rows[0];
//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// // Update room details => /api/admin/rooms/:id
// export const updateRoom = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const body = await req.json();

//     const updateRoomQuery = `
//       UPDATE rooms SET
//         name = $1, description = $2, price_per_night = $3, address = $4,
//         location_type = $5, location_coordinates = $6, formatted_address = $7,
//         city = $8, state = $9, zip_code = $10, country = $11, guest_capacity = $12,
//         num_of_beds = $13, is_internet = $14, is_breakfast = $15, is_air_conditioned = $16,
//         is_pets_allowed = $17, is_room_cleaning = $18, ratings = $19, num_of_reviews = $20,
//         category = $21, is_available = $22
//       WHERE id = $23 RETURNING *;
//     `;
//     const result = await db.pool.query(updateRoomQuery, [
//       body.name, body.description, body.price_per_night, body.address, body.location_type,
//       body.location_coordinates, body.formatted_address, body.city, body.state, body.zip_code,
//       body.country, body.guest_capacity, body.num_of_beds, body.is_internet, body.is_breakfast,
//       body.is_air_conditioned, body.is_pets_allowed, body.is_room_cleaning, body.ratings,
//       body.num_of_reviews, body.category, body.is_available, params.id
//     ]);

//     return NextResponse.json({
//       success: true,
//       room: result.rows[0],
//     });
//   }
// );

// // Upload room images => /api/admin/rooms/:id/upload_images
// export const uploadRoomImages = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const body = await req.json();
//     const roomQuery = `
//       SELECT * FROM rooms WHERE id = $1
//     `;
//     const roomResult = await db.pool.query(roomQuery, [params.id]);

//     if (!roomResult.rows.length) {
//       throw new Error("Room not found");
//     }

//     const room = roomResult.rows[0];

//     const uploader = async (image: string) => upload_file(image, "urban/rooms");
//     const urls = await Promise.all(body?.images.map(uploader));

//     const insertImageQuery = `
//       INSERT INTO room_images (room_id, public_id, url)
//       VALUES ($1, $2, $3) RETURNING *;
//     `;
//     for (const url of urls) {
//       await db.pool.query(insertImageQuery, [room.id, url.public_id, url.url]);
//     }

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// // Delete room image => /api/admin/rooms/:id/delete_image
// export const deleteRoomImage = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const body = await req.json();
//     const roomQuery = `
//       SELECT * FROM rooms WHERE id = $1
//     `;
//     const roomResult = await db.pool.query(roomQuery, [params.id]);

//     if (!roomResult.rows.length) {
//       throw new Error("Room not found");
//     }

//     const room = roomResult.rows[0];
//     const deleteImageQuery = `
//       DELETE FROM room_images WHERE public_id = $1 AND room_id = $2
//     `;
//     await db.pool.query(deleteImageQuery, [body.imgId, room.id]);

//     const isDeleted = await delete_file(body?.imgId);

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// // Delete room details => /api/admin/rooms/:id
// export const deleteRoom = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomQuery = `
//       SELECT * FROM rooms WHERE id = $1
//     `;
//     const roomResult = await db.pool.query(roomQuery, [params.id]);

//     if (!roomResult.rows.length) {
//       throw new Error("Room not found");
//     }

//     const room = roomResult.rows[0];
//     const deleteImagesQuery = `
//       DELETE FROM room_images WHERE room_id = $1
//     `;
//     await db.pool.query(deleteImagesQuery, [room.id]);

//     await delete_file(room.images.map((img: { public_id: string }) => img.public_id));

//     const deleteRoomQuery = `
//       DELETE FROM rooms WHERE id = $1
//     `;
//     await db.pool.query(deleteRoomQuery, [room.id]);

//     return NextResponse.json({
//       success: true,
//     });
//   }
// );

// // Create/Update room review => /api/reviews
// export const createRoomReview = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { rating, comment, roomId } = body;

//   const review = {
//     user: req.user.id,
//     rating: Number(rating),
//     comment,
//   };

//   const roomQuery = `
//     SELECT * FROM rooms WHERE id = $1
//   `;
//   const roomResult = await db.pool.query(roomQuery, [roomId]);

//   if (!roomResult.rows.length) {
//     throw new Error("Room not found");
//   }

//   const room = roomResult.rows[0];

//   const isReviewed = room.reviews.find((r: any) => r.user.toString() === req.user.id.toString());

//   if (isReviewed) {
//     // Update review
//     const updateReviewQuery = `
//       UPDATE room_reviews SET rating = $1, comment = $2
//       WHERE room_id = $3 AND user_id = $4 RETURNING *;
//     `;
//     await db.pool.query(updateReviewQuery, [rating, comment, roomId, req.user.id]);
//   } else {
//     // Insert new review
//     const insertReviewQuery = `
//       INSERT INTO room_reviews (room_id, user_id, rating, comment)
//       VALUES ($1, $2, $3, $4) RETURNING *;
//     `;
//     await db.pool.query(insertReviewQuery, [roomId, req.user.id, rating, comment]);
//   }

//   const updateRoomRatingsQuery = `
//     UPDATE rooms SET ratings = (
//       SELECT AVG(rating) FROM room_reviews WHERE room_id = $1
//     ), num_of_reviews = (SELECT COUNT(*) FROM room_reviews WHERE room_id = $1)
//     WHERE id = $1 RETURNING *;
//   `;
//   await db.pool.query(updateRoomRatingsQuery, [roomId]);

//   return NextResponse.json({
//     success: true,
//   });
// });

// // Can user review room => /api/reviews/can_review
// export const canReview = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId");

//   const bookingsQuery = `
//     SELECT * FROM bookings WHERE user_id = $1 AND room_id = $2
//   `;
//   const bookingsResult = await db.pool.query(bookingsQuery, [req.user.id, roomId]);

//   const canReview = bookingsResult.rows.length > 0 ? true : false;

//   return NextResponse.json({
//     canReview,
//   });
// });

// // Get all rooms - ADMIN => /api/admin/rooms
// export const allAdminRooms = catchAsyncErrors(async (req: NextRequest) => {
//   const roomsQuery = `
//     SELECT * FROM rooms ORDER BY created_at DESC
//   `;
//   const roomsResult = await db.pool.query(roomsQuery);

//   return NextResponse.json({
//     rooms: roomsResult.rows,
//   });
// });


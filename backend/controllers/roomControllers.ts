import { NextRequest, NextResponse } from "next/server";
import pool from "@/backend/config/dbConnect"; // your pg pool connection
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import { upload_file, delete_file } from "../utils/cloudinary";
import { IUser } from "@/types/user";
import { IReview, IRoom } from "@/types/room";

// Helper function to parse JSON fields safely
const safeJsonParse = (jsonStr: string | null) => {
  try {
    return jsonStr ? JSON.parse(jsonStr) : null;
  } catch {
    return null;
  }
};

// Get all rooms => /api/rooms
export const allRooms = catchAsyncErrors(async (req: NextRequest) => {
  const resPerPage = 4;
  const { searchParams } = new URL(req.url);

  // Basic offset & limit pagination
  const page = Number(searchParams.get("page")) || 1;
  const offset = (page - 1) * resPerPage;

  // Example: Fetch total count
  const totalRes = await pool.query("SELECT COUNT(*) FROM rooms");
  const filteredRoomsCount = Number(totalRes.rows[0].count);

  // Fetch rooms with limit and offset
  const roomsRes = await pool.query(
    "SELECT * FROM rooms ORDER BY created_at ASC LIMIT $1 OFFSET $2",
    [resPerPage, offset]
  );
  const rooms = roomsRes.rows;

  return NextResponse.json({
    success: true,
    filteredRoomsCount,
    resPerPage,
    rooms,
  });
});

// Create new room => /api/admin/rooms
// Create new room => /api/admin/rooms
export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();

  if (!body?.images || !Array.isArray(body.images)) {
    throw new Error("Images must be an array.");
  }

  if (body.images.some((img: string) => typeof img !== "string")) {
    throw new Error("Each image must be a string (file path or base64).");
  }

  // Upload images to cloudinary
  const imageLinks = await Promise.all(
    body.images.map(async (image: string) => {
      const result = await upload_file(image, "urban/rooms");
      return { public_id: result.public_id, url: result.url };
    })
  );

  const userId = req.user._id;

  const insertQuery = `
    INSERT INTO rooms (
      name,
      description,
      price_per_night,
      guest_capacity,
      num_of_beds,
      address,
      category,
      images,
      is_internet,
      is_breakfast,
      is_air_conditioned,
      is_pets_allowed,
      is_room_cleaning,
      user_id,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    body.name,
    body.description,
    body.price_per_night ?? body.pricePerNight,
    body.guest_capacity ?? body.capacity,
    body.num_of_beds,
    body.address,
    body.category,
    JSON.stringify(imageLinks),
    body.is_internet,
    body.is_breakfast,
    body.is_air_conditioned,
    body.is_pets_allowed,
    body.is_room_cleaning,
    userId,
  ];

  const result = await pool.query(insertQuery, values);
  const room = result.rows[0];

  // Parse if needed
  try {
    room.images = JSON.parse(room.images);
  } catch {
    // Already parsed
  }

  return NextResponse.json({
    success: true,
    room,
  });
});

// Get room details => /api/rooms/:id

// export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomId = params.id;
//     console.log("➡️ Fetching room with ID:", roomId);

//     const client = await pool.connect();

//     try {
//       // Step 1: Fetch room with JSONB reviews
//       const roomQuery = `SELECT * FROM rooms WHERE id = $1`;
//       const { rows } = await client.query(roomQuery, [roomId]);

//       if (rows.length === 0) {
//         throw new ErrorHandler("Room not found", 404);
//       }

//       const room: IRoom = rows[0];
//       const reviews: IReview[] = room.reviews || [];

//       console.log("🔍 Raw reviews from DB:", reviews);

//       // Step 2: Extract user IDs from reviews
//       const userIds: string[] = Array.from(
//         new Set(
//           reviews
//             .map((rev) => rev?.user?.id)
//             .filter((id): id is string => Boolean(id))
//         )
//       );

//       console.log("👤 User IDs to fetch:", userIds);

//       // Step 3: Fetch user details
//       const userMap: Record<string, IUser> = {};

//       if (userIds.length > 0) {
//         const usersRes = await client.query(
//           `SELECT id, name, avatar FROM users WHERE id = ANY($1::uuid[])`,
//           [userIds]
//         );

//         const users: IUser[] = usersRes.rows as IUser[];

//         users.forEach((user) => {
//           const rawAvatar = user.avatar;

//           const avatar =
//             typeof rawAvatar === "object" && rawAvatar !== null
//               ? {
//                   public_id: rawAvatar.public_id ?? "",
//                   url: rawAvatar.url ?? "",
//                 }
//               : {
//                   public_id: "",
//                   url: typeof rawAvatar === "string" ? rawAvatar : "",
//                 };

//           userMap[user.id as string] = {
//             id: user.id,
//             name: user.name,
//             email: "", // optional
//             role: "user",
//             avatar,
//           };
//         });

//         console.log("🧑‍🤝‍🧑 Users from DB:", userMap);
//       }

//       // Step 4: Merge user details into reviews
//       const enrichedReviews: IReview[] = reviews.map((rev, i) => {
//         const userData = rev.user?.id ? userMap[rev.user.id] : undefined;

//         const fullReview: IReview = {
//           ...rev,
//           user: userData ?? {
//             id: "",
//             name: "Unknown",
//             email: "",
//             role: "user",
//             avatar: { public_id: "", url: "" },
//           },
//         };

//         console.log(`🧩 Review[${i}]:`, fullReview);
//         return fullReview;
//       });

//       room.reviews = enrichedReviews;

//       return NextResponse.json({
//         success: true,
//         room,
//       });
//     } finally {
//       client.release();
//     }
//   }
// );

export const getRoomDetails = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const roomId = params.id;
    console.log("➡️ Fetching room with ID:", roomId);

    const client = await pool.connect();

    try {
      // 1. Fetch the room
      const roomRes = await client.query(`SELECT * FROM rooms WHERE id = $1`, [
        roomId,
      ]);

      if (roomRes.rowCount === 0) {
        console.error("❌ Room not found with ID:", roomId);
        throw new ErrorHandler("Room not found", 404);
      }

      const room = roomRes.rows[0];
      console.log("🏨 Raw room data from DB:", room);

      // Parse images if needed
      if (typeof room.images === "string") {
        try {
          room.images = JSON.parse(room.images);
        } catch (e) {
          console.error("⚠️ Failed to parse images:", e);
          room.images = [];
        }
      }

      // 2. Fetch reviews with user details
      const reviewRes = await client.query(
        `
        SELECT 
          rev.id, rev.rating, rev.comment, rev.created_at,
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'role', u.role,
            'avatar', json_build_object(
              'public_id', u.avatar_public_id,
              'url', u.avatar_url
            )
          ) AS user
        FROM reviews rev
        LEFT JOIN users u ON rev.user_id = u.id
        WHERE rev.room_id = $1
        `,
        [roomId]
      );

      console.log("📝 Raw reviews from DB:", reviewRes.rows);

      const reviews = reviewRes.rows.map((r: any, i: any) => {
        const review = {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          user: r.user || {
            id: "",
            name: "Unknown",
            email: "",
            role: "user",
            avatar: { public_id: "", url: "" },
          },
        };

        console.log(`🧩 Review[${i}]:`, review);
        return review;
      });

      // Attach reviews to room
      room.reviews = reviews;

      return NextResponse.json({
        success: true,
        room,
      });
    } catch (error) {
      console.error("💥 Error in getRoomDetails:", error);
      throw error;
    } finally {
      client.release();
    }
  }
);

//  export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomId = params.id;
//     console.log("➡️ Fetching room with ID:", roomId);

//     const res = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [roomId]);

//     if (res.rowCount === 0) {
//       console.error("❌ Room not found.");
//       throw new ErrorHandler("Room not found", 404);
//     }

//     const room = res.rows[0];

//     // ✅ Parse images
//     if (typeof room.images === "string") {
//       try {
//         room.images = JSON.parse(room.images);
//         console.log("🖼️ Parsed room images.");
//       } catch (e) {
//         console.error("❌ Failed to parse room images:", e);
//         room.images = [];
//       }
//     }

//     // ✅ Parse reviews
//     if (typeof room.reviews === "string") {
//       try {
//         room.reviews = JSON.parse(room.reviews);
//         console.log("📝 Parsed room reviews.");
//       } catch (e) {
//         console.error("❌ Failed to parse room reviews:", e);
//         room.reviews = [];
//       }
//     }

//     console.log("🔍 Raw parsed reviews:", room.reviews);

//     // ✅ Loop over reviews and inject user data
//     for (const review of room.reviews) {
//       if (!review.user) {
//         console.warn("⚠️ Skipping review without user:", review);
//         continue;
//       }

//       const userId = review.user;
//       console.log("👤 Looking up user ID:", userId);

//       try {
//         const userRes = await pool.query(
//           `SELECT id, name, avatar_public_id, avatar_url FROM users WHERE id = $1`,
//           [userId]
//         );

//         if (userRes.rows.length > 0) {
//           const user = userRes.rows[0];
//           console.log("✅ Found user:", user.name);

//           review.user = {
//             id: user.id,
//             name: user.name,
//             avatar: {
//               public_id: user.avatar_public_id,
//               url: user.avatar_url,
//             },
//           };
//         } else {
//           console.warn("❌ No user found for review.user:", userId);
//           review.user = {
//             name: "Anonymous",
//             avatar: { url: "/images/default_avatar.jpg" },
//           };
//         }
//       } catch (error) {
//         console.error("❌ Error fetching user info:", error);
//         review.user = {
//           name: "Anonymous",
//           avatar: { url: "/images/default_avatar.jpg" },
//         };
//       }
//     }

//     console.log("✅ Final enriched reviews:", room.reviews);

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomId = params.id;

//     const res = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [roomId]);
//     if (res.rowCount === 0) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     const room = res.rows[0];

//     // Parse images
//     if (typeof room.images === "string") {
//       try {
//         room.images = JSON.parse(room.images);
//       } catch (e) {
//         console.error("❌ Failed to parse images:", e);
//         room.images = [];
//       }
//     }

//     // Parse reviews
//     if (typeof room.reviews === "string") {
//       try {
//         room.reviews = JSON.parse(room.reviews);
//       } catch (e) {
//         console.error("❌ Failed to parse reviews:", e);
//         room.reviews = [];
//       }
//     }

//     console.log("✅ Parsed room.reviews (raw):", room.reviews);

//     // Helper: Parse avatar field if it's JSON string
//     const parseAvatar = (avatar: any) => {
//       if (typeof avatar === "string") {
//         try {
//           return JSON.parse(avatar);
//         } catch (e) {
//           console.error("❌ Failed to parse avatar JSON:", e);
//           return null;
//         }
//       }
//       return avatar;
//     };

//     // For each review, fetch user details and attach to review.user
//     for (const review of room.reviews) {
//       if (!review.user) continue;

//       const userId = review.user;
//       console.log("🔍 Fetching user with ID:", userId);

//       const userRes = await pool.query(`SELECT id, name, avatar FROM users WHERE id = $1`, [userId]);

//       if (userRes.rows.length > 0) {
//         const user = userRes.rows[0];
//         console.log("📦 Raw user from DB:", user);

//         // Parse avatar field
//         user.avatar = parseAvatar(user.avatar);
//         console.log("🖼️ Parsed avatar:", user.avatar);

//         review.user = user;
//       } else {
//         console.warn("⚠️ No user found with ID:", userId);
//         review.user = {
//           name: "Anonymous",
//           avatar: { url: "/images/default_avatar.jpg" },
//         };
//       }
//     }

//     console.log("✅ Final room.reviews with user info:", room.reviews);

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );
// export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const roomId = params.id;

//     const res = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [roomId]);
//     if (res.rowCount === 0) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     const room = res.rows[0];

//     if (typeof room.images === "string") {
//       try {
//         room.images = JSON.parse(room.images);
//       } catch (e) {
//         console.error("Failed to parse images: ", e);
//         room.images = [];
//       }
//     }

//     if (typeof room.reviews === "string") {
//       try {
//         room.reviews = JSON.parse(room.reviews);
//       } catch (e) {
//         console.error("Failed to parse reviews: ", e);
//         room.reviews = [];
//       }
//     }

//     console.log("Parsed room Details:", room);

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// Update room details => /api/admin/rooms/:id
export const updateRoom = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const roomId = params.id;
    const body = await req.json();

    // Find the room first
    const existingRoom = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [
      roomId,
    ]);
    if (existingRoom.rowCount === 0) {
      throw new ErrorHandler("Room not found", 404);
    }

    let imageLinks = [];
    if (body.images && Array.isArray(body.images)) {
      for (const img of body.images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          try {
            const result = await upload_file(img, "urban/rooms");
            imageLinks.push({ public_id: result.public_id, url: result.url });
          } catch (error) {
            console.error("Image upload failed:", error);
            throw new ErrorHandler("Failed to upload image.", 500);
          }
        } else if (typeof img === "object" && img.public_id && img.url) {
          imageLinks.push(img);
        }
      }
    } else {
      // If images are not passed, keep existing images
      imageLinks = safeJsonParse(existingRoom.rows[0].images) || [];
    }

    // Prepare update query dynamically
    const updatedFields = {
      name: body.name ?? existingRoom.rows[0].name,
      description: body.description ?? existingRoom.rows[0].description,
      price_per_night:
        body.price_per_night ?? existingRoom.rows[0].price_per_night,
      guest_capacity:
        body.guest_capacity ?? existingRoom.rows[0].guest_capacity,
      images: JSON.stringify(imageLinks),
      updated_at: new Date(),
    };

    const updateQuery = `
  UPDATE rooms
  SET 
    name = $1,
    description = $2,
    price_per_night = $3,
    guest_capacity = $4,
    images = $5,
    updated_at = $6
  WHERE id = $7
  RETURNING *;
`;

    const values = [
      updatedFields.name,
      updatedFields.description,
      updatedFields.price_per_night,
      updatedFields.guest_capacity,
      updatedFields.images,
      updatedFields.updated_at,
      roomId,
    ];
    const updatedRoomRes = await pool.query(updateQuery, values);
    const updatedRoom = updatedRoomRes.rows[0];
    updatedRoom.images = imageLinks;

    return NextResponse.json({
      success: true,
      room: updatedRoom,
    });
  }
);

// Delete room image => /api/admin/rooms/:id/delete_image
export const deleteRoomImage = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const roomId = params.id;
    const body = await req.json();
    const imgId = body?.imgId;

    const roomRes = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [
      roomId,
    ]);
    if (roomRes.rowCount === 0) {
      throw new ErrorHandler("Room not found", 404);
    }

    const room = roomRes.rows[0];
    let images = safeJsonParse(room.images) || [];

    const isDeleted = await delete_file(imgId);

    if (isDeleted) {
      images = images.filter((img: any) => img.public_id !== imgId);
      await pool.query(`UPDATE rooms SET images = $1 WHERE id = $2`, [
        JSON.stringify(images),
        roomId,
      ]);
    }

    room.images = images;

    return NextResponse.json({
      success: true,
      room,
    });
  }
);

// Delete room details => /api/admin/rooms/:id
export const deleteRoom = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const roomId = params.id;

    const roomRes = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [
      roomId,
    ]);
    if (roomRes.rowCount === 0) {
      throw new ErrorHandler("Room not found", 404);
    }

    const room = roomRes.rows[0];
    const images = safeJsonParse(room.images) || [];

    for (const img of images) {
      await delete_file(img.public_id);
    }

    await pool.query(`DELETE FROM rooms WHERE id = $1`, [roomId]);

    return NextResponse.json({
      success: true,
    });
  }
);

// Create/Update room review => /api/reviews
// export const createRoomReview = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { rating, comment, roomId } = body;
//   const userId = req.user._id;

//   // Fetch the room
//   const roomRes = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [
//     roomId,
//   ]);
//   if (roomRes.rowCount === 0) {
//     throw new ErrorHandler("Room not found", 404);
//   }

//   const room = roomRes.rows[0];
//   let reviews = safeJsonParse(room.reviews) || [];

//   const existingReviewIndex = reviews.findIndex((r: any) => r.user === userId);

//   if (existingReviewIndex !== -1) {
//     // Update existing review
//     reviews[existingReviewIndex].comment = comment;
//     reviews[existingReviewIndex].rating = Number(rating);
//   } else {
//     // Add new review
//     reviews.push({
//       user: userId,
//       comment,
//       rating: Number(rating),
//       created_at: new Date(),
//     });
//   }

//   const numOfReviews = reviews.length;
//   const ratings =
//     numOfReviews === 0
//       ? 0
//       : reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
//         numOfReviews;

//   // Update room reviews and rating
//   await pool.query(
//     `UPDATE rooms SET reviews = $1, num_of_reviews = $2, ratings = $3 WHERE id = $4`,
//     [JSON.stringify(reviews), numOfReviews, ratings, roomId]
//   );

//   return NextResponse.json({ success: true });
// });

export const createRoomReview = catchAsyncErrors(async (req: NextRequest) => {
  const body = await req.json();
  const { rating, comment, roomId } = body;
  const userId = req.user.id; // assuming middleware attaches user object

  const client = await pool.connect();

  try {
    // 1. Validate room exists
    const roomRes = await client.query(`SELECT id FROM rooms WHERE id = $1`, [
      roomId,
    ]);
    if (roomRes.rowCount === 0) {
      throw new ErrorHandler("Room not found", 404);
    }

    // 2. Check if review already exists
    const existingReviewRes = await client.query(
      `SELECT id FROM reviews WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );

    if (existingReviewRes.rowCount > 0) {
      // Update existing review
      await client.query(
        `UPDATE reviews SET rating = $1, comment = $2, created_at = NOW() WHERE room_id = $3 AND user_id = $4`,
        [rating, comment, roomId, userId]
      );
      console.log("✏️ Updated existing review");
    } else {
      // Create new review
      await client.query(
        `INSERT INTO reviews (room_id, user_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [roomId, userId, rating, comment]
      );
      console.log("🆕 Added new review");
    }

    // 3. Recalculate ratings and number of reviews
    const aggregateRes = await client.query(
      `SELECT COUNT(*) AS count, AVG(rating)::float AS avg_rating FROM reviews WHERE room_id = $1`,
      [roomId]
    );

    const numOfReviews = parseInt(aggregateRes.rows[0].count, 10) || 0;
    const avgRating = parseFloat(aggregateRes.rows[0].avg_rating) || 0;

    // 4. Update room stats
    await client.query(
      `UPDATE rooms SET num_of_reviews = $1, ratings = $2 WHERE id = $3`,
      [numOfReviews, avgRating, roomId]
    );

    console.log("📊 Updated room stats:", { numOfReviews, avgRating });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 Error in createRoomReview:", error);
    throw error;
  } finally {
    client.release();
  }
});

// Delete room review - ADMIN => /api/admin/rooms/reviews
export const deleteRoomReview = catchAsyncErrors(async (req: NextRequest) => {
  const url = new URL(req.url);
  const roomId = url.searchParams.get("room_id");
  const reviewId = url.searchParams.get("id");

  if (!roomId || !reviewId) {
    throw new ErrorHandler("Invalid parameters", 400);
  }

  const roomRes = await pool.query(`SELECT * FROM rooms WHERE id = $1`, [
    roomId,
  ]);
  if (roomRes.rowCount === 0) {
    throw new ErrorHandler("Room not found", 404);
  }

  const room = roomRes.rows[0];
  let reviews = safeJsonParse(room.reviews) || [];

  console.log("🔍 Deleting review", { roomId, reviewId });
  // Filter out the review to delete
  reviews = reviews.filter(
    (review: any) => review.id !== reviewId && review._id !== reviewId
  );

  const numOfReviews = reviews.length;
  const ratings =
    numOfReviews === 0
      ? 0
      : reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
        numOfReviews;

  await pool.query(
    `UPDATE rooms SET reviews = $1, num_of_reviews = $2, ratings = $3 WHERE id = $4`,
    [JSON.stringify(reviews), numOfReviews, ratings, roomId]
  );

  return NextResponse.json({ success: true });
});

export const uploadRoomImages = catchAsyncErrors(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const roomId = params.id;
    const body = await req.json();

    // Check if the room exists
    const roomResult = await pool.query("SELECT * FROM rooms WHERE id = $1", [
      roomId,
    ]);
    if (roomResult.rowCount === 0) {
      throw new ErrorHandler("Room not found", 404);
    }

    const uploader = async (image: string) => upload_file(image, "urban/rooms");
    const urls: string[] = await Promise.all(body.images.map(uploader));

    // Append new images to existing ones
    await pool.query(
      `UPDATE rooms
       SET images = COALESCE(images, '{}') || $1
       WHERE id = $2`,
      [urls, roomId]
    );

    const updatedRoom = await pool.query("SELECT * FROM rooms WHERE id = $1", [
      roomId,
    ]);

    return NextResponse.json({
      success: true,
      room: updatedRoom.rows[0],
    });
  }
);

export const allAdminRooms = catchAsyncErrors(async (req: NextRequest) => {
  // const roomsQuery = `
  //   SELECT * FROM rooms ORDER BY created_at DESC
  // `;

  const roomsQuery = `
    SELECT * FROM rooms
  `;
  const roomsResult = await pool.query(roomsQuery);

  return NextResponse.json({
    rooms: roomsResult.rows,
  });
});

export const getRoomReviews = catchAsyncErrors(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("room_id");

  if (!roomId) {
    return NextResponse.json({ message: "Missing roomId" }, { status: 400 });
  }

  // Fetch all reviews for the specified room
  const result = await pool.query(
    `SELECT * FROM reviews WHERE room_id = $1 ORDER BY created_at DESC`,
    [roomId]
  );

  return NextResponse.json({
    reviews: result.rows,
  });
});

// GET /api/reviews/can_review?roomId=...
export const canReview = catchAsyncErrors(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  // Authenticated user's ID from middleware
  // You must ensure `req.user` is attached properly in your auth middleware
  const user = (req as any).user;

  if (!roomId || !user?.id) {
    return NextResponse.json(
      { message: "Missing roomId or user not authenticated" },
      { status: 400 }
    );
  }

  const bookingResult = await pool.query(
    `SELECT 1 
     FROM bookings WHERE user_id = $1 AND room_id = $2 AND status = 'confirmed'
     LIMIT 1`,
    [user.id, roomId]
  );

  const reviewResult = await pool.query(
    `SELECT FROM reviews WHERE user_id = $1 AND room_id = $2 LIMIT 1`,
    [user.id, roomId]
  )

  const canReview = bookingResult.rowCount > 0 && reviewResult.rowCount === 0;

  return NextResponse.json({
    canReview,
    hasReviewed: reviewResult.rowCount > 0,
  });
});

// import { NextRequest, NextResponse } from "next/server";
// import Room, { IImage, IRoom } from "../models/room";
// import ErrorHandler from "../utils/errorHandler";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
// import APIFilters from "../utils/apiFilters";
// import { IReview } from "../models/room";
// import Booking from "../models/booking";
// import { delete_file, upload_file } from "../utils/cloudinary";

// // Get all rooms  =>  /api/rooms
// export const allRooms = catchAsyncErrors(async (req: NextRequest) => {
//   const resPerPage: number = 4;

//   const { searchParams } = new URL(req.url);

//   const queryStr: any = {};
//   searchParams.forEach((value, key) => {
//     queryStr[key] = value;
//   });

//   const apiFilters = new APIFilters(Room, queryStr).search().filter();

//   let rooms: IRoom[] = await apiFilters.query;
//   const filteredRoomsCount: number = rooms.length;

//   apiFilters.pagination(resPerPage);
//   rooms = await apiFilters.query.clone();

//   return NextResponse.json({
//     success: true,
//     filteredRoomsCount,
//     resPerPage,
//     rooms,
//   });
// });

// // Create new room  =>  /api/admin/rooms
// export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();

//   // Ensure images are valid strings
//   if (!body?.images || !Array.isArray(body.images)) {
//     throw new Error("Images must be an array.");
//   }

//   if (body.images.some((img: string) => typeof img !== "string")) {
//     throw new Error("Each image must be a string (file path or base64).");
//   }

//   // Process image uploads
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

//   body.images = imageLinks; // Attach uploaded images
//   body.user = req.user._id; // Attach user

//   // Create the room
//   const room = await Room.create(body);

//   return NextResponse.json({
//     success: true,
//     room,
//   });
// });

// // export const newRoom = catchAsyncErrors(async (req: NextRequest) => {
// //   const body = await req.json();
// //   let imageLinks: { public_id: string; url: string }[] = []; // Declare imageLinks here
// //   body.user = req.user._id;

// //   const room = await Room.create(body);

// //   // Function to upload each image
// //   const uploader = async (image: string) => upload_file(image, "urban/rooms");

// //   // Check if images are provided and upload them
// //   if (body?.images && Array.isArray(body.images)) {
// //     // Map through each image and upload it
// //     const uploadResults = await Promise.all(
// //       body.images.map(async (image: string) => {
// //         const result = await uploader(image); // Await the result of upload
// //         return {
// //           public_id: result.public_id,
// //           url: result.url,
// //         };
// //       })
// //     );

// //     console.log("Error", uploadResults);

// //     imageLinks.push(...uploadResults);

// //     room.images.push(...imageLinks);

// //     await room.save();
// //   }

// //   return NextResponse.json({
// //     success: true,
// //     room,
// //   });
// // });

// // Get room details  =>  /api/rooms/:id

// export const getRoomDetails = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const room = await Room.findById(params.id).populate("reviews.user");

//     if (!room) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// // Update room details  =>  /api/admin/rooms/:id
// export const updateRoom = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     // Find the existing room by ID
//     let room = await Room.findById(params.id);
//     if (!room) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     // Parse the request body
//     const body = await req.json();

//     // Check if images are provided and are an array
//     if (body.images && Array.isArray(body.images)) {
//       const imageLinks: { public_id: string; url: string }[] = [];

//       // Loop through each image item in the body.images array
//       for (const img of body.images) {
//         if (typeof img === "string" && img.startsWith("data:image")) {
//           // If the image is a base64 string, upload it
//           try {
//             const result = await upload_file(img, "urban/rooms");
//             imageLinks.push({ public_id: result.public_id, url: result.url });
//           } catch (error) {
//             console.error("Image upload failed:", error);
//             throw new ErrorHandler("Failed to upload image.", 500);
//           }
//         } else if (
//           typeof img === "object" &&
//           img.public_id &&
//           img.url
//         ) {
//           // If image is already an uploaded image object, keep it as is
//           imageLinks.push(img);
//         } else {
//           // Optionally handle unexpected image formats (skip or throw error)
//           // For now, ignoring invalid image entries silently
//         }
//       }

//       // Replace body.images with the processed list of uploaded images
//       body.images = imageLinks;
//     }

//     // Update the room with the processed body data
//     room = await Room.findByIdAndUpdate(params.id, body, {
//       new: true,
//     });

//     // Return success response with updated room
//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );
// // export const updateRoom = catchAsyncErrors(
// //   async (req: NextRequest, { params }: { params: { id: string } }) => {
// //     let room = await Room.findById(params.id);
// //     const body = await req.json();

// //     if (!room) {
// //       throw new ErrorHandler("Room not found", 404);
// //     }

// //     room = await Room.findByIdAndUpdate(params.id, body, {
// //       new: true,
// //     });

// //     return NextResponse.json({
// //       success: true,
// //       room,
// //     });
// //   }
// // );

// //Upload room images => /api/admin/rooms/:id/upload_images
// export const uploadRoomImages = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string}}) => {
//     const room = await Room.findById(params.id);
//     const body = await req.json();

//     if (!room) {
//       throw new ErrorHandler("Room not found", 404)
//     }

//     const uploader = async (image: string) => upload_file(image, "urban/rooms");

//     const urls = await Promise.all((body?.images).map(uploader) );

//     room?.images.push(...urls);

//     await room.save();
//     return NextResponse.json({
//       success: true,
//       room,
//     })
//   }
// )

// // Delete room image  =>  /api/admin/rooms/:id/delete_image
// export const deleteRoomImage = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const room = await Room.findById(params.id);
//     const body = await req.json();

//     if (!room) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     const isDeleted = await delete_file(body?.imgId);

//     if (isDeleted) {
//       room.images = room?.images.filter(
//         (img: IImage) => img.public_id !== body.imgId
//       );
//     }

//     await room.save();

//     return NextResponse.json({
//       success: true,
//       room,
//     });
//   }
// );

// // Delete room details  =>  /api/admin/rooms/:id
// export const deleteRoom = catchAsyncErrors(
//   async (req: NextRequest, { params }: { params: { id: string } }) => {
//     const room = await Room.findById(params.id);

//     if (!room) {
//       throw new ErrorHandler("Room not found", 404);
//     }

//     // Delete images associated with the room
//     for (let i = 0; i < room?.images?.length; i++) {
//       await delete_file(room?.images[i].public_id);
//     }

//     await room.deleteOne();

//     return NextResponse.json({
//       success: true,
//     });
//   }
// );

// // Create/Update room review  =>  /api/reviews
// export const createRoomReview = catchAsyncErrors(async (req: NextRequest) => {
//   const body = await req.json();
//   const { rating, comment, roomId } = body;

//   const review = {
//     user: req.user._id,
//     rating: Number(rating),
//     comment,
//   };

//   const room = await Room.findById(roomId);

//   const isReviewed = room?.reviews?.find(
//     (r: IReview) => r.user?.toString() === req?.user?._id?.toString()
//   );

//   if (isReviewed) {
//     room?.reviews?.forEach((review: IReview) => {
//       if (review.user?.toString() === req?.user?._id?.toString()) {
//         review.comment = comment;
//         review.rating = rating;
//       }
//     });
//   } else {
//     room.reviews.push(review);
//     room.numOfReviews = room.reviews.length;
//   }

//   room.ratings =
//     room?.reviews?.reduce(
//       (acc: number, item: { rating: number }) => item.rating + acc,
//       0
//     ) / room?.reviews?.length;

//   await room.save();

//   return NextResponse.json({
//     success: true,
//   });
// });

// // Can user review room  =>  /api/reviews/can_review
// export const canReview = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);
//   const roomId = searchParams.get("roomId");

//   const bookings = await Booking.find({ user: req.user._id, room: roomId });

//   const canReview = bookings?.length > 0 ? true : false;

//   return NextResponse.json({
//     canReview,
//   });
// });

// // Get all rooms - ADMIN => /api/admin/rooms
// export const allAdminRooms = catchAsyncErrors(async (req: NextRequest) => {
//   const rooms = await Room.find().sort({ createdAt: - 1 })

//   return NextResponse.json({
//       rooms,
//   })
// })

// //Get room Reviews - ADMIN => /api/admin/room/reviews
// export const getRoomReviews = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);

//   const room = await Room.findById(searchParams.get("roomId"));

//   return NextResponse.json({
//     reviews: room.reviews,
//   })
// })

// //Delete room review - ADMIN => /api/admin/rooms/reviews
// export const deleteRoomReview = catchAsyncErrors(async (req: NextRequest) => {
//   const { searchParams } = new URL(req.url);

//   const roomId = searchParams.get("roomId");
//   const reviewId = searchParams.get("id");

//   const room = await Room.findById(roomId);

// const reviews = (room.reviews as IReview[]).filter(
//   (review) => review._id.toString() !== reviewId
// );
//   const numOfReviews = reviews.length;

//   const ratings =
//     numOfReviews === 0
//       ? 0
//       : room?.reviews?.reduce(
//           (acc: number, item: { rating: number }) => item.rating + acc,
//           0
//         ) / numOfReviews;

//   await Room.findByIdAndUpdate(roomId, { reviews, numOfReviews, ratings });

//   return NextResponse.json({
//     success: true,
//   });
// });

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

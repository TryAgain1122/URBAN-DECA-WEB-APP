import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user";

export interface IImage extends Document {
  public_id: string;
  url: string;
}

export interface IReview extends Document {
  _id: string;
  user: IUser;
  rating: number;
  comment: string;
}

export interface ILocation {
  type: string;
  coordinates: number[];
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IRoom extends Document {
  name: string;
  description: string;
  pricePerNight: number;
  address: string;
  location: ILocation;
  guestCapacity: number;
  numOfBeds: number;
  isInternet: boolean;
  isBreakfast: boolean;
  isAirConditioned: boolean;
  isPetsAllowed: boolean;
  isRoomCleaning: boolean;
  ratings: number;
  numOfReviews: number;
  images: IImage[];
  category: string;
  reviews: IReview[];
  user: IUser;
  isAvailable: boolean;
  createdAt: Date;
}

const roomSchema: Schema<IRoom> = new Schema({
  name: {
    type: String,
    required: [true, "Please enter room name"],
    trim: true,
    maxLength: [200, "Room name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter room description"],
  },
  pricePerNight: {
    type: Number,
    required: [true, "Please enter room price per night"],
    default: 0.0,
  },
  address: {
    type: String,
    required: [true, "Please enter room address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  guestCapacity: {
    type: Number,
    required: [true, "Please enter room guest capacity"],
  },
  numOfBeds: {
    type: Number,
    required: [true, "Please enter number of beds in room"],
  },
  isInternet: {
    type: Boolean,
    default: false,
  },
  isBreakfast: {
    type: Boolean,
    default: false,
  },
  isAirConditioned: {
    type: Boolean,
    default: false,
  },
  isPetsAllowed: {
    type: Boolean,
    default: false,
  },
  isRoomCleaning: {
    type: Boolean,
    default: false,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter room category"],
    enum: {
      values: ["King", "Single", "Twins"],
      message: "Please select correct category for room",
    },
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Room ||
  mongoose.model<IRoom>("Room", roomSchema);

// import db from '../config/dbConnect';

// const pool = db.pool;

// const createRoomsTable = async () => {
//   const roomsQuery = `
//     CREATE TABLE IF NOT EXISTS rooms (
//       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//       name VARCHAR(200) NOT NULL,
//       description TEXT NOT NULL,
//       price_per_night NUMERIC NOT NULL DEFAULT 0.0,
//       address TEXT NOT NULL,

//       location_type VARCHAR(10) DEFAULT 'Point',
//       location_coordinates DOUBLE PRECISION[],
//       formatted_address TEXT,
//       city VARCHAR(100),
//       state VARCHAR(100),
//       zip_code VARCHAR(20),
//       country VARCHAR(100),

//       guest_capacity INTEGER NOT NULL,
//       num_of_beds INTEGER NOT NULL,

//       is_internet BOOLEAN DEFAULT FALSE,
//       is_breakfast BOOLEAN DEFAULT FALSE,
//       is_air_conditioned BOOLEAN DEFAULT FALSE,
//       is_pets_allowed BOOLEAN DEFAULT FALSE,
//       is_room_cleaning BOOLEAN DEFAULT FALSE,

//       ratings NUMERIC DEFAULT 0,
//       num_of_reviews INTEGER DEFAULT 0,

//       category VARCHAR(50) NOT NULL CHECK (category IN ('King', 'Single', 'Twins')),

//       is_available BOOLEAN DEFAULT FALSE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

//       user_id UUID REFERENCES users(id) ON DELETE SET NULL
//     );
//   `;

//   const roomImagesQuery = `
//     CREATE TABLE IF NOT EXISTS room_images (
//       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//       room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
//       public_id TEXT NOT NULL,
//       url TEXT NOT NULL
//     );
//   `;

//   const roomReviewsQuery = `
//     CREATE TABLE IF NOT EXISTS room_reviews (
//       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//       room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
//       user_id UUID REFERENCES users(id),
//       rating NUMERIC NOT NULL,
//       comment TEXT NOT NULL,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
//   `;

//   try {
//     await pool.query(roomsQuery);
//     await pool.query(roomImagesQuery);
//     await pool.query(roomReviewsQuery);
//     console.log("✅ Rooms, Room Images, and Room Reviews tables created (or already exist)");
//   } catch (error) {
//     console.error("❌ Error creating room-related tables:", error);
//   }
// };

// createRoomsTable();

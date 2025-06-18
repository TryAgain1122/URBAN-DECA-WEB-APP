// // types/room.ts
// export interface IRoom {
//   // _id: string;
//   id: string;
//   name: string;
//   description: string;
//   // pricePerNight: number;
//   price_per_night: number;
//   address: string;
//   location: {
//     formattedAddress: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//   };
//   // guestCapacity: number;
//   guest_capacity: number;
//   num_of_beds: number;
//   is_internet: boolean;
//   is_breakfast: boolean;
//   is_air_conditioned: boolean;
//   is_pets_allowed: boolean;
//   is_room_cleaning: boolean;
//   ratings: number;
//   num_of_reviews: number;
//   images: {
//     url: string;
//     public_id: string;
//   }[];
//   category: string;
//   isAvailable: boolean;
//   createdAt: string;
//   reviews: IReview[];
//   user: {
//     id: string;
//     name: string;
//     email?: string
//   }
// }

// export interface IReview {
//   id: string;
//   user: {
//     id: string;
//     name: string;
//     avatar?: string;
//   };
//   rating: number;
//   comment: string;
// }

// export interface IImage {
//   url: string;
//   public_id: string
// }



// types/room.ts
import { IUser } from "./user";
export interface IImage {
  public_id: string;
  url: string;
}

export interface IReview {
  id: string;
  user: IUser;
  rating: number;
  comment: string;
}

export interface ILocation {
  type: string; // usually "Point"
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IRoom {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  address: string;
  location: Location;
  guest_capacity: number;
  num_of_Beds: number;
  is_internet: boolean;
  is_breakfast: boolean;
  is_air_conditioned: boolean;
  is_pets_allowed: boolean;
  is_room_cleaning: boolean;
  ratings: number;
  num_of_reviews: number;
  images: IImage[];
  category: "King" | "Single" | "Twins";
  reviews: IReview[];
  user: IUser;
  is_Available: boolean;
  created_at: string;
}



// types/room.ts
export interface IRoom {
  _id: string;
  name: string;
  description: string;
  pricePerNight: number;
  address: string;
  location: {
    formattedAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  guestCapacity: number;
  numOfBeds: number;
  isInternet: boolean;
  isBreakfast: boolean;
  isAirConditioned: boolean;
  isPetsAllowed: boolean;
  isRoomCleaning: boolean;
  ratings: number;
  numOfReviews: number;
  images: {
    url: string;
    public_id: string;
  }[];
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

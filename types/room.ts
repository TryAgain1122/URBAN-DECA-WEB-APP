export interface IRoom {
    id: string;
    name: string;
    description: string;
    price_per_night: number;
    address: string;
  
    location_type: string;
    location_coordinates: [number, number];
    formatted_address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  
    guest_capacity: number;
    num_of_beds: number;
  
    is_internet: boolean;
    is_breakfast: boolean;
    is_air_conditioned: boolean;
    is_pets_allowed: boolean;
    is_room_cleaning: boolean;
  
    ratings: number;
    num_of_reviews: number;
  
    category: 'King' | 'Single' | 'Twins';
    is_available: boolean;
    created_at: string;
  
    images?: {
      id: string;
      public_id: string;
      url: string;
    }[];
  
    user_id?: string;
  }
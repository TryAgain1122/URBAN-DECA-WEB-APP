import { IRoom } from "./room";
import { IUser } from "./user";

export interface PaymentInfo {
  id: string;
  status: "pending" | "paid" | "failed";
}

export interface IBooking {
  id: string; // corresponds to your primary key (_id in Mongo)
  room_id: string; // foreign key to rooms table
  user_id: string; // foreign key to users table
  room?: IRoom
  check_in_date: Date;
  check_out_date: Date;
  amount_paid: number;
  days_of_stay: number;
  payment_info: PaymentInfo;
  paid_at: Date;
  created_at: Date;
  status: "pending" | "confirmed" | "cancelled";
  cancellation_confirmed: boolean;
  user: IUser
}

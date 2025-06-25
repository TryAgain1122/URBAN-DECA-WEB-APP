"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { IBooking } from "@/types/booking";

interface BookingTableProps {
  bookings: IBooking[];
}

const BookingTable = ({ bookings }: BookingTableProps) => {
  return (
    <Card className="py-4 mt-5">
      <CardHeader className="pb-0 pt-2 px-4">
        <h4 className="font-bold text-large">Booking Details</h4>
      </CardHeader>
      <CardBody>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">Room</th>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Check-In</th>
                  <th className="px-4 py-2">Check-Out</th>
                  <th className="px-4 py-2">Days of Stay</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b even:bg-gray-50 odd:bg-white"
                  >
                    <td className="px-4 py-2">{booking.room?.name || "N/A"}</td>
                    <td className="px-4 py-2">{booking.user?.name || "N/A"}</td>
                    <td className="px-4 py-2">{booking.room?.category || "N/A"}</td>
                    <td className="px-4 py-2">
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(booking.check_out_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{booking.days_of_stay || "N/A"}</td>
                    <td className="px-4 py-2">₱{booking.amount_paid.toLocaleString()}</td>
                    <td className="px-4 py-2 capitalize">{booking.payment_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No bookings found in this range.</p>
        )}
      </CardBody>
    </Card>
  );
};

export default BookingTable;

"use client";

// import { IBooking } from "@/backend/models/booking";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IBooking } from "@/types/booking";

interface Props {
  data: {
    booking: IBooking;
  };
}

const BookingDetails = ({ data }: Props) => {
  const booking = data?.booking;

  if (!booking) {
    return <p>Booking details are not available.</p>;
  }

  // const isPaid = booking?.paymentInfo?.status === "paid" ? true : false;
  const isPaid = booking?.payment_info?.status === "paid" ? true : false;
  const roomImage =
    Array.isArray(booking?.room?.images) && booking.room.images.length > 0
      ? booking.room.images[0].url
      : "/default-room.jpg";

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center">
        <div className="w-full lg:w-9/12 mt-5">
          <div className="flex justify-between items-center my-5">
            {/* <h2 className="text-xl font-semibold">Booking # {booking._id as string}</h2> */}
            <h2 className="text-xl font-semibold">
              Booking # {booking.id as string}
            </h2>
            <Link
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              // href={`/bookings/invoice/${booking?._id}`}
              href={`/bookings/invoice/${booking?.id}`}
            >
              <i className="fa fa-print"></i> Invoice
            </Link>
          </div>

          <h4 className="mt-5 mb-4 text-lg font-medium">User Info</h4>
          <table className="min-w-full bg-white border border-gray-200">
            <tbody>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Name:
                </th>
                {/* <td className="py-2 px-4 border-b">{booking?.user?.name}</td> */}
                <td className="py-2 px-4 border-b">{booking?.user?.name}</td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Email:
                </th>
                <td className="py-2 px-4 border-b">{booking?.user?.email}</td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Amount Paid:
                </th>
                <td className="py-2 px-4 border-b">₱ {booking?.amount_paid}</td>
              </tr>
            </tbody>
          </table>

          <h4 className="mt-5 mb-4 text-lg font-medium">Booking Info</h4>
          <table className="min-w-full bg-white border border-gray-200">
            <tbody>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Check In:
                </th>
                <td className="py-2 px-4 border-b">
                  {/* {new Date(booking?.checkInDate).toLocaleString("en-PH")} */}
                  {new Date(booking?.check_in_date).toLocaleString("en-PH")}
                </td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Check Out:
                </th>
                <td className="py-2 px-4 border-b">
                  {/* {new Date(booking?.checkOutDate).toLocaleString("en-PH")} */}
                  {new Date(booking?.check_out_date).toLocaleString("en-PH")}
                </td>
              </tr>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Days of Stay:
                </th>
                {/* <td className="py-2 px-4 border-b">{booking?.daysOfStay}</td> */}
                <td className="py-2 px-4 border-b">{booking?.days_of_stay}</td>
              </tr>
            </tbody>
          </table>

          <h4 className="mt-5 mb-4 text-lg font-medium">Payment Info:</h4>
          <table className="min-w-full bg-white border border-gray-200">
            <tbody>
              <tr>
                <th className="py-2 px-4 border-b text-left font-medium">
                  Status:
                </th>
                <td className="py-2 px-4 border-b">
                  <b className={isPaid ? "text-green-500" : "text-red-500"}>
                    {isPaid ? "Paid" : "Not Paid"}
                  </b>
                </td>
              </tr>
            </tbody>
          </table>

          <h4 className="mt-5 mb-4 text-lg font-medium">Booked Room:</h4>

          <hr className="my-4" />
          <div className="flex items-center my-5">
            <div className="w-16 lg:w-20">
              <Image
                src={roomImage}
                alt={booking?.room?.name || "Room image"}
                height="45"
                width="65"
                className="rounded"
              />
            </div>

            <div className="flex-grow ml-5">
              <Link
                href={`/room/${booking?.room?.id}`}
                className="text-blue-500 hover:underline"
              >
                {booking?.room?.name}
              </Link>
            </div>

            <div className="w-24 mt-4 lg:mt-0">
              <p>₱ {booking?.room?.price_per_night}</p>
            </div>

            <div className="w-32 mt-4 lg:mt-0">
              <p>{booking?.days_of_stay} Day(s)</p>
            </div>
          </div>
          <hr className="my-4" />
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

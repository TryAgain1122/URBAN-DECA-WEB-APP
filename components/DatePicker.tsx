"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Spinner,
} from "@nextui-org/react";
import { IRoom } from "@/backend/models/room";
import DateRangePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { calculateDaysOfStay } from "@/helpers/helpers";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import {
  useGetBookedDatesQuery,
  useLazyCheckBookingAvailabilityQuery,
  useLazyStripeCheckoutQuery,
  useNewBookingMutation,
} from "@/redux/api/bookingApi";
import toast from "react-hot-toast";

interface Props {
  room: IRoom;
}
const DatePicker: React.FC<Props> = ({ room }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [daysOfStay, setDaysOfStay] = useState(0);

  const router = useRouter();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [newBooking] = useNewBookingMutation();

  const [checkBookingAvailability, { data }] =
    useLazyCheckBookingAvailabilityQuery();

  const isAvailable = data?.isAvailable;

  const { data: { bookedDates: dates } = {} } = useGetBookedDatesQuery(
    room._id
  );

  const excludeDates = dates?.map((date: string) => new Date(date)) || [];

  const onChange = (dates: Date[]) => {
    const [checkInDate, checkOutDate] = dates;
    setCheckInDate(checkInDate);
    setCheckOutDate(checkOutDate);

    if (checkInDate && checkOutDate) {
      const days = calculateDaysOfStay(checkInDate, checkOutDate);

      setDaysOfStay(days);

      //check booking availability
      checkBookingAvailability({
        id: room._id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      });
    }
  };

  const [stripeCheckout, { error, isLoading, data: checkoutData }] =
    useLazyStripeCheckoutQuery();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (checkoutData) {
      router.replace(checkoutData?.url);
      console.log(checkoutData)
    }
  }, [error, checkoutData]);

  const bookRoom = () => {
    const amount = room.pricePerNight * daysOfStay;

    const checkoutData = {
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      daysOfStay,
      amount,
    };

    stripeCheckout({ id: room?._id, checkoutData });
  };
  // const bookRoom = () => {
  //   const bookingData = {
  //     room: room?._id,
  //     checkInDate,
  //     checkOutDate,
  //     daysOfStay,
  //     amountPaid: room.pricePerNight * daysOfStay,
  //     paymentInfo: {
  //       id: "STRIPE_ID",
  //       status: "PAID",
  //     },
  //   };
  //   newBooking(bookingData);
  // };

  return (
    <div>
      <Card className="py-4 px-3">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Select Date</p>

          <h4 className="font-bold text-large mb-2">
            ₱ {room?.pricePerNight} <span></span>/ night
          </h4>
          <Divider />
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <DateRangePicker
            className="w-full"
            selected={checkInDate}
            onChange={onChange}
            startDate={checkInDate}
            endDate={checkOutDate}
            minDate={new Date()}
            excludeDates={excludeDates}
            selectsRange
            inline
          />

          {/* {isAvailable === true && (
          <Button isDisabled color="success" variant="light" className="mt-3 font-bold">Room is Available. Book Now</Button>
        )} */}

          {isAvailable === true && (
            <p className="mt-3 px-3 text-green-800">
              Room is Available. Book Now
            </p>
          )}

          {isAvailable == false && (
            <p className="mt-3 px-3">
              Room not Available. Try different dates.
            </p>
          )}

          {isAvailable && !isAuthenticated && (
            <p className="mt-3 px-3 text-center">Login to book room</p>
          )}
          {/* <Button variant="faded" color="secondary" className="mt-3">
          Pay - ₱ {daysOfStay * room?.pricePerNight}
        </Button> */}

          {isAvailable && isAuthenticated && (
            <Button
              variant="faded"
              color="secondary"
              className="mt-3"
              onClick={bookRoom}
              disabled={isLoading}
            >
              Pay - ₱ {daysOfStay * room?.pricePerNight}
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DatePicker;

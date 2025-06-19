"use client";

// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   Divider,
//   Button,
// } from "@nextui-org/react";
// import { IRoom } from "@/backend/models/room";
// import DateRangePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { calculateDaysOfStay } from "@/helpers/helpers";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/redux/hook";
// import {
//   useGetBookedDatesQuery,
//   useLazyCheckBookingAvailabilityQuery,
//   useLazyStripeCheckoutQuery,
//   useNewBookingMutation,
// } from "@/redux/api/bookingApi";
// import toast from "react-hot-toast";

// interface Props {
//   room: IRoom;
// }
// const DatePicker: React.FC<Props> = ({ room }) => {
//   const [checkInDate, setCheckInDate] = useState(new Date());
//   const [checkOutDate, setCheckOutDate] = useState(new Date());
//   const [daysOfStay, setDaysOfStay] = useState(0);

//   const router = useRouter();

//   const { isAuthenticated } = useAppSelector((state) => state.auth);


//   const [checkBookingAvailability, { data }] =
//     useLazyCheckBookingAvailabilityQuery();

//   const isAvailable = data?.isAvailable;

//   const { data: { bookedDates: dates } = {} } = useGetBookedDatesQuery(
//     room._id
//   );

//   const excludeDates = dates?.map((date: string) => new Date(date)) || [];

//   const onChange = (dates: Date[]) => {
//     const [checkInDate, checkOutDate] = dates;
//     setCheckInDate(checkInDate);
//     setCheckOutDate(checkOutDate);

//     if (checkInDate && checkOutDate) {
//       const days = calculateDaysOfStay(checkInDate, checkOutDate);

//       setDaysOfStay(days);

//       //check booking availability
//       checkBookingAvailability({
//         id: room._id,
//         checkInDate: checkInDate.toISOString(),
//         checkOutDate: checkOutDate.toISOString(),
//       });
//     }
//   };

//   const [stripeCheckout, { error, isLoading, data: checkoutData }] =
//     useLazyStripeCheckoutQuery();

//   useEffect(() => {
//     if (error && "data" in error) {
//       const errorMessage =
//         (error as any)?.data?.errMessage || "An error occurred";
//       toast.error(errorMessage);
//     }

//     if (checkoutData) {
//       router.replace(checkoutData?.url);
//       console.log(checkoutData)
//     }
//   }, [error, checkoutData, router]);

//   const bookRoom = () => {
//     const amount = room.pricePerNight * daysOfStay;

//     const checkoutData = {
//       checkInDate: checkInDate.toISOString(),
//       checkOutDate: checkOutDate.toISOString(),
//       daysOfStay,
//       amount,
//     };

//     stripeCheckout({ id: room?._id, checkoutData });
//   };

//   return (
//     <div>
//       <Card className="py-4 px-3">
//         <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
//           <p className="text-tiny uppercase font-bold">Select Date</p>

//           <h4 className="font-bold text-large mb-2">
//             ₱ {room?.pricePerNight} <span></span>/ night
//           </h4>
//           <Divider />
//         </CardHeader>
//         <CardBody className="overflow-visible py-2">
//           <DateRangePicker
//             className="custom"
//             selected={checkInDate}
//             onChange={onChange}
//             startDate={checkInDate}
//             endDate={checkOutDate}
//             minDate={new Date()}
//             excludeDates={excludeDates}
//             selectsRange
//             inline
//           />

//           {/* {isAvailable === true && (
//           <Button isDisabled color="success" variant="light" className="mt-3 font-bold">Room is Available. Book Now</Button>
//         )} */}

//           {isAvailable === true && (
//             <p className="mt-3 px-3 text-green-800">
//               Room is Available. Book Now
//             </p>
//           )}

//           {isAvailable == false && (
//             <p className="mt-3 px-3 text-center">
//               Room not Available.
//             </p>
//           )}

//           {isAvailable && !isAuthenticated && (
//             <p className="mt-3 px-3 text-center">Login to book room</p>
//           )}
//           {/* <Button variant="faded" color="secondary" className="mt-3">
//           Pay - ₱ {daysOfStay * room?.pricePerNight}
//         </Button> */}

//           {isAvailable && isAuthenticated && (
//             <Button
//               variant="faded"
//               color="secondary"
//               className="mt-3"
//               onClick={bookRoom}
//               disabled={isLoading}
//             >
//               Pay - ₱ {daysOfStay * room?.pricePerNight}
//             </Button>
//           )}
//         </CardBody>
//       </Card>
//     </div>
//   );
// };

// export default DatePicker;

// Updated DatePicker.tsx with Notice Modal
import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
// import { IRoom } from "@/backend/models/room";
import DateRangePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { calculateDaysOfStay } from "@/helpers/helpers";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import {
  useGetBookedDatesQuery,
  useLazyCheckBookingAvailabilityQuery,
  useNewBookingMutation,
} from "@/redux/api/bookingApi";
import toast from "react-hot-toast";
import PaypalButton from "./PaypalButton";
import { IRoom } from "@/types/room";

interface Props {
  room: IRoom;
}

const DatePicker: React.FC<Props> = ({ room }) => {
  const [check_in_date, setCheckInDate] = useState<Date | null>(new Date());
  const [check_out_date, setCheckOutDate] = useState<Date | null>(null);
  const [days_of_stay, setDaysOfStay] = useState(0);
  const [isPaypalVisible, setIsPaypalVisible] = useState(false);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [checkBookingAvailability, { data, error, isError }] =
    useLazyCheckBookingAvailabilityQuery();
  const [newBooking] = useNewBookingMutation();

  useEffect(() => {
  if (isError && (error as any)?.data?.errMessage) {
    const errorMessage =
      (error as any).data.errMessage || "An error occurred";
    toast.error(errorMessage);
    console.error("API Error:", error);
  } else if (isError) {
    toast.error("An unexpected error occurred while checking availability.");
    console.error("API Error (no message):", error);
  }
}, [isError, error]);


  const isAvailable = data?.isAvailable;

  // const { data: { bookedDates: dates } = {} } = useGetBookedDatesQuery(room._id);

  const { data: { bookedDates: dates } = {} } = useGetBookedDatesQuery(room.id);
  const excludeDates = dates?.map((date: string) => new Date(date)) || [];

  const onChange = (dates: [Date | null, Date | null]) => {
    const [checkInDate, checkOutDate] = dates;
    setCheckInDate(checkInDate);
    setCheckOutDate(checkOutDate);

    if (checkInDate && checkOutDate) {
      const days = calculateDaysOfStay(checkInDate, checkOutDate);
      setDaysOfStay(days);

      checkBookingAvailability({
        // id: room._id,
        room_id: room.id,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
      });
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    if (!check_in_date || !check_out_date) return;

    const bookingData = {
      // room: room._id,
      room_id: room.id,
      check_in_date: check_in_date.toISOString(),
      check_out_date: check_out_date.toISOString(),
      days_of_stay,
      amount_paid: totalAmount,
      payment_info: {
        id: details.id,
        status: details.status === "COMPLETED" ? "paid" : details.status,
      },   
    };

    console.log("Booking data to send: ", bookingData)
    try {
      await newBooking(bookingData).unwrap();
      toast.success(`Payment successful! Transaction ID: ${details.id}`);
      router.push("/confirmation");
    } catch (error) {
      console.log("Booking failed", error);
      toast.error("Booking failed");
    }
  };

  // const totalAmount = room.pricePerNight * daysOfStay;
   const totalAmount = room.price_per_night * days_of_stay;

  return (
    <div>
      <Card className="py-4 px-3">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <p className="text-tiny uppercase font-bold">Select Date</p>
          <h4 className="font-bold text-large mb-2">
            {/* ₱ {room?.pricePerNight} <span></span>/ night */}
             ₱ {room?.price_per_night} <span></span>/ night
          </h4>
          <Divider />
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <DateRangePicker
            className="custom"
            selected={check_in_date}
            onChange={onChange}
            startDate={check_in_date}
            endDate={check_out_date}
            minDate={new Date()}
            excludeDates={excludeDates}
            selectsRange
            inline
            dayClassName={(date: Date) => {
              const isBooked = excludeDates.some(
                (bookedDate: Date) =>
                  bookedDate.toDateString() === date.toDateString()
              );
              return isBooked ? "bg-red-500 border-2 border-red-700" : "";
            }}
            disabledDay={(date: Date) =>
              excludeDates.some(
                (bookedDate: Date) =>
                  bookedDate.toDateString() === date.toDateString()
              )
            }
          />
{/* 
          {isAvailable === true && (
            <p className="mt-3 px-3 text-green-800">
              Room is Available. Book Now
            </p>
          )}

          {isAvailable === false && (
            <p className="mt-3 px-3 text-center">Room not Available.</p>
          )}

          {isAvailable && !isAuthenticated && (
            <p className="mt-3 px-3 text-center">Login to book room</p>
          )} */}

          {isAvailable === false && (
            <p className="mt-3 px-3 text-center text-red-600 font-medium">
              Room not available.
            </p>
          )}

          {isAvailable === true && !isAuthenticated && (
            <p className="mt-3 px-3 text-center text-yellow-600 font-medium">
              Login to book room.
            </p>
          )}

          {isAvailable === true && isAuthenticated && (
            <p className="mt-3 px-3 text-green-800 font-medium">
              Room is Available. Book Now.
            </p>
          )}

          {isAvailable && isAuthenticated && (
            <>
              <p className="mt-3 text-center">
                Total: ₱ {totalAmount.toFixed(2)}
              </p>
              <Button
                variant="faded"
                color="secondary"
                className="mt-3"
                onPress={onOpen}
              >
                Proceed to Payment
              </Button>

              {isPaypalVisible && (
                <div className="mt-4">
                  <PaypalButton
                    amount={totalAmount}
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              )}

              <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader>Notice</ModalHeader>
                      <ModalBody>
                        <p>
                          Once you book, you cannot refund your payment. Are you sure you want to proceed?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="danger" variant="light" onPress={onClose}>
                          Cancel
                        </Button>
                        <Button
                          color="primary"
                          onPress={() => {
                            setIsPaypalVisible(true);
                            onClose();
                          }}
                        >
                          Yes, Proceed
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DatePicker;


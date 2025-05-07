"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Link,
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useCancelBookingMutation } from "@/redux/api/bookingApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IBooking } from "@/backend/models/booking";
import axios from "axios";

const MyBookings = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingList, setBookingList] = useState<IBooking[]>([]);
  const router = useRouter();
  const [cancelBooking, { error, isSuccess }] = useCancelBookingMutation();

  // 🔄 Fetch latest bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get("/api/bookings/me");
        setBookingList(data.bookings);
      } catch (error) {
        toast.error("Failed to load bookings.");
      }
    };

    fetchBookings();
  }, []);

  // ✅ Handle cancel booking updates
  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess && selectedBookingId) {
      toast.success("Booking canceled successfully");
      //@ts-ignore
      setBookingList((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === selectedBookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      onOpenChange();
      setSelectedBookingId(null);
    }
  }, [error, isSuccess, selectedBookingId, onOpenChange]);

  const cancelBookingHandler = (id: string) => {
    setSelectedBookingId(id);
    cancelBooking(id);
  };

  const setBookings = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "ID", field: "id" },
        { label: "Check In", field: "checkin" },
        { label: "Check Out", field: "checkout" },
        { label: "Amount Paid", field: "amountpaid" },
        { label: "Actions", field: "actions" },
      ],
      rows: [],
    };

    bookingList.forEach((booking) => {
      const isCancelled = booking.status === "cancelled";
      const isPending = booking.status === "pending";
      data.rows.push({
        id: booking._id,
        checkin: new Date(booking?.checkInDate).toLocaleString("en-US"),
        checkout: new Date(booking?.checkOutDate).toLocaleString("en-US"),
        amountpaid: `₱${booking?.amountPaid}`,
        actions: (
          <div className="flex gap-4">
            <Link
              href={`/bookings/${booking._id}`}
              color="secondary"
              isDisabled={isPending || isCancelled}
            >
              <i className="fa fa-eye"></i>
            </Link>
            <Link
              href={`/bookings/invoice/${booking._id as string}`}
              color="success"
              isDisabled={isPending || isCancelled}
            >
              <i className="fa fa-receipt"></i>
            </Link>

            {isPending ? (
              <Button variant="faded" isDisabled>
                Pending
              </Button>
            ) : isCancelled ? (
              <Button variant="faded" isDisabled>
                Cancelled
              </Button>
            ) : (
              <>
                <Button onPress={onOpen}>Cancel</Button>
                <Modal
                  backdrop="opaque"
                  isOpen={isOpen}
                  onOpenChange={onOpenChange}
                >
                  <ModalContent>
                    {(onClose) => (
                      <>
                        <ModalBody>
                          <h1 className="mt-5">
                            Are you sure you want to cancel?
                          </h1>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="danger" variant="light" onPress={onClose}>
                            No
                          </Button>
                          <Button
                            color="secondary"
                            onPress={onClose}
                            onClick={() => cancelBookingHandler(booking._id as string)}
                          >
                            Yes
                          </Button>
                        </ModalFooter>
                      </>
                    )}
                  </ModalContent>
                </Modal>
              </>
            )}
          </div>
        ),
      });
    });
    return data;
  };

  const bookingData = setBookings();

  return (
    <Table className="px-5 mt-10">
      <TableHeader>
        {bookingData.columns.map((column, index) => (
          <TableColumn key={index}>{column.label}</TableColumn>
        ))}
      </TableHeader>
      <TableBody>
        {bookingData.rows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.checkin}</TableCell>
            <TableCell>{row.checkout}</TableCell>
            <TableCell>{row.amountpaid}</TableCell>
            <TableCell>{row.actions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MyBookings;

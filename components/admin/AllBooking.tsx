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
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
  Modal,
  Pagination,
} from "@heroui/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  useDeleteBookingMutation,
  useRejectBookingMutation,
  useUpdateBookingStatusMutation,
} from "@/redux/api/bookingApi";
import { IBooking } from "@/types/booking";

interface Props {
  data: {
    bookings: IBooking[];
  };
}

const AllBookings = ({ data }: Props) => {
  const [bookingIdToDelete, setBookingIdToDelete] = useState<string | null>(
    null
  );
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  // ✅ Show all bookings (including rejected)
  const bookings = data?.bookings;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteBooking, { error, isLoading, isSuccess }] =
    useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [rejectBooking] = useRejectBookingMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.refresh();
      toast.success("Booking deleted");
    }
  }, [error, isSuccess, router]);

  const getStatusBadge = (status: string) => {
    const colorClass =
      status === "confirmed"
        ? "bg-green-500"
        : status === "rejected"
        ? "bg-red-500"
        : "bg-yellow-500";

    return (
      <span
        className={`px-2 py-1 rounded text-white text-xs font-semibold uppercase ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  const setBookings = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "ID", field: "id" },
        { label: "Room", field: "room" },
        { label: "Check In", field: "checkin" },
        { label: "Check Out", field: "checkout" },
        { label: "Amount Paid", field: "amountpaid" },
        { label: "Actions", field: "actions" },
        { label: "Status", field: "status" },
      ],
      rows: [],
    };

    bookings?.forEach((booking) => {
      data?.rows.push({
        id: booking.id,
        room: booking.room?.name,
        checkin: new Date(booking?.check_in_date).toLocaleString("en-US"),
        checkout: new Date(booking?.check_out_date).toLocaleString("en-US"),
        amountpaid: `₱${booking?.amount_paid}`,
        actions: (
          <div className="flex gap-4">
            <Button
              href={`/bookings/${booking.id}`}
              color="secondary"
              as={Link}
              isIconOnly
            >
              <i className="fa fa-eye"></i>
            </Button>
            <Button
              href={`/bookings/invoice/${booking.id}`}
              color="success"
              as={Link}
              isIconOnly
              isDisabled={booking.status === "rejected"}
              title={
                booking.status === "rejected"
                  ? "Receipt disabled"
                  : "View Receipt"
              }
            >
              <i className="fa fa-receipt text-white"></i>
            </Button>
            <Button
              isIconOnly
              onPress={() => {
                setBookingIdToDelete(booking.id);
                onOpen();
              }}
              color="danger"
            >
              <i className="fa fa-trash"></i>
            </Button>
            <Button
              isIconOnly
              color="success"
              onPress={() => handleConfirmBooking(booking.id)}
              title="Confirm"
              isDisabled={booking.status !== "pending"}
            >
              <i className="fa fa-check"></i>
            </Button>
            <Button
              isIconOnly
              color="warning"
              onPress={() => handleRejectingBooking(booking.id)}
              title="Reject"
              isDisabled={booking.status !== "pending"}
            >
              <i className="fa fa-times"></i>
            </Button>
          </div>
        ),
        status: getStatusBadge(booking.status),
      });
    });

    return data;
  };

  const deleteRoomHandler = () => {
    if (bookingIdToDelete) {
      deleteBooking(bookingIdToDelete);
    }
  };

  const bookingData = setBookings();
  const totalPages = Math.ceil(bookingData.rows.length / itemsPerPage);

  const currentRows = bookingData.rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmBooking = async (id: string) => {
    await updateBookingStatus({ id, status: "confirmed" });
    router.refresh();
    toast.success("Booking confirmed");
  };

  const handleRejectingBooking = async (id: string) => {
    try {
      await rejectBooking({ id }).unwrap();
      toast.success("Booking rejected");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject booking");
    }
  };

  return (
    <>
      <h1 className="my-5 text-2xl">{bookings?.length} Booking</h1>
      <Table
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="danger"
              page={currentPage}
              total={totalPages}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        }
        className="px-5 mt-10"
      >
        <TableHeader>
          {bookingData.columns.map((column, index) => (
            <TableColumn key={index}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {currentRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.room || "N/A"}</TableCell>
              <TableCell>{row.checkin}</TableCell>
              <TableCell>{row.checkout}</TableCell>
              <TableCell>{row.amountpaid}</TableCell>
              <TableCell>{row.actions}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal backdrop="opaque" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <h1 className="mt-5">Are you sure you want to delete?</h1>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  No
                </Button>
                <Button
                  color="secondary"
                  onPress={() => {
                    onClose();
                    deleteRoomHandler();
                  }}
                  isDisabled={isLoading}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AllBookings;

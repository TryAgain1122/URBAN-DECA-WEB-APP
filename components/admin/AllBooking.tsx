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
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDeleteBookingMutation } from "@/redux/api/bookingApi";
import { IBooking } from "@/backend/models/booking";

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
  const bookings = data?.bookings;
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  const [deleteBooking, { error, isLoading, isSuccess }] =
    useDeleteBookingMutation();

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

  const setBookings = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "ID", field: "id" },
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
        id: booking._id,
        checkin: new Date(booking?.checkInDate).toLocaleString("en-US"),
        checkout: new Date(booking?.checkOutDate).toLocaleString("en-US"),
        amountpaid: `₱${booking?.amountPaid}`,
        actions: (
          <div className="flex gap-4">
            <Button
              href={`/bookings/${booking._id}`}
              color="secondary"
              as={Link}
              isIconOnly
            >
              <i className="fa fa-eye"></i>
            </Button>
            <Button
              href={`/bookings/invoice/${booking._id as string}`}
              color="success"
              as={Link}
              isIconOnly
            >
              <i className="fa fa-receipt text-white"></i>
            </Button>
            <Button
              isIconOnly
              onPress={() => {
                setBookingIdToDelete(booking._id);
                onOpen();
              }}
              color="danger"
            >
              <i className="fa fa-trash"></i>
            </Button>
          </div>
        ),
        status: booking.status,
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

  // Slice the rows for the current page
  const currentRows = bookingData.rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

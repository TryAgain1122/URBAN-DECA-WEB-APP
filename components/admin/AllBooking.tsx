'use client'

import { IBooking } from "@/backend/models/booking";

import React, { useEffect } from "react";
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
    Modal} from "@nextui-org/react";
import { useDeleteBookingMutation } from "@/redux/api/bookingApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  data: {
    bookings: IBooking[];
  };
}

const AllBookings = ({ data }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const bookings = data?.bookings;

  const router = useRouter()

  const [deleteBooking, { error, isLoading, isSuccess}] = useDeleteBookingMutation();

  useEffect(()=> {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.refresh();
      toast.success("Booking deleted")
    }
  },[error, isSuccess])

  const setBookings = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "ID", field: "id" },
        { label: "Check In", field: "checkin" },
        { label: "Check Out", field: "checkout" },
        { label: "Amount Paid", field: "amountpaid" },
        { label: "Actions", field: "actions" },
        { label: "Status", field: "status"}
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
            href={`/bookings/${booking._id}`} color="secondary"
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
            <Button isIconOnly  onPress={onOpen} color="danger">
              <i className="fa fa-trash"></i>{" "}
            </Button>
            <Modal
              backdrop="opaque"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
            >
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalBody>
                      <h1 className="mt-5">Are you sure do want to delete ?</h1>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        No
                      </Button>
                      <Button
                        color="secondary"
                        onPress={onClose}
                        onClick={() => deleteRoomHandler(booking._id as string)}
                        isDisabled={isLoading}
                      >
                        Yes
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        ),
        status: booking.status,
      });
    });
    return data;
  };

  const deleteRoomHandler = (id: string) => {
    deleteBooking(id)
  }

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
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AllBookings;

"use client";

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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { IRoom } from "@/backend/models/room";
import { useRouter } from "next/navigation";
import { useDeleteRoomMutation } from "@/redux/api/roomApi";
import toast from "react-hot-toast";

interface Props {
  data: {
    rooms: IRoom[];
  };
}

const AllRooms = ({ data }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const rooms = data?.rooms;
  const router = useRouter();

  const [deleteRoom, { error, isSuccess }] = useDeleteRoomMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.refresh();
      toast.success("Room Deleted");
    }
  }, [error, isSuccess]);

  const setBookings = () => {
    const data: { columns: any[]; rows: any[] } = {
      columns: [
        { label: "Room ID", field: "id", sort: "asc" },
        { label: "Name", field: "name", sort: "asc" },
        { label: "Actions", field: "actions", sort: "asc" },
      ],
      rows: [],
    };

    rooms?.forEach((room) => {
      data?.rows.push({
        id: room._id,
        name: room.name,

        actions: (
          <div className="flex gap-3">
            <Button
              as={Link}
              color="primary"
              href={`/admin/rooms/${room._id} `}
              isIconOnly
            >
              {" "}
              <i className="fa fa-pencil"></i>{" "}
            </Button>
            <Button
              color="success"
              href={`/admin/rooms/${room._id}/upload_images`}
              isIconOnly
              as={Link}
            >
              {" "}
              <i className="fa fa-images text-white"></i>{" "}
            </Button>

            {/* <Button color="danger" variant="bordered" className="ml-2" onClick={() => deleteRoomHandler(room._id as string)}>
              <i className="fa fa-trash"></i>{" "}
            </Button> */}

            <Button isIconOnly  onPress={onOpen} color="danger">
              <i className="fa fa-trash"></i>{" "}
            </Button>
            <Modal
              backdrop="opaque"
              isOpen={isOpen}
              onOpenChange={onOpenChange}
              // classNames={{
              //   backdrop:
              //     "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
              // }}
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
                        onClick={() => deleteRoomHandler(room._id as string)}
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
      });
    });
    return data;
  };

  const deleteRoomHandler = (id: string) => {
    deleteRoom(id);
  };

  const allRoomsData = setBookings();

  return (
    <div>
      <div className="px-5">
        <h1 className="my-5 relative text-2xl">
          {`${rooms?.length} Rooms`}
          <Button
            href="/admin/rooms/new"
            as={Link}
            className="mt-0 absolute right-0"
            color="secondary"
          >
            Create Room
          </Button>
        </h1>
      </div>
      <Table className="px-5 mt-10">
        <TableHeader>
          {allRoomsData.columns.map((column, index) => (
            <TableColumn key={index}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody>
          {allRoomsData.rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.actions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllRooms;

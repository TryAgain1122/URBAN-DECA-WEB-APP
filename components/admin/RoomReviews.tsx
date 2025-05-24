"use client";

import { IReview } from "@/backend/models/room";
import { revalidateTag } from "@/helpers/revalidate";
import {
  useDeleteReviewMutation,
  useLazyGetRoomReviewsQuery,
} from "@/redux/api/roomApi";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const RoomReviews = () => {
  const [roomId, setRoomId] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const router = useRouter();

  const [getRoomReviews, { data, error }] = useLazyGetRoomReviewsQuery();
  const [deleteReview, { isSuccess, isLoading }] = useDeleteReviewMutation();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const reviews = data?.reviews || [];

  const getRoomReviewsHandler = () => {
    if (!roomId) {
      toast.error("Room ID is required");
      return;
    }
    getRoomReviews(roomId);
  };

  const deleteReviewHandler = (id: string) => {
    deleteReview({ id, roomId });
  };

  const openDeleteModal = (id: string) => {
    setSelectedReviewId(id);
    onOpen();
  };

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      revalidateTag("RoomDetails");
      router.refresh();
      toast.success("Review deleted");
    }
  }, [error, isSuccess]);

  return (
    <div className="mt-6">
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-md space-y-3">
          <Input
            type="text"
            label="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button color="danger" fullWidth onClick={getRoomReviewsHandler}>
            Fetch Reviews
          </Button>
        </div>
      </div>

      {reviews.length > 0 ? (
        <Table isStriped aria-label="Room Reviews Table" className="mt-6">
          <TableHeader>
            <TableColumn>ID</TableColumn>
            <TableColumn>Rating</TableColumn>
            <TableColumn>Comment</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody>
            {reviews.map((review: IReview) => (
              <TableRow key={review._id?.toString()}>
                <TableCell>{review._id?.toString()}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.comment}</TableCell>
                <TableCell>
                  <Button
                    isIconOnly
                    color="danger"
                    onPress={() => openDeleteModal(review._id?.toString())}
                  >
                    <i className="fa fa-trash" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center mt-10 text-gray-500">No Reviews</p>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this review?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  No
                </Button>
                <Button
                  color="danger"
                  isLoading={isLoading}
                  onClick={() => {
                    if (selectedReviewId) deleteReviewHandler(selectedReviewId);
                    onClose();
                  }}
                >
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RoomReviews;

"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import StarRatings from "react-star-ratings";
import { useRouter } from "next/navigation";
import {
  useCanUserReviewQuery,
  usePostReviewMutation,
} from "@/redux/api/roomApi";
import toast from "react-hot-toast";

const NewReviews = ({ roomId }: { roomId: string }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const router = useRouter();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const { data } = useCanUserReviewQuery(roomId);
  const canReview = data?.canReview ?? false;

  const [postReview, { error, isSuccess }] = usePostReviewMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any).data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      toast.success("Review Posted");
      router.refresh();
      onClose(); // close modal after success
      setRating(0);
      setComment("");
    }
  }, [error, isSuccess, router, onClose]);

  const submitHandler = () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    postReview({ rating, comment, roomId });
  };

  return (
    <>
      {canReview && (
        <Button onPress={onOpen} color="danger">
          Submit Your Review
        </Button>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="mb-36">
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Submit Review
              </ModalHeader>
              <hr />
              <ModalBody>
                <StarRatings
                  rating={rating}
                  starRatedColor="#F31260"
                  numberOfStars={5}
                  starDimension="18px"
                  starSpacing="1px"
                  name="rating"
                  changeRating={(e: any) => setRating(e)}
                />
                <Textarea
                  label="Description"
                  placeholder="Leave your review"
                  className="w-full"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </ModalBody>
              <hr />
              <ModalFooter>
                <Button
                  color="danger"
                  className="w-full"
                  onClick={submitHandler}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewReviews;

"use client";
import React from "react";
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

const NewReviews = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} color="secondary">
        Submit Your Review
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Submit Review
              </ModalHeader>
              <hr />
              <ModalBody>
                <StarRatings
                  rating={5}
                  starRatedColor="#000000"
                  numberOfStars={5}
                  starDimension="18px"
                  starSpacing="5px"
                  name="rating"
                  
                />
                <Textarea
                  label="Description"
                  placeholder="Enter your description"
                  className="w-full"
                />
              </ModalBody>
              <hr />
              <ModalFooter>
                <Button color="secondary" onPress={onClose} className="w-full">
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

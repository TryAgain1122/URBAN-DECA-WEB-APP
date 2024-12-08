"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Select,
  SelectItem,
  Button,
  Textarea,
  Checkbox,
  Spinner,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useNewRoomMutation } from "@/redux/api/roomApi";
import toast from "react-hot-toast";
import axios from "axios"; // for image upload (you can use other libraries too)

const NewRoom = () => {
  const [roomDetails, setRoomDetails] = useState({
    name: "",
    price: 0,
    description: "",
    address: "",
    category: "King",
    guestCapacity: 1,
    numOfBeds: 1,
    internet: false,
    breakfast: false,
    airConditioned: false,
    petsAllowed: false,
    roomCleaning: false,
  });

  const [image, setImage] = useState<File | null>(null); // Add state for image

  const {
    name,
    price,
    description,
    address,
    category,
    guestCapacity,
    numOfBeds,
    internet,
    breakfast,
    airConditioned,
    petsAllowed,
    roomCleaning,
  } = roomDetails;

  const router = useRouter();
  const [newRoom, { isLoading, error, isSuccess }] = useNewRoomMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.push("/admin/rooms");
      toast.success("Room created");
    }
  }, [error, isSuccess, router]);

  const SubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let imageUrl = "";

    if (image) {
      // Handle the image upload to a server or a service like Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "your_cloudinary_upload_preset"); // Example for Cloudinary

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/image/upload",
          formData
        );
        imageUrl = response.data.secure_url; // Get the uploaded image URL
      } catch (err) {
        toast.error("Image upload failed");
        return;
      }
    }

    const roomData = {
      name,
      pricePerNight: price,
      description,
      address,
      category,
      guestCapacity: Number(guestCapacity),
      numOfBeds: Number(numOfBeds),
      isInternet: internet,
      isBreakfast: breakfast,
      isAirConditioned: airConditioned,
      isPetsAllowed: petsAllowed,
      isRoomCleaning: roomCleaning,
      image: imageUrl, // Add the image URL to the room data
    };

    newRoom(roomData);
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setRoomDetails({
      ...roomDetails,
      [e.target.name]:
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    });
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const roomFeatures: { name: string; value: keyof typeof roomDetails }[] = [
    { name: "Internet", value: "internet" },
    { name: "Breakfast", value: "breakfast" },
    { name: "Air Conditioned", value: "airConditioned" },
    { name: "Pets Allowed", value: "petsAllowed" },
    { name: "Room Cleaning", value: "roomCleaning" },
  ];

  return (
    <div>
      <form onSubmit={SubmitHandler}>
        <Card className="w-full mt-10">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/images/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">Urban Deca Tower</p>
              <p className="text-small text-default-500">Add New Room</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 grid md:grid-cols-2 grid-cols-1">
            <div className="gap-3">
              <Input
                type="text"
                label="Room Name"
                name="name"
                className="mb-4"
                onChange={onChange}
                value={name}
                isRequired
                variant="bordered"
              />
              <Input
                type="number"
                label="Price per Night"
                name="price"
                className="mb-4"
                onChange={onChange}
                value={price.toString()}
                isRequired
                variant="bordered"
              />

              <Input
                type="text"
                label="Address"
                name="address"
                required
                className="mb-4"
                onChange={onChange}
                value={address}
                isRequired
                variant="bordered"
              />
            </div>

            <div>
              <Select
                label="Room Category"
                className="w-full mb-4"
                onChange={onChange}
                value={category}
                name="category"
              >
                {["King", "Single", "Twins"].map((bed) => (
                  <SelectItem key={bed} value={bed}>
                    {bed}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Guest Capacity"
                className="w-full mb-4"
                onChange={onChange}
                value={guestCapacity.toString()}
                name="guestCapacity"
              >
                {["1", "2", "3", "4", "5", "6"].map((num) => (
                  <SelectItem color="danger" key={num} value={num}>
                    {num}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Number of Beds"
                className="w-full mb-4"
                onChange={onChange}
                value={numOfBeds.toString()}
                name="numOfBeds"
              >
                {["1", "2", "3"].map((num) => (
                  <SelectItem key={num} value={num}>
                    {num}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Image Upload */}
            {/* <Input
              type="file"
              label="Room Image"
              name="image"
              onChange={onImageChange}
              className="mb-4"
              accept="image/*"
            /> */}

            {/* Room Features */}
            {roomFeatures.map((feature) => (
              <Checkbox
                key={feature.name}
                className="px-5 mb-2"
                color="danger"
                id={feature.name}
                onChange={onChange}
                size="md"
                checked={!!roomDetails[feature.value]}
                name={feature.value}
              >
                {feature.name}
              </Checkbox>
            ))}
          </CardBody>
          <Divider />
          <CardBody className="w-full">
            <Textarea
              label="Description"
              variant="bordered"
              placeholder="Enter a detailed description of the room"
              disableAnimation
              disableAutosize
              name="description"
              value={description}
              onChange={onChange}
              classNames={{
                base: "w-full mb-4",
                input: "resize-y min-h-[40px]",
              }}
            />
          </CardBody>
          <CardFooter className="w-full">
            <Button variant="faded" color="danger" type="submit" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Create Room"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewRoom;

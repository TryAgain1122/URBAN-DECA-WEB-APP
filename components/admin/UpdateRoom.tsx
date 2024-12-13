"use client";

import React, { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Button,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import { IRoom } from "@/backend/models/room";
import { useRouter } from "next/navigation";
import { useUpdateRoomMutation } from "@/redux/api/roomApi";
import toast from "react-hot-toast";
import { revalidateTag } from "@/helpers/revalidate";

interface Props {
  data: {
    room: IRoom;
  };
}

const selectStyles =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

const UpdateRoom = ({ data }: Props) => {
  const room = data?.room;
  
  const [roomDetails, setRoomDetails] = useState({
    name: room?.name,
    price: room?.pricePerNight,
    description: room?.description,
    address: room?.address,
    category: room?.category,
    guestCapacity: room?.guestCapacity,
    numOfBeds: room?.numOfBeds,
    internet: room?.isInternet,
    breakfast: room?.isBreakfast,
    airConditioned: room?.isAirConditioned,
    petsAllowed: room?.isPetsAllowed,
    roomCleaning: room?.isRoomCleaning,
  });

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

  const [images, setImages] = useState<string[]>([]);
  const [updateRoom, { isLoading, error, isSuccess }] = useUpdateRoomMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }
    if (isSuccess) {
      revalidateTag("RoomDetails");
      router.refresh();
      toast.success("Room Updated");
    }
  }, [error, isSuccess, router]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      images,
    };

    updateRoom({ id: room._id, body: roomData });
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

  const onImageChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files); 

      const base64Images = await Promise.all(
        filesArray.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
          })
        })
      )
      setImages(base64Images); 
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
    <div className="flex justify-center items-center py-10 px-4">
      <form onSubmit={submitHandler} className="w-full max-w-4xl">
        <Card className="w-full">
          <CardHeader className="flex items-center gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/images/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-lg font-semibold">Urban Deca Tower</p>
              <p className="text-sm text-gray-500">Update Room Details</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="grid md:grid-cols-2 grid-cols-1 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                label="Name"
                name="name"
                onChange={onChange}
                value={name}
                isRequired
              />
              <Input
                type="text"
                label="Price"
                name="price"
                onChange={onChange}
                value={price.toString()}
                isRequired
              />
              <Input
                type="text"
                label="Address"
                name="address"
                onChange={onChange}
                value={address}
                isRequired
              />
            </div>
            <div className="flex flex-col gap-4">
              <select
                className={selectStyles}
                id="room_type_field"
                name="category"
                value={category}
                onChange={onChange}
              >
                {["King", "Single", "Twins"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                className={selectStyles}
                name="guestCapacity"
                value={guestCapacity}
                onChange={onChange}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <select
                id="numofbeds_field"
                name="numOfBeds"
                value={numOfBeds}
                onChange={onChange}
                className={selectStyles}
              >
                {[1, 2, 3].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
            {/* <Input
                  type="file"
                  label="Room Image"
                  name="image"
                  onChange={onImageChange}
                  className="mb-4"
                  accept="image/*"
                  multiple // Allow multiple images
                /> */}
              <Textarea
                label="Description"
                variant="bordered"
                placeholder="Enter your description"
                disableAnimation
                disableAutosize
                name="description"
                value={description}
                onChange={onChange}
                classNames={{
                  base: "w-full",
                  input: "resize-y min-h-[40px]",
                }}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {roomFeatures?.map((feature) => (
                <div className="flex items-center gap-2" key={feature.name}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={feature.name}
                    name={feature.value}
                    onChange={onChange}
                    checked={!!roomDetails[feature.value]}
                  />
                  <label
                    className="form-check-label text-gray-700 dark:text-gray-300"
                    htmlFor={feature.name}
                  >
                    {feature.name}
                  </label>
                </div>
              ))}
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-end">
            <Button
              color="secondary"
              variant="faded"
              type="submit"
              isDisabled={isLoading}
            >
              {isLoading ? <Spinner color="danger" size="sm" /> : "Update"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UpdateRoom;

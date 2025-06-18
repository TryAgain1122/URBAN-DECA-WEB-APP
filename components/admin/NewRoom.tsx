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
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useNewRoomMutation } from "@/redux/api/roomApi";
import toast from "react-hot-toast";

interface RoomDetails {
  name: string;
  price_per_night: number;
  description: string;
  address: string;
  category: string;
  guest_capacity: number;
  num_of_beds: number;
  is_internet: boolean;
  is_breakfast: boolean;
  is_air_conditioned: boolean;
  is_pets_allowed: boolean;
  is_room_cleaning: boolean;
}

const NewRoom = () => {
  const [roomDetails, setRoomDetails] = useState<RoomDetails>({
    name: "",
    price_per_night: 0,
    description: "",
    address: "",
    category: "King",
    guest_capacity: 1,
    num_of_beds: 1,
    is_internet: false,
    is_breakfast: false,
    is_air_conditioned: false,
    is_pets_allowed: false,
    is_room_cleaning: false,
  });

  const [images, setImage] = useState<string[]>([]);

  const {
    name,
    price_per_night,
    description,
    address,
    category,
    guest_capacity,
    num_of_beds,
    is_internet,
    is_breakfast,
    is_air_conditioned,
    is_pets_allowed,
    is_room_cleaning
  } = roomDetails;

  const router = useRouter();
  const [newRoom, { isLoading, error, isSuccess }] = useNewRoomMutation();

  useEffect(() => {
    if (error && (error as any)?.data?.errMessage) {
      const errorMessage =
        (error as any).data.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.push("/admin/rooms");
      toast.success("Room created");
    }
  }, [error, isSuccess, router]);

  const SubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formattedDescription = description
      .split(/\n|\\n/)
      .map((line) =>
        line.trim().match(/^[-•]/) ? `\n${line.trim()}` : line.trim()
      )
      .join(" ");

    const roomData = {
      // name,
      // pricePerNight: price,
      // description: formattedDescription,
      // address,
      // category,
      // guestCapacity: Number(guestCapacity),
      // numOfBeds: Number(numOfBeds),
      // isInternet: internet,
      // isBreakfast: breakfast,
      // isAirConditioned: airConditioned,
      // isPetsAllowed: petsAllowed,
      // isRoomCleaning: roomCleaning,
      // images,
      name,
      price_per_night: price_per_night,
      description: formattedDescription,
      address: address,
      category: category,
      guest_capacity: Number(guest_capacity),
      num_of_beds: Number(num_of_beds),
      is_internet: is_internet,
      is_breakfast: is_breakfast,
      is_air_conditioned: is_air_conditioned,
      is_pets_allowed: is_pets_allowed,
      is_room_cleaning: is_room_cleaning,
      images,
    };

    newRoom(roomData);
    console.log("Sending Data :", roomData);
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

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      const base64Images = await Promise.all(
        filesArray.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            })
        )
      );
      setImage(base64Images);
    }
  };

  const handleSelectChange = (
    key: keyof RoomDetails,
    value: string | number
  ) => {
    setRoomDetails((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const roomFeatures: { name: string; value: keyof RoomDetails }[] = [
    { name: "Internet", value: "is_internet" },
    { name: "Breakfast", value: "is_breakfast" },
    { name: "Air Conditioned", value: "is_air_conditioned" },
    { name: "Pets Allowed", value: "is_pets_allowed" },
    { name: "Room Cleaning", value: "is_room_cleaning" },
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
                name="price_per_night"
                className="mb-4"
                onChange={onChange}
                value={price_per_night.toString()}
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
                // onChange={onChange}
                // value={category}
                selectedKeys={[category]}
                onChange={(e) => handleSelectChange("category", e.target.value)}
                name="category"
              >
                {["King", "Single", "Twins"].map((bed) => (
                  <SelectItem color="danger" key={bed}>
                    {bed}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Guest Capacity"
                className="w-full mb-4"
                onChange={onChange}
                value={guest_capacity.toString()}
                name="guest_capacity"
              >
                {["1", "2", "3", "4", "5", "6"].map((num) => (
                  <SelectItem color="danger" key={num}>
                    {num}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Number of Beds"
                className="w-full mb-4"
                // onChange={onChange}
                // value={numOfBeds.toString()}
                selectedKeys={[num_of_beds.toString()]}
                onChange={(e) => handleSelectChange("num_of_beds", Number(e.target.value))}
                name="numOfBeds"
              >
                {["1", "2", "3"].map((num) => (
                  <SelectItem color="danger" key={num}>
                    {num}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Input
              type="file"
              label="Room Image"
              name="image"
              onChange={onImageChange}
              className="mb-4"
              accept="image/*"
              multiple
            />

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
            <Button color="danger" type="submit" disabled={isLoading}>
              {isLoading ? (
                <Spinner color="default" size="sm" />
              ) : (
                "Create Room"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Description Preview with line breaks */}
      <div
        className="mt-6 p-4 border rounded whitespace-pre-line bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        style={{ whiteSpace: "pre-line" }}
      >
        <h3 className="mb-2 font-semibold">Description Preview:</h3>
        {description || <i>No description yet...</i>}
      </div>
    </div>
  );
};

export default NewRoom;

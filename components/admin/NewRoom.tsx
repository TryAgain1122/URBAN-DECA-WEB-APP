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
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      router.push("/admin/rooms");
      toast.success("Room created");
    }
  }, [error, isSuccess]);

  const SubmitHandler = (e: FormEvent<HTMLFormElement>) => {
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

  const roomFeatures: { name: string; value: keyof typeof roomDetails }[] = [
    { name: "Internet", value: "internet" },
    { name: "Breakfast", value: "breakfast" },
    { name: "Air Conditioned", value: "airConditioned" },
    { name: "Pets Allowed", value: "petsAllowed" },
    { name: "Room Cleaning", value: "roomCleaning" },
  ];
  return (
    <div>
      <>
        <form onSubmit={SubmitHandler}>
          <Card className="max-w-[500px] mt-10">
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
                <p className="text-small text-default-500">Search</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4 grid md:grid-cols-2 grid-cols-1">
              <div className="gap-3">
                <Input
                  type="text"
                  label="Name"
                  name="name"
                  className="mb-4"
                  onChange={onChange}
                  value={name}
                  isRequired
                />
                <Input
                  type="text"
                  label="Price"
                  name="price"
                  className="mb-4"
                  onChange={onChange}
                  value={price.toString()}
                  isRequired
                />

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
                    base: "w-full mb-4",
                    input: "resize-y min-h-[40px]",
                  }}
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
                />
              </div>

              <div>
                <Select
                  label="Category"
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
                  value={guestCapacity}
                  name="guestCapacity"
                >
                  {["1", "2", "3", "4", "5", "6"].map((num) => (
                    <SelectItem key={num} value={num}>
                      {num}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Number of Beds"
                  className="w-full mb-4"
                  onChange={onChange}
                  value={numOfBeds}
                  name="numOfBeds"
                >
                  {["1", "2", "3"].map((num) => (
                    <SelectItem key={num} value={num}>
                      {num}
                    </SelectItem>
                  ))}
                </Select>

                {/* Room Features */}
                {roomFeatures?.map((feature) => (
                  <>
                    <Checkbox
                      className="px-5 mb-2"
                      color="secondary"
                      id={feature.name}
                      onChange={onChange}
                      size="md"
                      checked={!!roomDetails[feature.value]}
                      name={feature.value}
                      required
                    >
                      {feature.name}
                    </Checkbox>
                  </>
                ))}
              </div>
            </CardBody>
            <Divider />
            <CardFooter className="w-full">
              <Button color="secondary" type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "CREATE"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </>
    </div>
  );
};

export default NewRoom;

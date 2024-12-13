"use client";

import React, { FormEvent, useState } from "react";
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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export const metadata = {
  title: "Search Page",
};

const Search = () => {
  const [formData, setFormData] = useState({
    name: "",
    guests: "",
    category: "",
  });

  const router = useRouter();

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const queryString = [
      formData.name && `name=${encodeURIComponent(formData.name)}`,
      formData.guests && `guestCapacity=${encodeURIComponent(formData.guests)}`,
      formData.category && `category=${encodeURIComponent(formData.category)}`,
    ]
      .filter(Boolean)
      .join("&");

    // Navigate to the search results page with the query string
    router.push(`/?${queryString}`);
    console.log("Form data: ", formData);
  };

  return (
    <form onSubmit={submitHandler}>
      <Card className="max-w-[500px] mx-auto mt-24">
        <CardHeader className="flex gap-3">
          <Image alt="nextui logo" height={40} radius="sm" src="/images/logo.png" width={40} />
          <div className="flex flex-col">
            <p className="text-md">Urban Deca Tower</p>
            <p className="text-small text-default-500">Search</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <Input
            type="text"
            label="Room Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label="No. of Guests"
            className="w-full"
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
          >
            {["1", "2", "3", "4", "5", "6"].map((num) => (
              <SelectItem key={num} value={num}>
                {num}
              </SelectItem>
            ))}
          </Select>

          <Select
            label="Room Type"
            className="w-full"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {["King", "Single", "Twins"].map((bed) => (
              <SelectItem key={bed} value={bed}>
                {bed}
              </SelectItem>
            ))}
          </Select>
        </CardBody>
        <Divider />
        <CardFooter className="w-full">
          <Button color="danger" type="submit">
            Search
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default Search;

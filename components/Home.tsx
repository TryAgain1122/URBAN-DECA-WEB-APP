"use client";

import { useEffect, useState } from "react";
import Container from "./Container";
import Link from "next/link";
import RoomItem from "./rooms/RoomItem";
import { FaArrowLeft } from "react-icons/fa6";
import { IRoom } from "@/backend/models/room";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "next/navigation";

interface Props {
  data: {
    success: boolean;
    resPerPage: number;
    filteredRoomCount: number;
    rooms: IRoom[];
  };
}

export const HomePage: React.FC<Props> = ({ data }) => {
  const searchParams = useSearchParams();
  const nameQuery = searchParams.get("name") || "";
  const guestsQuery = searchParams.get("guestCapacity") || "";
  const categoryQuery = searchParams.get("category") || "";

  const [filteredRooms, setFilteredRooms] = useState<IRoom[]>(data.rooms);

  useEffect(() => {
    // Filter rooms based on query parameters only when search parameters are available
    const filtered = data.rooms.filter((room) => {
      const nameMatch = room.name.toLowerCase().includes(nameQuery.toLowerCase());
      const guestsMatch = guestsQuery ? room.guestCapacity === parseInt(guestsQuery) : true;
      const categoryMatch = categoryQuery ? room.category.toLowerCase() === categoryQuery.toLowerCase() : true;
      return nameMatch && guestsMatch && categoryMatch;
    });

    setFilteredRooms(filtered);
  }, [nameQuery, guestsQuery, categoryQuery, data.rooms]);

  return (
    <div>
      <Container>
        <div className="mt-5">
          <h2 className="mb-2 text-3xl font-bold">
            {nameQuery ? `${filteredRooms.length} rooms found for "${nameQuery}"` : "All Rooms"}
          </h2>
          <Link href="/search" className="underline flex items-center gap-2">
            <FaArrowLeft /> Back to Search
          </Link>
          <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredRooms.length === 0 ? (
              <div className="h-[100vh] w-full flex justify-center item text-3xl font-bold">
                No Rooms
              </div>
            ) : (
              filteredRooms.map((room) => <RoomItem room={room} key={room._id as React.Key} />)
            )}
          </div>
        </div>

        <CustomPagination filteredRoomsCount={filteredRooms.length} resPerPage={data.resPerPage} />
      </Container>
    </div>
  );
};

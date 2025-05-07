"use client";

import { useEffect } from "react";
import Container from "./Container";
import Link from "next/link";
import RoomItem from "./rooms/RoomItem";
import { FaArrowLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import { IRoom } from "../types/room"
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
  const location = searchParams.get("name")

  const { rooms, resPerPage, filteredRoomCount } = data;

  return (
    <div>
      <Container>
        <div className="mt-5">
          <h2 className="mb-2 text-3xl font-bold">
          {location
            ? `${rooms?.length} rooms found ${location}`
            : "All Rooms"}
          </h2>
          <Link href="/search" className="underline flex items-center gap-2">
            <FaArrowLeft /> Back to Search
          </Link>
          <div
            className="
            pt-10
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            gap-5
          "
          >
            {rooms?.length === 0 ? (
              <div className="h-[100vh] w-full flex justify-center item text-3xl font-bold">
                No Rooms
              </div>
            ) : (
              rooms?.map((room) => <RoomItem room={room} key={room.id as React.Key} />)
            )}
          </div>
        </div>

        <CustomPagination 
          filteredRoomsCount={filteredRoomCount}
          resPerPage={resPerPage}
        />
      </Container>
    </div>
  );
};
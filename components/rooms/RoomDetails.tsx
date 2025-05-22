"use client";

import { IRoom } from "@/backend/models/room";
import React from "react";
import Container from "../Container";
import HotelPhotoGallery from "../HotelPhotoGallery";
import RoomFeature from "./RoomFeature";
import NewReviews from "../review/NewReviews";
import ListReviews from "../review/ListReviews";
import DatePicker from "../DatePicker";

interface Props {
  data: {
    room: IRoom | null;
  };
}

const RoomDetails: React.FC<Props> = ({ data }) => {
  const room = data?.room;

  // Utility function to detect and format bullet points
  const formatDescription = (description: string) => {
    const lines = description.split(/•|\n/).map((line) => line.trim());
    return (
      <ul className="list-disc list-inside space-y-2">
        {lines.map((line, index) => line && <li key={index}>{line}</li>)}
      </ul>
    );
  };

  if (!room) {
    return (
      <Container>
        <div className="text-center mt-10">
          <p className="text-xl font-semibold text-gray-700">
            Room details are not available.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto mt-10 px-4 max-w-7xl">
        <HotelPhotoGallery images={room?.images} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <h1 className="text-2xl md:text-3xl font-bold">{room.name}</h1>
            <p className="text-md font-medium mt-2 text-gray-600">
              {room.address}
            </p>
            <div className="mt-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Description
              </h2>
              {room?.description?.includes("•") ? (
                formatDescription(room.description)
              ) : (
                <p className="text-gray-700">
                  {room.description || "No description available."}
                </p>
              )}
            </div>
          </div>
          <div className="md:col-span-4 flex items-center justify-end">
            <DatePicker room={room} />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Room Features
            </h2>
            <RoomFeature room={room} />
          </div>
          <div className="md:col-span-4">
            <NewReviews roomId={room?._id as string}/>
            <ListReviews reviews={room?.reviews}/>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default RoomDetails;

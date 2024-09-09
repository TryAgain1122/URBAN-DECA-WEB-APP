"use client";

import { IRoom } from "@/backend/models/room";
import React from "react";
import StarRatings from "react-star-ratings";
import Container from "../Container";
import HotelPhotoGallery from "../HotelPhotoGallery";
import RoomFeature from "./RoomFeature";
import NewReviews from "../review/NewReviews";
import ListReviews from "../review/ListReviews";
import DatePicker from "../DatePicker";

interface Props {
  data: {
    room: IRoom;
  };
}
const RoomDetails: React.FC<Props> = ({ data }) => {
  const { room } = data;
  return (
    <Container>
      <div className="mx-auto mt-10">
        <HotelPhotoGallery images={room?.images} />
        <div className="md:grid md:grid-cols-12 gap-10 px-3 mt-8">
          <div className="md:col-span-8 md:w-full">
            <div className="text-left text-lg md:text-2xl">
              <p className="font-bold">{room.name}</p>
              <p className="text-md font-semi-bold mt-7">{room.address}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between flex-row">
          <div className="mb-11 mt-5 px-3 flex justify-between md:w-3/4 w-1/2 flex-col gap-5">
            <div className="w-1/2">
              <h2 className="font-bold text-3xl mb-2 text-left">Description</h2>
              <p>{room.description}</p>
            </div>
            <div className="mb-11 flex flex-wrap justify-between ">
              <div>
                <h2 className="font-bold text-3xl mb-2 px-3">Room Features</h2>
                <RoomFeature room={room} />
              </div>
            </div>
          </div>
          <div>
            <DatePicker room={room} />
            {/* <span>Map</span> */}
          </div>
        </div>

        <div className="px-3">
          <NewReviews />
          <ListReviews />
        </div>
      </div>
    </Container>
  );
};

export default RoomDetails;

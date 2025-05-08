"use client";
import StarRatings from "react-star-ratings";
import {
  Image,
  Button,
  Link,
} from "@nextui-org/react";
import { IRoom } from "../../types/room"

interface Props {
  room: IRoom;
}
const RoomItem: React.FC<Props> = ({ room }) => {
  return (
    <div className="rounded-xl w-72 mb-10 mx-auto md:x-0 overflow-hidden">
      <div className=" overflow-hidden">
        <Image
          isZoomed
          width={240}
          alt={room?.name}
          src={
            room?.images?.length > 0 ? room.images[0].url : "/images/logo.png"
          }
          className="cursor-pointer w-full h-[300px]"
        />
        <div className="pt-4 ml-2">
          <div className="flex justify-between font-semibold flex-col gap-2 mt-5">
            <p className="text-xl">{room?.name}</p>
            <p className="text-md font-medium mb-2">₱ {room?.pricePerNight} / per night</p>
          </div>
        </div>
        <div className="ml-2 flex">
          <StarRatings
            rating={room?.ratings}
            starRatedColor="#000000"
            numberOfStars={5}
            starDimension="18px"
            starSpacing="1px"
            name="rating"
          />
          <span>({room?.numOfReviews}) Reviews</span>
        </div>
        <div className="flex flex-row items-center ">
          <Button
            href={`/rooms/${room?._id}`}
            as={Link}
            variant="solid"
            className="w-56 mt-2 ml-2"
            color="danger"
          >
            View Details{" "}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomItem;

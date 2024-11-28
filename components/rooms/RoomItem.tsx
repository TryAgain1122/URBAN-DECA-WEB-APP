"use client";
import StarRatings from "react-star-ratings";
import {
  Image,
  Button,
  Link,
} from "@nextui-org/react";
import { IRoom } from "@/backend/models/room";

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
            room?.images?.length > 0 ? room.images[0].url : "/images/image1.jpg"
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
          >
            View Details{" "}
          </Button>
        </div>
      </div>
    </div>

    // <Card className="py-4">
    //   <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
    //     <Image
    //       isZoomed
    //       width={240}
    //       alt={room?.name}
    //       src={
    //         room?.images?.length > 0 ? room.images[0].url : "/images/image1.jpg"
    //       }
    //       className="cursor-pointer w-full"
    //     />
    //   </CardHeader>
    //   <CardBody className="overflow-visible py-2">
    //     <h4 className="font-bold text-large">{room?.name}</h4>
    //     <small className="text-default-500">
    //       ₱ {room?.pricePerNight} / per night
    //     </small>

    //     <div className="ml-2 flex">
    //       <StarRatings
    //         rating={room?.ratings}
    //         starRatedColor="#000000"
    //         numberOfStars={5}
    //         starDimension="18px"
    //         starSpacing="1px"
    //         name="rating"
    //       />
    //       <span>({room?.numOfReviews}) Reviews</span>
    //     </div>
    //     <div className="flex flex-row items-center ">
    //       <Button
    //         href={`/rooms/${room?._id}`}
    //         as={Link}
    //         variant="solid"
    //         className="w-56 mt-2 ml-2"
    //       >
    //         View Details{" "}
    //       </Button>
    //     </div>
    //   </CardBody>
    // </Card>

  //   <Card shadow="sm" className="w-full max-w-md mx-auto"> 
  //   <CardBody className="p-0"> 
  //     <Image
  //       shadow="sm"
  //       radius="lg"
  //       width="100%" 
  //       isZoomed
  //       alt={room?.name}
  //       src={
  //         room?.images?.length > 0 ? room.images[0].url : "/images/image1.jpg"
  //       }
  //       className="cursor-pointer h-[300px] object-cover"  
  //     />
  //   </CardBody>
    
  //   <CardFooter className="p-4"> 
  //     <div className="flex flex-col space-y-2">  {/* Add space between elements */}
  //       <h4 className="font-bold text-xl">  {/* Increased text size for better hierarchy */}
  //         {room?.name}
  //       </h4>
  //       <p className="text-default-500 text-base">
  //         ₱ {room?.pricePerNight} / per night
  //       </p>
        
  //       <div className="flex items-center space-x-1">  {/* Align ratings and reviews better */}
  //         <StarRatings
  //           rating={room?.ratings}
  //           starRatedColor="#000000"
  //           numberOfStars={5}
  //           starDimension="18px"
  //           starSpacing="1px"
  //           name="rating"
  //         />
  //         <span className="text-sm text-default-400">({room?.numOfReviews} Reviews)</span>
  //       </div>
  
  //       <div className="w-full mt-4 ml-2">
  //         <Button 
  //         as={Link}
  //         variant="solid"
  //         href={`/rooms/${room?._id}`}
  //         className="w-full" size="lg">
  //           View
  //         </Button>
  //       </div>
  //     </div>
  //   </CardFooter>
  // </Card>
  
  );
};

export default RoomItem;

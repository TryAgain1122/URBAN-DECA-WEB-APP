import { IRoom } from '@/backend/models/room'
import React from 'react'
import { LiaSynagogueSolid } from "react-icons/lia";
import { FaBed } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { GiCrossMark } from "react-icons/gi";


interface Props {
    room: IRoom
}
const RoomFeature: React.FC<Props> = ({ room }) => {
  return (
    <div className='mt-5 px-3'>
        <div className='room-feature flex flex-row gap-1 items-center'>
            <LiaSynagogueSolid size={30} className='font-bold'/>
            <p>{room?.guestCapacity} Guests</p>
        </div>

        <div className='flex flex-row gap-1 items-center mt-5'>
            <FaBed size={30}/>
            <p>{room?.numOfBeds} Beds</p>
        </div>

        <div className='room-feature flex flex-row items-center gap-2 mt-5'>
        <i
          className={
            room?.isBreakfast
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>Breakfast</p>
        </div>

        <div className='room-feature flex flex-row items-center gap-2 mt-5'>
        <i
          className={
            room?.isInternet
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>Internet</p>
        </div>

        <div className='room-feature flex flex-row items-center gap-2 mt-5'>
        <i
          className={
            room?.isAirConditioned
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>Air Conditioned</p>
        </div>

        <div className='room-feature flex flex-row items-center gap-2 mt-5'>
        <i
          className={
            room?.isPetsAllowed
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>Pets Allowed</p>
        </div>

        <div className='room-feature flex flex-row items-center gap-2 mt-5'>
        <i
          className={
            room?.isRoomCleaning
              ? "fa fa-check text-success"
              : "fa fa-times text-danger"
          }
          aria-hidden="true"
        ></i>
        <p>Room Cleaning</p>
        </div>
    </div>
  )
}

export default RoomFeature
import Error from '@/app/error'
import UploadRoomImages from '@/components/admin/UploadRoomImages'
import React from 'react'

export const metadata = {
    title: "Upload Room Images - ADMIN"
 }

 const getRoom = async (id: string) => {
    const res = await fetch(`${process.env.API_URL}/api/rooms/${id}`, {
        next: {
            tags: ["RoomsDetails"]
        }
    })
    return res.json()
 }

export default async function AdminUploadImagePage({
    params
}: {
    params: { id: string };
}) {
    const data = await getRoom(params?.id);

    if (data?.errMessage) {
        return <Error error={data}/>
    }
  return <UploadRoomImages data={data}/>
}

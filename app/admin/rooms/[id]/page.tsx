import Error from "@/app/error";
import UpdateRoom from "@/components/admin/UpdateRoom";
import { getAuthHeader } from "@/helpers/authHeader";

export const metadata = {
  title: "Update Room - ADMIN",
};

const getRoom = async (id: string) => {

  const res = await fetch(`${process.env.API_URL}/api/rooms/${id}`, {
    next: {
      tags: ['RoomDetails']
    }
  });
  return res.json();
};

export default async function AdminUpdateRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getRoom(params?.id);

  if (data?.errMessage) {
    return <Error error={data} />;
  }

  return <UpdateRoom data={data} />;
}
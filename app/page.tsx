import { HomePage } from "@/components/Home";
import Error from "./error";

export const metadata = {
  title: "HomePage - Urban Deca Tower",
};

const getRooms = async (searchParams: string) => {
  console.log(searchParams);

  const urlParams = new URLSearchParams(searchParams);
  const queryString = urlParams.toString();

  try {
    const res = await fetch(`${process.env.API_URL}/api/rooms?${queryString}`, {
      cache: "no-cache",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("error => ", error)
  }
};

export default async function Home({ searchParams }: { searchParams: string }) {
  const data = await getRooms(searchParams);

  if (data?.errMessage) {
    return <Error error={data} />;
  }

  return <HomePage data={data} />;
}

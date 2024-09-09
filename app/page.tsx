import { HomePage } from "@/components/Home";
import Error from "./error";

export const metadata = {
  title: "HomePage - Urban Deca Tower",
};

const getRooms = async (searchParams: string) => {
  console.log(searchParams);

  const urlParams = new URLSearchParams(searchParams);
  const queryString = urlParams.toString();

  const res = await fetch(`${process.env.API_URL}/api/rooms?${queryString}`, 
    { cache: "no-cache",});
  return res.json();
};

export default async function Home({ searchParams }: { searchParams: string }) {
  const data = await getRooms(searchParams);

  if (data?.errMessage) {
    return <Error error={data} />;
  }

  return <HomePage data={data} />;
}

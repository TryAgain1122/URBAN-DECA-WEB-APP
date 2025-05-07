import Error from "@/app/error";
import MyBookings from "@/components/booking/MyBooking";
import { getAuthHeader } from "@/helpers/authHeader";

export const metadata = {
    title: "My Bookings"
}

// authHeader
const getBookings = async () => {
    const authHeader = getAuthHeader();

    const res = await fetch(`${process.env.API_URL}/api/bookings/me`, authHeader);
    return res.json()
}

export default async function MyBookingsPage() {
    const data = await getBookings();

    if (data?.errMessage) {
        return <Error error={data}/>
    }
    return <MyBookings data={data}/>
}
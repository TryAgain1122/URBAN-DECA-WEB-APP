"use client"; // if you're using App Router
import { useRouter } from "next/navigation"; // or next/router for Pages Router
import { Button } from "@heroui/react";
import { FaCheckCircle } from "react-icons/fa";

const ConfirmationPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <FaCheckCircle className="h-24 w-24 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-green-700 mb-4">Booking Confirmed!</h1>
      <p className="text-gray-600 max-w-md mb-6">
        Thank you for your payment. Your booking has been successfully processed.
        We’ve sent a confirmation email with your booking details.
      </p>

      <div className="flex gap-4">
        <Button
          color="primary"
          onClick={() => router.push("/bookings/me")}
        >
          View My Bookings
        </Button>
        <Button
          variant="faded"
          onClick={() => router.push("/")}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationPage;

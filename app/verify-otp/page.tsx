'use client';

import OtpVerification from "@/components/OtpVerification";
import { useSearchParams } from "next/navigation";

const VerifyOtpPage = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    if (!email) return <p>Email is missing!</p>;

  return <OtpVerification email={email} />
}

export default VerifyOtpPage
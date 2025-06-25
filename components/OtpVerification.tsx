// "use client";
// import { useVerifyOtpMutation } from "@/redux/api/authApi";
// import {
//   Card,
//   CardBody,
//   Input,
//   Button,
//   CardHeader,
//   Divider,
//   CardFooter,
// } from "@heroui/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";

// interface Props {
//   email: string;
// }

// const OtpVerification = ({ email }: Props) => {
//   const [otp, setOtp] = useState("");
//   const router = useRouter();
//   const [verifyOtp, { isLoading, isSuccess, error }] = useVerifyOtpMutation();

//   const submitHandler = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await verifyOtp({ email, otp }).unwrap();
//       toast.success("Account verified! You can now login.");
//       router.push("/");
//     } catch (err: any) {
//       const message =
//         err?.data?.errMessage || "Invalid OTP or expired. Please try again";
//       toast.error(message);
//     }
//   };
//   return (
//     <div>
//       <form onSubmit={submitHandler}>
//         <Card className="max-w-[500px] mx-auto mt-24">
//           <CardHeader className="flex justify-between">
//             <h2 className="text-lg font-semibold">Verify your Email</h2>
//           </CardHeader>
//           <Divider />
//           <CardBody className="gap-4">
//             <p className="text-sm">
//               We've sent a 6-digit code to <strong>{email}</strong>
//             </p>
//             <Input
//               label="Enter OTP"
//               maxLength={6}
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//           </CardBody>
//           <Divider />
//           <CardFooter className="flex justify-end">
//             <Button color="danger" type="submit" isLoading={isLoading}>
//               Verify
//             </Button>
//           </CardFooter>
//         </Card>
//       </form>
//     </div>
//   );
// };

// export default OtpVerification;

"use client";

import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "@/redux/api/authApi";
import {
  Card,
  CardBody,
  Button,
  CardHeader,
  Divider,
  CardFooter,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Props {
  email: string;
}

const OtpVerification = ({ email }: Props) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendEnabled, setResendEnabled] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendEnabled(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const updatedOtp = [...otp];
      if (otp[index] === "") {
        if (index > 0) {
          updatedOtp[index - 1] = "";
          setOtp(updatedOtp);
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        updatedOtp[index] = "";
        setOtp(updatedOtp);
      }
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const joinedOtp = otp.join("");
    if (joinedOtp.length !== 6) {
      return toast.error("Please enter a 6-digit OTP.");
    }

    try {
      await verifyOtp({ email, otp: joinedOtp }).unwrap();
      toast.success("Account verified! You can now login.");
      router.push("/");
    } catch (err: any) {
      const message =
        err?.data?.errMessage || "Invalid OTP or expired. Please try again.";
      toast.error(message);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent successfully.");
      setTimeLeft(600); // Reset timer
      setResendEnabled(false);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <Card className="max-w-[500px] mx-auto mt-24">
        <CardHeader className="flex justify-between">
          <h2 className="text-lg font-semibold">Verify your Email</h2>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <p className="text-sm text-center">
            We've sent a 6-digit code to <strong>{email}</strong>
          </p>

          <div className="flex gap-4 justify-center mt-4">
            {otp.map((digit, idx) => (
              <div key={idx} className="relative">
                <input
                  ref={(el) => {
                    inputsRef.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="
                    w-12 h-14 text-center text-2xl font-semibold text-gray-800
                    bg-transparent border-b-4 border-gray-300
                    focus:outline-none focus:border-blue-600
                    transition duration-300 ease-in-out
                    peer
                  "
                />
                <span
                  className="
                    absolute bottom-0 left-0 w-full h-0.5
                    bg-blue-500 scale-x-0 origin-center
                    transition-transform duration-300 ease-out
                    peer-focus:scale-x-100
                  "
                ></span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm mt-4 text-gray-500">
            Code expires in:{" "}
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </p>

          {resendEnabled && (
            <div className="text-center mt-4">
              <Button
                type="button"
                onClick={handleResendOtp}
                isLoading={isResending}
                color="primary"
                variant="bordered"
              >
                Resend OTP
              </Button>
            </div>
          )}
        </CardBody>
        <Divider />
        <CardFooter className="flex justify-end">
          <Button color="danger" type="submit" isLoading={isLoading}>
            Verify
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default OtpVerification;

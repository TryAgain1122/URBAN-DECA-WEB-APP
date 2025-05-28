"use client";

import React, { FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Image,
  Input,
  Button,
  Spinner,
} from "@heroui/react";
import {
  useResetPasswordMutation,
} from "@/redux/api/authApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  token: string;
}
const NewPassword = ({ token }: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  const [resetPassword, { isLoading, error, isSuccess }] =
    useResetPasswordMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (isSuccess) {
      toast.success("Password reset was successful");
      router.push("/");
    }
  }, [error, isSuccess, router]);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwords = { password, confirmPassword };

    resetPassword({ token, body: passwords });
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <Card className="max-w-[500px] mx-auto mt-24">
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/images/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">Reset Password</p>
              <p className="text-small text-default-500">Urban Deca Tower</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="mb-3">
              <Input
               label="Password"
               type="password"
               name="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Input
               label="Confirm Password"
               type="password"
               name="confirmPassword"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               />
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <Button
              variant="faded"
              color="secondary"
              type="submit"
              isDisabled={isLoading}
            >
              {isLoading ? <Spinner color="secondary" /> : "Set Password"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default NewPassword;

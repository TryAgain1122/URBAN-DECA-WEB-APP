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
} from "@nextui-org/react";
import { useForgotPasswordMutation } from "@/redux/api/authApi";
import toast from "react-hot-toast";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");

  const [forgotPassword, {isLoading, error, isSuccess}] = useForgotPasswordMutation();

    useEffect(()=> {
        if (error && "data" in error) {
            const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
            toast.error(errorMessage);
        }

        if (isSuccess) {
            toast.success("Email sent successfully")
        }
    },[error, isSuccess])

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = { email };

    forgotPassword(userData)
  }

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
            <Input 
                label="Email" 
                onChange={(e) => setEmail(e.target.value)} 
                name="email"
                value={email}
            />
          </CardBody>
          <Divider />
          <CardFooter>
            <Button variant="faded" color="secondary" type="submit" isDisabled={isLoading}>
             {isLoading ? <Spinner color="secondary"/> : "Send Email"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ForgetPassword;

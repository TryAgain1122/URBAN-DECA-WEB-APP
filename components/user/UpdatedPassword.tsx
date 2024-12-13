"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Input,
  Button,
  Link,
  Skeleton,
  Spinner,
} from "@nextui-org/react";
import { useUpdatePasswordMutation } from "@/redux/api/userApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Skeleton component for loading state
const UpdatedPassword = () => {
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const router = useRouter();

  const [updatePassword, { isLoading, error, isSuccess }] =
    useUpdatePasswordMutation();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage || "An error occured"
      toast.error(errorMessage);
    }

    if (isSuccess) {
      toast.success("Password updated");
      router.refresh();
    }
  }, [error, isSuccess, router]);

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwords = { password, oldPassword };

    updatePassword(passwords);
  };
  return (
    <div className="pr-5">
      <form onSubmit={submitHandler}>
        <Card className="w-full mx-auto mt-24">
          {isLoading ? (
            <>
              <CardHeader className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex flex-col">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 px-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardBody>
              <Divider />
            </>
          ) : (
            <>
              <CardHeader className="flex gap-3">
                <Image
                  alt="nextui logo"
                  height={40}
                  radius="sm"
                  src="/images/logo.png"
                  width={40}
                />
                <div className="flex flex-col">
                  <p className="text-md">Urban Deca Tower</p>
                  <p className="text-small text-default-500">Change Password</p>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="gap-4 px-5">
                <Input
                  type="password"
                  label="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </CardBody>
            </>
          )}
           <Divider />
              <CardFooter className="w-full flex justify-end gap-3 px-5">
                <Link href="/">
                  <Button color="danger" variant="flat">
                    Close
                  </Button>
                </Link>
                
                <Button variant="faded" type="submit">
                  {isLoading ? <Spinner color="danger"/> : "Change Password"}
                </Button>
              </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UpdatedPassword;

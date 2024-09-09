"use client";

import {
  useLazyUpdateSessionQuery,
  useUpdateProfileMutation,
} from "@/redux/api/userApi";
import { setUser } from "@/redux/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
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
  Spinner
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ButtonLoader from "../ButtonLoader";

const UpdateProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [updateProfile, { isLoading, isSuccess, error }] =
    useUpdateProfileMutation();
  const [updateSession, { data }] = useLazyUpdateSessionQuery();

  useEffect(() => {
    if (currentUser) {
      setName(currentUser?.name);
      setEmail(currentUser?.email);
    }
  }, [currentUser]);

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      //@ts-ignore
      updateSession(); // Update the session state
      router.refresh();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (data) {
      dispatch(setUser(data?.user)); // Update user state in Redux
    }
  }, [data, dispatch]);

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { name, email };
    updateProfile(userData);
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
              <p className="text-md">Urban Deca Tower</p>
              <p className="text-small text-default-500">Update Profile</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 px-5">
            {isLoading ? (
              <>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  label="Fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            )}
          </CardBody>
          <Divider />
          <CardFooter className="w-full flex justify-end gap-3 px-5">
            <Link href="/">
              <Button color="danger" variant="flat">
                Close
              </Button>
            </Link>
            <Button color="secondary" variant="faded" type="submit" isDisabled={isLoading}>
              {isLoading ? <Spinner color="secondary" size="sm"/> : "Update"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default UpdateProfile;

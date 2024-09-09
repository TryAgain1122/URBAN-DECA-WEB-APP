'use client'

import React, { FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Image,
  Button,
  Input,
  Spinner,
} from "@nextui-org/react";
import { IUser } from "@/backend/models/user";
import { useRouter } from "next/navigation";
import { useUpdateUserMutation } from "@/redux/api/userApi";
import toast from "react-hot-toast";

const selectStyles =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

interface Props {
  data: {
    user: IUser;
  };
}

const UpdateUser = ({ data }: Props) => {
  const [name, setName] = useState(data?.user?.name);
  const [email, setEmail] = useState(data?.user?.email);
  const [role, setRole] = useState(data?.user?.role || "");

  const router = useRouter();

  const [updateUser, {error, isSuccess, isLoading}] = useUpdateUserMutation();

  useEffect(()=> {
    if (error && "data" in error) {
        const errorMessage = (error as any)?.data?.errMessage || "An error occurred";
        toast.error(errorMessage);
      }

      if (isSuccess) {
        router.refresh();
        toast.success("User Updated")
      }
  },[isSuccess, error, router])

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
        name,
        email,
        role,
    }
    updateUser({ id: data?.user?._id, body: userData });
  }
  return (
    <div className="mt-10">
      <Card className="max-w-[400px]">
        <form onSubmit={submitHandler}>
          <CardHeader className="flex gap-3">
            <Image
              alt="nextui logo"
              height={40}
              radius="sm"
              src="/images/logo.png"
              width={40}
            />
            <div className="flex flex-col">
              <p className="text-md">Update user</p>
              <p className="text-small text-default-500">Urban Deca Tower</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="mb-3">
              <Input 
                label="Name" 
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            </div>

            <div className="mb-3">
              <Input 
                label="Email" 
                name="email"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <select 
                 className={selectStyles} 
                 name="role"
                 value={role}
                 onChange={(e) => setRole(e.target.value)}
                 required
              >
                <option value="">Choose Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </CardBody>
          <Divider />
          <CardFooter>
            <div className="flex flex-start w-full">
              <Button type="submit" variant="faded" color="secondary" isDisabled={isLoading}>
                {isLoading ? <Spinner color="secondary"/> : "Update"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UpdateUser;

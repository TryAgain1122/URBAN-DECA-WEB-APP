"use client";
import React, { ChangeEvent, ChangeEventHandler, FormEvent, useEffect, useState } from "react";
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
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/redux/api/authApi";
import toast from "react-hot-toast";
import ButtonLoader from "../ButtonLoader";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    })
  const { name, email, password} = formData;

  const router = useRouter();

  const [register, { isLoading, error, isSuccess}] = useRegisterMutation()

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage = (error as any)?.data?.errMessage
      toast.error(errorMessage);
    }
    if (isSuccess) {
      router.push("/");
      toast.success("Account Registered. You can login now");
    }

  },[error, isSuccess])

  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      name,
      email,
      password,
    };

    register(userData);
  };

  return (
    <>
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
              <p className="text-small text-default-500">Register Now</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4 px-5">
            <Input
              type="text"
              label="Fullname"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
                type="email" 
                label="Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
                type="password" 
                label="Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={isLoading}
            />
          </CardBody>
          <Divider />
          <CardFooter className="w-full flex justify-end gap-3 px-5">
            <Link href="/">
            <Button color="danger" variant="flat">
              Close
            </Button>
            </Link>     
            <Button color="secondary" type="submit">
              {isLoading ? <ButtonLoader /> : "Register"}
            </Button>       
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default Register;

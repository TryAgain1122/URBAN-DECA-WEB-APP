"use client";

import React, { FormEvent, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Link,
} from "@nextui-org/react";
import { MdEmail } from "react-icons/md";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import ButtonLoader from "../ButtonLoader";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";


const LoginModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const router = useRouter();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Login Successfully");
      router.replace("/");
    }
  };

  return (
    <>
      {/* <form onSubmit={submitHandler}> */}
      <Button onPress={onOpen} color="secondary">
        Login
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <form onSubmit={submitHandler}>
                <ModalHeader className="flex flex-col gap-1">
                  Log in
                </ModalHeader>
                <ModalBody>
                  <Input
                    autoFocus
                    endContent={<MdEmail />}
                    label="Email"
                    variant="bordered"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Input
                    label="Password"
                    variant="bordered"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label="toggle password visibility"
                      >
                        {isVisible ? (
                          <FaEyeSlash
                            size={20}
                            className=" pointer-events-none font-bold"
                          />
                        ) : (
                          <FaRegEye
                            size={20}
                            className=" pointer-events-none font-bold"
                          />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                    className="w-full"
                  />
                  <div className="mx-auto">
                    <div className="flex flex-col items-center">
                    <hr /><p>OR</p><hr />
                    <Button 
                      className="mt-2" 
                      color="warning" 
                      variant="bordered"
                      startContent={<FaGoogle />}
                      onClick={() => signIn('google')}
                      
                      >Google</Button>
                    </div>
                   
                  </div>
                  <div className="flex py-2 px-1 justify-between">
                    <Link color="secondary" href="/register">
                      New User? Register Here
                    </Link>
                    <Link color="primary" href="/password/forgot" size="sm">
                      Forgot password?
                    </Link>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="secondary" type="submit" disabled={loading}>
                    { loading ? <ButtonLoader /> : "Login" }
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* </form> */}
    </>
  );
};

export default LoginModal;

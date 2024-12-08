"use client";

import React, { useEffect, useState } from "react";
import { Skeleton } from "@nextui-org/react";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import Image from "next/image";

import { signOut, useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setIsAuthenticated, setUser } from "@/redux/features/userSlice";
import LoginModal from "../auth/LoginModal";
import ThemeSwitcher from "../ThemeSwitcher";

export default function Header() {
  const { data, status } = useSession();
  const [loading, setLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
    } else {
      setLoading(false);
    }

    if (data) {
      dispatch(setUser(data?.user));
      dispatch(setIsAuthenticated(true));
    }
  }, [status, data, dispatch]);

  return (
    <Navbar className="w-full">
      <NavbarBrand>
        <Link href="/" color="danger">
          <Image
            src={"/images/logo.png"}
            alt="no-image"
            width={60}
            height={60}
            className="rounded-full mr-2"
          />
          <p className="font-bold text-inherit">Urban Deca Tower</p>
        </Link>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          {/* <DropDown /> */}
          <ThemeSwitcher />
        </NavbarItem>

      </NavbarContent>

      {data?.user ? (
        <NavbarContent as="div" justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <div className="flex items-center justify-end gap-3">
                <span className="hidden md:block">{data?.user?.name}</span>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="danger"
                  name="Jason Hughes"
                  size="md"
                  src={
                    data?.user?.image
                    ? data?.user?.image
                    : user?.avatar 
                    ? user?.avatar?.url
                    :   "/images/default_avatar.jpg"
                  }
                />
              </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" color="danger" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Signed in as</p>
                <p className="font-semibold">{data?.user?.email}</p>
              </DropdownItem>
              <DropdownItem key="dashboard">
                {user?.role === "admin" && (
                  <Link href="/admin/dashboard">Dashboard</Link>
                )}
              </DropdownItem>
              <DropdownItem key="bookings" href="/bookings/me">
                My Bookings
              </DropdownItem>
              <DropdownItem key="profile" href="/me/update">
                Profile
              </DropdownItem>
              <DropdownItem key="logout" color="danger">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-medium"
                >
                  Logout
                </button>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      ) : (
        <>
          {data === undefined && (
            <NavbarContent as="div" justify="end">
              <div className="max-w-[300px] w-full flex items-center gap-3">
                <div>
                  <Skeleton
                    isLoaded={loading}
                    className="flex rounded-full w-12 h-12"
                  />
                </div>
                <div className="w-full flex flex-col gap-2">
                  <Skeleton
                    isLoaded={loading}
                    className="h-3 w-3/5 rounded-lg"
                  />
                  <Skeleton
                    isLoaded={loading}
                    className="h-3 w-4/5 rounded-lg"
                  />
                </div>
              </div>
            </NavbarContent>
          )}
          {data === null && (
            <NavbarContent as="div" justify="end">
              <LoginModal />
            </NavbarContent>
          )}
        </>
      )}
    </Navbar>
  );
}

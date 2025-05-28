"use client";

import { setIsAuthenticated, setUser } from "@/redux/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { Avatar, Button, Link, Skeleton } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import LoginModal from "../auth/LoginModal";

const Header2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, status } = useSession();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (data) {
      dispatch(setUser(data.user));
      dispatch(setIsAuthenticated(true));
    }
  }, [data, dispatch]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
  };

  const handleClickedOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickedOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickedOutside);
    };
  }, []);

  const avatarSrc =
    data?.user?.image || user?.avatar?.url || "/images/default_avatar.jpg";

  return (
    <header className="w-full px-6 py-4 bg-white shadow-md flex justify-between items-center">
      {/* Logo and Title */}
      <div className="flex items-center space-x-3">
        <Link href={"/"} color="danger">
          <Image
            src={"/images/logo.png"}
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">Urban Deca Tower</h1>
      </div>

      {/* Right Side: Avatar / Skeleton / Login */}
      {status === "loading" ? (
        // Show Skeleton while session is loading
        <div className="max-w-[300px] w-full flex items-center gap-3">
          <Skeleton className="flex rounded-full w-12 h-12" />
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
      ) : data?.user ? (
        // Show Avatar if user is logged in
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className={`transition-transform duration-150 ${
              isClicked ? "scale-110" : "scale-100"
            }`}
          >
            <div className="flex flex-row items-center space-x-4">
              <span className="hidden md:block font-semibold">
                {data?.user?.name}
              </span>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="danger"
                name={user?.name || "User"}
                size="md"
                src={
                  data?.user?.image
                    ? data?.user?.image
                    : user?.avatar
                    ? user?.avatar?.url
                    : "/images/default_avatar.jpg"
                }
              />
            </div>
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-dropdown">
              <div className="px-4 py-3 border-b text-sm text-gray-700">
                <p className="font-semibold">Signed in as</p>
                <p className="truncate">{data?.user?.email}</p>
              </div>
              <div className="py-1">
                {user?.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="block px-4 py-2 text-sm font-bold text-[#F31260] hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/bookings/me"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Bookings
                </Link>
                <Link
                  href="/me/update"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Show Login Modal if user not logged in
        <LoginModal />
      )}
    </header>
  );
};

export default Header2;

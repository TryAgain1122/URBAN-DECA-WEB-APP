// "use client";

// import { setIsAuthenticated, setUser } from "@/redux/features/userSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hook";
// import { Avatar, Button, Link, Skeleton } from "@heroui/react";
// import { signOut, useSession } from "next-auth/react";
// import Image from "next/image";
// import { useEffect, useRef, useState } from "react";
// import LoginModal from "../auth/LoginModal";
// import { useGetAdminNotificationsQuery } from "@/redux/api/bookingApi";
// import { FaBell } from "react-icons/fa";


// const Header2 = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isClicked, setIsClicked] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { data, status } = useSession();
//   const dispatch = useAppDispatch();
//   const { user } = useAppSelector((state) => state.auth);
//   const [notifications, setNotifications] = useState<any[]>([]);

//   useEffect(() => {
//     if (data) {
//       dispatch(setUser(data.user));
//       dispatch(setIsAuthenticated(true));
//     }
//   }, [data, dispatch]);

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//     setIsClicked(true);
//     setTimeout(() => setIsClicked(false), 150);
//   };

//   const handleClickedOutside = (event: MouseEvent) => {
//     if (
//       dropdownRef.current &&
//       !dropdownRef.current.contains(event.target as Node)
//     ) {
//       setIsOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickedOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickedOutside);
//     };
//   }, []);

//   // const avatarSrc =
//   //   data?.user?.image || user?.avatar?.url || "/images/default_avatar.jpg";

//   const {
//     data: notifData,
//     isSuccess,
//     refetch,
//   } = useGetAdminNotificationsQuery(undefined, {
//     skip: user?.role !== "admin",
//     pollingInterval: 10000,
//   });

//   useEffect(() => {
//     if (isSuccess && notifData) {
//       setNotifications(notifData.notifications || []);
//     }
//   },[notifData, isSuccess]);

//   return (
//     <header className="w-full px-6 py-4 shadow-md flex justify-between items-center">
//       {/* Logo and Title */}
//       <div className="flex items-center space-x-3">
//         <Link href={"/"} color="danger">
//           <Image
//             src={"/images/logo.png"}
//             alt="Logo"
//             width={50}
//             height={50}
//             className="rounded-full"
//           />
//         </Link>
//         <h1 className="font-bold text-lg">Urban Deca Tower</h1>
//       </div>

//       {/* Right Side: Avatar / Skeleton / Login */}
//       {status === "loading" ? (
//         // Show Skeleton while session is loading
//         <div className="max-w-[300px] w-full flex items-center gap-3">
//           <Skeleton className="flex rounded-full w-12 h-12" />
//           <div className="w-full flex flex-col gap-2">
//             <Skeleton className="h-3 w-3/5 rounded-lg" />
//             <Skeleton className="h-3 w-4/5 rounded-lg" />
//           </div>
//         </div>
//       ) : data?.user ? (
//         // Show Avatar if user is logged in
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={toggleDropdown}
//             className={`transition-transform duration-150 ${
//               isClicked ? "scale-110" : "scale-100"
//             }`}
//           >
//             <div className="flex flex-row items-center space-x-4">
//               <span className="hidden md:block font-semibold">
//                 {data?.user?.name}
//               </span>
//               <Avatar
//                 isBordered
//                 as="button"
//                 className="transition-transform"
//                 color="danger"
//                 name={user?.name || "User"}
//                 size="md"
//                 src={
//                   // data?.user?.image
//                   //   ? data?.user?.image
//                   //   : user?.avatar
//                   //   ? user?.avatar?.url
//                   //   : "/images/default_avatar.jpg"
//                   data?.user?.image || 
//                   user?.avatar_url || 
//                   "/images/default_avatar.jpg"
//                 }
//               />
//               {user?.role === "admin" && notifications.length > 0 && ()}
//             </div>
//           </button>
//           {isOpen && (
//             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-dropdown">
//               <div className="px-4 py-3 border-b text-sm text-gray-700">
//                 <p className="font-semibold">Signed in as</p>
//                 <p className="truncate">{data?.user?.email}</p>
//               </div>
//               <div className="py-1">
//                 {user?.role === "admin" && (
//                   <Link
//                     href="/admin/dashboard"
//                     className="block px-4 py-2 text-sm font-bold text-[#F31260] hover:bg-gray-100"
//                   >
//                     Dashboard
//                   </Link>
//                 )}
//                 <Link
//                   href="/bookings/me"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   My Bookings
//                 </Link>
//                 <Link
//                   href="/me/update"
//                   className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Profile
//                 </Link>
//                 <button
//                   onClick={() => signOut({ callbackUrl: "/" })}
//                   className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         // Show Login Modal if user not logged in
//         <LoginModal />
//       )}
//     </header>
//   );
// };

// export default Header2;

// Header2.tsx (Full Updated Version with Bell Notification)

"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, Skeleton, Link } from "@heroui/react";
import Image from "next/image";
import { FaBell } from "react-icons/fa";

import LoginModal from "../auth/LoginModal";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { setIsAuthenticated, setUser } from "@/redux/features/userSlice";
import {
  useGetAdminNotificationsQuery,
  useGetUserNotificationsQuery,
} from "@/redux/api/bookingApi";

const Header2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: sessionData, status } = useSession();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const {
    data: adminData,
    isLoading: loadingAdminNotif,
  } = useGetAdminNotificationsQuery(undefined, {
    pollingInterval: 10000,
    skip: !isAdmin,
  });

  const {
    data: userData,
    isLoading: loadingUserNotif,
  } = useGetUserNotificationsQuery(undefined, {
    pollingInterval: 10000,
    skip: !isUser,
  });

  const notifications =
    isAdmin
      ? adminData?.notifications ?? []
      : isUser
      ? (userData?.notifications ?? []).filter((notif: any) =>
          notif.message?.toLowerCase().includes("accepted")
        )
      : [];

  useEffect(() => {
    if (sessionData) {
      dispatch(setUser(sessionData.user));
      dispatch(setIsAuthenticated(true));
    }
  }, [sessionData, dispatch]);

  useEffect(() => {
  console.log("✅ userData:", userData);
  console.log("✅ Filtered user notifications:", notifications);

}, [userData, notifications]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
  };

  const toggleNotifDropdown = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleClickedOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }

    if (
      notifRef.current &&
      !notifRef.current.contains(event.target as Node)
    ) {
      setNotifOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickedOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickedOutside);
    };
  }, []);

  const avatarSrc =
    sessionData?.user?.image || user?.avatar_url || "/images/default_avatar.jpg";

  return (
    <header className="w-full px-6 py-4 shadow-md flex justify-between items-center">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3">
        <Link href="/" color="danger">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
        </Link>
        <h1 className="font-bold text-lg">Urban Deca Tower</h1>
      </div>

      {/* Right */}
      {status === "loading" ? (
        <div className="max-w-[300px] w-full flex items-center gap-3">
          <Skeleton className="flex rounded-full w-12 h-12" />
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
      ) : sessionData?.user ? (
        <div className="flex items-center space-x-4">
          {/* 🔔 Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={toggleNotifDropdown} className="relative">
              <FaBell className="text-xl text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-30 animate-dropdown p-2">
                <h4 className="text-sm font-bold px-2 mb-2">
                  {isAdmin ? "Pending Bookings" : "Booking Updates"}
                </h4>
                {(loadingAdminNotif || loadingUserNotif) ? (
                  <p className="text-sm px-2 text-gray-500">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-sm px-2 text-gray-500">No new notifications</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((notif: any) => (
                      <li
                        key={notif.id}
                        className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 hover:bg-gray-100"
                      >
                        {isAdmin ? (
                          <p>
                            <strong>{notif.user_name}</strong> booked{" "}
                            <strong>{notif.room_name}</strong>
                          </p>
                        ) : (
                          <p>
                            Booking for <strong>{notif.room_name}</strong> is{" "}
                            <span
                              className={`font-semibold ${
                                notif.status === "confirmed"
                                  ? "text-green-600"
                                  : notif.status === "pending"
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {notif.status}
                            </span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 👤 Avatar */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`transition-transform duration-150 ${
                isClicked ? "scale-110" : "scale-100"
              }`}
            >
              <div className="flex flex-row items-center space-x-4">
                <span className="hidden md:block font-semibold">
                  {sessionData?.user?.name}
                </span>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="danger"
                  name={user?.name || "User"}
                  size="md"
                  src={avatarSrc}
                />
              </div>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 animate-dropdown">
                <div className="px-4 py-3 border-b text-sm text-gray-700">
                  <p className="font-semibold">Signed in as</p>
                  <p className="truncate">{sessionData?.user?.email}</p>
                </div>
                <div className="py-1">
                  {isAdmin && (
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
        </div>
      ) : (
        <LoginModal />
      )}
    </header>
  );
};

export default Header2;

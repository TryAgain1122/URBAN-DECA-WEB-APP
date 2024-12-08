"use client";

import { useState } from "react";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import { usePathname } from "next/navigation";
import { FaTachographDigital } from "react-icons/fa6";
import { LuHotel } from "react-icons/lu";
import { IoReceiptOutline } from "react-icons/io5";
import { FaRegUser, FaRegStar } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";




const AdminSidebar = () => {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: <FaTachographDigital />
    },
    {
      name: "Rooms",
      url: "/admin/rooms",
      icon: <LuHotel />
    },
    {
      name: "Bookings",
      url: "/admin/bookings",
      icon: <IoReceiptOutline />
    },
    {
      name: "Users",
      url: "/admin/users",
      icon: <FaRegUser />
    },
    {
      name: "Reviews",
      url: "/admin/reviews",
      icon: <FaRegStar />
    },
  ];

      const [activeMenuItem, setActiveMenuItem] = useState(pathname);

      const handleMenuItemClick = (menuItemUrl: string) => {
        setActiveMenuItem(menuItemUrl);
      };
  return (
    <div>
    {/* Mobile sidebar toggle button */}
    <button
      className="lg:hidden px-4 py-2 bg-[#C20E4D] text-white rounded-md mb-5"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen ? <IoClose size={18} /> : <IoMdMenu size={18}/>}
    </button>

    {/* Sidebar */}
    <div
      className={`lg:block ${sidebarOpen ? "block" : "hidden"} w-full lg:w-auto`}
    >
      <div className="max-w-[300px] p-4">
        <div className="flex flex-col gap-3">
          <p className="text-2xl my-5">Admin Dashboard</p>
          <hr />
          <div>
            {menuItems.map((menuItem, index) => (
              <Link
                key={index}
                href={menuItem.url}
                size="lg"
                color="foreground"
                aria-current={
                  activeMenuItem === menuItem.url ? "true" : "false"
                }
                onClick={() => handleMenuItemClick(menuItem.url)}
                className={`flex items-center py-3 px-5 transition-colors duration-200 ${
                  activeMenuItem === menuItem.url
                    ? "bg-[#F871A0]"
                    : " hover:bg-[#F54180] rounded-md"
                }`}
              >
                {menuItem.icon}
                <span className="ml-3">{menuItem.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default AdminSidebar;

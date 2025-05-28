"use client";

import { useState } from "react";
import { Link } from "@heroui/react";
import { FaUser, FaUserCircle, FaLock } from "react-icons/fa"; import { usePathname } from "next/navigation";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const UserSidebar = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const menuItems = [
    {
      name: "Update Profile",
      url: "/me/update",
      icon: <FaUser />,
    },
    {
      name: "Upload Avatar",
      url: "/me/upload_avatar",
      icon: <FaUserCircle />,
    },
    {
      name: "Update Password",
      url: "/me/update_password",
      icon: <FaLock />,
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
        {sidebarOpen ? <IoClose size={18} /> : <IoMdMenu size={18} />}
      </button>

      {/* Sidebar */}
      <div
        className={`lg:block ${
          sidebarOpen ? "block" : "hidden"
        } w-full lg:w-auto`}
      >
        <div className="max-w-[300px] p-4">
          <div className="flex flex-col gap-3">
            <p className="text-2xl my-5">User Settings</p>
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

export default UserSidebar;

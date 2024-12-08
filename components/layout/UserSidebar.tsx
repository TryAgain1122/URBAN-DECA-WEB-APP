"use client";

import { useState } from "react";
import {Card, CardHeader, CardBody, CardFooter, Divider, Link, Image} from "@nextui-org/react";
import { FaUser, FaUserCircle, FaLock } from "react-icons/fa"; // Importing FontAwesome icons
import { usePathname } from "next/navigation";

const UserSidebar = () => {
  const pathname = usePathname()
  
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
    <div className="md:ml-24 ml-1">
      <Card className="max-w-[500px]">
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">User Settings</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
            {menuItems.map((menuItem, index) => (
                <Link 
                    key={index}
                    href={menuItem.url} 
                    size="lg"
                    color="secondary"
                    aria-current={activeMenuItem === menuItem.url ? "true" : "false"}
                    onClick={() => handleMenuItemClick(menuItem.url)}
                    className={`flex items-center py-3 px-5 transition-colors duration-200 ${
                        activeMenuItem === menuItem.url ? "bg-[#F871A0]" : " hover:bg-[#F54180] rounded-md"
                      }`}

                >
                    {menuItem.icon}
                    <span className="ml-3">{menuItem.name}</span>
                </Link>
            ))}
        
        </CardBody>
      </Card>
    </div>
  );
};

export default UserSidebar;

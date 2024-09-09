import UserSidebar from "@/components/layout/UserSidebar";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const UserLayout: React.FC<Props> = ({ children }) => {
  return (
    <div>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-around items-center">
          <div className="w-full lg:1/4">
            <UserSidebar />
          </div>
          <div className="w-full lg:2/3 user-dashboard">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;

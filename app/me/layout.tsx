import UserSidebar from "@/components/layout/UserSidebar";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const UserLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen">
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/4 w-full mb-5 lg:mb-0">
          <UserSidebar />
        </div>
        <div className="lg:w-3/4 w-full p-4">{children}</div>
      </div>
    </div>
  </div>
  );
};

export default UserLayout;

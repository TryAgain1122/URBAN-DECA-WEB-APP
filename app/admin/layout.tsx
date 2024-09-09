import AdminSidebar from "@/components/layout/AdminSidebar";

interface Props {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: Props) => {
  return (
    // <div>
    //   <div className="container mx-auto">
    //     <div className="flex flex-col lg:flex-row justify-around">
    //       <div className="lg:w-1/2 w-1/4">
    //         <AdminSidebar />
    //       </div>
    //       <div className="lg:w-full w-2/6 user-dashboard">{children}</div>
    //     </div>
    //   </div>
    // </div>

    <div className="min-h-screen">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/4 w-full mb-5 lg:mb-0">
            <AdminSidebar />
          </div>
          <div className="lg:w-3/4 w-full p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

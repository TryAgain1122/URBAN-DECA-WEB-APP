import { addCommasToAmount } from "@/helpers/helpers";
import React from "react";
import { Card, CardHeader, CardBody, Image } from "@heroui/react";

interface Props {
  data: {
    totalSales: string;
    numberOfBookings: string;
  };
}

const SalesStats = ({ data }: Props) => {
  return (
    // <Card className="py-4 min-w-[1200px] mt-5">
    //   <div className="grid grid-cols-2 ">
    //     <div>
    //       <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
    //         <h4 className="font-bold text-large">Sales</h4>
    //       </CardHeader>

    //       <CardBody className="overflow-visible py-2 flex flex-row items-center gap-3">
    //         <div className="text-4xl text-gray-300">
    //           <i style={{ color: "#dbdee4" }} className="fas fa-peso-sign"></i>
    //         </div>

    //         <b>{data && addCommasToAmount(data?.totalSales)}</b>
    //       </CardBody>
    //     </div>
    //     <div>
    //       <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
    //         <h4 className="font-bold text-large">Bookings</h4>
    //       </CardHeader>
    //       <CardBody className="overflow-visible py-2 flex flex-row items-center gap-3">
    //         <div className="text-4xl text-gray-300">
    //           <i style={{ color: "#dbdee4" }} className="fas fa-file-invoice"></i>
    //         </div>
    //         {data?.numberOfBookings}
    //       </CardBody>
    //     </div>
    //   </div>
    // </Card>

    <Card className="py-4 mt-5 w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-lg">Sales</h4>
        </CardHeader>

        <CardBody className="py-2 flex items-center gap-3">
          <div className="text-4xl text-gray-300">
            <i style={{ color: "#dbdee4" }} className="fas fa-peso-sign"></i>
          </div>
          <b>{data && addCommasToAmount(data?.totalSales)}</b>
        </CardBody>
      </div>
      <div>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-lg">Bookings</h4>
        </CardHeader>
        <CardBody className="py-2 flex items-center gap-3">
          <div className="text-4xl text-gray-300">
            <i style={{ color: "#dbdee4" }} className="fas fa-file-invoice"></i>
          </div>
          <b>{data?.numberOfBookings}</b>
        </CardBody>
      </div>
    </div>
  </Card>
  );
};

export default SalesStats;

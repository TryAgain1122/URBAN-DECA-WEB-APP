"use client";
import { useLazyGetSalesStatsQuery } from "@/redux/api/bookingApi";
import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import DateRangePicker from "react-datepicker";
import SalesStats from "./SalesStats";
import { TopPerformingChart } from "../charts/TopPerformingChart";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "@nextui-org/button";
import toast from "react-hot-toast";
import { SalesCharts } from "../charts/SalesCharts";
import { Card, CardHeader, CardBody, Image, Spinner } from "@nextui-org/react";

const Dashboard = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [getSalesStats, { error, data, isLoading }] =
    useLazyGetSalesStatsQuery();

  useEffect(() => {
    if (error && "data" in error) {
      const errorMessage =
        (error as any)?.data?.errMessage || "An error occurred";
      toast.error(errorMessage);
    }

    if (startDate && endDate && !data) {
      getSalesStats({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
    }
  }, [data, startDate, endDate, error, getSalesStats]);

  const submitHandler = () => {
    getSalesStats({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }).then((response) => {
      if (response?.data && response.data.length === 0) {
        toast.error("No records found!");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-[100vh] flex justify-center items-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="p-4 my-5">
      <div className="flex flex-wrap justify-start items-center">
        <div className="mb-3 md:mr-4 w-full md:w-auto">
          <label className="block font-medium text-gray-700">Start Date</label>
          <DateRangePicker
            selected={startDate}
            onChange={(date: any) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-3 w-full md:w-auto">
          <label className="block font-medium text-gray-700">End Date</label>
          <DateRangePicker
            selected={endDate}
            onChange={(date: any) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          />
        </div>
        <Button
          className="font-semibold py-2 px-5 mt-3 md:mt-0 md:ml-4 rounded-md"
          color="secondary"
          onClick={submitHandler}
        >
          Fetch
        </Button>
      </div>

      <div className="w-full mt-5">
        <SalesStats data={data} />
      </div>

      <Card className="py-4 mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <CardHeader className="pb-0 pt-2 px-4">
              <h4 className="font-bold text-large">Sales History</h4>
            </CardHeader>
            <CardBody className="py-2">
              <SalesCharts salesData={data?.sixMonthSalesData} />
            </CardBody>
          </div>
          <div>
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h4 className="font-bold text-large">Top Performing Rooms</h4>
            </CardHeader>
            <CardBody>
              {data?.topRooms?.length > 0 ? (
                <div style={{ width: "100%", height: "400px" }}>
                  <TopPerformingChart rooms={data?.topRooms} />
                </div>
              ) : (
                <p className="mt-5">No data available</p>
              )}
            </CardBody>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

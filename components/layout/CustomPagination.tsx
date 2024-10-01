"use client";

import React from "react";
import { Pagination } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  resPerPage: number;
  filteredRoomsCount: number;
}

const CustomPagination = ({ resPerPage, filteredRoomsCount }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current page from URL or default to 1
  let page = searchParams.get("page") || 1;
  page = Number(page);

  // Calculate total pages based on filtered room count and results per page
  const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

  // Handler for page change
  const handlePerPage = (currentPage: number) => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);

      // Set or update the 'page' query parameter
      queryParams.set("page", currentPage.toString());

      // Construct the new path and push it to the router
      const path = `${window.location.pathname}?${queryParams.toString()}`;
      router.push(path);
    }
  };

  return (
    <div>
      <div className="flex justify-center mt-5">
        <Pagination
          isCompact
          showControls
          total={totalPages} // Total number of pages
          color="secondary"
          page={page} // Use current page from URL
          onChange={handlePerPage} // Handle page change
        />
      </div>
    </div>
  );
};

export default CustomPagination;

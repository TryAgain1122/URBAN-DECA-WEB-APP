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
  let page = searchParams.get("page") || 1;
  page = Number(page);

  let queryParams;

  const handlePerPage = (currentPage: number) => {
    if (typeof window !== "undefined") {
      queryParams = new URLSearchParams(window.location.search);

      if (queryParams.has("page")) {
        queryParams.set("page", currentPage.toString());
      } else {
        queryParams.append("page", currentPage.toString());
      }

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
          total={resPerPage}
          color="secondary"
          initialPage={filteredRoomsCount}
          onChange={handlePerPage}
        />
      </div>
    </div>
  );
};

export default CustomPagination;

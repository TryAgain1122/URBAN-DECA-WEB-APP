"use client";

import React from "react";
import { Pagination } from "@heroui/react"; // or "@heroui/react"
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  resPerPage: number;
  filteredRoomsCount: number;
}

const CustomPagination = ({ resPerPage, filteredRoomsCount }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get("page");
  const rawPage = Number(pageParam);
  const isValidPage =
    !isNaN(rawPage) && Number.isInteger(rawPage) && rawPage > 0;

  const page = isValidPage ? rawPage : 1;
  const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

  const handlePageChange = (newPage: number) => {
    if (!Number.isInteger(newPage) || newPage < 1 || newPage > totalPages)
      return;

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <>
      {resPerPage < filteredRoomsCount && (
        <div className="flex justify-center mt-6">
          <Pagination
            isCompact
            showControls
            loop
            total={totalPages}
            color="danger"
            page={page}
            onChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default CustomPagination;

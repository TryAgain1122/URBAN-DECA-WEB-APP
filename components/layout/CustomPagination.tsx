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
  const isValidPage = !isNaN(rawPage) && Number.isInteger(rawPage) && rawPage > 0;

  const page = isValidPage ? rawPage : 1;
  const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

  const handlePageChange = (newPage: number) => {
    if (!Number.isInteger(newPage) || newPage < 1 || newPage > totalPages) return;

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
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
  );
};

export default CustomPagination;
// "use client";

// import React from "react";
// import { Pagination } from "@heroui/react";
// import { useRouter, useSearchParams } from "next/navigation";

// interface Props {
//   resPerPage: number;
//   filteredRoomsCount: number;
// }

// const CustomPagination = ({ resPerPage, filteredRoomsCount }: Props) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Parse the 'page' query parameter as a number, default to 1 if not present
//   const page = Number(searchParams.get("page")) || 1;

//   // Calculate total pages
//   const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

//   // Handle page change
//   const handlePerPage = (currentPage: number) => {
//     if (typeof window !== "undefined") {
//       const queryParams = new URLSearchParams(window.location.search);
//       queryParams.set("page", currentPage.toString());
//       const path = `${window.location.pathname}?${queryParams.toString()}`;
//       router.push(path);
//     }
//   };

//   return (
//     <div className="flex justify-center mt-5">
//       <Pagination
//         isCompact
//         showControls
//         total={totalPages}
//         color="danger"
//         page={page} // Ensure this is a number
//         onChange={handlePerPage} // Update on page change
//         isDisabled={page === totalPages && totalPages === 1}
//       />
//     </div>
//   );
// };

// export default CustomPagination;

// "use client";

// import React from "react";
// import ReactPaginate from "react-paginate";
// import { useRouter, useSearchParams } from "next/navigation";

// interface Props {
//   resPerPage: number;
//   filteredRoomsCount: number;
// }

// const CustomPagination = ({ resPerPage, filteredRoomsCount }: Props) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const page = Number(searchParams.get("page")) || 1;
//   const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

//   const handlePerPage = ({ selected }: { selected: number }) => {
//     const currentPage = selected + 1; // react-paginate is 0-based
//     if (typeof window !== "undefined") {
//       const queryParams = new URLSearchParams(window.location.search);
//       queryParams.set("page", currentPage.toString());
//       const path = `${window.location.pathname}?${queryParams.toString()}`;
//       router.push(path);
//     }
//   };

//   return (
//     <div className="flex justify-center mt-5">
//       <ReactPaginate
//         previousLabel={"← Prev"}
//         nextLabel={"Next →"}
//         breakLabel={"..."}
//         pageCount={totalPages}
//         forcePage={page - 1} // react-paginate is 0-indexed
//         marginPagesDisplayed={2}
//         pageRangeDisplayed={3}
//         onPageChange={handlePerPage}
//         containerClassName={"flex items-center gap-2"}
//         pageClassName={"px-3 py-1 rounded border"}
//         activeClassName={"bg-red-500 text-white"}
//         previousClassName={"px-3 py-1 rounded border"}
//         nextClassName={"px-3 py-1 rounded border"}
//         breakClassName={"px-3 py-1"}
//         disabledClassName={"opacity-50 cursor-not-allowed"}
//       />
//     </div>
//   );
// };

// export default CustomPagination;

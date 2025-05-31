// "use client";

// import { useSearchParams, useRouter } from "next/navigation";

// interface Props {
//   resPerPage: number;
//   filteredRoomsCount: number;
// }

// const CustomPagination = ({ resPerPage, filteredRoomsCount }: Props) => {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // Kunin page param, parse safely, fallback to 1 kung invalid
//   const pageParam = searchParams.get("page");
//   const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
//   const currentPage = isNaN(parsedPage) ? 1 : parsedPage;

//   // Compute total pages
//   const totalPages = Math.ceil(filteredRoomsCount / resPerPage);

//   // Function to navigate sa bagong page
//   const goToPage = (page: number) => {
//     if (page < 1 || page > totalPages) return; // safety check

//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", page.toString());
//     router.push(`?${params.toString()}`);
//   };

//   return (

//     <div className="flex items-center gap-4 justify-center mt-4">
//       <button
//         disabled={currentPage === 1}
//         onClick={() => goToPage(currentPage - 1)}
//         className="px-3 py-1 border rounded disabled:opacity-50"
//       >
//         Prev
//       </button>

//       <span>
//         Page <strong>{currentPage}</strong> of {totalPages}
//       </span>

//       <button
//         disabled={currentPage === totalPages}
//         onClick={() => goToPage(currentPage + 1)}
//         className="px-3 py-1 border rounded disabled:opacity-50"
//       >
//         Next
//       </button>
//     </div>
//   );
// };

// export default CustomPagination;

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

import { IReview } from "@/backend/models/room";
import React from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface Props {
  reviews?: IReview[]; // Make reviews optional to prevent runtime errors
}

const ListReviews = ({ reviews = [] }: Props) => {
  console.log("Reviews data:", reviews); // Debugging to check if reviews is received

  return (
    <div className="w-full mb-10 mt-7">
      <h3 className="text-2xl font-bold mb-4">{reviews.length} Reviews</h3>
      <hr className="border-gray-300 mb-6" />

      {/* Scrollable Section */}
      <div className="space-y-6 max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {Array.isArray(reviews) && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="flex items-start gap-4 bg-white shadow-md rounded-lg p-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={review?.user?.avatar?.url || "/images/default_avatar.jpg"}
                  alt={review?.user?.name || "Anonymous"}
                  width={60}
                  height={60}
                  className="w-12 h-12 rounded-full"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600 font-light">
                    by {review?.user?.name || "Anonymous"}
                  </p>
                  <div className="star-ratings flex text-yellow-500 space-x-1">
                    {Array.from({ length: Math.floor(review?.rating || 0) }).map((_, index) => (
                      <FaStar key={index} />
                    ))}
                    {review?.rating % 1 !== 0 && <FaStarHalfAlt />}
                  </div>
                </div>
                <p className="font-medium text-gray-800">
                  {review?.comment || "No comment provided."}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews available.</p>
        )}
      </div>
    </div>
  );
};

export default ListReviews;

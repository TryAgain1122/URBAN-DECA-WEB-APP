import React from "react";
import { RxAvatar } from "react-icons/rx";

export const reviews = [
  {
    id: 1,
    name: "Rafhael Fernando",
    avatar: "https://via.placeholder.com/50", // Replace with actual image URLs if needed
    rating: 4.5,
    comment: "The room was clean and comfortable. Great location and friendly staff!",
  },
  {
    id: 2,
    name: "Jane Doe",
    avatar: "https://via.placeholder.com/50",
    rating: 5,
    comment: "Absolutely loved my stay here! Highly recommended for families.",
  },
  {
    id: 3,
    name: "John Smith",
    avatar: "https://via.placeholder.com/50",
    rating: 4,
    comment: "Good value for money. The breakfast could be improved, but overall a great experience.",
  },
  {
    id: 4,
    name: "Emily Johnson",
    avatar: "https://via.placeholder.com/50",
    rating: 3.5,
    comment: "The room was decent, but the service was a bit slow. Still, a nice stay.",
  },
  {
    id: 5,
    name: "Michael Brown",
    avatar: "https://via.placeholder.com/50",
    rating: 5,
    comment: "Fantastic stay! The view from the room was breathtaking. Will visit again.",
  },
  // Add more reviews if needed
];

const ListReviews = () => {
  return (
    <div className="w-full mb-10 mt-7">
      <h3 className="text-2xl font-bold mb-4">{reviews.length} Reviews</h3>
      <hr className="border-gray-300 mb-6" />
      {/* Scrollable Section */}
      <div className="space-y-6 max-h-96 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {reviews.map((review) => (
          <div key={review.id} className="flex items-start gap-4 bg-white shadow-md rounded-lg p-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {review.avatar ? (
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <RxAvatar size={50} className="text-gray-500" />
              )}
            </div>
            {/* Review Content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-light">by {review.name}</p>
                <div className="star-ratings flex text-yellow-500 space-x-1">
                  {Array.from({ length: Math.floor(review.rating) }).map((_, index) => (
                    <i key={index} className="fa fa-star"></i>
                  ))}
                  {review.rating % 1 !== 0 && <i className="fa fa-star-half"></i>}
                </div>
              </div>
              <p className="font-medium text-gray-800">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListReviews;

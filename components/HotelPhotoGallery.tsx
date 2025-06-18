"use client";

import { IImage } from "@/types/room";
// import { IImage } from "@/backend/models/room";
import React, { useEffect, useState } from "react";

interface Props {
  images: IImage[];
}

const HotelPhotoGallery: React.FC<Props> = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images?.length);
      }
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, images?.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images?.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images?.length);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsPaused(true); // Pause the carousel when the modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsPaused(false); // Resume the carousel when the modal is closed
  };

  console.log("images: ", images)
  return (
    <div className="relative w-full h-64 md:h-96 overflow-x-hidden rounded-lg">
      <div
        className="absolute top-0 left-0 w-full h-full flex justify-between items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Images */}
        <div
          className="w-full h-full flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images?.map((image, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0 cursor-pointer rounded-lg"
              style={{
                backgroundImage: `url(${image?.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onClick={openModal}
            />
          ))}
        </div>

        {/* Previous and Next Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition duration-300"
        >
          &#8249;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition duration-300"
        >
          &#8250;
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images?.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 bg-white rounded-full ${
              index === currentIndex ? "opacity-100" : "opacity-50"
            } cursor-pointer`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative">
            <img
              src={images[currentIndex]?.url}
              alt={`Slide ${currentIndex}`}
              className="w-full max-w-3xl max-h-screen object-contain rounded-md shadow-md"
            />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 p-2 bg-gray-800 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition duration-300"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPhotoGallery;

import React, { useEffect, useState } from "react";

const UNSPLASH_API_URL = "https://api.unsplash.com/search/photos";
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const InfoSection = ({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (trip) fetchUnsplashImage();
  }, [trip]);

  const fetchUnsplashImage = async () => {
    if (!trip?.userChoice?.location?.label) return;

    try {
      const response = await fetch(
        `${UNSPLASH_API_URL}?query=${trip.userChoice.location.label}&client_id=${ACCESS_KEY}&per_page=1`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        setPhotoUrl(data.results[0].urls.regular);
      } else {
        console.warn("No images found on Unsplash.");
      }
    } catch (error) {
      console.error("Error fetching image from Unsplash:", error);
    }
  };

  return (
    <div className="flex justify-between items-center mt-12 md:mx-16 lg:mx-48 p-6 rounded-lg shadow-lg">
      {photoUrl ? (
        <img
          className="h-40 w-40 rounded-full object-cover"
          src={photoUrl}
          alt="Trip Image"
        />
      ) : (
        <div className="h-40 w-40 bg-gray-200 rounded-full flex items-center justify-center">
          No Image
        </div>
      )}
      <div className="flex flex-col ml-6 items-end">
        <div className="text-4xl font-bold mb-2 flex items-center">
          🗺️ {trip?.userChoice?.location?.label}
        </div>
        <div className="text-xl mb-1 flex items-center">
          📅 <span className="font-semibold ml-2">Duration:</span> {trip?.userChoice?.noOfDays} days
        </div>
        <div className="text-xl mb-1 flex items-center">
          💰 <span className="font-semibold ml-2">Budget:</span> {trip?.userChoice?.budget}
        </div>
        <div className="text-xl flex items-center">
          👥 <span className="font-semibold ml-2">Traveling with:</span> {trip?.userChoice?.noOfPeople}
        </div>
      </div>
    </div>
  );
};

export default InfoSection;

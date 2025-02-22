import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const UserTripCardItem = ({ trip }) => {
  const [photoURL, setPhotoURL] = useState("");

  useEffect(() => {
    if (trip) {
      fetchTripImage();
    }
  }, [trip]);

  const fetchTripImage = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          trip?.userChoice?.location?.label + " travel"
        )}&client_id=${UNSPLASH_API_KEY}`
      );

      const data = await response.json();

      if (data.results.length > 0) {
        setPhotoURL(data.results[0].urls.regular);
      } else {
        setPhotoURL("https://source.unsplash.com/400x300/?travel");
      }
    } catch (error) {
      console.error("Error fetching trip image:", error);
      setPhotoURL("https://source.unsplash.com/400x300/?travel");
    }
  };

  return (
    <Link to={`/view-trip/${trip?.id}`}>
      <div className="hover:scale-105 transition-all hover:shadow-md">
        <img
          className="object-cover rounded-xl mx-auto w-80 h-64"
          src={photoURL}
          alt={trip?.userChoice?.location?.label}
        />
        <h2 className="font-bold text-lg">{trip?.userChoice?.location?.label}</h2>
        <h2 className="text-sm text-gray-500">
          {trip?.userChoice?.noOfDays} days trip with "{trip?.userChoice?.budget}" budget.
        </h2>
      </div>
    </Link>
  );
};

export default UserTripCardItem;

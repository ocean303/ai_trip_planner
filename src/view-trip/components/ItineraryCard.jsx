import React, { useEffect, useState } from "react";
import axios from "axios";
import { CiStar } from "react-icons/ci";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";
import { Link } from "react-router-dom";

const UNSPLASH_ACCESS_KEY = "rjkefMo26FtCHwC-zF0kGoMjUUoymGcfmeeGmvz7uRI"; // Replace with your key

const ItineraryCard = ({ plan }) => {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (plan) {
      fetchPlacePhoto();
    }
  }, [plan]);

  const fetchPlacePhoto = async () => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${plan?.placeName}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
      );

      if (response.data.results.length > 0) {
        setPhotoUrl(response.data.results[0].urls.regular);
      } else {
        setPhotoUrl("https://via.placeholder.com/300"); // Fallback image
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      setPhotoUrl("https://via.placeholder.com/300"); // Fallback image
    }
  };

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${plan?.placeName}`}
      target="_blank"
    >
      <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-300 itinerary-card">
        <img
          className="w-full h-48 object-cover"
          src={photoUrl}
          alt={plan?.placeName || "Place Image"}
        />
        <div className="p-4">
          <h4 className="text-xl font-semibold mb-2 flex items-center">
            <FaMapMarkerAlt className="text-blue-500 mr-2" />
            {plan?.placeName}
          </h4>
          <p className="flex items-center text-md mb-2 text-gray-700">
            <CiStar className="text-yellow-500 mr-1" />
            {plan?.rating || "N/A"}
          </p>
          <p className="flex items-center text-md mb-1 text-gray-600">
            <MdAttachMoney className="text-green-500 mr-1" />
            Ticket Pricing: {plan?.ticketPricing || "N/A"}
          </p>
          <p className="flex items-center text-md mb-1 text-gray-600">
            <FaClock className="text-gray-500 mr-1" />
            Travel Time: {plan?.timeTravel || "N/A"}
          </p>
          <p className="text-md text-gray-600 truncate">
            {plan?.placeDetails || "No details available"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ItineraryCard;

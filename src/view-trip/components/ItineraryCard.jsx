import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import { FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdAttachMoney } from "react-icons/md";

const UNSPLASH_ACCESS_KEY = "rjkefMo26FtCHwC-zF0kGoMjUUoymGcfmeeGmvz7uRI";

const ItineraryCard = ({ trip }) => {
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      let images = {};
      for (const day of trip?.tripData?.itinerary || []) {
        for (const plan of day.plan || []) {
          try {
            const response = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(plan.placeName)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
            );
            if (response.data.results.length > 0) {
              images[plan.placeName] = response.data.results[0].urls.regular;
            } else {
              images[plan.placeName] = "https://via.placeholder.com/300"; // Fallback image
            }
          } catch (error) {
            console.error("Error fetching place photo:", error);
            images[plan.placeName] = "https://via.placeholder.com/300"; // Fallback image
          }
        }
      }
      setPhotos(images);
    };

    if (trip?.tripData?.itinerary) {
      fetchImages();
    }
  }, [trip]);

  return (
    <div className="w-full px-6"> {/* Removed py-6 to eliminate extra padding */}
      <h2 className="text-4xl font-bold text-center mb-8">Your Journey Timeline</h2>
      <div className="relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>
        
        {trip?.tripData?.itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-8 relative"> {/* Reduced margin-bottom */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-4 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center z-10">
              {dayIndex + 1}
            </div>
            
            <div className="relative flex items-start">
              <div className={`w-1/2 ${dayIndex % 2 === 0 ? 'pr-8 text-right' : 'pl-8 ml-auto'}`}>
                <h3 className="text-2xl font-semibold mb-4">{day.day}</h3>
                <div className="space-y-6"> {/* Added space between cards */}
                  {day.plan?.map((plan, planIndex) => (
                    <Link 
                      key={planIndex}
                      to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.placeName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="bg-white rounded-lg shadow-lg p-4 transform transition-all hover:scale-105 mb-6"> {/* Added margin-bottom */}
                        <div className="relative">
                          <img
                            src={photos[plan.placeName] || "https://via.placeholder.com/300"}
                            alt={plan.placeName}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm flex items-center">
                            <CiStar className="text-yellow-500 mr-1" /> {plan.rating || "N/A"}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="text-xl font-semibold mb-2 flex items-center">
                            <FaMapMarkerAlt className="text-blue-500 mr-2" />
                            {plan.placeName}
                          </h4>
                          <div className="text-gray-600 text-sm space-y-2">
                            <p className="flex items-center">
                              <FaClock className="text-gray-500 mr-2" />
                              Travel Time: {plan.timeTravel || "N/A"}
                            </p>
                            <p className="flex items-center">
                              <MdAttachMoney className="text-green-500 mr-2" />
                              Ticket Pricing: {plan.ticketPricing || "N/A"}
                            </p>
                            <p className="line-clamp-2">{plan.placeDetails || "No details available"}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryCard;
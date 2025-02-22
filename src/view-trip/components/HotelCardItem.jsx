import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CiStar } from "react-icons/ci";

const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

const HotelCardItem = ({ h }) => {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (h) {
      fetchHotelImage();
    }
  }, [h]);

  const fetchHotelImage = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          h.name + "hotel rooms"
        )}&orientation=landscape&per_page=1&client_id=${UNSPLASH_API_KEY}`
      );
      const data = await response.json();

      if (data.results.length > 0) {
        setPhotoUrl(data.results[0].urls.regular);
      } else {
        setPhotoUrl("https://source.unsplash.com/400x300/?hotel");
      }
    } catch (error) {
      console.error("Error fetching hotel image:", error);
      setPhotoUrl("https://source.unsplash.com/400x300/?hotel");
    }
  };

  return (
    <div>
      <Link
        to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          h.name + ", " + h.address
        )}`}
        target="_blank"
      >
        <div className="flex flex-col items-center justify-center">
          <img className="w-80 h-52 rounded-md object-cover" src={photoUrl} alt={h?.name} />
          <div className="flex w-full items-center justify-between px-8 mt-2">
            <div className="font-bold">{h.name}</div>
            <div className="flex items-center">
              {h.rating}
              <CiStar />
            </div>
          </div>
          <div className="w-full px-8 my-1 text-md">{h.address}</div>
        </div>
      </Link>
    </div>
  );
};

export default HotelCardItem;

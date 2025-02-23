import React, { useState, useEffect } from "react";
import HotelCardItem from "./HotelCardItem";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

const Hotels = ({ trip }) => {
  const [checkInDate, setCheckInDate] = useState("2025-05-01");
  const [checkOutDate, setCheckOutDate] = useState("2025-05-02");
  const [hotelPrices, setHotelPrices] = useState({}); // Store prices for all hotels

  useEffect(() => {
    if (trip?.tripData?.hotel || trip?.tripData?.hotels || trip?.tripData?.hotelOptions) {
      fetchAllHotelPrices();
    }
  }, [checkInDate, checkOutDate]);

  const fetchAllHotelPrices = async () => {
    const hotels = trip?.tripData?.hotel || trip?.tripData?.hotels || trip?.tripData?.hotelOptions;
    const prices = {};

    await Promise.all(
      hotels.map(async (hotel) => {
        try {
          const response = await axios.post("http://localhost:5000/get-hotel-price", {
            cityCode: hotel.name,
            checkInDate,
            checkOutDate,
          });
          prices[hotel.id] = response.data.price;
        } catch (error) {
          console.error(`Error fetching price for ${hotel.name}:`, error);
          prices[hotel.id] = "Price not available";
        }
      })
    );

    setHotelPrices(prices);
  };

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="mt-12 mx-auto md:mx-16 lg:mx-32 p-6 rounded-lg shadow-lg">
      <div className="text-4xl font-bold text-center mb-8">Hotel Recommendations</div>

      {/* Global Check-in & Check-out Date Selection */}
      {/* <div className="flex justify-center space-x-4 mb-6">
        <div>
          <label>Check-in: </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </div>
        <div>
          <label>Check-out: </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
          />
        </div>
      </div> */}

      <div className="slider-container">
        <Slider {...settings}>
          {(trip?.tripData?.hotel || trip?.tripData?.hotels || trip?.tripData?.hotelOptions)?.map((h, i) => (
            <div key={i} className="p-2">
              <HotelCardItem h={h} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Hotels;

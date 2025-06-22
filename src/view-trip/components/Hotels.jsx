import React from "react";
import HotelCardItem from "./HotelCardItem";
import { motion } from "framer-motion";

const Hotels = ({ trip }) => {
  const hotels = trip?.tripData?.hotels || trip?.tripData?.hotel || trip?.tripData?.hotelOptions || [];

  return (
    <div className="max-w-6xl mx-auto p-6 overflow-hidden">
      <h2 className="text-3xl font-bold text-center mb-8">Hotel Recommendations</h2>

      {/* Sliding Container */}
      <motion.div
        className="flex space-x-6 overflow-x-auto scrollbar-hide p-4"
        whileTap={{ cursor: "grabbing" }}
      >
        {hotels.map((h, index) => (
          <motion.div
            key={index}
            className="flex-none w-80"
            whileHover={{ scale: 1.05 }}
            drag="x"
            dragConstraints={{ left: -500, right: 500 }} // Adjust range for smooth sliding
          >
            <HotelCardItem h={h} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Hotels;
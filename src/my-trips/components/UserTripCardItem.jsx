import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";

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

  const generatePDF = () => {
    const doc = new jsPDF();
  
    doc.setFontSize(16);
    doc.text("Trip Itinerary", 20, 20);
  
    doc.setFontSize(12);
    doc.text(`Location: ${trip?.userChoice?.location?.label}`, 20, 40);
    doc.text(`Duration: ${trip?.userChoice?.noOfDays} days`, 20, 50);
    doc.text(`Budget: ${trip?.userChoice?.budget}`, 20, 60);
  
    let yPos = 80;
  
    // Add itinerary details
    trip?.tripData?.itinerary?.forEach((day, index) => {
      doc.setFontSize(14);
      doc.text(`Day ${index + 1}: ${day.day}`, 20, yPos);
      yPos += 10;
  
      day.plan.forEach((activity) => {
        doc.setFontSize(12);
        doc.text(`- ${activity.placeName}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`  Details: ${activity.placeDetails}`, 25, yPos);
        yPos += 6;
        doc.text(`  Time Travel: ${activity.timeTravel}`, 25, yPos);
        yPos += 6;
        doc.text(`  Rating: ${activity.rating}`, 25, yPos);
        yPos += 10;
      });
  
      yPos += 5;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  
    // Add hotel details
    if (trip?.tripData?.hotels?.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text("Hotel Details", 20, yPos);
      yPos += 10;
  
      trip.tripData.hotels.forEach((hotel) => {
        doc.setFontSize(12);
        doc.text(`- ${hotel.name}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`  Rating: ${hotel.rating}`, 25, yPos);
        yPos += 6;
        doc.text(`  Address: ${hotel.address}`, 25, yPos);
        yPos += 10;
  
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
  
    doc.save(`Trip_${trip?.id}.pdf`);
  };
  
  

  return (
    <div className="hover:scale-105 transition-all hover:shadow-md p-4 border rounded-lg">
      <Link to={`/view-trip/${trip?.id}`}>
        <img
          className="object-cover rounded-xl mx-auto w-80 h-64"
          src={photoURL}
          alt={trip?.userChoice?.location?.label}
        />
        <h2 className="font-bold text-lg">{trip?.userChoice?.location?.label}</h2>
        <h2 className="text-sm text-gray-500">
          {trip?.userChoice?.noOfDays} days trip with "{trip?.userChoice?.budget}" budget.
        </h2>
      </Link>
      <button
        onClick={generatePDF}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Download Trip PDF
      </button>
    </div>
  );
};

export default UserTripCardItem;

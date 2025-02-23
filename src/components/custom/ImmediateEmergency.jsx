import React, { useEffect, useState } from "react";
import { FiPhone } from "react-icons/fi";
import { FaAmbulance, FaShieldAlt, FaFireExtinguisher, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const ImmediateEmergency = () => {
  const [emergencyServices, setEmergencyServices] = useState({
    hospitals: [],
    police: [],
    fire: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hospitals");
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchEmergencyServices();
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Please enable location services to find nearby emergency services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred while getting location.";
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const fetchEmergencyServices = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/emergency-services/nearby?lat=${userLocation.latitude}&lng=${userLocation.longitude}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency services');
      }

      const data = await response.json();
      setEmergencyServices({
        hospitals: data.filter(service => service.type === "Hospital"),
        police: data.filter(service => service.type === "Police station"),
        fire: data.filter(service => service.type === "Fire station"),
      });
    } catch (error) {
      setError("Error fetching emergency services. Please try again later.");
      console.error("Error fetching emergency services:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "hospitals", label: "Hospitals", icon: <FaAmbulance /> },
    { key: "police", label: "Police", icon: <FaShieldAlt /> },
    { key: "fire", label: "Fire Services", icon: <FaFireExtinguisher /> },
  ];

  if (error) {
    return (
      <div className="container mx-auto mt-10 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          {error.includes("location services") && (
            <button 
              onClick={getUserLocation}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry with Location
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Emergency Mode Active - Showing Nearest Services
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
        🚨 Nearest Emergency Services
      </h1>

      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${
              activeTab === tab.key
                ? "bg-red-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          Finding nearest emergency services...
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {emergencyServices[activeTab].length > 0 ? (
            emergencyServices[activeTab].map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="p-6 border rounded-lg shadow-md bg-white transition transform hover:shadow-xl"
              >
                <h2 className="text-xl font-bold text-gray-800">{service.name}
                </h2>
                <div className="mt-2 flex items-center text-green-600">
                  <span className="font-semibold">{service.distance}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">{service.estimated_time}</span>
                </div>
                <p className="text-gray-600 flex items-center mt-2">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {service.address}
                </p>
                <div className="flex items-center text-blue-600 mt-2">
                  <FiPhone className="mr-2" />
                  <a 
                    href={`tel:${service.phone}`} 
                    className="hover:underline font-medium"
                  >
                    {service.phone || "No phone available"}
                  </a>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.coordinates.lat},${service.coordinates.lng}&travelmode=driving`)}
                  className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">Get Directions</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-600 col-span-3 text-center">No services found for this category.</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ImmediateEmergency;
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiPhone, FiDownload } from "react-icons/fi";
import { FaAmbulance, FaShieldAlt, FaFireExtinguisher, FaMapMarkerAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import jsPDF from 'jspdf';

const EmergencyServices = () => {
  const location = useLocation();
  const { trip } = location.state || {};
  const [emergencyServices, setEmergencyServices] = useState({
    hospitals: [],
    police: [],
    fire: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hospitals");

  useEffect(() => {
    if (trip?.userChoice?.location?.label) {
      fetchEmergencyServices();
    }
  }, [trip]);

  const fetchEmergencyServices = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/emergency-services?location=${encodeURIComponent(trip.userChoice.location.label)}`
      );
      console.log(response);
      const data = await response.json();
      setEmergencyServices({
        hospitals: data.filter(service => service.type === "Hospital"),
        police: data.filter(service => service.type === "Police station"),
        fire: data.filter(service => service.type === "Fire station"),
      });
    } catch (error) {
      console.error("Error fetching emergency services:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yOffset = 20;

    // Add title
    doc.setFontSize(20);
    doc.text('Emergency Services Directory', 20, yOffset);
    yOffset += 20;

    // Process each category
    const categories = [
      { key: 'hospitals', title: 'Hospitals' },
      { key: 'police', title: 'Police Stations' },
      { key: 'fire', title: 'Fire Stations' }
    ];

    categories.forEach(category => {
      // Add category title
      doc.setFontSize(16);
      doc.text(category.title, 20, yOffset);
      yOffset += 10;

      // Add services under this category
      doc.setFontSize(12);
      emergencyServices[category.key].forEach(service => {
        // Add new page if needed
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }

        doc.text(service.name, 20, yOffset);
        yOffset += 7;
        doc.text(service.address, 20, yOffset);
        yOffset += 7;
        doc.text(service.phone || 'No phone available', 20, yOffset);
        yOffset += 15;
      });

      yOffset += 10;
    });

    // Save the PDF
    doc.save('emergency-services.pdf');
  };

  const tabs = [
    { key: "hospitals", label: "Hospitals", icon: <FaAmbulance /> },
    { key: "police", label: "Police", icon: <FaShieldAlt /> },
    { key: "fire", label: "Fire Services", icon: <FaFireExtinguisher /> },
  ];

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          🚨 Emergency Services
        </h1>
        <button
          onClick={generatePDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiDownload className="mr-2" />
          Export PDF
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-all ${activeTab === tab.key
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Display Data */}
      {loading ? (
        <div className="text-center text-gray-600">Loading emergency services...</div>
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
                <h2 className="text-xl font-bold text-gray-800">{service.name}</h2>
                <p className="text-gray-600 flex items-center mt-2">
                  <FaMapMarkerAlt className="mr-2 text-red-500" />
                  {service.address}
                </p>
                <div className="flex items-center text-blue-600 mt-2">
                  <FiPhone className="mr-2" />
                  <a href={`tel:${service.phone}`} className="hover:underline">
                    {service.phone || "No phone available"}
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-600">No services found for this category.</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EmergencyServices;
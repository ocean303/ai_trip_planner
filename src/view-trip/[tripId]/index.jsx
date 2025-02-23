import { db } from "@/service/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import ItineraryCard from "../components/ItineraryCard";
import LeafletTripMap from "../components/ItineraryMap";
import Finance from "../components/FinancialData";
import Events from "../components/events";
import Chat from "../components/Chatbot";
import CarbonCalc from "../components/CarbonFtpr";

const ViewTrip = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');

  // Enhanced trip data fetching with loading state and error handling
  const GetTripData = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "AITrips", tripId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setTrip(docSnap.data());
      } else {
        console.log("No such document");
        toast.error("Trip not found");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
      toast.error("Error loading trip data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    GetTripData();
  }, [tripId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabData = [
    { id: 'itinerary', label: 'Itinerary', component: <ItineraryCard trip={trip} /> },
    { id: 'events', label: 'Events', component: <Events trip={trip} /> },
    { id: 'hotels', label: 'Hotels', component: <Hotels trip={trip} /> },
    { id: 'map', label: 'Map', component: <LeafletTripMap trip={trip} /> },
    { id: 'finance', label: 'Financial Forecast', component: <Finance trip={trip} /> },
    { id: 'Chat', label: 'ChatBot', component: <Chat trip={trip} /> },
    { id: 'CarbonCalc', label: 'Carbon footprint analyser', component: <CarbonCalc itineraryData={trip} /> }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Info Section - Always visible */}
      <div className="mb-8">
        <InfoSection trip={trip} />
      </div>

      {/* Custom Tabbed Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabData.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-6 text-sm font-medium mr-4 focus:outline-none ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {tabData.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-300"
      >
        ↑
      </button>
    </div>
  );
};

export default ViewTrip;
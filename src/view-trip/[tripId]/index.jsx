import { db } from "@/service/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import ItineraryCard from "../components/ItineraryCard";
import LeafletTripMap from "../components/ItineraryMap";

const ViewTrip = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Information Section */}
      <InfoSection trip={trip} />
      
      {/* Recommended Hotels */}
      <Hotels trip={trip} />
      
      {/* Timeline Itinerary */}
      <ItineraryCard trip={trip} />

      <LeafletTripMap trip={trip} />
      
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
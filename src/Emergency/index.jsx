import React, { useEffect, useState } from 'react';
import { AlertCircle, Phone } from 'lucide-react';

const EmergencyServicesPage = ({ tripData }) => {
  const [services, setServices] = useState({
    hospitals: [],
    police: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PLACES_API_KEY = 'AIzaSyBPRzZN0cd_I-1DPllUVQv0Qz7rFvLhoDs';

  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,international_phone_number&key=${PLACES_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        phoneNumber: data.result.formatted_phone_number || data.result.international_phone_number,
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      return { phoneNumber: null };
    }
  };

  const searchNearbyPlaces = async (location, type) => {
    try {
      if (!location?.geoCoordinates) {
        throw new Error('No coordinates found for location');
      }

      const [lat, lng] = location.geoCoordinates.split(',').map(coord => coord.trim());
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=${type}&key=${PLACES_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Get only first 5 results and fetch their details
      const placesWithDetails = await Promise.all(
        data.results.slice(0, 5).map(async (result) => {
          const details = await getPlaceDetails(result.place_id);
          return {
            name: result.name,
            address: result.vicinity,
            location: result.geometry.location,
            rating: result.rating,
            phoneNumber: details.phoneNumber,
            placeId: result.place_id
          };
        })
      );

      return placesWithDetails;

    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Failed to fetch ${type} locations`);
      return [];
    }
  };

  useEffect(() => {
    const findEmergencyServices = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!tripData?.tripData?.itinerary?.[0]?.plan?.[0]) {
          throw new Error('Invalid trip data structure');
        }

        const location = tripData.tripData.itinerary[0].plan[0];
        
        const [hospitals, policeStations] = await Promise.all([
          searchNearbyPlaces(location, 'hospital'),
          searchNearbyPlaces(location, 'police')
        ]);

        setServices({
          hospitals,
          police: policeStations
        });
        
      } catch (error) {
        console.error('Error finding emergency services:', error);
        setError('Failed to load emergency services');
      } finally {
        setLoading(false);
      }
    };

    if (tripData) {
      findEmergencyServices();
    }
  }, [tripData]);

  const ServiceCard = ({ service }) => (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-medium">{service.name}</h3>
      <p className="text-gray-600 mt-1">{service.address}</p>
      {service.phoneNumber && (
        <div className="flex items-center gap-2 mt-2 text-blue-600">
          <Phone className="h-4 w-4" />
          <a href={`tel:${service.phoneNumber}`} className="hover:underline">
            {service.phoneNumber}
          </a>
        </div>
      )}
      {service.rating && (
        <p className="text-sm text-gray-500 mt-2">Rating: {service.rating} ⭐</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nearby Emergency Services</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Hospitals</h2>
          <div className="grid gap-4">
            {services.hospitals.map((hospital, index) => (
              <ServiceCard key={index} service={hospital} />
            ))}
            {services.hospitals.length === 0 && (
              <p className="text-gray-500">No hospitals found nearby</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Police Stations</h2>
          <div className="grid gap-4">
            {services.police.map((station, index) => (
              <ServiceCard key={index} service={station} />
            ))}
            {services.police.length === 0 && (
              <p className="text-gray-500">No police stations found nearby</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmergencyServicesPage;
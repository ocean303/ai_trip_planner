import React, { useState, useEffect } from 'react';
import { Calendar, Music, Activity } from 'lucide-react';

const EventsTimeline = ({ trip }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculate dates based on duration
        const startDate = new Date();
        const endDate = new Date();
        const duration = parseInt(trip.userChoice.noOfDays);
        endDate.setDate(startDate.getDate() + duration);

        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };

        // Determine budget based on preference
        const budgetMap = {
          'Budget-Friendly': 3000,
          'Mid-Range': 5000,
          'Luxury': 8000
        };

        const requestData = {
          source_city: "New York", // Default as not provided in trip data
          destination: trip.userChoice.location.label.split(',')[0],
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
          budget: budgetMap[trip.userChoice.budget] || 3000,
          currency: "USD"
        };

        const response = await fetch('http://localhost:5000/api/travel/plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setEvents(data.plan.events);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (trip) {
      fetchData();
    }
  }, [trip]);

  const getIcon = (category) => {
    switch (category) {
      case 'concerts':
        return <Music className="w-5 h-5" />;
      case 'sports':
        return <Activity className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="w-full p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-full p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upcoming Events</h2>
      
      <div className="bg-white rounded-lg shadow">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div 
              key={index}
              className={`flex items-start p-4 ${
                index !== events.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                {getIcon(event.category)}
              </div>
              
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDateTime(event.date)}
                </p>
                <span className="inline-block px-2 py-1 mt-2 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-600">
            No events scheduled for this trip
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsTimeline;
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import _ from 'lodash';

const EMISSION_FACTORS = {
  walking: 0,
  bicycle: 0,
  bus: 0.089,
  train: 0.041,
  car: 0.171,
  plane: 0.255
};

const ACCOMMODATION_EMISSIONS = {
  hotel: 12.2,
  hostel: 5.5,
  apartment: 8.0
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const calculateDistance = (coord1, coord2) => {
  const [lat1, lon1] = coord1.split(',').map(x => parseFloat(x.trim()));
  const [lat2, lon2] = coord2.split(',').map(x => parseFloat(x.trim()));
  
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const CarbonDashboard = ({ itineraryData }) => {
  const [selectedTransport, setSelectedTransport] = useState('train');
  const [emissionsData, setEmissionsData] = useState([]);
  const [dailyEmissions, setDailyEmissions] = useState([]);
  const [totalStats, setTotalStats] = useState({
    distance: 0,
    emissions: 0,
    days: 0
  });

  useEffect(() => {
    // Calculate routes and distances
    const routes = [];
    let previousCoord = null;
    let totalDistance = 0;

    itineraryData.tripData.itinerary.forEach((day, dayIndex) => {
      let dailyDistance = 0;
      
      day.plan.forEach(place => {
        if (previousCoord) {
          const distance = calculateDistance(previousCoord, place.geoCoordinates);
          dailyDistance += distance;
          totalDistance += distance;
          routes.push({
            from: previousCoord,
            to: place.geoCoordinates,
            distance: distance,
            day: dayIndex + 1
          });
        }
        previousCoord = place.geoCoordinates;
      });
    });

    // Calculate emissions for different modes
    const emissions = Object.entries(EMISSION_FACTORS).map(([mode, factor]) => ({
      mode: mode.charAt(0).toUpperCase() + mode.slice(1),
      emissions: totalDistance * factor,
      distance: totalDistance,
      perKm: factor
    }));

    // Calculate daily emissions
    const daily = routes.reduce((acc, route) => {
      const dayEmissions = {};
      Object.entries(EMISSION_FACTORS).forEach(([mode, factor]) => {
        dayEmissions[mode] = route.distance * factor;
      });
      
      if (!acc[route.day]) {
        acc[route.day] = {
          day: `Day ${route.day}`,
          distance: route.distance,
          ...dayEmissions
        };
      } else {
        acc[route.day].distance += route.distance;
        Object.entries(EMISSION_FACTORS).forEach(([mode, factor]) => {
          acc[route.day][mode] += route.distance * factor;
        });
      }
      return acc;
    }, {});

    setEmissionsData(emissions);
    setDailyEmissions(Object.values(daily));
    setTotalStats({
      distance: totalDistance,
      emissions: totalDistance * EMISSION_FACTORS[selectedTransport],
      days: itineraryData.tripData.itinerary.length
    });

  }, [itineraryData, selectedTransport]);

  return (
    <div className="p-6 bg-white rounded-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Travel Carbon Footprint Analysis</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Total Distance</p>
            <p className="text-2xl font-bold">{totalStats.distance.toFixed(2)} km</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Trip Duration</p>
            <p className="text-2xl font-bold">{totalStats.days} days</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-sm text-gray-600">Selected Mode Emissions</p>
            <p className="text-2xl font-bold">{totalStats.emissions.toFixed(2)} kg CO₂</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-xl font-bold mb-4">Emissions by Transport Mode</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mode" />
                <YAxis label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value.toFixed(3)} kg CO₂`,
                    name === 'emissions' ? 'Total Emissions' : name
                  ]}
                />
                <Bar dataKey="emissions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-xl font-bold mb-4">Daily Emissions Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyEmissions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'CO₂ Emissions (kg)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {Object.keys(EMISSION_FACTORS).map((mode, index) => (
                  <Line 
                    key={mode}
                    type="monotone"
                    dataKey={mode}
                    stroke={COLORS[index % COLORS.length]}
                    name={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="text-xl font-bold mb-3">Transport Recommendations</h3>
          <div className="space-y-2">
            {emissionsData.sort((a, b) => a.emissions - b.emissions).map((mode, index) => (
              <div key={mode.mode} className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {mode.mode}
                </span>
                <span className="text-gray-600">{mode.emissions.toFixed(3)} kg CO₂</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded">
          <h3 className="text-xl font-bold mb-3">Offset Your Impact</h3>
          <div className="space-y-2">
            <p>To offset your carbon footprint:</p>
            <ul className="list-disc ml-6">
              <li>Plant {Math.ceil(totalStats.emissions / 21)} trees (1 tree ≈ 21kg CO₂/year)</li>
              <li>Switch to LED bulbs ({Math.ceil(totalStats.emissions / 34)} bulbs)</li>
              <li>Support local carbon offset projects</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>* Calculations based on average emission factors and optimal routes between locations</p>
        <p>* Actual emissions may vary based on specific vehicles, weather, and traffic conditions</p>
      </div>
    </div>
  );
};

export default CarbonDashboard;
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TripMap = ({ trip }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Extract all locations from the trip itinerary
  const locations = trip.tripData.itinerary.flatMap(day => 
    day.plan.map(place => ({
      name: place.placeName,
      coordinates: place.geoCoordinates.split(', ').map(Number),
      details: place.placeDetails,
      day: day.day
    }))
  );
  
  useEffect(() => {
    console.log('Initializing map...');
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F1MjUwOSIsImEiOiJjbTdoZGkza2YxYndwMnJyNTk1MnJqN2JhIn0.S1LR-LBVjO4G_iP8EinLZw';
    
    try {
      if (!mapRef.current) {
        const initialCoords = locations[0].coordinates;
        console.log('Creating new map instance at:', initialCoords);
        
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initialCoords[1], initialCoords[0]],
          zoom: 12,
          pitch: 45,
          bearing: 0
        });

        // Add terrain and fog for depth effect
        mapRef.current.on('load', () => {
          mapRef.current.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
          });
          
          // Add 3D terrain
          mapRef.current.setTerrain({
            'source': 'mapbox-dem',
            'exaggeration': 1.5
          });
          
          // Add atmospheric fog
          mapRef.current.setFog({
            'color': 'rgb(186, 210, 235)',
            'horizon-blend': 0.02,
            'high-color': 'rgb(36, 92, 223)',
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          });

          // Add a pulsing dot animation
          const size = 150;
          const pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),
            onAdd: function() {
              const canvas = document.createElement('canvas');
              canvas.width = this.width;
              canvas.height = this.height;
              this.context = canvas.getContext('2d');
            },
            render: function() {
              const duration = 1000;
              const t = (performance.now() % duration) / duration;
              const radius = (size / 2) * 0.3;
              const outerRadius = (size / 2) * 0.7 * t + radius;
              const context = this.context;
              context.clearRect(0, 0, this.width, this.height);
              context.beginPath();
              context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
              );
              context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
              context.fill();
              context.beginPath();
              context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
              );
              context.fillStyle = 'rgba(255, 100, 100, 1)';
              context.strokeStyle = 'white';
              context.lineWidth = 2 + 4 * (1 - t);
              context.fill();
              context.stroke();
              this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
              ).data;
              return true;
            }
          };

          mapRef.current.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
        });

        // Create initial marker with custom pulsing dot
        markerRef.current = new mapboxgl.Marker({
          color: '#FF0000',
          scale: 0.8,
          animation: true
        })
          .setLngLat([initialCoords[1], initialCoords[0]])
          .setPopup(new mapboxgl.Popup({
            offset: 25,
            className: 'custom-popup'
          }).setHTML(
            `<div class="p-2 animate-fade-in">
              <h3 class="font-bold">${locations[0].name}</h3>
              <p class="text-sm">${locations[0].details}</p>
              <p class="text-xs mt-1">${locations[0].day}</p>
            </div>`
          ))
          .addTo(mapRef.current);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Update map when slider changes with enhanced animations
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const location = locations[currentIndex];
      const [lat, lng] = location.coordinates;
      
      // Calculate bearing to create a swooping effect
      const prevLocation = locations[currentIndex > 0 ? currentIndex - 1 : 0];
      const bearing = getBearing(
        prevLocation.coordinates[0],
        prevLocation.coordinates[1],
        lat,
        lng
      );

      // Animate marker with bounce effect
      markerRef.current
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({
          offset: 25,
          className: 'custom-popup animate-bounce'
        }).setHTML(
          `<div class="p-2 animate-fade-in">
            <h3 class="font-bold">${location.name}</h3>
            <p class="text-sm">${location.details}</p>
            <p class="text-xs mt-1">${location.day}</p>
          </div>`
        ));

      // Enhanced flyTo animation
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 2000,
        essential: true,
        bearing: bearing,
        pitch: 60,
        curve: 1.5,
        easing: (t) => {
          return t * (2 - t); // Ease out quad
        },
        animation: {
          duration: 2000,
          animate: true
        }
      });

      // Add a smooth pitch adjustment after the initial animation
      setTimeout(() => {
        mapRef.current.easeTo({
          pitch: 45,
          duration: 1000,
          easing: (t) => t * (2 - t)
        });
      }, 2000);
    }
  }, [currentIndex]);

  // Helper function to calculate bearing between two points
  const getBearing = (lat1, lon1, lat2, lon2) => {
    const toRad = (degree) => degree * Math.PI / 180;
    const toDeg = (rad) => rad * 180 / Math.PI;
    
    const dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    let bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  };

  const handleSliderChange = (event) => {
    setCurrentIndex(parseInt(event.target.value));
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 overflow-hidden"
      />
      
      <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{locations[currentIndex].day}: {locations[currentIndex].name}</span>
          <span>
            {locations[currentIndex].coordinates[0]}, {locations[currentIndex].coordinates[1]}
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max={locations.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="w-full"
        />
        
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 justify-between">
          {locations.map((location, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`p-1 rounded transition-all duration-300 ${
                currentIndex === index 
                  ? 'bg-blue-500 text-white scale-110' 
                  : 'hover:bg-gray-200'
              }`}
            >
              {location.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TripMap;
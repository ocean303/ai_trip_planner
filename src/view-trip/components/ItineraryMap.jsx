import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TripMap = ({ trip }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Guard against undefined data
  if (!trip?.tripData?.itinerary || !trip?.tripData?.hotels) {
    return (
      <div className="w-full h-96 rounded-lg border-2 border-gray-300 flex items-center justify-center">
        <p className="text-gray-500">Loading map data...</p>
      </div>
    );
  }
  
  // Process all locations including both attractions and hotels
  const locations = {
    attractions: trip.tripData.itinerary.flatMap(day => 
      (day.plan || []).map(place => ({
        name: place.placeName,
        coordinates: place.geoCoordinates.split(',').map(coord => parseFloat(coord.trim())),
        details: place.placeDetails,
        day: day.day,
        type: 'attraction',
        rating: place.rating,
        timing: place.timeTravel,
        price: place.ticketPricing
      }))
    ),
    hotels: (trip.tripData.hotels || []).map(hotel => ({
      name: hotel.name,
      coordinates: hotel.geoCoordinates.split(',').map(coord => parseFloat(coord.trim())),
      details: hotel.description,
      rating: hotel.rating,
      address: hotel.address,
      type: 'hotel'
    }))
  };

  const allLocations = [...locations.attractions, ...locations.hotels];

  // Guard against empty locations
  if (allLocations.length === 0) {
    return (
      <div className="w-full h-96 rounded-lg border-2 border-gray-300 flex items-center justify-center">
        <p className="text-gray-500">No locations to display</p>
      </div>
    );
  }

  useEffect(() => {
    if (!mapContainer.current || !allLocations.length) return;
    
    console.log('Initializing map...');
    mapboxgl.accessToken = 'pk.eyJ1IjoiZ2F1MjUwOSIsImEiOiJjbTdoZGkza2YxYndwMnJyNTk1MnJqN2JhIn0.S1LR-LBVjO4G_iP8EinLZw';
    
    try {
      if (!mapRef.current) {
        const initialCoords = allLocations[0].coordinates;
        
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initialCoords[1], initialCoords[0]],
          zoom: 12,
          pitch: 45,
          bearing: 0
        });

        mapRef.current.on('load', () => {
          // Only add route if there are attractions
          if (locations.attractions.length > 1) {
            const attractionPoints = locations.attractions.map(loc => 
              [loc.coordinates[1], loc.coordinates[0]]
            );

            mapRef.current.addSource('route', {
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                  'type': 'LineString',
                  'coordinates': attractionPoints
                }
              }
            });

            // Add the line layer
            mapRef.current.addLayer({
              'id': 'route',
              'type': 'line',
              'source': 'route',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#e74c3c',
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [2, 1]
              }
            });

            // Add animated line layer
            mapRef.current.addLayer({
              'id': 'route-animated',
              'type': 'line',
              'source': 'route',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#ffffff',
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [0, 4, 3],
              }
            });

            // Animate the line
            let start = 0;
            function animate() {
              const dashArray = [0, 4, 3];
              const newDash = dashArray.map(d => d + start);
              if (mapRef.current) {
                mapRef.current.setPaintProperty('route-animated', 'line-dasharray', newDash);
                start = (start + 0.5) % 6;
                requestAnimationFrame(animate);
              }
            }
            animate();
          }
        });

        // Add markers for all locations
        allLocations.forEach((location, index) => {
          if (!location?.coordinates?.length === 2) return;

          // Create custom marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';
          markerEl.style.width = '30px';
          markerEl.style.height = '30px';
          markerEl.style.borderRadius = '50%';
          markerEl.style.display = 'flex';
          markerEl.style.alignItems = 'center';
          markerEl.style.justifyContent = 'center';
          markerEl.style.fontWeight = 'bold';
          markerEl.style.color = 'white';
          markerEl.style.border = '2px solid white';
          markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          
          if (location.type === 'hotel') {
            markerEl.style.backgroundColor = '#3498db';
            markerEl.innerHTML = 'H';
          } else {
            markerEl.style.backgroundColor = '#e74c3c';
            markerEl.innerHTML = (locations.attractions.indexOf(location) + 1).toString();
          }

          const popupContent = location.type === 'hotel' 
            ? `<div class="p-2">
                <h3 class="font-bold text-lg">${location.name || 'Unnamed Location'}</h3>
                <p class="text-sm mt-1">${location.details || ''}</p>
                ${location.rating ? `<p class="text-sm mt-1">Rating: ${location.rating}/5</p>` : ''}
                <p class="text-xs mt-1">${location.address || ''}</p>
              </div>`
            : `<div class="p-2">
                <h3 class="font-bold text-lg">${location.name || 'Unnamed Location'}</h3>
                <p class="text-sm mt-1">${location.details || ''}</p>
                <p class="text-sm mt-1">${location.day || ''}</p>
                ${location.timing ? `<p class="text-xs">Duration: ${location.timing}</p>` : ''}
                ${location.price ? `<p class="text-xs">Price: ${location.price}</p>` : ''}
                ${location.rating ? `<p class="text-xs">Rating: ${location.rating}/5</p>` : ''}
              </div>`;

          const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'center'
          })
            .setLngLat([location.coordinates[1], location.coordinates[0]])
            .setPopup(new mapboxgl.Popup({
              offset: 25,
              className: 'custom-popup'
            }).setHTML(popupContent))
            .addTo(mapRef.current);

          markersRef.current.push(marker);
        });

        // Fit bounds to include all markers
        const bounds = new mapboxgl.LngLatBounds();
        allLocations.forEach(location => {
          if (location?.coordinates?.length === 2) {
            bounds.extend([location.coordinates[1], location.coordinates[0]]);
          }
        });
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });

        // Add legend
        const legend = document.createElement('div');
        legend.className = 'map-legend';
        legend.style.position = 'absolute';
        legend.style.bottom = '20px';
        legend.style.right = '20px';
        legend.style.padding = '10px';
        legend.style.backgroundColor = 'white';
        legend.style.borderRadius = '4px';
        legend.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
        legend.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 5px;">Trip Itinerary</div>
          <div style="display: flex; align-items: center; margin: 5px 0;">
            <div style="background-color: #e74c3c; width: 14px; height: 14px; border-radius: 50%; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Attractions</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div style="background-color: #3498db; width: 14px; height: 14px; border-radius: 50%; margin-right: 5px;"></div>
            <span style="font-size: 12px;">Hotels</span>
          </div>
        `;
        mapContainer.current.appendChild(legend);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSliderChange = (event) => {
    setCurrentIndex(parseInt(event.target.value));
    
    if (mapRef.current && allLocations[currentIndex]?.coordinates) {
      const location = allLocations[currentIndex];
      mapRef.current.flyTo({
        center: [location.coordinates[1], location.coordinates[0]],
        zoom: 14,
        duration: 2000,
        essential: true
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 relative"
      />
      
      <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600">
          
        </div>
        
        
        
        
      </div>
    </div>
  );
};

export default TripMap;
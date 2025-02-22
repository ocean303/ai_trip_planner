import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletTripMap = ({ trip }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !trip?.tripData) return;
    
    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([15.2993, 74.1240], 10);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markers = [];
    const attractionPoints = [];

    // Process hotels
    if (trip.tripData.hotel?.length) {
      trip.tripData.hotel.forEach(hotel => {
        if (hotel.geoCoordinates) {
          const [lat, lng] = hotel.geoCoordinates.split(',').map(coord => parseFloat(coord.trim()));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            // Hotel icon
            const icon = L.divIcon({
              html: `<div style="background-color: #3498db; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">H</div>`,
              className: '',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            
            const marker = L.marker([lat, lng], { icon })
              .addTo(map)
              .bindPopup(`
                <b>${hotel.name}</b><br>
                ${hotel.description || ''}<br>
                ${hotel.rating ? `Rating: ${hotel.rating}/5<br>` : ''}
                <small>${hotel.address || ''}</small>
              `);
            
            // Simple tooltip
            marker.bindTooltip(`${hotel.name}`, {
              direction: 'top',
              offset: [0, -10]
            });
            
            markers.push(marker);
          }
        }
      });
    }

    // Process attractions
    let placeNumber = 1;
    if (trip.tripData.itinerary?.length) {
      trip.tripData.itinerary.forEach(day => {
        if (day.plan?.length) {
          day.plan.forEach(place => {
            if (place.geoCoordinates) {
              const [lat, lng] = place.geoCoordinates.split(',').map(coord => parseFloat(coord.trim()));
              
              if (!isNaN(lat) && !isNaN(lng)) {
                // Attraction icon with number
                const icon = L.divIcon({
                  html: `<div style="background-color: #e74c3c; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${placeNumber}</div>`,
                  className: '',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                
                const marker = L.marker([lat, lng], { icon })
                  .addTo(map)
                  .bindPopup(`
                    <b>${place.placeName}</b><br>
                    <small>${day.day}</small><br>
                    ${place.placeDetails || ''}<br>
                    ${place.rating ? `Rating: ${place.rating}/5<br>` : ''}
                    ${place.ticketPricing ? `Price: ${place.ticketPricing}<br>` : ''}
                    ${place.timeTravel ? `Time: ${place.timeTravel}` : ''}
                  `);
                
                // Simple tooltip
                marker.bindTooltip(`${placeNumber}. ${place.placeName}`, {
                  direction: 'top',
                  offset: [0, -10]
                });
                
                markers.push(marker);
                attractionPoints.push([lat, lng]);
                placeNumber++;
              }
            }
          });
        }
      });
    }

    // Add route line
    if (attractionPoints.length >= 2) {
      L.polyline(attractionPoints, {
        color: '#e74c3c',
        weight: 3,
        opacity: 0.7
      }).addTo(map);
    }

    // Fit map to markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Add simple legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'legend');
      div.style.padding = '6px 8px';
      div.style.background = 'white';
      div.style.borderRadius = '4px';
      div.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
      div.style.fontSize = '12px';
      div.style.lineHeight = '1.5';

      div.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: bold;">Trip Itinerary</div>
        <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="background-color: #e74c3c; width: 14px; height: 14px; border-radius: 50%; margin-right: 5px;"></div>
          <span>Attractions</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="background-color: #3498db; width: 14px; height: 14px; border-radius: 50%; margin-right: 5px;"></div>
          <span>Accommodations</span>
        </div>
      `;
      
      return div;
    };
    legend.addTo(map);

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trip]);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapRef} className="w-full h-96"></div>
    </div>
  );
};

export default LeafletTripMap;
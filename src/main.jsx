import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateTrip from "./create-trip/index.jsx"; // Ensure correct file extension
import Header from "./components/custom/Header.jsx";
import { Toaster } from "./components/ui/sonner.jsx"; // Ensure correct file extension
import { GoogleOAuthProvider } from "@react-oauth/google";
import ViewTrip from "./view-trip/[tripId]/index.jsx"; // Ensure correct file extension
import { ParallaxProvider } from "react-scroll-parallax";
import MyTrips from "./my-trips/index.jsx";
import Emergency from "./Emergency/index.jsx";
import LiveScanner from "./imagescanner/Scanner.jsx";
import Scanner from "./imagescanner/Scanner.jsx";

const trip = {
  "userChoice": {
      "noOfPeople": "3 to 4 people",
      "location": {
          "label": "Mumbai, Maharashtra, India",
          "value": {
              "description": "Mumbai, Maharashtra, India",
              "reference": "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
              "place_id": "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
              "terms": [
                  {
                      "value": "Mumbai",
                      "offset": 0
                  },
                  {
                      "value": "Maharashtra",
                      "offset": 8
                  },
                  {
                      "offset": 21,
                      "value": "India"
                  }
              ],
              "matched_substrings": [
                  {
                      "length": 6,
                      "offset": 0
                  }
              ],
              "types": [
                  "locality",
                  "geocode",
                  "political"
              ],
              "structured_formatting": {
                  "secondary_text": "Maharashtra, India",
                  "main_text_matched_substrings": [
                      {
                          "length": 6,
                          "offset": 0
                      }
                  ],
                  "main_text": "Mumbai"
              }
          }
      },
      "noOfDays": "5",
      "budget": "Budget-Friendly"
  },
  "id": "1740242333494",
  "userEmail": "gbee0925@gmail.com",
  "tripData": {
      "hotels": [
          {
              "rating": "4.0",
              "imageUrl": "https://images.thrillophilia.com/image/upload/s--7y8_2s7s--/c_fill,f_auto,fl_progressive,h_600,q_auto,w_900/v1/images/uploads/attractions/images/hotel_sea_green_mumbai.jpg",
              "geoCoordinates": "18.9262, 72.8311",
              "address": "Marine Drive, Mumbai, Maharashtra 400020",
              "name": "Hotel Sea Green",
              "description": "A budget-friendly hotel located near Marine Drive, offering basic amenities."
          },
          {
              "address": "36, Cawasji Patel Street, Colaba, Mumbai, Maharashtra 400005",
              "geoCoordinates": "18.9262, 72.8311",
              "name": "Hotel Ram Krishna",
              "rating": "3.5",
              "description": "A no-frills hotel in Colaba, ideal for budget travelers.",
              "imageUrl": "https://www.oyorooms.com/hotels/mumbai/hotel-ram-krishna-colaba-250123-exterior.jpg"
          },
          {
              "description": "A budget-friendly hotel close to many attractions in south Mumbai.",
              "imageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/10/8c/45/hotel-kohinoor-continental.jpg?w=1200&h=-1&s=1",
              "address": "29, Apollo Bandar, Colaba, Mumbai, Maharashtra 400005",
              "name": "Hotel Kohinoor Continental",
              "rating": "3.8",
              "geoCoordinates": "18.9262, 72.8311"
          }
      ],
      "itinerary": [
          {
              "bestTime": "Morning",
              "plan": [
                  {
                      "geoCoordinates": "18.9220, 72.8347",
                      "rating": "4.8",
                      "placeName": "Gateway of India",
                      "ticketPricing": "Free",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Gateway_of_India_Mumbai.jpg/1280px-Gateway_of_India_Mumbai.jpg",
                      "placeDetails": "A historical monument and iconic landmark of Mumbai.",
                      "timeTravel": "1-2 hours"
                  },
                  {
                      "placeDetails": "A luxurious hotel with a rich history. You can admire it from the outside.",
                      "geoCoordinates": "18.9247, 72.8358",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Taj_Mahal_Palace_Hotel_%28Mumbai%29.jpg/1280px-Taj_Mahal_Palace_Hotel_%28Mumbai%29.jpg",
                      "timeTravel": "30 mins",
                      "rating": "4.7",
                      "ticketPricing": "N/A",
                      "placeName": "Taj Mahal Palace Hotel"
                  }
              ],
              "day": "Day 1"
          },
          {
              "bestTime": "Morning",
              "day": "Day 2",
              "plan": [
                  {
                      "timeTravel": "1-2 hours",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Chhatrapati_Shivaji_Terminus_%28formerly_Victoria_Terminus%29.jpg/1280px-Chhatrapati_Shivaji_Terminus_%28formerly_Victoria_Terminus%29.jpg",
                      "geoCoordinates": "18.9440, 72.8347",
                      "placeDetails": "A UNESCO World Heritage Site, showcasing stunning Victorian Gothic architecture.",
                      "rating": "4.6",
                      "ticketPricing": "Free",
                      "placeName": "Chhatrapati Shivaji Maharaj Terminus"
                  },
                  {
                      "placeName": "Dhobi Ghat",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Dhobi_Ghat%2C_Mumbai%2C_India.jpg/1280px-Dhobi_Ghat%2C_Mumbai%2C_India.jpg",
                      "rating": "4.0",
                      "timeTravel": "30 mins-1 hour",
                      "ticketPricing": "Free",
                      "placeDetails": "An open-air laundromat showcasing a unique way of washing clothes.",
                      "geoCoordinates": "18.9329, 72.8209"
                  }
              ]
          },
          {
              "day": "Day 3",
              "plan": [
                  {
                      "placeDetails": "A scenic promenade offering stunning views of the Arabian Sea.",
                      "geoCoordinates": "18.9346, 72.8378",
                      "ticketPricing": "Free",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Marine_Drive_Mumbai.jpg/1280px-Marine_Drive_Mumbai.jpg",
                      "rating": "4.5",
                      "placeName": "Marine Drive",
                      "timeTravel": "1-2 hours"
                  },
                  {
                      "geoCoordinates": "18.9385, 72.8237",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Girgaum_Chowpatty_Beach.jpg/1280px-Girgaum_Chowpatty_Beach.jpg",
                      "rating": "4.2",
                      "timeTravel": "1-2 hours",
                      "placeDetails": "A popular beach and gathering place, ideal for enjoying street food and the sea breeze.",
                      "ticketPricing": "Free",
                      "placeName": "Girgaum Chowpatty"
                  }
              ],
              "bestTime": "Morning"
          },
          {
              "day": "Day 4",
              "plan": [
                  {
                      "ticketPricing": "₹50-₹100 (ferry ride included)",
                      "placeName": "Elephanta Caves",
                      "rating": "4.6",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Elephanta_Caves_from_the_sea.jpg/1280px-Elephanta_Caves_from_the_sea.jpg",
                      "placeDetails": "UNESCO World Heritage Site, featuring ancient cave temples with intricate carvings.",
                      "geoCoordinates": "18.9880, 72.9025",
                      "timeTravel": "4-5 hours (including travel time)"
                  },
                  {
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Kanheri_Caves%2C_Mumbai.jpg/1280px-Kanheri_Caves%2C_Mumbai.jpg",
                      "ticketPricing": "Park entry fee applies",
                      "placeDetails": "A group of ancient Buddhist cave monuments located inside Sanjay Gandhi National Park.",
                      "geoCoordinates": "19.2002, 72.9107",
                      "timeTravel": "3-4 hours (including travel time)",
                      "placeName": "Kanheri Caves",
                      "rating": "4.3"
                  }
              ],
              "bestTime": "Morning"
          },
          {
              "plan": [
                  {
                      "placeDetails": "A large urban national park, perfect for nature walks and spotting wildlife.",
                      "rating": "4.4",
                      "timeTravel": "3-4 hours",
                      "placeName": "Sanjay Gandhi National Park",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Sanjay_Gandhi_National_Park%2C_Mumbai.jpg/1280px-Sanjay_Gandhi_National_Park%2C_Mumbai.jpg",
                      "ticketPricing": "₹50-₹100",
                      "geoCoordinates": "19.1608, 72.8886"
                  },
                  {
                      "timeTravel": "1-2 hours",
                      "placeDetails": "A museum dedicated to Mahatma Gandhi's life and works.",
                      "placeName": "Mani Bhavan Gandhi Museum",
                      "ticketPricing": "₹20-₹50",
                      "placeImageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Mani_Bhavan_Gandhi_Museum.jpg/1280px-Mani_Bhavan_Gandhi_Museum.jpg",
                      "rating": "4.0",
                      "geoCoordinates": "18.9644, 72.8162"
                  }
              ],
              "day": "Day 5",
              "bestTime": "Morning"
          }
      ]
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/create-trip",
    element: <CreateTrip />,
  },
  {
    path: "/view-trip/:tripId",
    element: <ViewTrip />,
  },
  {
    path: "/my-trip",
    element: <MyTrips />
  }, {
    path: "/emergency",
    element: <Emergency tripData={trip} />
  }, {
    path: "/scan-text",
    element: <Scanner />
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <ParallaxProvider>
        <Header />
        <Toaster />
        <RouterProvider router={router} />
      </ParallaxProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

import React, { useEffect, useState } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiFog } from "react-icons/wi";
import { FiSunrise, FiSunset, FiAlertTriangle, FiPhone, FiChevronDown, FiChevronUp } from "react-icons/fi";

const InfoSection = ({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [weather, setWeather] = useState(null);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [showEmergency, setShowEmergency] = useState(false); // State to toggle emergency section

  useEffect(() => {
    if (trip) {
      fetchUnsplashImage();
      fetchWeatherData();
      fetchEmergencyServices();
    }
  }, [trip]);

  const fetchUnsplashImage = async () => {
    if (!trip?.userChoice?.location?.label) return;
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${trip.userChoice.location.label}&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}&per_page=1`);
      const data = await response.json();
      if (data.results.length > 0) {
        setPhotoUrl(data.results[0].urls.regular);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchWeatherData = async () => {
    if (!trip?.userChoice?.location?.label) return;
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${trip.userChoice.location.label}&appid=${import.meta.env.VITE_OPENWEATHER_KEY}&units=metric`);
      const data = await response.json();
      if (data.cod === 200) {
        setWeather({
          temp: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          condition: data.weather[0].main,
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const fetchEmergencyServices = async () => {
    if (!trip?.userChoice?.location?.label) return;
    try {
      const response = await fetch(`http://localhost:5000/api/emergency-services?location=${encodeURIComponent(trip.userChoice.location.label)}`);
      const data = await response.json();
      setEmergencyServices(data);
    } catch (error) {
      console.error("Error fetching emergency services:", error);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Clear": return <WiDaySunny className="text-yellow-400 text-4xl" />;
      case "Clouds": return <WiCloud className="text-gray-500 text-4xl" />;
      case "Rain": return <WiRain className="text-blue-400 text-4xl" />;
      case "Snow": return <WiSnow className="text-white text-4xl" />;
      case "Fog": case "Mist": return <WiFog className="text-gray-400 text-4xl" />;
      default: return <WiCloud className="text-gray-500 text-4xl" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-12 mx-4 md:mx-16 lg:mx-48 p-8 rounded-3xl shadow-2xl bg-gradient-to-r from-pink-50 to-indigo-50 hover:shadow-3xl transition-shadow duration-300">

      {/* Image Section */}
      <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        {photoUrl ? (
          <img className="h-48 w-48 md:h-56 md:w-56 rounded-full object-cover border-4 border-white shadow-lg" src={photoUrl} alt="Trip Image" />
        ) : (
          <div className="h-48 w-48 md:h-56 md:w-56 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="w-full md:w-2/3 flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          📍 {trip?.userChoice?.location?.label}
        </h1>

        <div className="text-xl text-gray-700 flex items-center">📅 <span className="font-semibold ml-2">Duration:</span> {trip?.userChoice?.noOfDays} days</div>
        <div className="text-xl text-gray-700 flex items-center">💰 <span className="font-semibold ml-2">Budget:</span> {trip?.userChoice?.budget}</div>
        <div className="text-xl text-gray-700 flex items-center">👥 <span className="font-semibold ml-2">People:</span> {trip?.userChoice?.noOfPeople}</div>

        {/* Weather Section */}
        {weather && (
          <div className="mt-4 p-6 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(weather.condition)}
              <div>
                <p className="text-2xl font-semibold text-gray-800">{weather.temp}°C, {weather.condition}</p>
                <p className="text-sm text-gray-600">Feels like {weather.feelsLike}°C</p>
                <p className="text-sm text-gray-600">🌅 Sunrise: {weather.sunrise} | 🌆 Sunset: {weather.sunset}</p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Services Toggle Button */}
        <button onClick={() => setShowEmergency(!showEmergency)} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg flex items-center justify-between w-full transition hover:bg-red-600">
          <span className="font-semibold flex items-center">
            <FiAlertTriangle className="mr-2" />
            Emergency Services
          </span>
          {showEmergency ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {/* Emergency Services Section (Visible only when clicked) */}
        {showEmergency && (
          <div className="mt-4 p-6 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg">
            {emergencyServices.length > 0 ? (
              emergencyServices.map((service, index) => (
                <div key={index} className="text-lg text-gray-700 border-b pb-2 mb-2">
                  <span className="font-semibold">{service.type}: {service.name}</span>
                  <div className="text-sm text-gray-600">{service.address}</div>
                  <div className="flex items-center text-sm text-blue-600"><FiPhone className="mr-1" /> {service.phone}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No emergency services found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoSection;

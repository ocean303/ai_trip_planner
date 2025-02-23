import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const TravelPlaylist = () => {
    const location = useLocation();
    const trip = location.state?.trip; // Fetching the user's selected trip
    const destination = trip?.userChoice?.location?.label.split(",")[0] || "Travel";
    console.log(destination);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState("");

    // Fetch Spotify Access Token on Mount
    useEffect(() => {
        fetchSpotifyToken();
    }, []);

    // Fetch Playlists when accessToken & destination are available
    useEffect(() => {
        if (accessToken && destination) {
            fetchPlaylists(destination);
        }
    }, [accessToken, destination]);

    // Step 1: Get Spotify Access Token
    const fetchSpotifyToken = async () => {
        try {
            const response = await axios.post(
                "https://accounts.spotify.com/api/token",
                "grant_type=client_credentials",
                {
                    headers: {
                        Authorization: "Basic " + btoa("584bd1ae8b104abf834492b1e3039763:2537eefc99674b318fd4967de12b22fe"),
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );
            setAccessToken(response.data.access_token);
        } catch (err) {
            setError("Failed to authenticate with Spotify.");
        }
    };

    // Step 2: Fetch Playlists from Spotify based on travel destination
    const fetchPlaylists = async (query) => {
        if (!accessToken) return;

        try {
            const response = await axios.get(
                `https://api.spotify.com/v1/search`,
                {
                    params: { q: query, type: "playlist", limit: 10 },
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );

            console.log("Fetched Playlists:", response.data.playlists.items);

            let songdata = response.data.playlists.items;

            if (Array.isArray(songdata)) {
                // Filter out null values before setting state
                const filteredPlaylists = songdata.filter(item => item !== null);
                setPlaylists(filteredPlaylists);
            } else {
                console.error("Expected an array but got:", songdata);
                setPlaylists([]);
            }


            // setPlaylists(songdata.data);

            console.log(playlists);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch playlists.");
            setLoading(false);
        }
    };

    // Debugging: Log updated playlists
    // useEffect(() => {
    //     console.log("Updated Playlists:", playlists);
    // }, [playlists]);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mt-4 text-center text-green-600">
                🎵 Travel Playlists for {destination}
            </h1>

            {error && <p className="text-red-500 text-center mt-2">{error}</p>}

            {loading ? (
                <p className="text-center">Loading playlists...</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-6">
                    {playlists.map((playlist) => (
                        <div key={playlist.id} className="bg-white p-4 rounded-lg shadow-lg">
                            <img
                                src={playlist.images[0]?.url}
                                alt={playlist.name}
                                className="w-full h-50 object-cover rounded-lg"
                            />
                            <h3 className="text-lg font-semibold mt-2">{playlist.name}</h3>
                            <a
                                href={playlist.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline mt-2 block"
                            >
                                Listen on Spotify 🎧
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TravelPlaylist;

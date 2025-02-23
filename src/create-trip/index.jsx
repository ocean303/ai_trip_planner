import React, { useEffect, useState } from "react";
import axios from "axios";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import _ from "lodash";
import { Input } from "@/components/ui/input";
import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelList,
} from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { useNavigate } from "react-router-dom";
import VoiceInputButton from "./components/VoiceInputButton";

const TravelPreferences = () => {
  const [place, setPlace] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    console.log("Updating form data:", name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVoiceInput = ({ type, value }) => {
    console.log("Received voice input:", { type, value });

    switch (type) {
      case 'text':
        const locationValue = { label: value, value: value };
        setPlace(locationValue);
        handleInputChange("location", locationValue);
        break;
      case 'days':
        handleInputChange("noOfDays", value);
        break;
      case 'budget':
        handleInputChange("budget", value);
        break;
      case 'travelType':
        const travelOption = SelectTravelList.find(
          option => option.title.toLowerCase() === value.toLowerCase()
        );
        if (travelOption) {
          handleInputChange("noOfPeople", travelOption.people);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => GetUserProfile(tokenResponse),
    onError: (error) => {
      console.log(error);
      toast.error("Login failed. Please try again.");
    },
  });

  const handleSelect = _.debounce((value) => {
    console.log("Location selected:", value);
    setPlace(value);
    handleInputChange("location", value);
  }, 1000);

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (formData?.noOfDays > 7) {
      toast.error("Please enter no. of days less than 8");
      return;
    }

    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.budget ||
      !formData?.noOfPeople
    ) {
      toast.error("Please enter all the details");
      return;
    }

    try {
      setLoading(true);
      const FINAL_PROMPT = AI_PROMPT.replace(
        "{location}",
        formData?.location?.label
      )
        .replace("{totalDays}", formData?.noOfDays)
        .replace("{traveler}", formData?.noOfPeople)
        .replace("{budget}", formData?.budget)
        .replace("{totalDays}", formData?.noOfDays);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      setLoading(false);
      SaveAiTrip(result?.response?.text());
    } catch (error) {
      setLoading(false);
      toast.error("Error generating trip. Please try again.");
      console.error("Error generating trip:", error);
    }
  };

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        onGenerateTrip();
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        toast.error("Error signing in. Please try again.");
      });
  };

  const SaveAiTrip = async (TripData) => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const docId = Date.now().toString();
      await setDoc(doc(db, "AITrips", docId), {
        userChoice: formData,
        tripData: JSON.parse(TripData),
        userEmail: user?.email,
        id: docId,
        createdAt: new Date().toISOString(),
      });
      navigate("/view-trip/" + docId);
    } catch (error) {
      setLoading(false);
      toast.error("Error saving trip. Please try again.");
      console.error("Error saving trip:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      {/* Header Section */}
      <div className="w-full bg-white shadow-sm py-6 mb-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-indigo-900 flex items-center gap-3">
            Travel Preferences
            <span className="flex gap-2">
              <span className="text-3xl">🚢</span>
              <span className="text-3xl">✈️</span>
              <span className="text-3xl">⛱️</span>
            </span>
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Help us understand your travel plans by providing some details below. You can type or use voice input for each field.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-16 space-y-12">
        {/* Destination Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <label className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold text-indigo-900">What is your Destination?</span>
            <VoiceInputButton onTranscript={handleVoiceInput} />
          </label>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              placeholder: "Search for places...",
              onChange: handleSelect,
              value: place,
              styles: {
                control: (provided) => ({
                  ...provided,
                  borderRadius: '0.5rem',
                  borderColor: '#E2E8F0',
                  padding: '0.25rem',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#CBD5E0'
                  }
                })
              }
            }}
          />
        </div>

        {/* Days Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <label className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-semibold text-indigo-900">For how many days are you planning?</span>
            <VoiceInputButton onTranscript={handleVoiceInput} />
          </label>
          <Input
            placeholder="e.g., 6"
            type="number"
            value={formData.noOfDays || ""}
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
            className="max-w-xs text-lg py-6"
          />
        </div>

        {/* Budget Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-indigo-900">What is your budget?</h2>
            <VoiceInputButton onTranscript={handleVoiceInput} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl transition-all duration-300 p-6 cursor-pointer hover:shadow-lg border-2 
                  ${formData?.budget === item.title
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 hover:border-indigo-200"
                  }`}
                onClick={() => handleInputChange("budget", item.title)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Group Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-semibold text-indigo-900">Who do you plan on travelling with?</h2>
            <VoiceInputButton onTranscript={handleVoiceInput} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SelectTravelList.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl transition-all duration-300 p-6 cursor-pointer hover:shadow-lg border-2
                  ${formData?.noOfPeople === item.people
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 hover:border-indigo-200"
                  }`}
                onClick={() => handleInputChange("noOfPeople", item.people)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-indigo-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={onGenerateTrip}
            disabled={loading}
            className="px-12 py-6 text-xl bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
          >
            {loading ? "Generating Trip..." : "Generate Trip"}
          </Button>
        </div>
      </div>

      {/* Sign In Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Sign In Required</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center mt-4">
                <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-6" />
                <p className="text-center text-gray-600 mb-6">
                  Please sign in with Google to generate your personalized trip plan.
                </p>
                <Button 
                  onClick={() => login()} 
                  className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign in with Google
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelPreferences;
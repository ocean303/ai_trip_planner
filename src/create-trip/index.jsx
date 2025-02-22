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

const index = () => {
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
        // For destination
        const locationValue = { label: value, value: value };
        setPlace(locationValue);
        handleInputChange("location", locationValue);
        break;
      case 'days':
        // For number of days
        handleInputChange("noOfDays", value);
        break;
      case 'budget':
        // For budget selection
        handleInputChange("budget", value);
        break;
      case 'travelType':
        // For travel type selection
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
    <div className="flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-gray-100 min-h-screen py-8 px-4">
      {/* Heading */}
      <div className="mt-8 text-center w-full max-w-2xl">
        <h1 className="font-bold text-blue-900 text-4xl mb-4">
          Travel Preferences 🚢✈️⛱️
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Help us understand your travel plans by providing some details below.
          You can type or use voice input for each field.
        </p>
      </div>

      {/* Destination Choice */}
      <div className="flex flex-col w-full max-w-2xl mb-8">
        <label className="text-black text-2xl font-semibold mb-2 flex items-center gap-2">
          What is your Destination?
          <VoiceInputButton
            onTranscript={handleVoiceInput}
            className="ml-2"
          />
        </label>
        <GooglePlacesAutocomplete
          apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
          // apiKey="AIzaSyBFjMkBwjvDo17f7CxraTuax2UufVKPUJ0"
          selectProps={{
            placeholder: "Search for places...",
            onChange: handleSelect,
            value: place,
          }}
        />
      </div>

      {/* Number of Days */}
      <div className="flex flex-col w-full max-w-2xl mb-8">
        <label className="text-black text-2xl font-semibold mb-2 flex items-center gap-2">
          For how many days are you planning?
          <VoiceInputButton
            onTranscript={handleVoiceInput}
            className="ml-2"
          />
        </label>
        <Input
          placeholder="e.g., 6"
          type="number"
          value={formData.noOfDays || ""}
          onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Budget */}
      <div className="flex flex-col w-full max-w-2xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-black text-2xl font-semibold">
            What is your budget?
          </h2>
          <VoiceInputButton
            onTranscript={handleVoiceInput}
            className="ml-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SelectBudgetOptions.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-white transition-all duration-300 p-6 cursor-pointer ${formData?.budget === item.title
                  ? "shadow-lg bg-blue-600 text-white"
                  : "bg-white"
                }`}
              onClick={() => handleInputChange("budget", item.title)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h2 className="text-lg font-bold mb-1">{item.title}</h2>
                <p className="text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Number of People */}
      <div className="flex flex-col w-full max-w-2xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-black text-2xl font-semibold">
            Who do you plan on travelling with?
          </h2>
          <VoiceInputButton
            onTranscript={handleVoiceInput}
            className="ml-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SelectTravelList.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border-2 border-transparent hover:border-blue-500 hover:bg-white transition-all duration-300 p-6 cursor-pointer ${formData?.noOfPeople === item.people
                  ? "shadow-lg bg-blue-600 text-white"
                  : "bg-white"
                }`}
              onClick={() => handleInputChange("noOfPeople", item.people)}
            >
              <div className="flex items-center justify-center">
                <div className="text-4xl mr-2">{item.icon}</div>
                <h2 className="text-lg font-bold">{item.title}</h2>
              </div>
              <p className="text-center mt-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Trip Button */}
      <div className="flex justify-center w-full max-w-2xl">
        <Button
          onClick={onGenerateTrip}
          disabled={loading}
          className="w-full py-3 text-lg"
        >
          {loading ? "Generating Trip..." : "Generate Trip"}
        </Button>
      </div>

      {/* Sign In Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center">
                <img src="/logo.png" alt="Logo" className="w-20 mb-4" />
                <p className="text-center mb-4">
                  Please sign in with Google to generate your personalized trip plan.
                </p>
                <Button onClick={() => login()} className="w-full">
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

export default index;
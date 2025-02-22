import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  // Check if browser supports speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('Speech recognition is not supported in this browser');
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized speech:", transcript); // Debug log
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(event.error);
      setIsListening(false);
      toast.error('Error with speech recognition. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Error starting recognition:", err);
      toast.error('Error starting speech recognition. Please try again.');
    }
  }, [recognition, onResult]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { isListening, error, startListening, stopListening };
};

const VoiceInputButton = ({ onTranscript, className = "" }) => {
  // Process speech results
  const processSpeechResult = (transcript) => {
    console.log("Processing transcript:", transcript); // Debug log

    // Budget keywords
    const budgetKeywords = {
      'budget friendly': 'Budget-Friendly',
      'cheap': 'Budget-Friendly',
      'affordable': 'Budget-Friendly',
      'moderate': 'Moderate',
      'medium': 'Moderate',
      'luxury': 'Luxury',
      'expensive': 'Luxury',
    };

    // Travel type keywords
    const travelTypeKeywords = {
      'solo': 'Solo Adventure',
      'alone': 'Solo Adventure',
      'romantic': 'Romantic Getaway',
      'couple': 'Romantic Getaway',
      'family': 'Family Fun',
      'kids': 'Family Fun',
    };

    const transcriptLower = transcript.toLowerCase();

    // Try to match budget
    for (const [keyword, value] of Object.entries(budgetKeywords)) {
      if (transcriptLower.includes(keyword)) {
        console.log("Matched budget:", value); // Debug log
        onTranscript({ type: 'budget', value });
        toast.success(`Selected budget: ${value}`);
        return;
      }
    }

    // Try to match travel type
    for (const [keyword, value] of Object.entries(travelTypeKeywords)) {
      if (transcriptLower.includes(keyword)) {
        console.log("Matched travel type:", value); // Debug log
        onTranscript({ type: 'travelType', value });
        toast.success(`Selected travel type: ${value}`);
        return;
      }
    }

    // Try to match numbers for days
    const numberMatch = transcript.match(/\d+/);
    if (numberMatch) {
      const days = parseInt(numberMatch[0]);
      if (days > 0 && days <= 7) {
        console.log("Matched days:", days); // Debug log
        onTranscript({ type: 'days', value: days });
        toast.success(`Set duration to ${days} days`);
        return;
      }
    }

    // If no matches found, treat as destination
    console.log("Using as destination text:", transcript); // Debug log
    onTranscript({ type: 'text', value: transcript });
    toast.success('Recognized location input');
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition(processSpeechResult);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? "destructive" : "secondary"}
      className={`p-2 ${className}`}
      onClick={handleClick}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};

export default VoiceInputButton;
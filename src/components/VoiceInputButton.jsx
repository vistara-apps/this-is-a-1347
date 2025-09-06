import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export function VoiceInputButton({ onVoiceInput, isProcessing }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse-slow'
            : 'bg-primary hover:bg-primary/80'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''} shadow-card`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
        
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
        )}
      </button>
      
      <p className="text-white text-center">
        {isProcessing
          ? 'Processing...'
          : isRecording
          ? 'Tap to stop recording'
          : 'Tap to speak your task'
        }
      </p>
    </div>
  );
}
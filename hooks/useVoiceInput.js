import { useState } from 'react';

export const useVoiceInput = () => {
  return {
    isRecording: false,
    recognizedText: '',
    error: 'Voice input is temporarily disabled.',
    startRecording: () => console.log("Voice input disabled."),
    stopRecording: () => console.log("Voice input disabled."),
  };
};
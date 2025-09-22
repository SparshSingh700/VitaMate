// services/ai/geminiService.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${Constants.expoConfig.extra.GEMINI_API_KEY}`;
// --- UPDATED: Now accepts a specialRequest parameter ---
const buildWeeklyWorkoutPrompt = (userProfile, existingPlan, specialRequest) => {
    const { age, weight, height, gender, goal } = userProfile;
    
    let repRange, setRange, restPeriod;
    switch (goal) {
        case 'lose':
            repRange = '12-15 reps'; setRange = '3-4 sets'; restPeriod = '45-60 seconds';
            break;
        case 'gain':
            repRange = '6-12 reps'; setRange = '4-5 sets'; restPeriod = '90-120 seconds';
            break;
        default:
            repRange = '8-15 reps'; setRange = '3-4 sets'; restPeriod = '60-90 seconds';
    }

    const planString = Object.entries(existingPlan).map(([day, workout]) => `${day}: ${workout.name}`).join('\n- ');
    
    // --- NEW: A high-priority section for the user's notes ---
    const requestSection = specialRequest 
        ? `IMPORTANT USER REQUEST (MUST FOLLOW THIS OVER ALL OTHER RULES):
- ${specialRequest}`
        : '';
    
    return `
    You are an expert fitness coach. Generate a scientific 7-day workout plan based on the user's profile and their desired weekly split.
    USER PROFILE:
    - Age: ${age}, Weight: ${weight}kg, Height: ${height}cm, Gender: ${gender}, Goal: ${goal}

    USER'S DESIRED WEEKLY SPLIT:
    - ${planString}

    ${requestSection}

    RULES:
    1. For each day in the user's split that is NOT a "Rest Day", generate a detailed workout with 4-5 exercises.
    2. The first 1-2 exercises must be major compound lifts (Squat, Bench Press, Deadlift, etc.) relevant to the day's focus.
    3. The remaining exercises must be accessory movements targeting the same muscle groups.
    4. Exercises should be ordered logically (e.g., compound lifts first).
    5. Rep ranges for accessory lifts must be ${repRange}. Compound lifts can be lower (e.g., 5-8 reps).
    6. Sets should be ${setRange}.
    7. For "Rest Day", the exercises array must be empty, and the description should be "Active recovery or a light walk."
    8. YOUR RESPONSE MUST BE ONLY a valid JSON object in the following format, with no other text or explanations:
    {
      "monday": { "name": "Push Day A", "description": "A workout focusing on...", "exercises": [{ "name": "Bench Press", "sets": 4, "reps": "6-8" }] },
      "tuesday": { "name": "Pull Day A", "description": "...", "exercises": [...] },
      "wednesday": { "name": "Leg Day", "description": "...", "exercises": [...] },
      "thursday": { "name": "Rest Day", "description": "Active recovery or a light walk.", "exercises": [] },
      "friday": { "name": "Push Day B", "description": "...", "exercises": [...] },
      "saturday": { "name": "Pull Day B", "description": "...", "exercises": [...] },
      "sunday": { "name": "Rest Day", "description": "Active recovery or a light walk.", "exercises": [] }
    }
  `;
};

// --- UPDATED: The function now passes the specialRequest to the prompt builder ---
export const generateAiWorkoutPlan = async (userProfile, existingPlan, specialRequest) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
        Alert.alert("API Key Missing", "Please add your Gemini API key to constants/ApiKeys.js");
        return null;
    }
    
    const prompt = buildWeeklyWorkoutPrompt(userProfile, existingPlan, specialRequest);
    
    try {
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: prompt }] }],
        });
        const aiResponseText = response.data.candidates[0].content.parts[0].text;
        const jsonString = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        console.log("--- AI WORKOUT PLAN RESPONSE ---", jsonString); 
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        Alert.alert("AI Error", "Could not generate a workout plan. Please check your API key and internet connection.");
        return null;
    }
};
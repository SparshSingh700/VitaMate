import workoutPlans from '../data/workoutPlans.json';

/**
 * Suggests a workout based on the user's daily logged data.
 * @param {object} dailyLog - The data object for a specific day.
 * @returns {object} - A workout object from workoutPlans.json.
 */
export const suggestWorkout = (dailyLog) => {
  // Rule 1: If a low mood is logged, suggest a calming workout.
  const lowMoods = ['sad', 'stressed', 'anxious', 'tired'];
  if (dailyLog && dailyLog.mood && lowMoods.includes(dailyLog.mood.toLowerCase())) {
    console.log("WellnessLogic: Low mood detected, suggesting yoga.");
    // Find the first yoga or flexibility plan in our data
    return workoutPlans.find(p => p.type === 'yoga' || p.type === 'flexibility') || workoutPlans[0];
  }

  // Rule 2: If no specific conditions are met, suggest a default workout.
  console.log("WellnessLogic: No specific conditions met, suggesting default cardio.");
  return workoutPlans.find(p => p.name === 'Morning Cardio') || workoutPlans[0];
};
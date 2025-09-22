// utils/wellnessGenome.js
import { calculateWaterGoal } from "./wellnessCalculators";

const MAX_SCORE = 5;

const calculateGoalScore = (value, goal, tolerance = 0.15) => {
    if (goal <= 0 || value < 0) return 0;
    const toleranceValue = goal * tolerance;
    const lowerBound = goal - toleranceValue;
    const upperBound = goal + toleranceValue;

    if (value >= lowerBound && value <= upperBound) {
        return MAX_SCORE;
    }
    if (value < lowerBound) {
        return Math.max(0, MAX_SCORE * (value / lowerBound));
    }
    const excess = value - upperBound;
    const maxAllowedExcess = goal * 0.5;
    return Math.max(0, MAX_SCORE * (1 - excess / maxAllowedExcess));
};

const calculateSleepScore = (sleepHours) => {
    if (sleepHours >= 7 && sleepHours <= 9) {
        return MAX_SCORE;
    }
    if (sleepHours < 7) {
        return Math.max(0, MAX_SCORE * (sleepHours / 7));
    }
    if (sleepHours > 9) {
        const excess = sleepHours - 9;
        return Math.max(0, MAX_SCORE * (1 - excess / 3));
    }
    return 0;
};

// --- MODIFIED: The function now accepts the 'date' to determine the day of the week ---
export const calculateWellnessScores = (dailyLog, userProfile, date) => {
    const caloriesEaten = Object.values(dailyLog.meals).flat().reduce((sum, item) => sum + item.calories, 0);
    const foodScore = userProfile.calorieGoal ? calculateGoalScore(caloriesEaten, userProfile.calorieGoal) : 0;

    const waterIntake = dailyLog.waterIntake || 0;
    const waterGoal = calculateWaterGoal(userProfile);
    const waterScore = Math.min((waterIntake / waterGoal) * MAX_SCORE, MAX_SCORE);

    // --- NEW LOGIC: Checks if it's a planned rest day ---
    const dayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const isRestDay = userProfile.workoutPlan[dayName]?.name === 'Rest Day';
    const exerciseScore = (dailyLog.workouts.length > 0 || isRestDay) ? MAX_SCORE : 0;

    const sleepHours = dailyLog.sleepHours || 0;
    const sleepScore = calculateSleepScore(sleepHours);

    const moodMap = {
        happy: 5, calm: 4, tired: 3, stressed: 2, sad: 1,
    };
    const moodScore = dailyLog.mood ? moodMap[dailyLog.mood.toLowerCase()] || 0 : 0;

    const chartData = [
        { value: moodScore, label: 'Mood' },
        { value: sleepScore, label: 'Sleep' },
        { value: exerciseScore, label: 'Exercise' },
        { value: waterScore, label: 'Water' },
        { value: foodScore, label: 'Food' },
    ];

    return chartData;
};
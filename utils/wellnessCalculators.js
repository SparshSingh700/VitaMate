// utils/wellnessCalculators.js

const activityWaterModifier = {
    sedentary: 0,
    light: 350,
    moderate: 500,
    active: 750,
};

/**
 * Calculates a personalized daily water intake goal based on weight and activity level.
 * @param {object} userProfile - The user's profile containing weight and activityLevel.
 * @returns {number} The calculated water goal in milliliters (ml).
 */
export const calculateWaterGoal = (userProfile) => {
    if (!userProfile || !userProfile.weight) {
        return 2000; // Default goal if profile is incomplete
    }
    const baseline = userProfile.weight * 35; // 35 ml per kg of body weight
    const activityBonus = activityWaterModifier[userProfile.activityLevel] || 0;
    
    // --- UPDATED: Round to the nearest 250ml ---
    return Math.round((baseline + activityBonus) / 250) * 250;
};

/**
 * Calculates Body Mass Index (BMI).
 * @param {number} weight - Weight in kilograms (kg).
 * @param {number} height - Height in centimeters (cm).
 * @returns {number} The calculated BMI value.
 */
export const calculateBMI = (weight, height) => {
    if (!weight || !height) {
        return 0;
    }
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi;
};
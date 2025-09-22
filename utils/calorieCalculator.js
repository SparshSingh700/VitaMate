// Activity level multipliers for TDEE calculation
const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

// Caloric adjustment per kg of weekly weight change
const caloriesPerKg = 7700;
const caloriesPerDayAdjustment = caloriesPerKg / 7;

/**
 * Calculates a user's Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 */
const calculateBMR = (profile) => {
  const { weight, height, age, gender } = profile;
  if (!weight || !height || !age || !gender) {
    return 0;
  }
  if (gender.toLowerCase() === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculates a user's Total Daily Energy Expenditure (TDEE).
 */
const calculateTDEE = (bmr, activityLevel) => {
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return bmr * multiplier;
};

/**
 * Calculates the final daily calorie goal based on the user's goal.
 */
export const calculateCalorieGoal = (profile) => {
  const { goal, weeklyWeightChange } = profile;
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  let goalCalories = tdee;

  if (goal === 'lose') {
    goalCalories -= weeklyWeightChange * caloriesPerDayAdjustment;
  } else if (goal === 'gain') {
    goalCalories += weeklyWeightChange * caloriesPerDayAdjustment;
  }
  return Math.round(goalCalories / 10) * 10;
};
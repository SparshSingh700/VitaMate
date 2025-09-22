// utils/weeklyReview.js

const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getLastSevenDaysLogs = (dailyLogs) => {
    const logs = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = getDateString(date);
        if (dailyLogs[dateString]) {
            logs.push({ date: dateString, ...dailyLogs[dateString] });
        }
    }
    return logs.reverse();
};

export const generateWeeklyAnalysis = (dailyLogs, userProfile, weightLog) => {
    const last7Days = getLastSevenDaysLogs(dailyLogs);
    if (last7Days.length < 5) {
        return { insights: [{ type: 'info', text: `Log at least 5 days to unlock your first weekly review. You've logged ${last7Days.length} so far.` }], summary: {}, weightTrend: 'not_enough_data' };
    }

    const insights = [];
    let totalCalories = 0, totalProtein = 0, totalSleep = 0, workoutsCompleted = 0;
    
    last7Days.forEach(log => {
        totalCalories += Object.values(log.meals).flat().reduce((sum, item) => sum + (item.calories || 0), 0);
        totalProtein += Object.values(log.meals).flat().reduce((sum, item) => sum + (item.protein || 0), 0);
        totalSleep += log.sleepHours || 0;
        if (log.workouts.length > 0) workoutsCompleted++;
    });

    const avgCalories = Math.round(totalCalories / last7Days.length);
    const avgSleep = parseFloat((totalSleep / last7Days.length).toFixed(1));
    const avgProtein = Math.round(totalProtein / last7Days.length);
    
    // Insight: Calorie & Protein
    const proteinGoal = Math.round(userProfile.weight * 1.6);
    if (Math.abs(avgCalories - userProfile.calorieGoal) < 150) {
        insights.push({ type: 'positive', text: `Calorie intake was on point! Your average of ${avgCalories} kcal was very close to your ${userProfile.calorieGoal} kcal goal.` });
    } else {
        insights.push({ type: 'suggestion', text: `Your average calorie intake was ${avgCalories} kcal, a bit off your goal of ${userProfile.calorieGoal}. Let's focus on consistency.` });
    }
    if (avgProtein >= proteinGoal) {
        insights.push({ type: 'positive', text: `You averaged ${avgProtein}g of protein, hitting your goal of ~${proteinGoal}g. This is crucial for muscle support.`});
    }

    // Insight: Sleep
    const sleepDaysInRange = last7Days.filter(d => d.sleepHours >= 7 && d.sleepHours <= 9).length;
    insights.push({ type: 'info', text: `You hit the optimal 7-9 hour sleep range on ${sleepDaysInRange} out of ${last7Days.length} nights.` });
    if(avgSleep < 6.5) {
        insights.push({ type: 'suggestion', text: `Your average sleep was only ${avgSleep} hours. Prioritizing more sleep can dramatically improve your energy and results.` });
    }

    // Weight Trend Analysis
    const weekWeightLogs = weightLog.filter(entry => last7Days.some(day => day.date === entry.date));
    let weightTrend = 'no_change';
    let actualWeightChange = 0;
    if (weekWeightLogs.length >= 2) {
        const startWeight = weekWeightLogs[0].weight;
        const endWeight = weekWeightLogs[weekWeightLogs.length - 1].weight;
        actualWeightChange = parseFloat((endWeight - startWeight).toFixed(2));
        const goalChange = userProfile.goal === 'lose' ? -userProfile.weeklyWeightChange : userProfile.weeklyWeightChange;
        
        if (Math.abs(actualWeightChange - goalChange) < 0.2) {
            weightTrend = 'on_track';
            insights.push({ type: 'positive', text: `Weight is on track! You changed by ${actualWeightChange} kg, right on target.`});
        } else if ( (userProfile.goal === 'lose' && actualWeightChange >= 0) || (userProfile.goal === 'gain' && actualWeightChange <= 0) ) {
            weightTrend = 'stalled';
            insights.push({ type: 'suggestion', text: `Your weight trend seems to have stalled or reversed. Let's adapt your calorie goal.`});
        }
    } else {
        insights.push({ type: 'info', text: 'Log your weight at least twice a week (start and end) to track your progress accurately.'});
    }

    return { insights, summary: { avgCalories, avgSleep, workoutsCompleted, actualWeightChange }, weightTrend };
};

export const suggestNewCalorieGoal = (userProfile, weightTrend) => {
    const currentGoal = userProfile.calorieGoal;
    if (weightTrend === 'stalled') {
        const adjustment = userProfile.goal === 'lose' ? -200 : 250;
        return { newGoal: currentGoal + adjustment, reason: `Since your progress stalled, a small adjustment to ~${currentGoal + adjustment} kcal can help get things moving again.` };
    }
    // You can add a 'too_fast' trend for more complex logic later
    return { newGoal: currentGoal, reason: 'You are on track with your current goals. No changes are needed this week. Keep up the great work!' };
};
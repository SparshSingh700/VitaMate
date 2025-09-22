// utils/progressionLogic.js
const PROGRESSION_FACTOR = {
    lose: 1.025,
    maintain: 1.025,
    gain: 1.05,
};

const parseReps = (reps) => {
    if (typeof reps !== 'string' || !reps.includes('-')) {
        const singleRep = parseInt(reps, 10);
        return { low: singleRep || 0, high: singleRep || 0 };
    }
    const parts = reps.split('-').map(num => parseInt(num.trim(), 10));
    return { low: parts[0], high: parts[1] };
};

export const generateNextWeekPlan = (lastWeekPlan, workoutHistory, userProfile) => {
    console.log("--- Running Scientific Weekly Progression Logic ---");
    
    // --- FIX: Add a comprehensive guard clause at the beginning ---
    if (!userProfile || !lastWeekPlan || typeof lastWeekPlan !== 'object' || !workoutHistory) {
        console.log("Incomplete data provided. Skipping progression for this week.");
        return lastWeekPlan || {}; // Return the old plan or an empty object to prevent a crash
    }

    const newPlan = JSON.parse(JSON.stringify(lastWeekPlan));
    const factor = PROGRESSION_FACTOR[userProfile.goal] || 1.025;

    const lastSessions = {};
    workoutHistory.forEach(log => {
        if (log.name) {
            lastSessions[log.name] = log;
        }
    });

    for (const day in newPlan) {
        const workout = newPlan[day];
        if (workout && workout.exercises && workout.exercises.length > 0) {
            const lastPerformance = lastSessions[workout.name];
            workout.exercises.forEach(exercise => {
                let lastWeight = 0;
                let completedAllReps = true;
                
                if (lastPerformance && lastPerformance.exercises && lastPerformance.exercises[exercise.name]) {
                    const exerciseHistory = lastPerformance.exercises[exercise.name];
                    const lastCompletedSet = [...exerciseHistory].reverse().find(set => set.completed && set.weight && parseFloat(set.weight) > 0);
                    lastWeight = lastCompletedSet ? parseFloat(lastCompletedSet.weight) : 0;
                    
                    const repRange = parseReps(exercise.reps);
                    
                    if(exerciseHistory.every(set => set.completed)) {
                        exerciseHistory.forEach(set => {
                            if (parseInt(set.reps, 10) < repRange.high) {
                                completedAllReps = false;
                            }
                        });
                    } else {
                        completedAllReps = false;
                    }

                    if (completedAllReps && lastWeight > 0) {
                        const newWeight = Math.round((lastWeight * factor) * 2) / 2;
                        exercise.suggestedWeight = newWeight; 
                    } else {
                        exercise.suggestedWeight = lastWeight > 0 ? lastWeight : undefined;
                    }
                }
            });
        }
    }
    
    console.log("--- New Progressed Plan Generated ---", newPlan);
    return newPlan;
};
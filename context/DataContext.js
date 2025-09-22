// context/DataContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { storeData, getData } from '../services/storage/asyncStorage';
import { useDebounce } from '../hooks/useDebounce';
import { generateNextWeekPlan } from '../utils/progressionLogic.js';
import { registerForPushNotificationsAsync, scheduleNudge } from '../services/notifications/notificationService';

const DataContext = createContext();

const getDateString = (date) => {
    if (!date || typeof date.getFullYear !== 'function') { date = new Date(); }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const produceNewDayLog = () => ({
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    waterIntake: 0, workouts: [], mood: null, sleepHours: 0,
});

const produceInitialWorkout = () => ({ name: "Rest Day", description: "Take a day to recover.", exercises: [] });

const blankWorkoutPlan = () => ({
    monday: produceInitialWorkout(), tuesday: produceInitialWorkout(), wednesday: produceInitialWorkout(),
    thursday: produceInitialWorkout(), friday: produceInitialWorkout(), saturday: produceInitialWorkout(), sunday: produceInitialWorkout(),
});

const initialAppData = {
    userProfile: {
        isSetupComplete: false, age: null, height: null, weight: null, startWeight: null, goalWeight: null, gender: null,
        activityLevel: null, goal: null, weeklyWeightChange: null, calorieGoal: 2000,
        workoutPlan: blankWorkoutPlan(),
    },
    lastProgressionDate: null, foodCache: {}, recipes: [],
    dailyLogs: {}, weightLog: [],
};

const migrateData = (loadedData) => {
    const data = { ...initialAppData, ...(loadedData || {}) };
    data.userProfile = { ...initialAppData.userProfile, ...(data.userProfile || {}) };
    if (!data.userProfile.workoutPlan || typeof data.userProfile.workoutPlan !== 'object') {
        data.userProfile.workoutPlan = blankWorkoutPlan();
    } else {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        days.forEach(day => {
            if (!data.userProfile.workoutPlan[day] || typeof data.userProfile.workoutPlan[day] !== 'object') {
                data.userProfile.workoutPlan[day] = produceInitialWorkout();
            }
        });
    }
    data.weightLog = Array.isArray(data.weightLog) ? [...data.weightLog] : [];
    data.dailyLogs = typeof data.dailyLogs === 'object' && data.dailyLogs !== null ? { ...data.dailyLogs } : {};
    return data;
};

export const DataProvider = ({ children }) => {
    const [appData, _setAppData] = useState(initialAppData);
    const [isReady, setIsReady] = useState(false); 
    const [selectedDate, _setSelectedDate] = useState(new Date());
    const debouncedAppData = useDebounce(appData, 1000);
    const [waterReminderScheduled, setWaterReminderScheduled] = useState(false);
    const [moodReminderScheduled, setMoodReminderScheduled] = useState(false);

    const setAppData = useCallback((updater) => {
        if (typeof updater === 'function') {
            _setAppData(prev => updater(prev));
        } else if (typeof updater === 'object') {
            _setAppData(prev => ({ ...prev, ...updater }));
        }
    }, []);

    const setSelectedDate = useCallback((newDate) => {
        const dateString = getDateString(newDate);
        setAppData(prevData => {
            if (!prevData.dailyLogs[dateString]) {
                const newDailyLogs = { ...prevData.dailyLogs, [dateString]: produceNewDayLog() };
                return { ...prevData, dailyLogs: newDailyLogs };
            }
            return prevData;
        });
        _setSelectedDate(newDate);
    }, [setAppData]);

    useEffect(() => {
        let mounted = true;
        const loadDataAndPermissions = async () => {
            try {
                await registerForPushNotificationsAsync();
                const savedData = await getData('appData');
                let finalData = savedData ? migrateData(savedData) : migrateData(null);
                const todayString = getDateString(new Date());
                if (!finalData.dailyLogs[todayString]) {
                    finalData.dailyLogs = { ...finalData.dailyLogs, [todayString]: produceNewDayLog() };
                }
                const today = new Date();
                if (finalData.userProfile.isSetupComplete && today.getDay() === 1) {
                    if (finalData.lastProgressionDate !== todayString) {
                        const dailyLogsObject = finalData.dailyLogs || {};
                        const workoutHistory = Object.values(dailyLogsObject).flatMap(day => day.workouts || []);
                        const newPlan = generateNextWeekPlan(finalData.userProfile.workoutPlan, workoutHistory, finalData.userProfile);
                        finalData = { ...finalData, userProfile: { ...finalData.userProfile, workoutPlan: newPlan }, lastProgressionDate: todayString };
                    }
                }
                if (!mounted) return;
                _setAppData(finalData);
            } catch (error) {
                console.error("Critical error loading data. Resetting app data.", error);
                await storeData('appData', initialAppData);
                if (!mounted) return;
                _setAppData(initialAppData);
            } finally {
                if (!mounted) return;
                setIsReady(true);
            }
        };
        loadDataAndPermissions();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (isReady) {
            storeData('appData', debouncedAppData);
            const todayString = getDateString(new Date());
            const todaysLog = debouncedAppData.dailyLogs && debouncedAppData.dailyLogs[todayString];
            if (!todaysLog) return;
            const now = new Date();
            if (now.getHours() >= 15 && (todaysLog.waterIntake || 0) < 1000 && !waterReminderScheduled) {
                scheduleNudge("💧 Stay Hydrated!", "You're a bit behind on water today. Let's log a glass or two.", 300);
                setWaterReminderScheduled(true);
            }
            if (now.getHours() >= 20 && !todaysLog.mood && !moodReminderScheduled) {
                scheduleNudge("🧠 How was your day?", "Take a moment to check in and log your mood for the day.", 300);
                setMoodReminderScheduled(true);
            }
        }
    }, [debouncedAppData, isReady]);

    const addMealFromVoice = useCallback((mealInfo) => {
        const { name, category } = mealInfo;
        const dateString = getDateString(selectedDate);
        const newMeal = { id: Date.now() + Math.random(), name: name.charAt(0).toUpperCase() + name.slice(1), calories: 0, protein: 0, carbs: 0, fat: 0, portion: 1, unit: 'serving', timestamp: new Date().toISOString() };
        setAppData(prevData => {
            const prevDailyLogs = prevData.dailyLogs || {};
            const dayLog = prevDailyLogs[dateString] ? { ...prevDailyLogs[dateString] } : produceNewDayLog();
            const meals = { ...dayLog.meals };
            if (!meals[category]) meals[category] = [];
            const updatedCategory = [...meals[category], newMeal];
            const newDayLog = { ...dayLog, meals: { ...meals, [category]: updatedCategory } };
            const newDailyLogs = { ...prevDailyLogs, [dateString]: newDayLog };
            return { ...prevData, dailyLogs: newDailyLogs };
        });
    }, [selectedDate, setAppData]);

    const logNewWeight = useCallback((newWeight) => {
        const todayString = getDateString(new Date());
        setAppData(prevData => {
            const filtered = (prevData.weightLog || []).filter(entry => entry.date !== todayString);
            const newLog = [...filtered, { date: todayString, weight: newWeight }];
            const updatedProfile = { ...prevData.userProfile, weight: newWeight };
            return { ...prevData, userProfile: updatedProfile, weightLog: newLog };
        });
    }, [setAppData]);

    const updateWater = useCallback((amount) => {
        const dateString = getDateString(selectedDate);
        setAppData(prevData => {
            const prevDailyLogs = prevData.dailyLogs || {};
            const dayLog = prevDailyLogs[dateString] ? { ...prevDailyLogs[dateString] } : produceNewDayLog();
            const newWaterIntake = Math.max(0, (dayLog.waterIntake || 0) + (Number(amount) || 0));
            const newDayLog = { ...dayLog, waterIntake: newWaterIntake };
            return { ...prevData, dailyLogs: { ...prevDailyLogs, [dateString]: newDayLog } };
        });
    }, [selectedDate, setAppData]);

    const updateSleep = useCallback((hours) => {
        const dateString = getDateString(selectedDate);
        setAppData(prevData => {
            const prevDailyLogs = prevData.dailyLogs || {};
            const dayLog = prevDailyLogs[dateString] ? { ...prevDailyLogs[dateString] } : produceNewDayLog();
            const newDayLog = { ...dayLog, sleepHours: Number(hours) || 0 };
            return { ...prevData, dailyLogs: { ...prevDailyLogs, [dateString]: newDayLog } };
        });
    }, [selectedDate, setAppData]);

    const setMoodForDate = useCallback((mood) => {
        const dateString = getDateString(selectedDate);
        setAppData(prevData => {
            const prevDailyLogs = prevData.dailyLogs || {};
            const dayLog = prevDailyLogs[dateString] ? { ...prevDailyLogs[dateString] } : produceNewDayLog();
            const newDayLog = { ...dayLog, mood };
            return { ...prevData, dailyLogs: { ...prevDailyLogs, [dateString]: newDayLog } };
        });
    }, [selectedDate, setAppData]);
    
    const value = { appData, setAppData, isReady, selectedDate, setSelectedDate, getDateString, updateWater, updateSleep, setMoodForDate, logNewWeight, addMealFromVoice };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    return useContext(DataContext);
};
// screens/ActiveWorkoutScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, TextInput, AppState, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import * as Haptics from 'expo-haptics'; // --- NEW: Import haptics ---

const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const SetRow = ({ setNumber, reps, isCompleted, onUpdate, onToggle, suggestedWeight }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [weight, setWeight] = useState('');
    const [currentReps, setCurrentReps] = useState(reps.toString());
    return (
        <View style={[styles.setRow, { backgroundColor: isCompleted ? '#2ecc7120' : 'transparent', borderBottomColor: colors.border }]}>
            <Text style={[styles.setText, { color: colors.text }]}>Set {setNumber}</Text>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder={suggestedWeight ? suggestedWeight.toString() : "kg"}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    onEndEditing={() => onUpdate({ reps: currentReps, weight })}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    placeholder="reps"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={currentReps}
                    onChangeText={setCurrentReps}
                    onEndEditing={() => onUpdate({ reps: currentReps, weight })}
                />
            </View>
            <TouchableOpacity onPress={onToggle}>
                <Ionicons 
                    name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
                    size={32} 
                    color={isCompleted ? COLORS.secondary : colors.textSecondary} 
                />
            </TouchableOpacity>
        </View>
    );
};

const ActiveWorkoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { workout } = route.params;
    const { appData, setAppData, initialDayData } = useData();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [timer, setTimer] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const appState = useRef(AppState.currentState);
    const backgroundTime = useRef(null);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setTimer(seconds => seconds + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const timeInBackground = Math.floor((Date.now() - backgroundTime.current) / 1000);
                setTimer(t => t + timeInBackground);
            } else if (nextAppState.match(/inactive|background/)) {
                backgroundTime.current = Date.now();
            }
            appState.current = nextAppState;
        });
        return () => {
            subscription.remove();
        };
    }, []);

    const formatTime = () => {
        const getSeconds = `0${(timer % 60)}`.slice(-2);
        const minutes = `${Math.floor(timer / 60)}`;
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);
        return `${getHours} : ${getMinutes} : ${getSeconds}`;
    };

    const [workoutLog, setWorkoutLog] = useState(() => {
        const log = {};
        workout.exercises.forEach(ex => {
            log[ex.name] = Array.from({ length: ex.sets }, () => ({ reps: ex.reps, weight: '', completed: false }));
        });
        return log;
    });

    const updateSet = (exerciseName, setIndex, setData) => {
        const newLog = { ...workoutLog };
        newLog[exerciseName][setIndex] = { ...newLog[exerciseName][setIndex], ...setData };
        setWorkoutLog(newLog);
    };

    const toggleSetCompletion = (exerciseName, setIndex) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // --- NEW: Haptic feedback on set completion
        const newLog = { ...workoutLog };
        newLog[exerciseName][setIndex].completed = !newLog[exerciseName][setIndex].completed;
        setWorkoutLog(newLog);
    };

    const handleFinishWorkout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // --- NEW: Haptic feedback for finishing
        setIsActive(false);
        const todayDateString = getDateString(new Date());
        const finishedWorkout = {
            id: Date.now(),
            name: workout.name,
            duration: Math.round(timer / 60),
            exercises: workoutLog,
            timestamp: new Date().toISOString(),
        };
        setAppData(prevData => {
            const dayLog = prevData.dailyLogs[todayDateString] || initialDayData;
            return {
                ...prevData,
                dailyLogs: {
                    ...prevData.dailyLogs,
                    [todayDateString]: {
                        ...dayLog,
                        workouts: [...dayLog.workouts, finishedWorkout],
                    }
                }
            }
        });
        
        Alert.alert("Workout Logged!", `Your ${workout.name} session has been saved.`);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={[FONTS.h1, styles.workoutName, { color: colors.text }]}>{workout.name}</Text>
                    
                    <View style={[styles.timerContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.timerText, { color: colors.text }]}>{formatTime()}</Text>
                    </View>
                    {workout.exercises.map((exercise) => (
                        <View key={exercise.name} style={[styles.exerciseCard, { backgroundColor: colors.card }]}>
                            <Text style={[FONTS.h2, styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
                            {workoutLog[exercise.name].map((set, index) => (
                                <SetRow 
                                    key={index}
                                    setNumber={index + 1}
                                    reps={set.reps}
                                    isCompleted={set.completed}
                                    onUpdate={(data) => updateSet(exercise.name, index, data)}
                                    onToggle={() => toggleSetCompletion(exercise.name, index)}
                                    suggestedWeight={exercise.suggestedWeight}
                                />
                            ))}
                        </View>
                    ))}
                </ScrollView>
                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.controlButton, { backgroundColor: isActive ? COLORS.obese : COLORS.primary }]} 
                            onPress={() => setIsActive(!isActive)}
                        >
                            <Ionicons name={isActive ? "pause" : "play"} size={24} color="white" />
                            <Text style={styles.finishButtonText}>{isActive ? "Pause" : "Resume"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
                            <Ionicons name="stopwatch" size={24} color="white" />
                            <Text style={styles.finishButtonText}>Finish & Log</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 20 },
    workoutName: { textAlign: 'center', marginBottom: 24 },
    timerContainer: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24 },
    timerText: { fontSize: 48, fontWeight: 'bold', letterSpacing: 2 },
    exerciseCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
    exerciseName: { marginBottom: 16 },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    setText: { ...FONTS.body1, fontWeight: 'bold' },
    inputContainer: { width: '25%' },
    input: {
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
        ...FONTS.body1,
    },
    footer: { padding: 20, borderTopWidth: 1 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    controlButton: { flexDirection: 'row', flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    finishButton: { flexDirection: 'row', flex: 2, backgroundColor: COLORS.secondary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
    finishButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ActiveWorkoutScreen;
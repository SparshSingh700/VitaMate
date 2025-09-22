// screens/WorkoutScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import WeekdaySlider from '../components/WeekdaySlider';

const WorkoutScreen = () => {
    const navigation = useNavigation();
    const { appData, selectedDate } = useData();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    
    // --- FIX: Add a guard clause to prevent crash if selectedDate is not ready ---
    if (!selectedDate) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} />
        ); // Render an empty screen briefly if date is not available
    }

    const selectedDayName = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const selectedWorkout = appData?.userProfile?.workoutPlan?.[selectedDayName];

    if (!selectedWorkout || !selectedWorkout.exercises || selectedWorkout.exercises.length === 0) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <WeekdaySlider />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center'}]}>
                    <Ionicons name="moon-outline" size={60} color={COLORS.primary} />
                    <Text style={[FONTS.h1, { color: colors.text, marginTop: 16 }]}>Rest Day</Text>
                    <Text style={[FONTS.body1, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>Enjoy your recovery, or go to Settings to create a plan for this day!</Text>
                </View>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <WeekdaySlider />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[FONTS.h1, styles.headerTitle, { color: colors.text }]}>{selectedWorkout.name}</Text>
                
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[FONTS.body1, styles.description, { color: colors.textSecondary }]}>{selectedWorkout.description}</Text>
                    <TouchableOpacity 
                        style={styles.startButton}
                        onPress={() => navigation.navigate('ActiveWorkout', { workout: selectedWorkout })}
                    >
                        <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.exerciseList, { backgroundColor: colors.card }]}>
                    <Text style={[FONTS.h2, styles.listHeader, { color: colors.text }]}>Exercises</Text>
                    {selectedWorkout.exercises.map((exercise, index) => (
                        <View key={index} style={[styles.exerciseItem, { borderBottomColor: colors.border }]}>
                            <View style={{flex: 1}}>
                                <Text style={[FONTS.h3, styles.exerciseName, { color: colors.text }]}>{exercise.name}</Text>
                                <Text style={[FONTS.body1, styles.exerciseDetails, { color: colors.textSecondary }]}>
                                    {exercise.sets} sets x {exercise.reps} reps
                                    {exercise.suggestedWeight && ` @ ${exercise.suggestedWeight}kg`}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 20, flexGrow: 1 },
    headerTitle: { marginBottom: 24, textAlign: 'center' },
    card: { borderRadius: 16, padding: 20, marginBottom: 24, elevation: 5 },
    description: { textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    startButton: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    startButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    listHeader: { marginBottom: 16 },
    exerciseList: { borderRadius: 16, padding: 20 },
    exerciseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
    exerciseName: { fontWeight: '600' },
    exerciseDetails: { marginTop: 4 },
});

export default WorkoutScreen;
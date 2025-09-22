// screens/WorkoutPlanScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import { generateAiWorkoutPlan } from '../services/ai/geminiService.js';
import cloneDeep from 'lodash.clonedeep';

// --- UPDATED: "sunday" has been removed from the array ---
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const workoutTypes = ['push', 'pull', 'legs', 'functional', 'yoga', 'rest'];

const WorkoutPlanScreen = () => {
    const { appData, setAppData } = useData();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    
    const [localPlan, setLocalPlan] = useState(() => cloneDeep(appData.userProfile.workoutPlan || {}));
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [specialRequest, setSpecialRequest] = useState('');

    const setWorkoutForDay = (day, type) => {
        setLocalPlan(currentPlan => {
            const prevWorkout = currentPlan[day] || {};
            const workoutName = type === 'rest' ? 'Rest Day' : type.charAt(0).toUpperCase() + type.slice(1);
            return {
                ...currentPlan,
                [day]: {
                    ...prevWorkout,
                    name: workoutName,
                    description: `A custom ${type} workout.`,
                    exercises: prevWorkout.exercises || (type === 'rest' ? [] : undefined),
                },
            };
        });
    };

    const handleCreateAndSavePlan = async () => {
        setIsLoadingAi(true);
        const generatedPlan = await generateAiWorkoutPlan(appData.userProfile, localPlan, specialRequest);
        setIsLoadingAi(false);

        if (generatedPlan) {
            setAppData(prevData => ({
                ...prevData,
                userProfile: {
                    ...prevData.userProfile,
                    workoutPlan: generatedPlan,
                },
            }));
            Alert.alert("Plan Created & Saved", "Your new AI-powered workout plan has been saved.");
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[FONTS.h1, styles.headerTitle, { color: colors.text }]}>Create Your Plan</Text>
                
                <Text style={[FONTS.h3, styles.subHeader, { color: colors.text, borderTopColor: colors.border, marginTop: 0, paddingTop: 0, }]}>Special Request (Optional)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    placeholder="e.g., 'focus on biceps', 'no jumping exercises'"
                    placeholderTextColor={colors.textSecondary}
                    value={specialRequest}
                    onChangeText={setSpecialRequest}
                />
                
                <Text style={[FONTS.h3, styles.subHeader, { color: colors.text, borderTopColor: colors.border }]}>Choose Your Weekly Split</Text>
                
                {daysOfWeek.map(day => (
                    <View key={day} style={styles.dayContainer}>
                        <Text style={[FONTS.body1, styles.dayText, { color: colors.text }]}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {workoutTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, {backgroundColor: colors.card, borderColor: colors.border}, localPlan[day]?.name?.toLowerCase().includes(type) && styles.typeButtonSelected]}
                                    onPress={() => setWorkoutForDay(day, type)}
                                >
                                    <Text style={[styles.typeButtonText, {color: COLORS.primary}, localPlan[day]?.name?.toLowerCase().includes(type) && styles.typeButtonTextSelected]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                {isLoadingAi ? (
                     <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                    <Button title="✨ Create & Save AI Plan" onPress={handleCreateAndSavePlan} color={COLORS.primary} />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 20, paddingBottom: 100 },
    headerTitle: { marginBottom: 24, textAlign: 'center' },
    subHeader: { marginTop: 24, marginBottom: 12, borderTopWidth: 1, paddingTop: 24 },
    input: {
        padding: 15,
        borderRadius: 12,
        ...FONTS.body1,
        borderWidth: 1,
        marginBottom: 24,
    },
    dayContainer: { marginBottom: 24 },
    dayText: { fontWeight: '600', marginBottom: 12 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    typeButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    typeButtonText: { fontSize: 14 },
    typeButtonTextSelected: { color: 'white', fontWeight: 'bold' },
    footer: { padding: 20, borderTopWidth: 1, minHeight: 78, justifyContent: 'center' },
});

export default WorkoutPlanScreen;
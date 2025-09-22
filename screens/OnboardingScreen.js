// screens/OnboardingScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Button, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useData } from '../context/DataContext';
import { calculateCalorieGoal } from '../utils/calorieCalculator.js';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';

const SelectionButton = ({ label, value, selectedValue, onSelect, style }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const selected = selectedValue === value;
    return (
        <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.card, borderColor: colors.border}, selected && styles.buttonSelected, style]}
            onPress={() => onSelect(value)}
        >
            <Text style={[styles.buttonText, {color: colors.text}, selected && styles.buttonTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );
};

const OnboardingScreen = () => {
    const { setAppData } = useData();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        gender: 'male', age: '', weight: '', height: '',
        goalWeight: '', activityLevel: 'light', goal: 'lose', weeklyWeightChange: 0.5,
    });

    const handleNext = () => {
        if (step === 2) {
            if (!profile.age || !profile.weight || !profile.height || !profile.goalWeight) {
                Alert.alert("Missing Information", "Please fill out all fields.");
                return;
            }
        }
        setStep(prev => prev + 1);
    };

    const handleFinish = () => {
        const finalProfile = {
            ...profile,
            age: Number(profile.age) || 0,
            weight: Number(profile.weight) || 0,
            height: Number(profile.height) || 0,
            goalWeight: Number(profile.goalWeight) || 0,
            startWeight: Number(profile.weight) || 0,
        };
        const calorieGoal = calculateCalorieGoal(finalProfile);

        // --- THIS IS THE FIX ---
        // It now correctly merges the new profile with the old one, preserving the workoutPlan.
        setAppData(prevData => ({
            ...prevData,
            userProfile: {
                ...prevData.userProfile,
                ...finalProfile,
                calorieGoal: calorieGoal,
                isSetupComplete: true,
            },
        }));
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
                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>Welcome to VitaMate</Text>
                            <Text style={[FONTS.body1, styles.subtitle, { color: colors.textSecondary }]}>Let's set up your profile to personalize your experience.</Text>
                            <Button title="Get Started" onPress={handleNext} color={COLORS.primary} />
                        </View>
                    )}
                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>About You</Text>
                            <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                            <View style={styles.genderButtonGroup}>
                                <SelectionButton label="Male" value="male" selectedValue={profile.gender} onSelect={(v) => setProfile(p => ({ ...p, gender: v }))} />
                                <SelectionButton label="Female" value="female" selectedValue={profile.gender} onSelect={(v) => setProfile(p => ({ ...p, gender: v }))} />
                            </View>
                            <Text style={[styles.label, { color: colors.text }]}>Age</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g., 25" placeholderTextColor={colors.textSecondary} value={profile.age?.toString()} onChangeText={(v) => setProfile(p => ({ ...p, age: v }))} keyboardType="number-pad" />
                            <Text style={[styles.label, { color: colors.text }]}>Current Weight (kg)</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g., 70" placeholderTextColor={colors.textSecondary} value={profile.weight?.toString()} onChangeText={(v) => setProfile(p => ({ ...p, weight: v }))} keyboardType="numeric" />
                            <Text style={[styles.label, { color: colors.text }]}>Goal Weight (kg)</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g., 65" placeholderTextColor={colors.textSecondary} value={profile.goalWeight?.toString()} onChangeText={(v) => setProfile(p => ({ ...p, goalWeight: v }))} keyboardType="numeric" />
                            <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} placeholder="e.g., 175" placeholderTextColor={colors.textSecondary} value={profile.height?.toString()} onChangeText={(v) => setProfile(p => ({ ...p, height: v }))} keyboardType="numeric" />
                            <View style={styles.nextButton}><Button title="Next" onPress={handleNext} color={COLORS.primary} /></View>
                        </View>
                    )}
                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>Activity Level</Text>
                            <View style={styles.verticalButtonGroup}>
                                <SelectionButton label="Sedentary (little or no exercise)" value="sedentary" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
                                <SelectionButton label="Lightly Active (1-3 days/week)" value="light" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
                                <SelectionButton label="Moderately Active (3-5 days/week)" value="moderate" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
                                <SelectionButton label="Very Active (6-7 days a week)" value="active" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
                            </View>
                            <View style={styles.nextButton}><Button title="Next" onPress={handleNext} color={COLORS.primary} /></View>
                        </View>
                    )}
                    {step === 4 && (
                        <View style={styles.stepContainer}>
                            <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>Your Goal</Text>
                            <View style={styles.verticalButtonGroup}>
                                <SelectionButton label="Lose Weight" value="lose" selectedValue={profile.goal} onSelect={(v) => setProfile(p => ({ ...p, goal: v }))} />
                                <SelectionButton label="Maintain Weight" value="maintain" selectedValue={profile.goal} onSelect={(v) => setProfile(p => ({ ...p, goal: v }))} />
                                <SelectionButton label="Gain Weight" value="gain" selectedValue={profile.goal} onSelect={(v) => setProfile(p => ({ ...p, goal: v }))} />
                            </View>
                            {profile.goal !== 'maintain' && (
                                <>
                                    <Text style={[styles.label, { color: colors.text }]}>Weekly Goal</Text>
                                    <View style={styles.buttonGroup}>
                                        <SelectionButton label="0.25 kg" value={0.25} selectedValue={profile.weeklyWeightChange} onSelect={(v) => setProfile(p => ({ ...p, weeklyWeightChange: v }))} style={{flex: 1}}/>
                                        <SelectionButton label="0.5 kg" value={0.5} selectedValue={profile.weeklyWeightChange} onSelect={(v) => setProfile(p => ({ ...p, weeklyWeightChange: v }))} style={{flex: 1}}/>
                                    </View>
                                    <View style={styles.buttonGroup}>
                                        <SelectionButton label="0.75 kg" value={0.75} selectedValue={profile.weeklyWeightChange} onSelect={(v) => setProfile(p => ({ ...p, weeklyWeightChange: v }))} style={{flex: 1}}/>
                                        <SelectionButton label="1 kg" value={1} selectedValue={profile.weeklyWeightChange} onSelect={(v) => setProfile(p => ({ ...p, weeklyWeightChange: v }))} style={{flex: 1}}/>
                                    </View>
                                </>
                            )}
                            <View style={styles.nextButton}><Button title="Finish Setup" onPress={handleFinish} color={COLORS.primary} /></View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    stepContainer: { width: '100%' },
    title: { textAlign: 'center', marginBottom: 16 },
    subtitle: { textAlign: 'center', marginBottom: 40 },
    label: { ...FONTS.h3, marginTop: 20, marginBottom: 8 },
    input: { padding: 15, borderRadius: 12, ...FONTS.body1 },
    buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
    genderButtonGroup: { flexDirection: 'row', gap: 8 },
    verticalButtonGroup: { flexDirection: 'column' },
    button: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginVertical: 6 },
    buttonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    buttonText: { ...FONTS.body1, textAlign: 'center' },
    buttonTextSelected: { color: 'white', fontWeight: 'bold' },
    nextButton: { marginTop: 30 },
});

export default OnboardingScreen;
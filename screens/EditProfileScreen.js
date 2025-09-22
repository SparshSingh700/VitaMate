import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Button, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useData } from '../context/DataContext';
import { calculateCalorieGoal } from '../utils/calorieCalculator.js';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';

const SelectionButton = ({ label, value, selectedValue, onSelect, style }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <TouchableOpacity
            style={[styles.button, {backgroundColor: colors.card, borderColor: colors.border}, selectedValue === value && styles.buttonSelected, style]}
            onPress={() => onSelect(value)}
        >
            <Text style={[styles.buttonText, {color: colors.text}, selectedValue === value && styles.buttonTextSelected]}>{label}</Text>
        </TouchableOpacity>
    );
};

const EditProfileScreen = () => {
  const { appData, setAppData } = useData();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = COLORS[theme];
  
  const [profile, setProfile] = useState({
    ...appData.userProfile,
    age: appData.userProfile.age.toString(),
    weight: appData.userProfile.weight.toString(),
    height: appData.userProfile.height.toString(),
    goalWeight: appData.userProfile.goalWeight.toString(),
  });

  const handleSaveChanges = () => {
    if (!profile.age || !profile.weight || !profile.height || !profile.goalWeight) {
        Alert.alert("Missing Information", "Please fill out all fields.");
        return;
    }
    const finalProfile = {
        ...profile,
        age: parseInt(profile.age),
        weight: parseFloat(profile.weight),
        height: parseFloat(profile.height),
        goalWeight: parseFloat(profile.goalWeight),
    };
    const calorieGoal = calculateCalorieGoal(finalProfile);
    setAppData(prevData => ({
      ...prevData,
      userProfile: { ...prevData.userProfile, ...finalProfile, calorieGoal: calorieGoal },
    }));
    Alert.alert("Profile Updated", "Your profile and calorie goal have been updated.");
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
          <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>Edit Profile</Text>
          
          <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
          <View style={styles.genderButtonGroup}>
            <SelectionButton label="Male" value="male" selectedValue={profile.gender} onSelect={(v) => setProfile(p => ({ ...p, gender: v }))} />
            <SelectionButton label="Female" value="female" selectedValue={profile.gender} onSelect={(v) => setProfile(p => ({ ...p, gender: v }))} />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Age</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={profile.age} onChangeText={(v) => setProfile(p => ({ ...p, age: v }))} keyboardType="number-pad" />
          
          <Text style={[styles.label, { color: colors.text }]}>Current Weight (kg)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={profile.weight} onChangeText={(v) => setProfile(p => ({ ...p, weight: v }))} keyboardType="numeric" />
          
          <Text style={[styles.label, { color: colors.text }]}>Goal Weight (kg)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={profile.goalWeight} onChangeText={(v) => setProfile(p => ({ ...p, goalWeight: v }))} keyboardType="numeric" />

          <Text style={[styles.label, { color: colors.text }]}>Height (cm)</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.text }]} value={profile.height} onChangeText={(v) => setProfile(p => ({ ...p, height: v }))} keyboardType="numeric" />

          <Text style={[styles.label, { color: colors.text }]}>Activity Level</Text>
          <View style={styles.verticalButtonGroup}>
              <SelectionButton label="Sedentary" value="sedentary" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
              <SelectionButton label="Lightly Active" value="light" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
              <SelectionButton label="Moderately Active" value="moderate" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
              <SelectionButton label="Very Active" value="active" selectedValue={profile.activityLevel} onSelect={(v) => setProfile(p => ({ ...p, activityLevel: v }))} />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Your Goal</Text>
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
          <View style={styles.nextButton}>
              <Button title="Save Changes" onPress={handleSaveChanges} color={COLORS.primary} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flexGrow: 1, padding: 20 },
  title: { ...FONTS.h1, textAlign: 'center', marginBottom: 24 },
  label: { ...FONTS.h3, marginTop: 20, marginBottom: 8 },
  input: { padding: 15, borderRadius: 12, ...FONTS.body1 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  genderButtonGroup: { flexDirection: 'row', gap: 8 },
  verticalButtonGroup: { flexDirection: 'column' },
  button: { padding: 15, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginVertical: 6 },
  buttonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  buttonText: { ...FONTS.body1, textAlign: 'center' },
  buttonTextSelected: { color: 'white', fontWeight: 'bold' },
  nextButton: { marginTop: 40, marginBottom: 20 },
});

export default EditProfileScreen;
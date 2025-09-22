// screens/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';

const SettingsOption = ({ label, icon, onPress }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: colors.border }]} onPress={onPress}>
            <Ionicons name={icon} size={24} color={COLORS.primary} style={styles.optionIcon} />
            <Text style={[FONTS.body1, styles.optionText, { color: colors.text }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
    );
};

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <View style={styles.container}>
                <View style={styles.optionsGroup}>
                    <SettingsOption 
                        label="Edit Profile & Goals" 
                        icon="person-circle-outline"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <SettingsOption 
                        label="Edit Workout Plan" 
                        icon="barbell-outline"
                        onPress={() => navigation.navigate('WorkoutPlan')}
                    />
                    {/* --- NEW: Button to open the Weekly Review Screen --- */}
                    <SettingsOption 
                        label="View Weekly Review" 
                        icon="analytics-outline"
                        onPress={() => navigation.navigate('WeeklyReview')}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 20 },
    optionsGroup: { borderRadius: 12, overflow: 'hidden' },
    optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, },
    optionIcon: { marginRight: 15, },
    optionText: { flex: 1, },
});

export default SettingsScreen;
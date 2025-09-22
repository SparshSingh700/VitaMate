// components/WeightProgressMeter.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS, COLORS } from '../constants/Theme';

// --- MODIFIED: Now accepts an `onPressCurrent` prop ---
const WeightProgressMeter = ({ start, current, goal, onPressCurrent }) => {
    const totalRange = Math.abs(start - goal);
    const currentProgress = Math.abs(start - current);
    const progressPercentage = totalRange > 0 ? (currentProgress / totalRange) * 100 : (current >= goal ? 100 : 0);

    return (
        <View style={[styles.card, { backgroundColor: '#34495e' }]}>
            <Text style={styles.cardTitle}>Weight Goal</Text>
            <View style={styles.weightRow}>
                <View style={styles.weightBox}>
                    <Text style={styles.weightValue}>{start}</Text>
                    <Text style={styles.weightLabel}>Start</Text>
                </View>
                {/* --- MODIFIED: This section is now pressable --- */}
                <TouchableOpacity onPress={onPressCurrent} style={styles.currentWeightTouchable}>
                    <Text style={[styles.weightValue, styles.currentWeight]}>{current}</Text>
                    <Text style={styles.weightLabel}>Current</Text>
                </TouchableOpacity>
                <View style={styles.weightBox}>
                    <Text style={styles.weightValue}>{goal}</Text>
                    <Text style={styles.weightLabel}>Goal</Text>
                </View>
            </View>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: 16, padding: 20, marginBottom: 16, justifyContent: 'center' },
    cardTitle: { ...FONTS.body1, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold', position: 'absolute', top: 15, left: 15 },
    weightRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 20 },
    weightBox: { alignItems: 'center' },
    currentWeightTouchable: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
    weightValue: { ...FONTS.h2, color: 'white' },
    currentWeight: { ...FONTS.h1, color: COLORS.secondary },
    weightLabel: { ...FONTS.body2, color: '#bdc3c7', marginTop: 4 },
    progressBarBackground: { width: '100%', height: 10, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 5, marginTop: 20 },
    progressBarFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: 5 },
});

export default WeightProgressMeter;
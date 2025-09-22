// components/WaterLogger.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

// --- NEW: A simple, universal, and highly reliable SVG path for a person icon ---
const personIconPath = "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z";
const personIconViewBox = "0 0 24 24";

export const WaterLogger = ({ currentIntake, goal, onLogWater }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];

    const progress = goal > 0 ? currentIntake / goal : 0;
    const isOverGoal = progress > 1;

    // Cap the visual fill progress at 100%
    const fillProgress = Math.min(progress, 1); 
    const fillColor = isOverGoal ? COLORS.obese : COLORS.secondary;

    const svgHeight = parseInt(personIconViewBox.split(' ')[3], 10);
    const svgWidth = parseInt(personIconViewBox.split(' ')[2], 10);
    const fillY = svgHeight * (1 - fillProgress);

    return (
        <View style={styles.container}>
            <View style={styles.infoRow}>
                <Text style={[FONTS.h1, { color: isOverGoal ? COLORS.obese : colors.text, fontWeight: 'bold' }]}>{currentIntake} ml</Text>
                <Text style={[FONTS.body1, { color: colors.textSecondary }]}>Goal: {goal} ml</Text>
            </View>

            <View style={styles.visualContainer}>
                <Svg width={120} height={120} viewBox={personIconViewBox}>
                    <Defs>
                        <ClipPath id="clip">
                            <Path d={personIconPath} />
                        </ClipPath>
                    </Defs>
                    <Path d={personIconPath} fill={colors.border} />
                    <G clipPath="url(#clip)">
                        <Rect
                            x="0"
                            y={fillY}
                            width={svgWidth}
                            height={svgHeight}
                            fill={fillColor}
                        />
                    </G>
                </Svg>
            </View>

            {isOverGoal && (
                <Text style={styles.warningText}>
                    Note: Excessive water intake can also be harmful.
                </Text>
            )}

            <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={() => onLogWater(250)}>
                    <Ionicons name="water" size={24} color={COLORS.primary} />
                    <Text style={[styles.buttonText, { color: colors.text }]}>Glass (250ml)</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, paddingVertical: 14 }]} onPress={() => onLogWater(-250)}>
                    <Ionicons name="remove-circle-outline" size={20} color={colors.textSecondary} />
                    <Text style={[styles.buttonText, { color: colors.textSecondary, fontWeight: '500' }]}>Undo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    infoRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    visualContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    warningText: {
        ...FONTS.body2,
        color: COLORS.overweight,
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        ...FONTS.body1,
        fontWeight: '600',
    },
});
// components/SleepLogger.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';

export const SleepLogger = ({ onLogSleep, loggedHours }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [hours, setHours] = useState(loggedHours > 0 ? loggedHours : 7.5);

    // --- THIS IS THE FIX ---
    // This effect runs whenever the loggedHours prop changes from the outside
    // (e.g., from a voice command) and updates the slider's visual state.
    useEffect(() => {
        setHours(loggedHours);
    }, [loggedHours]);

    const handleLog = () => {
        onLogSleep(hours);
    };

    return (
        <View style={{width: '100%'}}>
            <Text style={[styles.sliderValue, { color: colors.text }]}>{hours.toFixed(1)} hours</Text>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={12}
                step={0.5}
                value={hours}
                onValueChange={setHours}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={COLORS.primary}
            />
             <View style={{marginTop: 8}}>
                <Button title="Log Sleep" onPress={handleLog} color={COLORS.primary} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sliderValue: {
        ...FONTS.h2,
        textAlign: 'center',
        marginBottom: 8,
    },
});
// components/WeekdaySlider.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';

// Helper function to get all the dates for the week of a given date
const getWeekDays = (currentDate) => {
    const week = [];
    const date = new Date(currentDate);
    // Find the Monday of the current week
    const dayOfWeek = date.getDay(); // Sunday is 0, Monday is 1
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust if Sunday
    const monday = new Date(date.setDate(diff));

    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        week.push(day);
    }
    return week;
};

const WeekdaySlider = () => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const { selectedDate, setSelectedDate } = useData();
    const [week, setWeek] = useState([]);

    useEffect(() => {
        setWeek(getWeekDays(selectedDate));
    }, [selectedDate]);

    const isSameDay = (d1, d2) => {
        return d1.toDateString() === d2.toDateString();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            {week.map((day, index) => {
                const isSelected = isSameDay(day, selectedDate);
                return (
                    <TouchableOpacity
                        key={index}
                        style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                        onPress={() => setSelectedDate(day)}
                    >
                        <Text style={[styles.dayInitial, { color: colors.textSecondary }, isSelected && styles.selectedText]}>
                            {day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                        </Text>
                        <Text style={[styles.dayNumber, { color: colors.text }, isSelected && styles.selectedText]}>
                            {day.getDate()}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    dayButton: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        width: 44,
    },
    selectedDayButton: {
        backgroundColor: COLORS.primary,
    },
    dayInitial: {
        ...FONTS.body2,
        marginBottom: 4,
    },
    dayNumber: {
        ...FONTS.h3,
    },
    selectedText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default WeekdaySlider;
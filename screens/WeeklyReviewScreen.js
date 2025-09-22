// screens/WeeklyReviewScreen.js
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Button, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { generateWeeklyAnalysis, suggestNewCalorieGoal } from '../utils/weeklyReview';

const InsightCard = ({ insight }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const iconMap = {
        positive: { name: 'checkmark-circle', color: COLORS.normal },
        suggestion: { name: 'bulb', color: COLORS.overweight },
        info: { name: 'information-circle', color: COLORS.primary },
    };
    const icon = iconMap[insight.type] || iconMap['info'];

    return (
        <View style={[styles.insightCard, { backgroundColor: colors.background }]}>
            <Ionicons name={icon.name} size={28} color={icon.color} style={styles.icon} />
            <Text style={[styles.insightText, { color: colors.text }]}>{insight.text}</Text>
        </View>
    );
};

const WeeklyReviewScreen = ({ navigation }) => {
    const { appData, setAppData } = useData();
    const { theme } = useTheme();
    const colors = COLORS[theme];

    const analysis = useMemo(() => generateWeeklyAnalysis(appData.dailyLogs, appData.userProfile, appData.weightLog), [appData]);
    const goalSuggestion = useMemo(() => suggestNewCalorieGoal(appData.userProfile, analysis.weightTrend), [appData, analysis.weightTrend]);

    const handleAcceptGoal = () => {
        setAppData(prev => ({
            ...prev,
            userProfile: { ...prev.userProfile, calorieGoal: goalSuggestion.newGoal }
        }));
        Alert.alert("Goal Updated!", `Your new daily calorie goal is ${goalSuggestion.newGoal} kcal.`);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[FONTS.h1, styles.title, { color: colors.text }]}>Your Weekly Review</Text>
                
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Key Insights</Text>
                    {analysis.insights.map((insight, index) => <InsightCard key={index} insight={insight} />)}
                </View>

                {goalSuggestion && analysis.weightTrend !== 'not_enough_data' && (
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>Goal Adaptation</Text>
                        <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>{goalSuggestion.reason}</Text>
                        {goalSuggestion.newGoal !== appData.userProfile.calorieGoal ? (
                            <View style={styles.buttonContainer}>
                                <Button title={`Accept ${goalSuggestion.newGoal} kcal`} onPress={handleAcceptGoal} color={COLORS.primary}/>
                                <View style={{width: 20}} />
                                <Button title="Keep My Goal" onPress={() => navigation.goBack()} color={colors.textSecondary} />
                            </View>
                        ) : (
                            <Button title="Awesome!" onPress={() => navigation.goBack()} color={COLORS.primary}/>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 16 },
    title: { textAlign: 'center', marginBottom: 24 },
    card: { borderRadius: 16, padding: 20, marginBottom: 20 },
    cardTitle: { ...FONTS.h2, marginBottom: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    insightCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, borderRadius: 8, },
    icon: { marginRight: 16 },
    insightText: { ...FONTS.body1, flex: 1, lineHeight: 22 },
    suggestionText: { ...FONTS.body1, color: 'gray', marginBottom: 20, lineHeight: 24, textAlign: 'center' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'center' }
});

export default WeeklyReviewScreen;
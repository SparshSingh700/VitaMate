// screens/HomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Button, Dimensions, LayoutAnimation, Platform, UIManager, Alert, TextInput, Animated, Pressable } from 'react-native';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import * as Haptics from 'expo-haptics';
import HomeScreenSkeleton from '../components/HomeScreenSkeleton';
import BMIMeter from '../components/BMIMeter.js';
import WeightProgressMeter from '../components/WeightProgressMeter.js';
import WellnessRadarChart from '../components/charts/WellnessRadarChart.js';
import { calculateBMI, calculateWaterGoal } from '../utils/wellnessCalculators.js';
import { calculateWellnessScores } from '../utils/wellnessGenome.js';
import { useNavigation } from '@react-navigation/native';
import { WaterLogger } from '../components/WaterLogger.js';
import { SleepLogger } from '../components/SleepLogger.js';
import WeekdaySlider from '../components/WeekdaySlider';
import { WeightLogModal } from '../components/WeightLogModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { UIManager.setLayoutAnimationEnabledExperimental(true); }

const screenWidth = Dimensions.get('window').width;

const Card = ({ title, children, style }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.background }, style]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            {children}
        </View>
    );
};

const MoodButton = ({ mood, icon, currentMood, onPress }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const isSelected = currentMood === mood;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Pressable onPress={() => onPress(mood)} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Animated.View style={[styles.moodButton, isSelected && styles.moodButtonSelected, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.moodIcon}>{icon}</Text>
                <Text style={[styles.moodText, { color: colors.textSecondary }]}>{mood}</Text>
            </Animated.View>
        </Pressable>
    );
};

const HomeScreen = () => {
    const { appData, isLoading, initialDayData, updateWater, updateSleep, selectedDate, setMoodForDate, getDateString, logNewWeight } = useData();
    const [isWeightModalVisible, setWeightModalVisible] = useState(false);
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isLoading]);

    const selectedDateString = getDateString(selectedDate);
    const selectedDayLog = appData.dailyLogs?.[selectedDateString] || initialDayData;
    const { userProfile } = appData;

    const handleLogWater = (amount) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateWater(amount);
    };

    const handleSetMood = (mood) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setMoodForDate(mood);
    };

    const handleLogWeight = (weight) => {
        logNewWeight(weight);
        setWeightModalVisible(false);
        Alert.alert("Weight Logged", `Your new weight of ${weight} kg has been saved.`);
    };
    
    if (isLoading || !userProfile.isSetupComplete) {
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <HomeScreenSkeleton />
            </SafeAreaView>
        );
    }

    const canDisplayMeters = userProfile.weight && userProfile.height && userProfile.startWeight && userProfile.goalWeight;
    let bmi = 0;
    let wellnessData = null; 
    let waterGoal = 2000;
    if (canDisplayMeters) {
        bmi = calculateBMI(userProfile.weight, userProfile.height);
        // --- MODIFIED: Pass the selectedDate to the calculation ---
        wellnessData = calculateWellnessScores(selectedDayLog, userProfile, selectedDate);
        waterGoal = calculateWaterGoal(userProfile);
    }
    
    const chartColors = {
        grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)',
        label: colors.textSecondary,
        stroke: theme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.2)',
        facetBase: [COLORS.primary, COLORS.secondary, "#10B981", "#F59E0B", "#EF476F"],
        gradientFrom: COLORS.secondary,
        gradientTo: COLORS.primary,
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <WeightLogModal 
                isVisible={isWeightModalVisible}
                onClose={() => setWeightModalVisible(false)}
                onLogWeight={handleLogWeight}
                weightLog={appData.weightLog}
                currentWeight={userProfile.weight}
            />
            <WeekdaySlider />
            <Animated.ScrollView contentContainerStyle={styles.container} style={{opacity: fadeAnim}}>
                <View style={styles.header}>
                    <Text style={[FONTS.h1, { color: colors.text }]}>Dashboard</Text>
                </View>
                
                {canDisplayMeters && wellnessData && (
                    <Card title="Daily Wellness Genome">
                        <WellnessRadarChart 
                            data={wellnessData} 
                            colors={chartColors}
                            size={screenWidth - 64}
                            padding={32}
                        />
                    </Card>
                )}
                
                {canDisplayMeters ? (
                    <>
                        <BMIMeter bmi={bmi} />
                        <WeightProgressMeter 
                            start={userProfile.startWeight} 
                            current={userProfile.weight} 
                            goal={userProfile.goalWeight} 
                            onPressCurrent={() => setWeightModalVisible(true)}
                        />
                    </>
                ) : (
                    <Card title="Complete Your Profile">
                        <Text style={[FONTS.body1, {color: colors.text, textAlign: 'center', marginBottom: 20}]}>
                            Please go to settings to complete your profile to enable personalized tracking.
                        </Text>
                        <Button title="Go to Settings" onPress={() => navigation.navigate('Settings')} color={COLORS.primary} />
                    </Card>
                )}

                {canDisplayMeters && (
                    <>
                        <Card title="Water Intake">
                           <WaterLogger 
                                currentIntake={selectedDayLog.waterIntake || 0}
                                goal={waterGoal}
                                onLogWater={handleLogWater}
                           />
                        </Card>
                        <Card title="Sleep">
                            <SleepLogger
                                loggedHours={selectedDayLog.sleepHours || 0}
                                onLogSleep={updateSleep}
                            />
                        </Card>
                    </>
                )}

                <Card title="How are you feeling today?">
                    <View style={styles.moodContainer}>
                        <MoodButton mood="Happy" icon="😄" currentMood={selectedDayLog.mood} onPress={handleSetMood} />
                        <MoodButton mood="Calm" icon="😌" currentMood={selectedDayLog.mood} onPress={handleSetMood} />
                        <MoodButton mood="Tired" icon="😴" currentMood={selectedDayLog.mood} onPress={handleSetMood} />
                        <MoodButton mood="Stressed" icon="😫" currentMood={selectedDayLog.mood} onPress={handleSetMood} />
                        <MoodButton mood="Sad" icon="😢" currentMood={selectedDayLog.mood} onPress={handleSetMood} />
                    </View>
                </Card>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { padding: 16, paddingBottom: 120 },
    header: { paddingVertical: 10, marginBottom: 10 },
    card: { 
        borderRadius: 16, 
        padding: 16,
        marginBottom: 16, 
        elevation: 3, 
        alignItems: 'center'
    },
    cardTitle: { 
        ...FONTS.h3, 
        marginBottom: 12,
        alignSelf: 'flex-start'
    },
    moodContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    moodButton: { alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 2, borderColor: 'transparent' },
    moodButtonSelected: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}20` },
    moodIcon: { fontSize: 30 },
    moodText: { marginTop: 4, fontSize: 12 },
});

export default HomeScreen;
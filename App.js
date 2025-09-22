// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { StatusBar, View, ActivityIndicator, Alert } from 'react-native';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { VoiceModal } from './components/VoiceModal';

const AppContent = () => {
    const { appData, isReady, updateWater, updateSleep, setMoodForDate, addMealFromVoice } = useData();
    const [isVoiceModalVisible, setVoiceModalVisible] = useState(false);
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        if (isReady) {
            const route = appData.userProfile.isSetupComplete ? 'Main' : 'Onboarding';
            setInitialRoute(route);
        }
    }, [isReady, appData.userProfile.isSetupComplete]);
    
    const handleVoiceCommand = useCallback((command) => {
        if (!command || !command.type || command.type === 'UNKNOWN') {
             Alert.alert("Sorry", "I couldn't quite catch that. Please try again.");
             return;
        }
        switch (command.type) {
            case 'LOG_WATER':
                updateWater(command.payload.amount);
                Alert.alert("Water Logged!", `${command.payload.amount > 0 ? 'Added' : 'Removed'} ${Math.abs(command.payload.amount)}ml of water.`);
                break;
            case 'LOG_SLEEP':
                updateSleep(command.payload.hours);
                Alert.alert("Sleep Logged!", `${command.payload.hours} hours of sleep has been logged.`);
                break;
            case 'SET_MOOD':
                setMoodForDate(command.payload.mood);
                Alert.alert("Mood Logged!", `Your mood has been set to ${command.payload.mood}.`);
                break;
            case 'ADD_MEAL':
                addMealFromVoice(command.payload);
                Alert.alert("Meal Logged!", `"${command.payload.name}" was added to your ${command.payload.category}.`);
                break;
            default:
                Alert.alert("Sorry", "I didn't understand that command.");
                break;
        }
    }, [updateWater, updateSleep, setMoodForDate, addMealFromVoice]);

    if (!isReady || !initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#060C1B' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer key={initialRoute}>
                <StatusBar barStyle="light-content" />
                <AppNavigator 
                    initialRouteName={initialRoute}
                    onVoiceButtonPress={() => setVoiceModalVisible(true)}
                />
            </NavigationContainer>
            <VoiceModal 
                isVisible={isVoiceModalVisible} 
                onClose={() => setVoiceModalVisible(false)} 
                onCommand={handleVoiceCommand}
            />
        </View>
    );
};

const App = () => (
    <ThemeProvider>
        <DataProvider>
            <AppContent />
        </DataProvider>
    </ThemeProvider>
);

export default App;
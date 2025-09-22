// components/VoiceModal.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Easing, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceCommand } from '../utils/voiceParser';

export const VoiceModal = ({ isVisible, onClose, onCommand }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const { isRecognizing, recognizedText, startRecognition, stopRecognition, error } = useVoiceRecognition();

    useEffect(() => {
        if (isVisible) {
            startRecognition();
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
                ])
            ).start();
        } else {
            stopRecognition();
            pulseAnim.setValue(1);
        }
    }, [isVisible]);

    useEffect(() => {
        const processCommand = () => {
            if (recognizedText) {
                const result = parseVoiceCommand(recognizedText);
                onCommand(result);
                onClose();
            }
        };

        if (!isRecognizing && recognizedText) {
            processCommand();
        }
    }, [isRecognizing, recognizedText]);

    const getDisplayText = () => {
        // --- THIS IS THE FIX ---
        // Provide clearer feedback to the user on error.
        if (error) return "Sorry, I didn't catch that.\nPlease try again.";
        if (isRecognizing) return recognizedText || 'Listening...';
        if (recognizedText) return recognizedText;
        return 'Tap screen to cancel';
    };

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.container} onPress={onClose}>
                <View style={styles.content}>
                    <Text style={styles.recognizedText}>
                        {getDisplayText()}
                    </Text>
                    <Animated.View style={[styles.micContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="mic" size={40} color="white" />
                    </Animated.View>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    content: {
        alignItems: 'center',
        paddingBottom: 100,
        width: '100%',
    },
    recognizedText: {
        ...FONTS.h2,
        color: 'white',
        marginBottom: 30,
        paddingHorizontal: 20,
        textAlign: 'center',
        minHeight: 40,
    },
    micContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
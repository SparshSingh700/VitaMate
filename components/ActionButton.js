// components/ActionButton.js
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

const ActionButton = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={styles.button}>
                <Ionicons name="mic-outline" size={32} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

export default ActionButton;
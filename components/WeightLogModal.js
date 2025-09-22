import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Button } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONTS } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';

export const WeightLogModal = ({ isVisible, onClose, onLogWeight, weightLog, currentWeight }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    const [weightInput, setWeightInput] = useState(currentWeight.toString());

    useEffect(() => {
        if (isVisible) {
            setWeightInput(currentWeight.toString());
        }
    }, [isVisible, currentWeight]);

    const handleLog = () => {
        const weight = parseFloat(weightInput);
        if (!isNaN(weight) && weight > 0) {
            onLogWeight(weight);
        }
    };
    
    const adjustWeight = (amount) => {
        const current = parseFloat(weightInput) || currentWeight;
        const newWeight = parseFloat((current + amount).toFixed(1));
        setWeightInput(newWeight.toString());
    };

    const chartData = weightLog.slice(-7).map(entry => ({
        value: entry.weight,
        label: new Date(entry.date).getDate(),
    }));

    return (
        <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
                <View style={[styles.modalView, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Log New Weight</Text>
                    
                    {chartData.length > 1 && (
                        <View style={styles.chartContainer}>
                            <LineChart
                                data={chartData}
                                height={100}
                                color={COLORS.primary}
                                thickness={3}
                                yAxisLabelSuffix=" kg"
                                hideDataPoints
                                hideRules
                                hideYAxisText
                                initialSpacing={10}
                                endSpacing={10}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TouchableOpacity onPress={() => adjustWeight(-0.1)} style={styles.adjustButton}>
                            <Ionicons name="remove-circle" size={44} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            value={weightInput}
                            onChangeText={setWeightInput}
                            keyboardType="numeric"
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => adjustWeight(0.1)} style={styles.adjustButton}>
                            <Ionicons name="add-circle" size={44} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.unitText, { color: colors.textSecondary }]}>kg</Text>
                    
                    <View style={styles.logButton}>
                        <Button title="Log Weight" onPress={handleLog} color={COLORS.primary}/>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: { margin: 20, borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { ...FONTS.h2, marginBottom: 20 },
    chartContainer: { height: 100, width: '100%', marginBottom: 20, paddingHorizontal: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    adjustButton: { padding: 10 },
    input: { ...FONTS.h1, fontSize: 48, fontWeight: 'bold', minWidth: 100, textAlign: 'center', borderBottomWidth: 2, paddingBottom: 8 },
    unitText: { ...FONTS.body1, marginTop: 4, marginBottom: 25 },
    logButton: { width: '100%' }
});
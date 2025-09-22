import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BMIMeter = ({ bmi }) => {
  const getBmiInfo = () => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3498db', progress: (bmi / 18.5) * 25 };
    if (bmi < 25) return { category: 'Normal', color: '#2ecc71', progress: 25 + ((bmi - 18.5) / 6.5) * 25 };
    if (bmi < 30) return { category: 'Overweight', color: '#f1c40f', progress: 50 + ((bmi - 25) / 5) * 25 };
    return { category: 'Obese', color: '#e74c3c', progress: Math.min(75 + ((bmi - 30) / 5) * 25, 100) };
  };

  const { category, color, progress } = getBmiInfo();

  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardTitle}>BMI</Text>
      <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
      <Text style={styles.bmiCategory}>{category}</Text>
      
      <View style={styles.meterContainer}>
        {/* --- THIS IS THE FIX: The triangle now points down from above --- */}
        <View style={[styles.indicator, { left: `${Math.max(0, Math.min(progress, 97))}%` }]} />
        <View style={styles.meterBackground} />
        <View style={styles.labelsContainer}>
          <Text style={styles.label}>18.5</Text>
          <Text style={styles.label}>25</Text>
          <Text style={styles.label}>30</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    position: 'absolute',
    top: 15,
    left: 15,
  },
  bmiValue: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  bmiCategory: {
    fontSize: 18,
    color: 'white',
    marginTop: 4,
    fontWeight: '600',
  },
  meterContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center', // Center the contents
  },
  meterBackground: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    marginTop: 12, // Add space for the triangle
  },
  indicator: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12, // Points down
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    top: 0, // Position at the top of the container
    zIndex: 1,
    transform: [{ translateX: -8 }], // Center the triangle on the line
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '12.5%',
    marginTop: 4,
  },
  label: {
    color: 'white',
    fontSize: 12,
  },
});

export default BMIMeter;
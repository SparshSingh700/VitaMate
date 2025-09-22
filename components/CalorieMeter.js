import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalorieMeter = ({ goal, eaten, burned }) => {
  const remaining = goal - eaten + burned;
  const progressPercentage = goal > 0 ? (eaten / goal) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.column}>
          <Text style={styles.value}>{goal}</Text>
          <Text style={styles.label}>Goal</Text>
        </View>
        <Text style={styles.operator}>-</Text>
        <View style={styles.column}>
          <Text style={styles.value}>{eaten}</Text>
          <Text style={styles.label}>Eaten</Text>
        </View>
        <Text style={styles.operator}>+</Text>
        <View style={styles.column}>
          <Text style={styles.value}>{burned}</Text>
          <Text style={styles.label}>Burned</Text>
        </View>
        <Text style={styles.operator}>=</Text>
        <View style={styles.column}>
          <Text style={[styles.value, styles.remainingValue]}>{remaining}</Text>
          <Text style={styles.label}>Remaining</Text>
        </View>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    marginTop: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 5,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // --- THIS IS THE FIX: Aligns numbers and operators correctly ---
    alignItems: 'baseline', 
  },
  column: {
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  remainingValue: {
    color: '#2ecc71',
  },
  label: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
  operator: {
    fontSize: 24,
    color: 'gray',
    marginHorizontal: 8,
  },
});

export default CalorieMeter;
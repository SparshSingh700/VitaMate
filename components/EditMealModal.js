import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const EditMealModal = ({ meal, visible, onClose, onSave }) => {
  const [portion, setPortion] = useState('');

  useEffect(() => {
    if (meal) {
      setPortion(meal.portion.toString());
    }
  }, [meal]);

  if (!meal) {
    return null;
  }

  const handleSave = () => {
    const newPortion = parseFloat(portion) || 0;
    onSave(meal, newPortion);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#ccc" />
          </TouchableOpacity>
          <Text style={styles.productName}>Edit Portion</Text>
          <Text style={styles.mealName}>{meal.name}</Text>
          <View style={styles.portionInputContainer}>
            <TextInput
              style={styles.portionInput}
              value={portion}
              onChangeText={setPortion}
              keyboardType="numeric"
            />
            <Text style={styles.portionUnit}>{meal.unit || 'g'}</Text>
          </View>
          <Button title="Save Changes" onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  productName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  mealName: { fontSize: 16, color: 'gray', marginBottom: 20 },
  portionInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  portionInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: 80, textAlign: 'center', fontSize: 18 },
  portionUnit: { fontSize: 18, marginLeft: 10 },
});
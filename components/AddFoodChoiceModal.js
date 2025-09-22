import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AddFoodChoiceModal = ({ visible, onClose, onSearch, onScan, onRecent, onMyRecipes }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Food</Text>
          <TouchableOpacity style={styles.optionButton} onPress={onSearch}>
            <Ionicons name="search-outline" size={24} color="#5E5CE6" />
            <Text style={styles.optionText}>Search by Name</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={onScan}>
            <Ionicons name="barcode-outline" size={24} color="#5E5CE6" />
            <Text style={styles.optionText}>Scan a Barcode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={onRecent}>
            <Ionicons name="time-outline" size={24} color="#5E5CE6" />
            <Text style={styles.optionText}>Recent Items</Text>
          </TouchableOpacity>
          {/* This now correctly calls the onMyRecipes function */}
          <TouchableOpacity style={styles.optionButton} onPress={onMyRecipes}>
            <Ionicons name="book-outline" size={24} color="#5E5CE6" />
            <Text style={styles.optionText}>My Recipes</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalView: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  optionText: { fontSize: 18, marginLeft: 16 },
});
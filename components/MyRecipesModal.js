import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const MyRecipesModal = ({ visible, onClose, onRecipeSelect, recipes }) => {
  const navigation = useNavigation();

  const handleSelect = (recipe) => {
    // --- FIX: Call the onRecipeSelect callback function ---
    onRecipeSelect(recipe);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultCalories}>{item.totalCalories} kcal • {item.ingredients.length} ingredients</Text>
        </View>
        <Ionicons name="add-circle-outline" size={24} color="#5E5CE6" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => {
            onClose(); // Close this modal first
            navigation.navigate('CreateRecipe', { recipeId: item.id }); // Then navigate to the edit screen
        }}
      >
        <Ionicons name="pencil-outline" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Recipes</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={30} color="#5E5CE6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't created any recipes yet.</Text>}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  list: { paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  resultItem: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  resultName: { fontSize: 16, fontWeight: '500' },
  resultCalories: { fontSize: 14, color: 'gray', marginTop: 4 },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 40 },
  editButton: { padding: 16, },
});
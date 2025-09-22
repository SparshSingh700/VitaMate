import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RecentItemsModal = ({ visible, onClose, onFoodSelect, foodCache, onDeleteRecent }) => {
  
  const recentItems = useMemo(() => {
    if (!foodCache) return [];
    const allItems = Object.entries(foodCache).map(([id, details]) => ({
      ...details,
      id,
    }));
    const uniqueItems = Array.from(new Map(allItems.map(item => [item.name, item])).values());
    return uniqueItems.reverse();
  }, [foodCache]);

  const handleSelect = (foodItem) => {
    onFoodSelect(foodItem);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.resultName}>{item.name}</Text>
          {/* --- FIX: Correctly display unit for recipes --- */}
          <Text style={styles.resultCalories}>
            {item.calories} kcal {item.isRecipe ? 'per serving' : 'per 100g'}
          </Text>
        </View>
        <Ionicons name="add-circle-outline" size={24} color="#5E5CE6" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteRecent(item)}>
        <Ionicons name="trash-bin-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recent & Cached</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={30} color="#5E5CE6" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={recentItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>No items in cache.</Text>}
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
  deleteButton: { padding: 16, },
});
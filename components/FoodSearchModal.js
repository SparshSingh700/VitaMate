// components/FoodSearchModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchUsdaProductsByName } from '../services/api/usda.js';
import { useDebounce } from '../hooks/useDebounce';
import FoodSearchSkeleton from './FoodSearchSkeleton'; // --- NEW: Import skeleton ---

export const FoodSearchModal = ({ visible, onClose, onFoodSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            const searchResults = await searchUsdaProductsByName(debouncedQuery);
            setResults(searchResults);
            setIsLoading(false);
        };
        search();
    }, [debouncedQuery]);

    const handleSelect = (foodItem) => {
        setQuery('');
        setResults([]);
        onFoodSelect(foodItem);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCalories}>{item.calories} kcal per 100g</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Add Food</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={30} color="#5E5CE6" />
                    </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search for a food..."
                        style={styles.searchInput}
                        value={query}
                        onChangeText={setQuery}
                        autoFocus
                    />
                </View>
                {/* --- UPDATED: Use FoodSearchSkeleton instead of ActivityIndicator --- */}
                {isLoading ? (
                    <FoodSearchSkeleton />
                ) : (
                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<Text style={styles.emptyText}>No results found.</Text>}
                        contentContainerStyle={styles.list}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, margin: 16, paddingHorizontal: 10 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 50, fontSize: 18 },
    list: { paddingHorizontal: 16 },
    resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    resultName: { fontSize: 16, fontWeight: '500' },
    resultCalories: { fontSize: 14, color: 'gray', marginTop: 4 },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 40 },
});
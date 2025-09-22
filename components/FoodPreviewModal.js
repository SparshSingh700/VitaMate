import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FoodPreviewModal = ({ product, visible, onClose, onAdd }) => {
  const [portion, setPortion] = useState('1');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('g');

  const isRecipe = product?.isRecipe;

  useEffect(() => {
    if (product) {
      setName(product.name);
      // --- FIX: Set portion and unit based on whether it's a recipe ---
      if (isRecipe) {
        setPortion('1'); // Recipes default to 1 serving
        setUnit('serving');
      } else {
        setPortion('100');
        setUnit('g');
      }
    }
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    const finalPortion = parseFloat(portion) || 1;
    
    // Calculate final nutrition based on whether it's a recipe or a standard item
    const baseCalories = isRecipe ? product.calories : (product.calories / 100);
    const baseProtein = isRecipe ? product.protein : (product.protein / 100);
    const baseCarbs = isRecipe ? product.carbs : (product.carbs / 100);
    const baseFat = isRecipe ? product.fat : (product.fat / 100);
    
    const multiplier = isRecipe ? finalPortion : finalPortion;

    onAdd({
      ...product,
      name,
      calories: Math.round(baseCalories * multiplier),
      protein: parseFloat((baseProtein * multiplier).toFixed(1)),
      carbs: parseFloat((baseCarbs * multiplier).toFixed(1)),
      fat: parseFloat((baseFat * multiplier).toFixed(1)),
      portion: finalPortion,
      unit,
    });
  };

  const calculatedCalories = (isRecipe ? product.calories : (product.calories / 100)) * (parseFloat(portion) || 0);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={30} color="#ccc" />
          </TouchableOpacity>
          <TextInput style={styles.productNameInput} value={name} onChangeText={setName} />
          
          <Text style={styles.baseInfo}>
            {isRecipe ? `Nutrients per 1 serving` : `Base Nutrients (per 100g)`}
          </Text>
          
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientLabel}>Calories</Text>
            <Text style={styles.nutrientValue}>{product.calories || 0} kcal</Text>
          </View>
          {/* You can add more nutrient displays here if you want */}
          
          <Text style={styles.portionHeader}>Your Portion</Text>
          <View style={styles.portionInputContainer}>
            <TextInput style={styles.portionInput} value={portion} onChangeText={setPortion} keyboardType="numeric" />
            
            {/* --- FIX: Show "serving(s)" for recipes, g/ml for others --- */}
            {isRecipe ? (
              <Text style={styles.portionUnit}>serving(s)</Text>
            ) : (
              <View style={styles.unitSelector}>
                <TouchableOpacity onPress={() => setUnit('g')} style={[styles.unitButton, unit === 'g' && styles.unitButtonActive]}><Text style={[styles.unitText, unit === 'g' && styles.unitTextActive]}>g</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setUnit('ml')} style={[styles.unitButton, unit === 'ml' && styles.unitButtonActive]}><Text style={[styles.unitText, unit === 'ml' && styles.unitTextActive]}>ml</Text></TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.totalCalories}>Total Calories: {Math.round(calculatedCalories)} kcal</Text>
          <Button title="Add to Log" onPress={handleAdd} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, paddingVertical: 25, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  productNameInput: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', width: '100%', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8 },
  baseInfo: { fontSize: 14, color: 'gray', marginBottom: 15 },
  nutrientRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8, paddingHorizontal: 10 },
  nutrientLabel: { fontSize: 16, fontWeight: '500', color: '#333' },
  nutrientValue: { fontSize: 16, color: '#666' },
  portionHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  portionInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  portionInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, width: 80, textAlign: 'center', fontSize: 18 },
  unitSelector: { flexDirection: 'row', marginLeft: 10, borderWidth: 1, borderColor: '#5E5CE6', borderRadius: 8, overflow: 'hidden' },
  unitButton: { paddingVertical: 10, paddingHorizontal: 15 },
  unitButtonActive: { backgroundColor: '#5E5CE6' },
  unitText: { fontSize: 16, color: '#5E5CE6' },
  unitTextActive: { color: 'white' },
  portionUnit: { fontSize: 18, marginLeft: 10 },
  totalCalories: { fontSize: 18, fontWeight: 'bold', marginBottom: 25, color: '#5E5CE6' },
});
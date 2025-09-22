import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, TouchableOpacity, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { FoodSearchModal } from '../components/FoodSearchModal.js';
import { FoodPreviewModal } from '../components/FoodPreviewModal.js';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';

const CreateRecipeScreen = () => {
  const { appData, setAppData } = useData();
  const navigation = useNavigation();
  const route = useRoute();
  const recipeId = route.params?.recipeId;
  const { theme } = useTheme();
  const colors = COLORS[theme];

  const [recipeName, setRecipeName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);

  useEffect(() => {
    if (recipeId) {
      const existingRecipe = appData.recipes.find(r => r.id === recipeId);
      if (existingRecipe) {
        setRecipeName(existingRecipe.name);
        setIngredients(existingRecipe.ingredients);
      }
    }
  }, [recipeId, appData.recipes]);

  const handleFoodSelected = (foodItem) => {
    setSearchVisible(false);
    setPreviewProduct(foodItem);
  };

  const handleConfirmAddIngredient = (ingredientData) => {
    const ingredientWithUniqueId = { ...ingredientData, uniqueListId: Date.now() + Math.random() };
    setIngredients(currentIngredients => [...currentIngredients, ingredientWithUniqueId]);
    setPreviewProduct(null);
  };

  const handleSaveRecipe = () => {
    if (recipeName.trim() === '') return Alert.alert('Missing Name', 'Please give your recipe a name.');
    if (ingredients.length === 0) return Alert.alert('No Ingredients', 'Please add at least one ingredient.');
    const totalNutrition = ingredients.reduce((totals, item) => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;
        return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const newRecipe = {
      id: recipeId || Date.now(),
      name: recipeName.trim(),
      ingredients: ingredients,
      totalCalories: Math.round(totalNutrition.calories),
      totalProtein: parseFloat(totalNutrition.protein.toFixed(1)),
      totalCarbs: parseFloat(totalNutrition.carbs.toFixed(1)),
      totalFat: parseFloat(totalNutrition.fat.toFixed(1)),
    };
    setAppData(prevData => {
      if (recipeId) {
        const updatedRecipes = prevData.recipes.map(r => r.id === recipeId ? newRecipe : r);
        return { ...prevData, recipes: updatedRecipes };
      } else {
        return { ...prevData, recipes: [...prevData.recipes, newRecipe] };
      }
    });
    Alert.alert('Recipe Saved!', `"${newRecipe.name}" has been saved.`);
    navigation.goBack();
  };

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    ingredients.forEach(item => {
        calories += item.calories || 0;
        protein += item.protein || 0;
        carbs += item.carbs || 0;
        fat += item.fat || 0;
    });
    return { calories: Math.round(calories), protein: parseFloat(protein.toFixed(1)), carbs: parseFloat(carbs.toFixed(1)), fat: parseFloat(fat.toFixed(1)) };
  }, [ingredients]);

  return (
    <>
      <FoodSearchModal visible={isSearchVisible} onClose={() => setSearchVisible(false)} onFoodSelect={handleFoodSelected} />
      <FoodPreviewModal visible={!!previewProduct} product={previewProduct} onClose={() => setPreviewProduct(null)} onAdd={handleConfirmAddIngredient} />
      
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.container}>
          <View style={styles.formContainer}>
            <TextInput 
              style={[styles.recipeNameInput, { backgroundColor: colors.card, color: colors.text }]} 
              placeholder="Recipe Name (e.g., Protein Shake)" 
              placeholderTextColor={colors.textSecondary}
              value={recipeName} 
              onChangeText={setRecipeName} 
            />
            <TouchableOpacity style={styles.addIngredientButton} onPress={() => setSearchVisible(true)}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addIngredientButtonText}>Add Ingredient</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <Text style={[FONTS.h2, styles.listHeader, { color: colors.text }]}>Ingredients</Text>
            {ingredients.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No ingredients added yet.</Text>
            ) : (
              ingredients.map((item) => (
                <View key={item.uniqueListId} style={[styles.ingredientItem, { backgroundColor: colors.card }]}>
                  <Text style={[styles.ingredientName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.ingredientDetails, { color: colors.textSecondary }]}>{item.calories} kcal ({item.portion}{item.unit})</Text>
                  <TouchableOpacity onPress={() => setIngredients(current => current.filter(ing => ing.uniqueListId !== item.uniqueListId))}>
                    <Ionicons name="close-circle" size={24} color={COLORS.obese} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        <View style={[styles.footerContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.summaryContainer}>
            <Text style={[FONTS.h3, styles.summaryTitle, { color: colors.text }]}>Recipe Totals</Text>
            <Text style={{ color: colors.textSecondary }}>Calories: {totals.calories} kcal</Text>
            <Text style={{ color: colors.textSecondary }}>Protein: {totals.protein}g, Carbs: {totals.carbs}g, Fat: {totals.fat}g</Text>
          </View>
          <View style={styles.footer}>
            <Button title={recipeId ? "Update Recipe" : "Save Recipe"} onPress={handleSaveRecipe} color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  formContainer: { padding: 16 },
  recipeNameInput: { padding: 15, borderRadius: 12, ...FONTS.body1, marginBottom: 16 },
  addIngredientButton: { flexDirection: 'row', backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  addIngredientButtonText: { color: 'white', ...FONTS.body1, fontWeight: 'bold', marginLeft: 8 },
  listContainer: { paddingHorizontal: 16 },
  listHeader: { marginTop: 16, marginBottom: 8 },
  ingredientItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 8 },
  ingredientName: { ...FONTS.body1, fontWeight: '500', flex: 1 },
  ingredientDetails: { ...FONTS.body2, marginHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 20 },
  footerContainer: { borderTopWidth: 1 },
  summaryContainer: { padding: 16 },
  summaryTitle: { marginBottom: 8 },
  footer: { padding: 16, paddingTop: 0 },
});

export default CreateRecipeScreen;
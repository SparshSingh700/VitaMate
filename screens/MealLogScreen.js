// screens/MealLogScreen.js
import React, { useState, useMemo } from 'react';
// --- NEW: Import LayoutAnimation for smooth list updates ---
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal.js';
import { getProductByBarcode } from '../services/api/openFoodFacts';
import { FoodPreviewModal } from '../components/FoodPreviewModal.js';
import { EditMealModal } from '../components/EditMealModal.js';
import { FoodSearchModal } from '../components/FoodSearchModal.js';
import { AddFoodChoiceModal } from '../components/AddFoodChoiceModal.js';
import { RecentItemsModal } from '../components/RecentItemsModal.js';
import { MyRecipesModal } from '../components/MyRecipesModal.js';
import CalorieMeter from '../components/CalorieMeter.js';
import WeekdaySlider from '../components/WeekdaySlider';

// --- NEW: Enable LayoutAnimation for Android ---
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SwipeableRow = ({ children, onDelete }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];
    return (
        <View style={[styles.rowContainer, { backgroundColor: colors.card }]}>
            <View style={styles.itemContent}>{children}</View>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const MealLogScreen = ({ navigation }) => {
    const { appData, setAppData, initialDayData, selectedDate, getDateString } = useData();
    const { theme } = useTheme();
    const colors = COLORS[theme];
    
    const [isChoiceModalVisible, setChoiceModalVisible] = useState(false);
    const [isRecentModalVisible, setRecentModalVisible] = useState(false);
    const [isRecipesModalVisible, setRecipesModalVisible] = useState(false);
    const [isScannerVisible, setScannerVisible] = useState(false);
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [previewProduct, setPreviewProduct] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [editingMeal, setEditingMeal] = useState(null);

    const selectedDateString = getDateString(selectedDate);
    const selectedDayLog = appData.dailyLogs[selectedDateString] || initialDayData;

    const caloriesEaten = useMemo(() => {
        if (!selectedDayLog || !selectedDayLog.meals) return 0;
        return Object.values(selectedDayLog.meals).flat().reduce((sum, item) => sum + item.calories, 0);
    }, [selectedDayLog.meals]);

    const caloriesBurned = useMemo(() => {
        if (!selectedDayLog || !selectedDayLog.workouts) return 0;
        return selectedDayLog.workouts.reduce((sum, item) => sum + (item.duration * 10), 0);
    }, [selectedDayLog.workouts]);

    const addMealToLog = (mealData, category) => { 
        const newMeal = { id: Date.now() + Math.random(), apiId: mealData.id, base: { calories: mealData.isRecipe ? mealData.calories : (mealData.calories / (mealData.portion / 100)), protein: mealData.isRecipe ? mealData.protein : (mealData.protein / (mealData.portion / 100)), carbs: mealData.isRecipe ? mealData.carbs : (mealData.carbs / (mealData.portion / 100)), fat: mealData.isRecipe ? mealData.fat : (mealData.fat / (mealData.portion / 100)), }, ...mealData, timestamp: new Date().toISOString(), }; 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // --- NEW: Animate the change ---
        setAppData(prevData => { 
            const dayLog = prevData.dailyLogs[selectedDateString] || initialDayData; 
            const updatedCategory = [...dayLog.meals[category], newMeal]; 
            let newFoodCache = { ...prevData.foodCache }; 
            if (mealData.isRecipe) { newFoodCache[mealData.id] = { name: mealData.name, calories: mealData.calories, protein: mealData.protein, carbs: mealData.carbs, fat: mealData.fat, isRecipe: true, }; } else if (mealData.id) { newFoodCache[mealData.id] = { name: mealData.name, calories: (mealData.calories / (mealData.portion / 100)), protein: (mealData.protein / (mealData.portion / 100)), carbs: (mealData.carbs / (mealData.portion / 100)), fat: (mealData.fat / (mealData.portion / 100)), }; } 
            return { ...prevData, foodCache: newFoodCache, dailyLogs: { ...prevData.dailyLogs, [selectedDateString]: { ...dayLog, meals: { ...dayLog.meals, [category]: updatedCategory } } } }; 
        }); 
    };

    const handleFoodSelected = (foodItem) => { setSearchVisible(false); setRecentModalVisible(false); setRecipesModalVisible(false); setPreviewProduct(foodItem); };
    const handleRecipeSelected = (recipe) => { setRecipesModalVisible(false); const recipeAsProduct = { id: recipe.id, name: recipe.name, calories: recipe.totalCalories, protein: recipe.totalProtein, carbs: recipe.totalCarbs, fat: recipe.totalFat, isRecipe: true, }; setPreviewProduct(recipeAsProduct); }
    const handleBarcodeScanned = async (barcodeData) => { setScannerVisible(false); setIsFetching(true); const product = await getProductByBarcode(barcodeData, appData, setAppData); setIsFetching(false); if (product && product.status !== 'not_found') { setActiveCategory('snacks'); setPreviewProduct(product); } else { Alert.alert('Product Not Found', `Could not find a product for barcode ${barcodeData}. Would you like to add it manually?`, [{ text: "Cancel", style: "cancel" }, { text: "Add Manually", onPress: () => setSearchVisible(true) }]); } };
    const handleConfirmAddMeal = (mealDataFromModal) => { if (!activeCategory) return; addMealToLog(mealDataFromModal, activeCategory); setPreviewProduct(null); setActiveCategory(null); };
    
    const handleDeleteMeal = (mealId, category) => { 
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // --- NEW: Animate the change ---
        setAppData(prevData => { 
            const dayLog = prevData.dailyLogs[selectedDateString]; 
            const updatedCategory = dayLog.meals[category].filter(meal => meal.id !== mealId); 
            return { ...prevData, dailyLogs: { ...prevData.dailyLogs, [selectedDateString]: { ...dayLog, meals: { ...dayLog.meals, [category]: updatedCategory } } } }; 
        }); 
    };

    const handleUpdateMeal = (mealToUpdate, newPortion) => { setAppData(prevData => { const dayLog = prevData.dailyLogs[selectedDateString]; if (!dayLog) return prevData; let targetCategory, mealIndex; for (const category in dayLog.meals) { const index = dayLog.meals[category].findIndex(m => m.id === mealToUpdate.id); if (index > -1) { targetCategory = category; mealIndex = index; break; } } if (targetCategory === undefined) return prevData; const updatedCategoryMeals = [...dayLog.meals[targetCategory]]; const originalMeal = updatedCategoryMeals[mealIndex]; const base = originalMeal.base; if (base) { const multiplier = newPortion / (originalMeal.isRecipe ? 1 : 100); const updatedMeal = { ...originalMeal, portion: newPortion, calories: Math.round(base.calories * multiplier), protein: parseFloat((base.protein * multiplier).toFixed(1)), carbs: parseFloat((base.carbs * multiplier).toFixed(1)), fat: parseFloat((base.fat * multiplier).toFixed(1)), }; updatedCategoryMeals[mealIndex] = updatedMeal; } return { ...prevData, dailyLogs: { ...prevData.dailyLogs, [selectedDateString]: { ...dayLog, meals: { ...dayLog.meals, [targetCategory]: updatedCategoryMeals }, }, }, }; }); setEditingMeal(null); };
    const handleDeleteFromCache = (foodItem) => { Alert.alert("Remove From Cache", `Are you sure you want to remove "${foodItem.name}" from your cached items?`, [{ text: "Cancel", style: "cancel" }, { text: "Remove", style: "destructive", onPress: () => { setAppData(prevData => { const newFoodCache = { ...prevData.foodCache }; if (newFoodCache[foodItem.id]) { delete newFoodCache[foodItem.id]; } return { ...prevData, foodCache: newFoodCache }; }); } }]); };
    
    const mealSections = Object.keys(selectedDayLog.meals).map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1),
        data: selectedDayLog.meals[key],
        key: key,
    }));

    return (
        <>
            <AddFoodChoiceModal visible={isChoiceModalVisible} onClose={() => setChoiceModalVisible(false)} onSearch={() => { setChoiceModalVisible(false); setSearchVisible(true); }} onScan={() => { setChoiceModalVisible(false); setScannerVisible(true); }} onRecent={() => { setChoiceModalVisible(false); setRecentModalVisible(true); }} onMyRecipes={() => { setChoiceModalVisible(false); setRecipesModalVisible(true); }} />
            <MyRecipesModal visible={isRecipesModalVisible} onClose={() => setRecipesModalVisible(false)} recipes={appData.recipes} onRecipeSelect={handleRecipeSelected} />
            <RecentItemsModal visible={isRecentModalVisible} onClose={() => setRecentModalVisible(false)} onFoodSelect={handleFoodSelected} foodCache={appData.foodCache} onDeleteRecent={handleDeleteFromCache} />
            <BarcodeScannerModal visible={isScannerVisible} onClose={() => setScannerVisible(false)} onBarcodeScanned={handleBarcodeScanned} />
            <FoodSearchModal visible={isSearchVisible} onClose={() => setSearchVisible(false)} onFoodSelect={handleFoodSelected} />
            <FoodPreviewModal visible={!!previewProduct} product={previewProduct} onClose={() => setPreviewProduct(null)} onAdd={handleConfirmAddMeal} />
            <EditMealModal visible={!!editingMeal} meal={editingMeal} onClose={() => setEditingMeal(null)} onSave={handleUpdateMeal} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
                {isFetching && <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />}
                
                <WeekdaySlider />
                
                <ScrollView contentContainerStyle={styles.listContainer}>
                    <CalorieMeter 
                        goal={appData.userProfile.calorieGoal}
                        eaten={caloriesEaten}
                        burned={caloriesBurned}
                    />
                    {mealSections.map((section) => (
                        <View key={section.key}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
                                <TouchableOpacity style={styles.sectionAddButton} onPress={() => { setActiveCategory(section.key); setChoiceModalVisible(true); }}>
                                    <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                                </TouchableOpacity>
                            </View>
                            {section.data.length === 0 ? (
                                <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>No items logged.</Text>
                            ) : (
                                section.data.map(item => (
                                    <SwipeableRow key={item.id} onDelete={() => handleDeleteMeal(item.id, section.key)}>
                                        <View style={styles.mealItem}>
                                            <View style={styles.mealInfo}>
                                                <Text style={[styles.mealName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                                                <Text style={[styles.mealDetails, { color: colors.textSecondary }]}>
                                                    {item.calories} kcal ({item.portion}{item.unit || 'g'})
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setEditingMeal(item)} style={styles.editButton}>
                                                <Ionicons name="pencil" size={20} color={COLORS.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </SwipeableRow>
                                ))
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    listContainer: { paddingHorizontal: 16, paddingBottom: 100 },
    loadingIndicator: { position: 'absolute', top: '50%', left: '50%', zIndex: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginTop: 10 },
    sectionHeaderText: { ...FONTS.h2 },
    sectionAddButton: { padding: 8 },
    rowContainer: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    itemContent: { flex: 1 },
    mealItem: { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mealInfo: { flex: 1, marginRight: 8 },
    mealName: { ...FONTS.body1, fontWeight: '600', flexShrink: 1, marginBottom: 4 },
    mealDetails: { ...FONTS.body2 },
    editButton: { padding: 8, alignSelf: 'center' },
    deleteButton: { backgroundColor: COLORS.obese, justifyContent: 'center', alignItems: 'center', width: 75 },
    emptySectionText: { padding: 16, textAlign: 'center' },
});

export default MealLogScreen;
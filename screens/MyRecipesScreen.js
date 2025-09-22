import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext.js';
import { COLORS, FONTS } from '../constants/Theme.js';

const MyRecipesScreen = () => {
  const { appData } = useData();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = COLORS[theme];

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.recipeItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      onPress={() => navigation.navigate('CreateRecipe', { recipeId: item.id })}
    >
      <View style={{ flex: 1 }}>
        <Text style={[FONTS.h3, { color: colors.text }]}>{item.name}</Text>
        <Text style={[FONTS.body2, { color: colors.textSecondary, marginTop: 4 }]}>
          {item.totalCalories} kcal • {item.ingredients.length} ingredients
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        data={appData.recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={[FONTS.body1, styles.emptyText, { color: colors.textSecondary }]}>
            You haven't created any recipes yet.
          </Text>
        }
        contentContainerStyle={styles.container}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateRecipe', { recipeId: null })}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { padding: 16, paddingBottom: 100 },
  recipeItem: { padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 12 },
  emptyText: { textAlign: 'center', marginTop: 40 },
  addButton: { position: 'absolute', bottom: 40, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, zIndex: 10 },
});

export default MyRecipesScreen;
import axios from 'axios';
import Constants from 'expo-constants';

const findNutrientValue = (nutrients, nutrientIds) => {
  const nutrient = nutrients.find(n => nutrientIds.includes(n.nutrientId));
  return nutrient ? nutrient.value : 0;
};

const calculateRelevanceScore = (food, query) => {
  if (!food.description) {
    return -1000;
  }
  const name = food.description.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let score = 0;

  if (name === lowerQuery) score += 1000;
  else if (name.startsWith(lowerQuery)) score += 500;
  else if (name.includes(` ${lowerQuery}`)) score += 100;

  score -= Math.abs(name.length - lowerQuery.length);

  if (food.dataType === 'Branded' && query.split(' ').length < 3) {
    score -= 50;
  }
  return score;
};

export const searchUsdaProductsByName = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  try {
    console.log(`Searching USDA for: ${query}`);
    const response = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        api_key: Constants.expoConfig.extra.USDA_API_KEY,
        query: query,
        dataType: "Foundation,SR Legacy,Branded",
        pageSize: 50,
      }
    });

    if (response.data.foods && response.data.foods.length > 0) {
      const results = response.data.foods
        .filter(food => food && food.fdcId && food.description)
        .map(food => {
          const nutrients = food.foodNutrients || [];
          const calories = findNutrientValue(nutrients, [1008, 2047]);
          const protein = findNutrientValue(nutrients, [1003]);
          const fat = findNutrientValue(nutrients, [1004]);
          const carbs = findNutrientValue(nutrients, [1005]);

          return {
            id: food.fdcId,
            name: food.description,
            calories: Math.round(calories),
            protein: parseFloat(protein.toFixed(1)),
            carbs: parseFloat(carbs.toFixed(1)),
            fat: parseFloat(fat.toFixed(1)),
          };
        });
      
      const sortedResults = results.sort((a, b) => {
          return calculateRelevanceScore({description: b.name}, query) - calculateRelevanceScore({description: a.name}, query);
      });

      console.log(`Found and sorted ${sortedResults.length} products from USDA.`);
      return sortedResults.slice(0, 20);
    }
    return [];
  } catch (error) {
    console.error('Error searching USDA API:', error);
    return [];
  }
};
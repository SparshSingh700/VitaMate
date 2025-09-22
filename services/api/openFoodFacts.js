import axios from 'axios';

export const getProductByBarcode = async (barcode, appData, setAppData) => {
  // 1. Primary check: Does the exact barcode exist in the cache?
  if (appData.foodCache && appData.foodCache[barcode]) {
    console.log(`Found exact barcode ${barcode} in local cache.`);
    return { ...appData.foodCache[barcode], id: barcode };
  }

  try {
    console.log(`Searching for barcode ${barcode} via API...`);
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (response.data.status === 1 && response.data.product?.product_name) {
      const product = response.data.product;
      const productName = product.product_name;
      const correctBarcode = product.code; // The API tells us the *correct* barcode

      // 2. Fallback check: Does a product with the CORRECT barcode or the same NAME exist?
      const existingCacheEntry = Object.entries(appData.foodCache).find(
        ([key, details]) => key === correctBarcode || details.name === productName
      );

      if (existingCacheEntry) {
        const [existingId, existingDetails] = existingCacheEntry;
        console.log(`Barcode mismatch/new, but found product by name/correct code: "${productName}". Using cached data.`);
        return { ...existingDetails, id: existingId };
      }

      // 3. If no match, this is a new item. Save it to the cache using the CORRECT barcode.
      const productDetails = {
        name: productName,
        calories: product.nutriments['energy-kcal_100g'] || 0,
        protein: product.nutriments.proteins_100g || 0,
        carbs: product.nutriments.carbohydrates_100g || 0,
        fat: product.nutriments.fat_100g || 0,
      };

      console.log(`Saving new product "${productName}" to cache with correct barcode ${correctBarcode}.`);
      setAppData(prevData => ({
        ...prevData,
        foodCache: { ...prevData.foodCache, [correctBarcode]: productDetails },
      }));

      return { ...productDetails, id: correctBarcode };

    } else {
      console.log('Product not found in OpenFoodFacts database.');
      return { status: 'not_found', barcode };
    }
  } catch (error) {
    console.error('Error fetching data from OpenFoodFacts API:', error);
    return null;
  }
};
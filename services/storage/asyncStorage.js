import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A collection of wrapper functions for interacting with AsyncStorage.
 * This makes storing and retrieving data more consistent and handles
 * JSON conversion automatically.
 */

/**
 * Saves a value to AsyncStorage. The value will be converted to a JSON string.
 * @param {string} key - The key to store the value under.
 * @param {any} value - The value to store (can be an object, array, string, etc.).
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data to AsyncStorage:', e);
  }
};

/**
 * Retrieves a value from AsyncStorage. The value will be parsed from a JSON string.
 * @param {string} key - The key of the value to retrieve.
 * @returns {Promise<any|null>} - The retrieved value, or null if it doesn't exist or an error occurs.
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error reading data from AsyncStorage:', e);
    return null;
  }
};

/**
 * Removes a value from AsyncStorage.
 * @param {string} key - The key of the value to remove.
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing data from AsyncStorage:', e);
  }
};
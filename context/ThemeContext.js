import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { storeData, getData } from '../services/storage/asyncStorage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceScheme = useColorScheme(); // 'light' or 'dark'
  const [theme, setTheme] = useState(deviceScheme || 'light');

  // Load saved theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await getData('appTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    storeData('appTheme', newTheme); // Save the new preference
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};

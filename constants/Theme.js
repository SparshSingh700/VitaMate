import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: "#7C3AED",   // Vibrant Purple
  secondary: "#06B6D4", // Vibrant Cyan

  dataColors: ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF476F"],

  // FIX: Polished the Light Theme for a cleaner, more modern aesthetic
  light: {
    background: "#FFFFFF",      // A pure, crisp white background
    card: "#F7F7F8",          // A very light gray for cards to create depth
    text: "#1C1C1E",
    textSecondary: "#8A8A8E",
    border: "#E5E5EA",          // A slightly darker border for better definition
  },
  
  dark: {
    background: "#060C1B",
    card: "#101C32",
    text: "#E8F2FF",
    textSecondary: "#A9A9A9",
    border: "rgba(255, 255, 255, 0.1)",
  },
  
  underweight: "#3498db",
  normal: "#2ecc71",
  overweight: "#f1c40f",
  obese: "#e74c3c",
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,

  h1: 32,
  h2: 24,
  h3: 18,
  body1: 16,
  body2: 14,

  width,
  height,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', lineHeight: 38 },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', lineHeight: 30 },
  h3: { fontSize: SIZES.h3, fontWeight: '600', lineHeight: 22 },
  body1: { fontSize: SIZES.body1, lineHeight: 22 },
  body2: { fontSize: SIZES.body2, lineHeight: 20 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;
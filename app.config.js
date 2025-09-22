// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "VitaMateV4",
    slug: "VitaMateV4",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.sparsh_singh.VitaMateV4",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    // This 'extra' block is the key part
    extra: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      USDA_API_KEY: process.env.USDA_API_KEY,
    },
  },
};
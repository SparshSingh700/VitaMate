// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/Theme';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';

// --- Screen Imports ---
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import MealLogScreen from '../screens/MealLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyRecipesScreen from '../screens/MyRecipesScreen';
import CreateRecipeScreen from '../screens/CreateRecipeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ConversationScreen from '../screens/ConversationScreen';
import WeeklyReviewScreen from '../screens/WeeklyReviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = ({ onVoiceButtonPress }) => {
    const { theme } = useTheme();
    const colors = COLORS[theme];

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: { 
                    backgroundColor: colors.card, borderTopWidth: 0, 
                    elevation: 10,
                    height: 60,
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused, color, size }) => (<Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />) }}/>
            <Tab.Screen name="Workout" component={WorkoutScreen} options={{ tabBarIcon: ({ focused, color, size }) => (<Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={size} color={color} />) }}/>
            <Tab.Screen
                name="Action"
                component={View} // Dummy component
                options={{
                    tabBarButton: (props) => <ActionButton {...props} onPress={onVoiceButtonPress} />,
                }}
            />
            <Tab.Screen name="MealLog" component={MealLogScreen} options={{ title: "Meals", tabBarIcon: ({ focused, color, size }) => (<Ionicons name={focused ? 'fast-food' : 'fast-food-outline'} size={size} color={color} />) }} />
            <Tab.Screen name="Vita" component={ConversationScreen} options={{ tabBarIcon: ({ focused, color, size }) => (<Ionicons name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={size} color={color} />) }}/> 
        </Tab.Navigator>
    );
};

const AppNavigator = ({ initialRouteName, onVoiceButtonPress }) => {
  const { theme, toggleTheme } = useTheme();
  const colors = COLORS[theme];
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Main"
        options={({ navigation, route }) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
            let headerTitle;
            switch(routeName) {
                case 'MealLog': headerTitle = 'Meals'; break;
                case 'Vita': headerTitle = 'Vita Companion'; break;
                case 'Action': headerTitle = 'Home'; break;
                default: headerTitle = routeName;
            }
            return {
              headerTitle,
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}>
                    <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={26} color={colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="menu-outline" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>
              ),
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: 'bold', color: colors.text },
            };
        }}
      >
        {(props) => <MainTabNavigator {...props} onVoiceButtonPress={onVoiceButtonPress} />}
      </Stack.Screen>
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }}/>
      <Stack.Screen name="MyRecipes" component={MyRecipesScreen} options={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} options={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ title: 'Workout in Progress', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} options={{ title: 'Edit Your Plan', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <Stack.Screen name="WeeklyReview" component={WeeklyReviewScreen} options={{ title: 'Weekly Review', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
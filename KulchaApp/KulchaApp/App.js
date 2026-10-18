import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/AuthContext';
import { CartProvider, useCart } from './src/CartContext';
import AuthScreen from './src/screens/AuthScreen';
import MenuScreen from './src/screens/MenuScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (e) => () => <Text style={{ fontSize: 20 }}>{e}</Text>;

function Tabs() {
  const { count } = useCart();
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: colors.primary,
      headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff',
    }}>
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Kulcha Menu', tabBarLabel: 'Menu', tabBarIcon: icon('🫓') }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ tabBarIcon: icon('🛒'), tabBarBadge: count > 0 ? count : undefined }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders', tabBarIcon: icon('📦') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
  if (!user) return <AuthScreen />;
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}>
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Root />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

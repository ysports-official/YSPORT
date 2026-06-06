import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getApp } from 'firebase/app';

import './src/services/FirebaseConfig';

import SplashScreen     from './src/screens/SplashScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import LoginScreen      from './src/screens/LoginScreen';
import MainScreen       from './src/screens/MainScreen';

const Stack = createStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser]             = useState(undefined);

  useEffect(() => {
    const auth = getAuth(getApp());
    const unsub = onAuthStateChanged(auth, u => setUser(u || null));
    return unsub;
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1a4fff" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
            {user ? (
              <Stack.Screen name="Main" component={MainScreen} />
            ) : (
              <>
                <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
                <Stack.Screen name="Login"      component={LoginScreen} />
                <Stack.Screen name="Main"       component={MainScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

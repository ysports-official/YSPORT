import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/services/FirebaseConfig';

import SplashScreen     from './src/screens/SplashScreen';
import RoleSelectScreen from './src/screens/RoleSelectScreen';
import LoginScreen      from './src/screens/LoginScreen';
import RegisterScreen   from './src/screens/RegisterScreen';
import MainScreen       from './src/screens/MainScreen';

const Stack = createStackNavigator();

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.warn('[ErrorBoundary]', e.message, info?.componentStack); }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#e84545', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Uygulama Hatası</Text>
          <Text style={{ color: '#4a6fa5', fontSize: 12, textAlign: 'center' }}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser]             = useState(undefined);

  useEffect(() => {
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
    <ErrorBoundary>
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
                <Stack.Screen name="Register"   component={RegisterScreen} />
                <Stack.Screen name="Main"       component={MainScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

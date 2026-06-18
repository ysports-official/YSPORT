import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen            from './main/HomeScreen';
import MarketScreen          from './main/MarketScreen';
import AthletesScreen        from './main/AthletesScreen';
import SportsScreen          from './main/SportsScreen';
import LiveScreen            from './main/LiveScreen';
import SporcuDashboardScreen from './main/SporcuDashboardScreen';
import ProfileSettingsScreen from './main/ProfileSettingsScreen';
import ContractScreen        from './main/ContractScreen';
import MediaCenterScreen     from './main/MediaCenterScreen';
import OnboardingScreen      from './main/OnboardingScreen';
// AIScreen lazy loaded — WebView/FileSystem native modülleri startup'ta yüklenmesin

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── HomeStack: Ana Sayfa + AI Kamera ───
function HomeStack({ route }) {
  const role = route?.params?.role || 'sporcu';
  const uid  = route?.params?.uid  || '';
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        initialParams={{ role, uid }}
      />
      <Stack.Screen
        name="AICamera"
        getComponent={() => require('./main/AIScreen').default}
      />
      <Stack.Screen name="SporcuDashboard" component={SporcuDashboardScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="ContractView"    component={ContractScreen}        />
      <Stack.Screen name="MediaCenter"     component={MediaCenterScreen}     />
      <Stack.Screen name="Onboarding"      component={OnboardingScreen}      />
    </Stack.Navigator>
  );
}

// ─── Tab Icon ───
function TabIcon({ icon, focused, color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{
        fontSize: focused ? 22 : 20,
        opacity: focused ? 1 : 0.6,
        ...(focused ? { textShadowColor: color, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } } : {}),
      }}>
        {icon}
      </Text>
    </View>
  );
}

export default function MainScreen({ route }) {
  const role = route?.params?.role || 'sporcu';
  const uid  = route?.params?.uid  || '';
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1117',
          borderTopColor: '#1e2d4a',
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 8),
        },
        tabBarActiveTintColor: '#7c6fff',
        tabBarInactiveTintColor: '#4a6fa5',
        tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🏠" focused={focused} color={color} />,
        }}
      >
        {(props) => <HomeStack {...props} route={{ ...props.route, params: { role, uid } }} />}
      </Tab.Screen>

      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarLabel: 'Piyasa',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="💰" focused={focused} color={color} />,
        }}
      />

      <Tab.Screen
        name="Athletes"
        component={AthletesScreen}
        options={{
          tabBarLabel: 'Sporcular',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🏅" focused={focused} color={color} />,
        }}
      />

      <Tab.Screen
        name="Sports"
        component={SportsScreen}
        options={{
          tabBarLabel: 'Spor Dalları',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🏆" focused={focused} color={color} />,
        }}
      />

      <Tab.Screen
        name="Live"
        component={LiveScreen}
        options={{
          tabBarLabel: 'Canlı',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🔴" focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

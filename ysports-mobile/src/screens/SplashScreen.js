import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, StyleSheet, Dimensions, Text } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO = require('../../assets/icon.png');

export default function SplashScreen({ onFinish }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.12, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 150, useNativeDriver: true }),
      ]),
      Animated.delay(250),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.16, duration: 110, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.97, duration: 90,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.10, duration: 90,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 130, useNativeDriver: true }),
      ]),
      Animated.delay(500),
      Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <Animated.Text style={[styles.brand, { opacity }]}>Y SPORTS</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity }]}>
        Küresel Sporcu Değerleme Ekosistemi
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center' },
  logoWrap: { width: width * 0.45, height: width * 0.45, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logo: { width: '100%', height: '100%' },
  brand: { color: '#ffffff', fontSize: 32, fontWeight: '900', letterSpacing: 4, marginBottom: 8 },
  tagline: { color: '#4a6fa5', fontSize: 11, letterSpacing: 1 },
});

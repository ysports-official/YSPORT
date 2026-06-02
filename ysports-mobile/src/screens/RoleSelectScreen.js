import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');
const LOGO = require('../../assets/icon.png');

const ROLES = [
  { key: 'sporcu',     icon: '🏃',  label: 'Sporcu Girişi',        sub: 'Lisans, SGD değerleme ve video takibi', color: '#1a4fff' },
  { key: 'federasyon', icon: '🏛️', label: 'Federasyon Girişi',    sub: 'Lisans tescil ve hakem kurulu kontrolü', color: '#8b2fff' },
  { key: 'kulup',      icon: '🛡️', label: 'Kulüp Girişi',         sub: 'Altyapı, transfer ve yetenek gelişimi', color: '#c9a227' },
  { key: 'temsilci',   icon: '🏙️', label: 'İl Temsilcisi Girişi', sub: 'Akıllı şehir spor koordinasyonu', color: '#00b97a' },
];

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={styles.header}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Y SPORTS</Text>
        <Text style={styles.sub}>Küresel Sporcu Değerleme Ekosistemi</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Giriş Türünü Seçin</Text>
      <View style={styles.roleList}>
        {ROLES.map(role => (
          <TouchableOpacity
            key={role.key}
            style={styles.card}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Login', { role: role.key, roleLabel: role.label, roleColor: role.color })}
          >
            <View style={[styles.iconBox, { backgroundColor: role.color + '22', borderColor: role.color + '55' }]}>
              <Text style={styles.icon}>{role.icon}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{role.label}</Text>
              <Text style={styles.cardSub}>{role.sub}</Text>
            </View>
            <Text style={[styles.arrow, { color: role.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.footer}>© 2025 Y SPORTS • Tüm hakları saklıdır</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b11' },
  header: { alignItems: 'center', paddingTop: 28, paddingBottom: 16 },
  logo: { width: 72, height: 72, marginBottom: 10, borderRadius: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 3 },
  sub: { color: '#4a6fa5', fontSize: 11, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#1e2d4a', marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: '#8ba8d4', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 10 },
  roleList: { paddingHorizontal: 16, gap: 10, flex: 1 },
  card: { backgroundColor: '#161d2e', borderRadius: 16, borderWidth: 1, borderColor: '#1e2d4a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 13, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 22 },
  cardText: { flex: 1 },
  cardLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardSub: { color: '#4a6fa5', fontSize: 11, marginTop: 3, lineHeight: 16 },
  arrow: { fontSize: 24, fontWeight: '700' },
  footer: { color: '#2a3a5a', fontSize: 10, textAlign: 'center', paddingBottom: 20, paddingTop: 10 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PACKAGES = [
  { id: 1, name: 'Starter',    price: '₺2.500/ay',  color: '#1a4fff', features: ['5 Sporcu Takibi', 'Temel SGD Raporu', 'E-posta Desteği'] },
  { id: 2, name: 'Pro',        price: '₺7.500/ay',  color: '#8b2fff', features: ['25 Sporcu Takibi', 'AI Performans Analizi', 'Özel Sözleşme', '7/24 Destek'] },
  { id: 3, name: 'Enterprise', price: 'Özel Fiyat', color: '#c9a227', features: ['Sınırsız Sporcu', 'Beyaz Etiket', 'API Erişimi', 'Özel Entegrasyon'] },
];

const ATHLETES = [
  { name: 'A. Yılmaz',  sport: 'Futbol',   sgd: 8.7, trend: '+12%', color: '#00b97a' },
  { name: 'B. Kaya',    sport: 'Basketbol', sgd: 7.9, trend: '+8%',  color: '#1a4fff' },
  { name: 'C. Demir',   sport: 'Güreş',    sgd: 9.1, trend: '+21%', color: '#8b2fff' },
  { name: 'D. Çelik',   sport: 'Boks',     sgd: 6.4, trend: '-3%',  color: '#e84545' },
];

export default function MarketScreen() {
  const [tab, setTab] = useState('piyasa'); // piyasa | sponsorluk

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Text style={s.title}>💰 Piyasa & Sponsorluk</Text>
      </View>

      {/* Sub Tabs */}
      <View style={s.tabRow}>
        {[['piyasa', 'Sporcu Piyasası'], ['sponsorluk', 'Sponsorluk Paketleri']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[s.tab, tab === key && s.tabActive]} onPress={() => setTab(key)}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'piyasa' ? (
          <>
            <Text style={s.sectionTitle}>GÜNCEL SGD PUANLARI</Text>
            {ATHLETES.map((a, i) => (
              <View key={i} style={s.athleteCard}>
                <View style={[s.avatar, { backgroundColor: a.color + '22', borderColor: a.color + '55' }]}>
                  <Text style={[s.avatarText, { color: a.color }]}>{a.name[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.athleteName}>{a.name}</Text>
                  <Text style={s.athleteSport}>{a.sport}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.sgdScore, { color: a.color }]}>{a.sgd}</Text>
                  <Text style={[s.trend, { color: a.trend.startsWith('+') ? '#00b97a' : '#e84545' }]}>{a.trend}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={s.sectionTitle}>SPONSORLUK PAKETLERİ</Text>
            {PACKAGES.map(pkg => (
              <View key={pkg.id} style={[s.pkgCard, { borderColor: pkg.color + '44' }]}>
                <View style={s.pkgHeader}>
                  <Text style={[s.pkgName, { color: pkg.color }]}>{pkg.name}</Text>
                  <Text style={s.pkgPrice}>{pkg.price}</Text>
                </View>
                {pkg.features.map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <Text style={[s.featureDot, { color: pkg.color }]}>✓</Text>
                    <Text style={s.featureText}>{f}</Text>
                  </View>
                ))}
                <TouchableOpacity style={[s.pkgBtn, { backgroundColor: pkg.color }]}>
                  <Text style={s.pkgBtnText}>Başvur →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#090b11' },
  topbar:       { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  title:        { color: '#fff', fontSize: 16, fontWeight: '800' },
  tabRow:       { flexDirection: 'row', margin: 16, backgroundColor: '#161d2e', borderRadius: 12, padding: 4 },
  tab:          { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabActive:    { backgroundColor: '#1a4fff' },
  tabText:      { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  tabTextActive:{ color: '#fff' },
  scroll:       { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  athleteCard:  { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  avatar:       { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: 18, fontWeight: '900' },
  athleteName:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  athleteSport: { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  sgdScore:     { fontSize: 20, fontWeight: '900' },
  trend:        { fontSize: 11, fontWeight: '700' },
  pkgCard:      { backgroundColor: '#161d2e', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  pkgHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pkgName:      { fontSize: 18, fontWeight: '900' },
  pkgPrice:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDot:   { fontSize: 14, fontWeight: '900' },
  featureText:  { color: '#8ba8d4', fontSize: 13 },
  pkgBtn:       { marginTop: 14, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  pkgBtnText:   { color: '#fff', fontSize: 14, fontWeight: '900' },
});

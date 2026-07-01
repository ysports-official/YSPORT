import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/SupabaseConfig';

// ponytail: mock data — Supabase paused/hata verince göster
const MOCK_ATHLETES = [
  { id: 1, name: 'Ahmet Yılmaz',  sport: 'Boks',      sgd_score: 87, city: 'İstanbul', age: 22, verified: true,  color: '#e84545', trend: '+5%' },
  { id: 2, name: 'Elif Kaya',     sport: 'Voleybol',   sgd_score: 79, city: 'Ankara',   age: 19, verified: true,  color: '#8b2fff', trend: '+12%' },
  { id: 3, name: 'Mert Demir',    sport: 'Futbol',     sgd_score: 72, city: 'İzmir',    age: 25, verified: false, color: '#00b97a', trend: '-2%' },
  { id: 4, name: 'Zeynep Arslan', sport: 'Atletizm',   sgd_score: 68, city: 'Bursa',    age: 20, verified: true,  color: '#1a4fff', trend: '+8%' },
];
const MOCK_PACKAGES = [
  { id: 1, name: 'Başlangıç Sponsoru', price: '₺5.000/ay',  features: ['Logo', '3 Sporcu', 'Aylık Rapor'],                              sort_order: 1, color: '#1a4fff', active: true },
  { id: 2, name: 'Pro Sponsor',        price: '₺15.000/ay', features: ['Logo + Video', '10 Sporcu', 'Haftalık Rapor', 'AI Analiz'],       sort_order: 2, color: '#8b2fff', active: true },
  { id: 3, name: 'Elite Partner',      price: '₺40.000/ay', features: ['Tam Paket', 'Sınırsız Sporcu', 'Gerçek Zamanlı AI', 'Özel Danışman'], sort_order: 3, color: '#c9a227', active: true },
];

export default function MarketScreen({ navigation }) {
  const [tab, setTab]           = useState('piyasa');
  const [athletes,  setAthletes]  = useState([]);
  const [packages,  setPackages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDemo,    setIsDemo]    = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!supabase) throw new Error('no supabase');
      const [athRes, pkgRes] = await Promise.all([
        supabase.from('market_athletes').select('*').order('sgd_score', { ascending: false }),
        supabase.from('sponsorship_packages').select('*').eq('active', true).order('sort_order'),
      ]);

      if (athRes.error) throw athRes.error;
      if (pkgRes.error) throw pkgRes.error;

      const aths = athRes.data || [];
      const pkgs = pkgRes.data || [];
      if (aths.length === 0 && pkgs.length === 0) throw new Error('empty');
      setAthletes(aths);
      setPackages(pkgs);
      setIsDemo(false);
    } catch (e) {
      console.warn('MarketScreen Supabase error — demo mod:', e.message);
      setAthletes(MOCK_ATHLETES); // ponytail: fallback to mock
      setPackages(MOCK_PACKAGES);
      setIsDemo(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(true); };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#090b11" />
        <View style={s.topbar}>
          <Text style={s.title}>💰 Piyasa & Sponsorluk</Text>
        </View>
        <View style={s.center}>
          <ActivityIndicator color="#1a4fff" size="large" />
          <Text style={s.loadingText}>Piyasa verileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Text style={s.title}>💰 Piyasa & Sponsorluk</Text>
        {isDemo ? (
          <View style={s.demoBadge}><Text style={s.demoText}>Demo</Text></View>
        ) : (
          <View style={s.liveIndicator}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>Canlı</Text>
          </View>
        )}
      </View>

      {/* Sub Tabs */}
      <View style={s.tabRow}>
        {[['piyasa', 'Sporcu Piyasası'], ['sponsorluk', 'Sponsorluk Paketleri']].map(([key, label]) => (
          <TouchableOpacity key={key} style={[s.tab, tab === key && s.tabActive]} onPress={() => setTab(key)}>
            <Text style={[s.tabText, tab === key && s.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a4fff" />}
      >
        {tab === 'piyasa' ? (
          <>
            <Text style={s.sectionTitle}>GÜNCEL SGD PUANLARI</Text>
            {athletes.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Henüz sporcu verisi yok.</Text>
              </View>
            ) : (
              athletes.map((a, i) => (
                <View key={a.id || i} style={s.athleteCard}>
                  <View style={[s.rank, { backgroundColor: i < 3 ? '#c9a22722' : '#ffffff11' }]}>
                    <Text style={[s.rankText, { color: i < 3 ? '#c9a227' : '#4a6fa5' }]}>#{i + 1}</Text>
                  </View>
                  <View style={[s.avatar, { backgroundColor: (a.color || '#1a4fff') + '22', borderColor: (a.color || '#1a4fff') + '55' }]}>
                    <Text style={[s.avatarText, { color: a.color || '#1a4fff' }]}>{(a.name || '?')[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.athleteName}>{a.name}</Text>
                    <Text style={s.athleteSport}>{a.sport}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.sgdScore, { color: a.color || '#1a4fff' }]}>{a.sgd_score}</Text>
                    <Text style={[s.trend, { color: (a.trend || '+0%').startsWith('+') ? '#00b97a' : '#e84545' }]}>
                      {a.trend || '+0%'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={s.sectionTitle}>SPONSORLUK PAKETLERİ</Text>
            {packages.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Paket bilgisi yükleniyor...</Text>
              </View>
            ) : (
              packages.map(pkg => {
                let features = [];
                try { features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]'); } catch { features = []; }
                return (
                  <View key={pkg.id} style={[s.pkgCard, { borderColor: (pkg.color || '#1a4fff') + '44' }]}>
                    <View style={s.pkgHeader}>
                      <Text style={[s.pkgName, { color: pkg.color || '#1a4fff' }]}>{pkg.name}</Text>
                      <Text style={s.pkgPrice}>{pkg.price}</Text>
                    </View>
                    {features.map((f, i) => (
                      <View key={i} style={s.featureRow}>
                        <Text style={[s.featureDot, { color: pkg.color || '#1a4fff' }]}>✓</Text>
                        <Text style={s.featureText}>{f}</Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[s.pkgBtn, { backgroundColor: pkg.color || '#1a4fff' }]}
                      onPress={() => Alert.alert(
                        `${pkg.name} Paketi`,
                        `Fiyat: ${pkg.price}\n\nBaşvuru için:\ninfo@ysports.com\n\nYakında online başvuru aktif olacak.`,
                        [{ text: 'Tamam' }]
                      )}
                    >
                      <Text style={s.pkgBtnText}>Başvur →</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* Scout Feed Banner */}
        <TouchableOpacity
          style={s.scoutBanner}
          onPress={() => navigation.navigate('Scout')}
          activeOpacity={0.85}
        >
          <Text style={s.scoutBannerIcon}>🔍</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.scoutBannerTitle}>Scout Feed</Text>
            <Text style={s.scoutBannerSub}>Sporcuları kaydır, beğen, eşleş</Text>
          </View>
          <Text style={s.scoutBannerArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:   { color: '#4a6fa5', fontSize: 13, marginTop: 8 },
  topbar:        { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:         { color: '#fff', fontSize: 16, fontWeight: '800' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#00b97a22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  liveDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00b97a' },
  liveText:      { color: '#00b97a', fontSize: 11, fontWeight: '700' },
  demoBadge:     { backgroundColor: '#c9a22733', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  demoText:      { color: '#c9a227', fontSize: 11, fontWeight: '700' },
  tabRow:        { flexDirection: 'row', margin: 16, backgroundColor: '#161d2e', borderRadius: 12, padding: 4 },
  tab:           { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  tabActive:     { backgroundColor: '#1a4fff' },
  tabText:       { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  scroll:        { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle:  { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  emptyBox:      { backgroundColor: '#161d2e', borderRadius: 14, padding: 24, alignItems: 'center' },
  emptyText:     { color: '#4a6fa5', fontSize: 13 },
  athleteCard:   { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  rank:          { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  rankText:      { fontSize: 11, fontWeight: '900' },
  avatar:        { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { fontSize: 18, fontWeight: '900' },
  athleteName:   { color: '#fff', fontSize: 14, fontWeight: '700' },
  athleteSport:  { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  sgdScore:      { fontSize: 20, fontWeight: '900' },
  trend:         { fontSize: 11, fontWeight: '700' },
  pkgCard:       { backgroundColor: '#161d2e', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1 },
  pkgHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pkgName:       { fontSize: 18, fontWeight: '900' },
  pkgPrice:      { color: '#fff', fontSize: 14, fontWeight: '700' },
  featureRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureDot:    { fontSize: 14, fontWeight: '900' },
  featureText:   { color: '#8ba8d4', fontSize: 13 },
  pkgBtn:        { marginTop: 14, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  pkgBtnText:    { color: '#fff', fontSize: 14, fontWeight: '900' },
  scoutBanner:      { backgroundColor: '#130820', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 8, borderWidth: 1.5, borderColor: '#8b2fff88', shadowColor: '#8b2fff', shadowRadius: 10, shadowOpacity: 0.25, elevation: 6 },
  scoutBannerIcon:  { fontSize: 26 },
  scoutBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  scoutBannerSub:   { color: '#8b2fff99', fontSize: 11, marginTop: 2 },
  scoutBannerArrow: { color: '#8b2fff', fontSize: 28, fontWeight: '700' },
});

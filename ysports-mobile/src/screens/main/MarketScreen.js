import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/SupabaseConfig';

export default function MarketScreen() {
  const [tab, setTab]           = useState('piyasa');
  const [athletes,  setAthletes]  = useState([]);
  const [packages,  setPackages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase bağlantısı kurulamadı');
      const [athRes, pkgRes] = await Promise.all([
        supabase.from('market_athletes').select('*').order('sgd_score', { ascending: false }),
        supabase.from('sponsorship_packages').select('*').eq('active', true).order('sort_order'),
      ]);

      if (athRes.error) throw athRes.error;
      if (pkgRes.error) throw pkgRes.error;

      setAthletes(athRes.data || []);
      setPackages(pkgRes.data || []);
    } catch (e) {
      console.warn('MarketScreen Supabase error:', e.message);
      Alert.alert('Bağlantı Hatası', 'Piyasa verileri yüklenemedi. İnternet bağlantınızı kontrol edin.');
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
        <View style={s.liveIndicator}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>Canlı</Text>
        </View>
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
                const features = Array.isArray(pkg.features) ? pkg.features : JSON.parse(pkg.features || '[]');
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
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Animated, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/SupabaseConfig';

// ponytail: mock data — Supabase paused/hata verince göster
const MOCK_EVENTS = [
  { id: 1, title: 'Türkiye Şampiyonası — Finaller', sport: 'Boks',       status: 'live',     location: 'İstanbul', home_team: 'Ahmet Y.',    away_team: 'Mert D.',    score: '3-2', time_info: '21:00', sport_emoji: '🥊', color: '#e84545' },
  { id: 2, title: 'Süper Lig Kapışması',            sport: 'Futbol',     status: 'live',     location: 'Ankara',   home_team: 'Ankara FC',   away_team: 'İstanbul SK', score: '1-1', time_info: "45'",   sport_emoji: '⚽', color: '#00b97a' },
  { id: 3, title: 'Basketbol Ligi Playoff',          sport: 'Basketbol',  status: 'upcoming', location: 'İzmir',    home_team: 'İzmir BB',    away_team: 'Bursa BS',   score: '-',   time_info: 'Yarın 18:00', sport_emoji: '🏀', color: '#1a4fff' },
  { id: 4, title: 'Voleybol Devler Ligi',            sport: 'Voleybol',   status: 'upcoming', location: 'Bursa',    home_team: 'Bursa BBSK',  away_team: 'Ankara DSİ', score: '-',   time_info: '16:30', sport_emoji: '🏐', color: '#8b2fff' },
];

export default function LiveScreen() {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [isDemo,   setIsDemo]   = useState(false);
  const [dot]                   = useState(new Animated.Value(1));
  const channelRef              = useRef(null);

  // Canlı dot animasyonu
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // İlk veri yükle
  const fetchEvents = async () => {
    try {
      if (!supabase) throw new Error('no supabase');
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .in('status', ['live', 'upcoming'])
        .order('status', { ascending: false }) // live önce
        .order('created_at');
      if (error) throw error;
      const rows = data || [];
      if (rows.length === 0) throw new Error('empty');
      setEvents(rows);
      setIsDemo(false);
    } catch (e) {
      console.warn('LiveScreen fetch error — demo mod:', e.message);
      setEvents(MOCK_EVENTS); // ponytail: fallback to mock
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    fetchEvents();

    // Supabase realtime — live_events tablosuna abone ol
    if (!supabase) return;
    channelRef.current = supabase
      .channel('live_events_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_events' },
        (payload) => {
          console.log('[Realtime] live_events change:', payload.eventType);
          // Her değişiklikte tüm listeyi güncelle
          fetchEvents();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status);
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const live     = events.filter(e => e.status === 'live');
  const upcoming = events.filter(e => e.status === 'upcoming');

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#090b11" />
        <View style={s.topbar}>
          <Animated.View style={[s.liveDot, { opacity: dot }]} />
          <Text style={s.title}>CANLI YAYINLAR</Text>
        </View>
        <View style={s.center}>
          <ActivityIndicator color="#e84545" size="large" />
          <Text style={s.loadingText}>Canlı veriler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Animated.View style={[s.liveDot, { opacity: dot }]} />
        <Text style={s.title}>CANLI YAYINLAR</Text>
        {isDemo ? (
          <View style={s.demoBadge}><Text style={s.demoText}>Demo</Text></View>
        ) : (
          <View style={s.realtimeBadge}><Text style={s.realtimeText}>🔄 Realtime</Text></View>
        )}
        <Text style={s.liveCount}>{live.length} canlı</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {live.length > 0 && (
          <>
            <Text style={s.sectionTitle}>🔴 DEVAM EDEN</Text>
            {live.map(e => <EventCard key={e.id} event={e} />)}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <Text style={s.sectionTitle}>🕐 YAKLAŞAN</Text>
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </>
        )}

        {events.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>📡</Text>
            <Text style={s.emptyTitle}>Şu an aktif maç yok</Text>
            <Text style={s.emptySub}>Maç başladığında otomatik güncellenecek</Text>
          </View>
        )}

        <View style={s.comingSoon}>
          <Text style={s.csIcon}>📡</Text>
          <Text style={s.csTitle}>Canlı Yayın Geliyor</Text>
          <Text style={s.csSub}>Gerçek zamanlı maç akışı yakında aktif olacak</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ event: e }) {
  return (
    <TouchableOpacity
      style={[s.card, { borderColor: (e.color || '#4a6fa5') + '44' }]}
      activeOpacity={0.8}
      onPress={() => Alert.alert(
        `${e.home_team}  vs  ${e.away_team}`,
        `Skor: ${e.score}\n${e.status === 'live' ? '🔴 Canlı — ' + e.time_info : '🕐 Başlangıç: ' + e.time_info}\n\nGerçek zamanlı maç akışı yakında aktif olacak.`,
        [{ text: 'Tamam' }]
      )}
    >
      <View style={s.cardTop}>
        <Text style={s.sportIcon}>{e.sport_emoji || '🏅'}</Text>
        {e.status === 'live' ? (
          <View style={s.liveBadge}><Text style={s.liveBadgeText}>🔴 CANLI</Text></View>
        ) : (
          <Text style={[s.minText, { color: '#4a6fa5' }]}>{e.time_info}</Text>
        )}
      </View>
      <View style={s.scoreRow}>
        <Text style={s.teamName}>{e.home_team}</Text>
        <Text style={[s.score, { color: e.color || '#4a6fa5' }]}>{e.score}</Text>
        <Text style={s.teamName}>{e.away_team}</Text>
      </View>
      {e.status === 'live' && (
        <Text style={[s.minText, { color: e.color, textAlign: 'center', marginTop: 6 }]}>{e.time_info}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:   { color: '#4a6fa5', fontSize: 13, marginTop: 8 },
  topbar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a', gap: 8 },
  liveDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e84545' },
  title:         { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1 },
  realtimeBadge: { backgroundColor: '#1a4fff22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  realtimeText:  { color: '#1a4fff', fontSize: 9, fontWeight: '700' },
  demoBadge:     { backgroundColor: '#c9a22733', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  demoText:      { color: '#c9a227', fontSize: 9, fontWeight: '700' },
  liveCount:     { color: '#e84545', fontSize: 12, fontWeight: '700', backgroundColor: '#e8454522', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scroll:        { padding: 16, paddingBottom: 40 },
  sectionTitle:  { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12, marginTop: 8 },
  card:          { backgroundColor: '#161d2e', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sportIcon:     { fontSize: 20 },
  liveBadge:     { backgroundColor: '#e8454522', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  liveBadgeText: { color: '#e84545', fontSize: 10, fontWeight: '800' },
  scoreRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamName:      { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
  score:         { fontSize: 20, fontWeight: '900', marginHorizontal: 12 },
  minText:       { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  emptyBox:      { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  emptyIcon:     { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub:      { color: '#4a6fa5', fontSize: 12, textAlign: 'center' },
  comingSoon:    { alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  csIcon:        { fontSize: 32, marginBottom: 8 },
  csTitle:       { color: '#2a3a5a', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  csSub:         { color: '#1e2d4a', fontSize: 11, textAlign: 'center' },
});

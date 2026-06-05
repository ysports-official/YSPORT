import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LIVE_EVENTS = [
  { id: 1, sport: '⚽', home: 'Galatasaray', away: 'Fenerbahçe', score: '2 - 1', min: "67'", status: 'live', color: '#e84545' },
  { id: 2, sport: '🏀', home: 'Anadolu Efes', away: 'Fenerbahçe', score: '78 - 74', min: "Q3", status: 'live', color: '#1a4fff' },
  { id: 3, sport: '🏐', home: 'Halkbank', away: 'Arkas', score: '2 - 1', min: "Set 4", status: 'live', color: '#8b2fff' },
  { id: 4, sport: '⚽', home: 'Trabzonspor', away: 'Beşiktaş', score: '0 - 0', min: "21:45", status: 'upcoming', color: '#4a6fa5' },
  { id: 5, sport: '🎾', home: 'T. Çağlar', away: 'M. Yıldız', score: '6-4, 3-', min: "Set 2", status: 'live', color: '#c9a227' },
];

export default function LiveScreen() {
  const [dot] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const live     = LIVE_EVENTS.filter(e => e.status === 'live');
  const upcoming = LIVE_EVENTS.filter(e => e.status === 'upcoming');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Animated.View style={[s.liveDot, { opacity: dot }]} />
        <Text style={s.title}>CANLI YAYINLAR</Text>
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
      style={[s.card, { borderColor: e.color + '44' }]}
      activeOpacity={0.8}
      onPress={() => Alert.alert(
        `${e.home}  vs  ${e.away}`,
        `Skor: ${e.score}\n${e.status === 'live' ? '🔴 Canlı — ' + e.min : '🕐 Başlangıç: ' + e.min}\n\nGerçek zamanlı maç akışı yakında aktif olacak.`,
        [{ text: 'Tamam' }]
      )}
    >
      <View style={s.cardTop}>
        <Text style={s.sportIcon}>{e.sport}</Text>
        {e.status === 'live' ? (
          <View style={s.liveBadge}><Text style={s.liveBadgeText}>🔴 CANLI</Text></View>
        ) : (
          <Text style={[s.minText, { color: '#4a6fa5' }]}>{e.min}</Text>
        )}
      </View>
      <View style={s.scoreRow}>
        <Text style={s.teamName}>{e.home}</Text>
        <Text style={[s.score, { color: e.color }]}>{e.score}</Text>
        <Text style={s.teamName}>{e.away}</Text>
      </View>
      {e.status === 'live' && (
        <Text style={[s.minText, { color: e.color, textAlign: 'center', marginTop: 6 }]}>{e.min}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  topbar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a', gap: 8 },
  liveDot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e84545' },
  title:         { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1 },
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
  comingSoon:    { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
  csIcon:        { fontSize: 40, marginBottom: 12 },
  csTitle:       { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  csSub:         { color: '#4a6fa5', fontSize: 12, textAlign: 'center' },
});

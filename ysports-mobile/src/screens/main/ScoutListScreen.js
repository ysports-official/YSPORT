import { auth } from '../../services/FirebaseConfig';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const TABS = [
  { key: 'all',      label: 'Tümü'    },
  { key: 'pending',  label: 'Bekleyen' },
  { key: 'accepted', label: 'Kabul'   },
  { key: 'rejected', label: 'Red'     },
];

function relativeTime(ts) {
  if (!ts) return '';
  const ms   = ts?.toDate ? ts.toDate().getTime() : new Date(ts).getTime();
  const diff  = Date.now() - ms;
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `${mins}d önce`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}s önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

function statusBadge(status, superMatch) {
  if (superMatch) return { label: '⭐ SÜPER MATCH', color: '#c9a227', bg: '#c9a22722' };
  if (status === 'accepted') return { label: 'Kabul ✓',      color: '#00b97a', bg: '#00b97a22' };
  if (status === 'rejected') return { label: 'Reddedildi ✕', color: '#e84545', bg: '#e8454522' };
  return { label: 'Bekliyor ⏳', color: '#4a6fa5', bg: '#4a6fa522' };
}

export default function ScoutListScreen({ navigation }) {
  const [matches,   setMatches]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab,       setTab]       = useState('all');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await auth.authStateReady();
      const uid = auth.currentUser?.uid;
      if (!uid) { setLoading(false); return; }
      const db = getFirestore(getApp());
      const snap = await getDocs(
        query(
          collection(db, 'matches'),
          where('scoutId', '==', uid),
          orderBy('matchedAt', 'desc'),
          limit(50),
        )
      );
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.warn('ScoutListScreen load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === 'all' ? matches : matches.filter(m => m.status === tab);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#090b11" />
        <View style={s.center}>
          <ActivityIndicator color="#1a4fff" size="large" />
          <Text style={s.loadingText}>Eşleşmeler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Header */}
      <View style={s.topbar}>
        <Text style={s.title}>💚 Scout Listem</Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>{matches.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={[s.tab, tab === t.key && s.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[s.tabText, tab === t.key && s.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor="#1a4fff" />}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Henüz eşleşme yok — Scout Feed'e git</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Scout')}>
              <Text style={s.emptyBtnText}>Scout Feed'e Git →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(m => {
            const badge = statusBadge(m.status, m.superMatch);
            return (
              <View key={m.id} style={s.card}>
                {/* Super Match altın şerit */}
                {m.superMatch && <View style={s.superStripe} />}

                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.athleteName}>{m.athleteName || 'İsimsiz Sporcu'}</Text>
                    <Text style={s.athleteSub}>
                      {[m.sport, m.city].filter(Boolean).join(' • ')}
                    </Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: badge.bg, borderColor: badge.color + '55' }]}>
                    <Text style={[s.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={s.cardMeta}>
                  {m.sgdScore != null && (
                    <View style={s.sgdBox}>
                      <Text style={s.sgdNum}>{m.sgdScore}</Text>
                      <Text style={s.sgdLbl}>SGD</Text>
                    </View>
                  )}
                  <Text style={s.time}>{relativeTime(m.matchedAt)}</Text>
                </View>

                <View style={s.btnRow}>
                  <TouchableOpacity
                    style={[s.btn, { borderColor: '#1a4fff55' }]}
                    onPress={() => Alert.alert('Sporcu Profili', 'Sporcu profili yakında aktif olacak.')}
                  >
                    <Text style={[s.btnText, { color: '#1a4fff' }]}>Profili Gör</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.btn, { borderColor: '#00b97a55', marginLeft: 8 }]}
                    onPress={() => Alert.alert('Mesajlaşma', 'Mesajlaşma yakında aktif olacak.')}
                  >
                    <Text style={[s.btnText, { color: '#00b97a' }]}>Mesaj Gönder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText:   { color: '#4a6fa5', fontSize: 13 },
  topbar:        { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a', flexDirection: 'row', alignItems: 'center', gap: 10 },
  title:         { color: '#fff', fontSize: 16, fontWeight: '800', flex: 1 },
  countBadge:    { backgroundColor: '#00b97a22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#00b97a44' },
  countText:     { color: '#00b97a', fontSize: 13, fontWeight: '900' },
  tabScroll:     { flexGrow: 0 },
  tabRow:        { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#161d2e', borderWidth: 1, borderColor: '#1e2d4a' },
  tabActive:     { backgroundColor: '#1a4fff', borderColor: '#1a4fff' },
  tabText:       { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  scroll:        { padding: 16, paddingBottom: 40 },
  card:          { backgroundColor: '#161d2e', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e2d4a', overflow: 'hidden' },
  superStripe:   { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#c9a227' },
  cardTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  athleteName:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  athleteSub:    { color: '#4a6fa5', fontSize: 11, marginTop: 3 },
  statusBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, marginLeft: 8 },
  statusText:    { fontSize: 11, fontWeight: '700' },
  cardMeta:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  sgdBox:        { flexDirection: 'row', alignItems: 'baseline', gap: 4, backgroundColor: '#1a4fff22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sgdNum:        { color: '#1a4fff', fontSize: 16, fontWeight: '900' },
  sgdLbl:        { color: '#1a4fff', fontSize: 9, fontWeight: '700' },
  time:          { color: '#4a6fa5', fontSize: 11 },
  btnRow:        { flexDirection: 'row' },
  btn:           { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  btnText:       { fontSize: 12, fontWeight: '700' },
  emptyBox:      { backgroundColor: '#161d2e', borderRadius: 16, padding: 32, alignItems: 'center', gap: 16, marginTop: 40 },
  emptyText:     { color: '#4a6fa5', fontSize: 14, textAlign: 'center' },
  emptyBtn:      { backgroundColor: '#8b2fff', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText:  { color: '#fff', fontSize: 13, fontWeight: '800' },
});

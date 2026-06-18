import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const LOGO = require('../../../assets/icon.png');

export default function HomeScreen({ navigation, route }) {
  const role = route?.params?.role || 'sporcu';
  const uid  = route?.params?.uid  || '';

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [stats,   setStats]     = useState({ sgd: 0, videos: 0, contracts: 0 });

  useEffect(() => {
    (async () => {
      try {
        const auth = getAuth(getApp());
        await auth.authStateReady();
        const u = auth.currentUser;
        if (!u) { setLoading(false); return; }
        const db = getFirestore(getApp());
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setProfile(snap.data());
        // basit stat
        const perfSnap = await getDocs(
          query(collection(db, 'sporcular', u.uid, 'performans'), orderBy('timestamp', 'desc'), limit(10))
        ).catch(() => ({ docs: [] }));
        setStats(s => ({ ...s, videos: perfSnap.docs.length }));
      } catch (e) {
        console.warn('HomeScreen load error:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const displayName = profile?.displayName || profile?.ad || 'Sporcu';
  const city        = profile?.sehir || '';
  const branch      = profile?.sporDali || '';

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#1a4fff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Image source={LOGO} style={s.logo} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.greeting}>Merhaba 👋</Text>
            <Text style={s.name}>{displayName}</Text>
            {(city || branch) ? (
              <Text style={s.sub}>{[branch, city].filter(Boolean).join(' • ')}</Text>
            ) : null}
          </View>
          <View style={s.sgdBadge}>
            <Text style={s.sgdNum}>{stats.sgd}</Text>
            <Text style={s.sgdLbl}>SGD</Text>
          </View>
        </View>

        {/* Stat Kartları */}
        <View style={s.statRow}>
          {[
            { label: 'Performans\nVideoları', value: stats.videos, color: '#1a4fff' },
            { label: 'Aktif\nSözleşme', value: stats.contracts, color: '#c9a227' },
            { label: 'Skor\nPuanı', value: stats.sgd, color: '#00b97a' },
          ].map((item, i) => (
            <View key={i} style={[s.statCard, { borderColor: item.color + '44' }]}>
              <Text style={[s.statVal, { color: item.color }]}>{item.value}</Text>
              <Text style={s.statLbl}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Sporcu Paneli Butonu */}
        <TouchableOpacity
          style={[s.aiBtn, { borderColor: '#00b97a44', marginBottom: 12 }]}
          onPress={() => navigation.navigate('SporcuDashboard', { uid, role })}
          activeOpacity={0.85}
        >
          <Text style={s.aiBtnIcon}>🏅</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.aiBtnTitle}>Sporcu Paneli</Text>
            <Text style={s.aiBtnSub}>Dashboard, sözleşme ve medya merkezi</Text>
          </View>
          <Text style={[s.aiBtnArrow, { color: '#00b97a' }]}>›</Text>
        </TouchableOpacity>

        {/* AI Kamera Butonu */}
        <TouchableOpacity
          style={s.aiBtn}
          onPress={() => navigation.navigate('AICamera', { uid, role })}
          activeOpacity={0.85}
        >
          <Text style={s.aiBtnIcon}>🤖</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.aiBtnTitle}>AI Performans Analizi</Text>
            <Text style={s.aiBtnSub}>MediaPipe ile gerçek zamanlı analiz</Text>
          </View>
          <Text style={s.aiBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Hızlı Linkler */}
        <Text style={s.sectionTitle}>HIZLI ERİŞİM</Text>
        <View style={s.quickGrid}>
          {[
            { icon: '💰', label: 'Piyasa', tab: 'Market' },
            { icon: '🏅', label: 'Sporcular', tab: 'Athletes' },
            { icon: '🏆', label: 'Spor Dalları', tab: 'Sports' },
            { icon: '🔴', label: 'Canlı', tab: 'Live' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={s.quickCard}
              onPress={() => navigation.navigate(item.tab)}
              activeOpacity={0.8}
            >
              <Text style={s.quickIcon}>{item.icon}</Text>
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footer}>Y SPORTS © 2026 — Küresel Sporcu Değerleme Ekosistemi</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#090b11' },
  center:      { flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center' },
  scroll:      { padding: 20, paddingBottom: 40 },
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logo:        { width: 48, height: 48, borderRadius: 12 },
  greeting:    { color: '#4a6fa5', fontSize: 12 },
  name:        { color: '#fff', fontSize: 18, fontWeight: '900' },
  sub:         { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  sgdBadge:    { backgroundColor: '#1a4fff22', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1a4fff44' },
  sgdNum:      { color: '#1a4fff', fontSize: 20, fontWeight: '900' },
  sgdLbl:      { color: '#4a6fa5', fontSize: 9, fontWeight: '700' },
  statRow:     { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:    { flex: 1, backgroundColor: '#161d2e', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statVal:     { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLbl:     { color: '#4a6fa5', fontSize: 9, fontWeight: '700', textAlign: 'center', lineHeight: 13 },
  aiBtn:       { backgroundColor: '#161d2e', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1a4fff44', marginBottom: 24 },
  aiBtnIcon:   { fontSize: 28 },
  aiBtnTitle:  { color: '#fff', fontSize: 15, fontWeight: '800' },
  aiBtnSub:    { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  aiBtnArrow:  { color: '#1a4fff', fontSize: 28, fontWeight: '700' },
  sectionTitle:{ color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  quickGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  quickCard:   { width: '47%', backgroundColor: '#161d2e', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  quickIcon:   { fontSize: 28, marginBottom: 8 },
  quickLabel:  { color: '#fff', fontSize: 13, fontWeight: '700' },
  footer:      { color: '#1e2d4a', fontSize: 9, textAlign: 'center' },
});

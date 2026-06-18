import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function SporcuDashboardScreen({ navigation, route }) {
  const uid  = route?.params?.uid  || '';
  const role = route?.params?.role || 'sporcu';

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const auth = getAuth(getApp());
        await auth.authStateReady();
        const u = auth.currentUser;
        if (!u) { setLoading(false); return; }
        const snap = await getDoc(doc(getFirestore(getApp()), 'users', u.uid));
        if (snap.exists()) setProfile(snap.data());
      } catch (e) {
        console.warn('SporcuDashboard load error:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const name    = profile?.displayName || profile?.ad || 'Sporcu';
  const sport   = profile?.sporDali    || 'Karate';
  const city    = profile?.sehir       || 'Türkiye';
  const age     = profile?.yas         || '';
  const sgd     = profile?.sgdScore    || 85;
  const marketV = profile?.marketValue || '₺350K';
  const sponsors= profile?.sponsorCount|| 2;
  const videos  = profile?.videosDone  || 1;
  const videosTotal = 2;
  const pct = Math.round((videos / videosTotal) * 100);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator color="#1a4fff" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Top Header */}
      <View style={s.topbar}>
        <View>
          <Text style={s.greeting}>Merhaba, {name}! 👋</Text>
          <Text style={s.sub}>Profesyonel {sport}</Text>
        </View>
        <TouchableOpacity
          style={s.avatar}
          onPress={() => navigation.navigate('ProfileSettings', { uid, role })}
        >
          <Text style={s.avatarIcon}>🧑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <TouchableOpacity
          style={s.profileCard}
          onPress={() => navigation.navigate('ProfileSettings', { uid, role })}
          activeOpacity={0.85}
        >
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarIcon}>🧑</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{name}</Text>
            <Text style={s.profileMeta}>
              {[age ? `${age} Yaş` : null, city, sport].filter(Boolean).join(' · ')}
            </Text>
            <View style={s.badgeRow}>
              <View style={[s.badge, { backgroundColor: '#c9a22722', borderColor: '#c9a22744' }]}>
                <Text style={[s.badgeText, { color: '#c9a227' }]}>🥇 U12 Şampiyonu</Text>
              </View>
              <View style={[s.badge, { backgroundColor: '#1a4fff22', borderColor: '#1a4fff44' }]}>
                <Text style={[s.badgeText, { color: '#1a4fff' }]}>SGS: {sgd}</Text>
              </View>
            </View>
          </View>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>

        {/* Contract Banner */}
        <TouchableOpacity
          style={s.contractBanner}
          onPress={() => navigation.navigate('ContractView', { uid, role, contractType: 'sporcu' })}
          activeOpacity={0.85}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.contractTitle}>📜 Dijital Sözleşmeniz Aktiftir</Text>
            <Text style={s.contractSub}>Unicorn seviyesi yasal taahhütler ve hak edişleriniz aktiftir.</Text>
          </View>
          <View style={s.contractBtn}>
            <Text style={s.contractBtnText}>İncele →</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: '#4ade80' }]}>{marketV}</Text>
            <Text style={s.statLbl}>Piyasa Değeri</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: '#a78bfa' }]}>{sgd}</Text>
            <Text style={s.statLbl}>SGS Skoru</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: '#c9a227' }]}>{sponsors}</Text>
            <Text style={s.statLbl}>Aktif Sponsor</Text>
          </View>
        </View>

        {/* Video Commitment Tracker */}
        <TouchableOpacity
          style={s.card}
          onPress={() => navigation.navigate('MediaCenter', { uid, role })}
          activeOpacity={0.85}
        >
          <View style={s.commitRow}>
            {/* Circular ring (View-based, no SVG) */}
            <View style={s.ring}>
              <View style={[s.ringFill, {
                borderColor: pct >= 100 ? '#00b97a' : pct >= 50 ? '#c9a227' : '#1a4fff',
              }]} />
              <View style={s.ringCenter}>
                <Text style={s.ringPct}>{pct}%</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.commitTitle}>Aylık Video Yükleme: {videos} / {videosTotal}</Text>
              <Text style={s.commitSub}>
                {pct >= 100
                  ? 'Taahhüt tamamlandı! ✓'
                  : `Gecikme Cezası Riski: %0. Bu ay son video için 5 gününüz kaldı.`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Wearable Device */}
        <View style={s.wearableCard}>
          <View style={s.wearableHeader}>
            <View style={s.wearableTitleRow}>
              <Text style={s.wearableIcon}>🔋</Text>
              <Text style={s.wearableTitle}>Biyo-Güç & Giyilebilir Cihaz</Text>
            </View>
            <View style={s.disconnectedBadge}>
              <Text style={s.disconnectedText}>Bağlı Değil</Text>
            </View>
          </View>
          <Text style={s.wearableSub}>
            Giyilebilir cihazını bağla; gücünü antrenmanda harca, ekstra kazanç ve madalya şansını yakala!
          </Text>
          <TouchableOpacity
            style={s.connectBtn}
            onPress={() => Alert.alert('Cihaz Bağlantısı', 'Apple Watch, WHOOP ve Garmin desteği yakında!')}
          >
            <Text style={s.connectBtnText}>🔌 Cihaz Bağlantısı Başlat</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={s.sectionTitle}>HIZLI ERİŞİM</Text>
        <View style={s.quickGrid}>
          {[
            { icon: '🎬', label: 'Medya Merkezi', screen: 'MediaCenter' },
            { icon: '📄', label: 'Sözleşmeler',   screen: 'ContractView' },
            { icon: '🤖', label: 'AI Analiz',      screen: 'AICamera'     },
            { icon: '⚙️', label: 'Ayarlar',        screen: 'ProfileSettings' },
          ].map(({ icon, label, screen }) => (
            <TouchableOpacity
              key={screen}
              style={s.quickCard}
              onPress={() => navigation.navigate(screen, { uid, role })}
              activeOpacity={0.8}
            >
              <Text style={s.quickIcon}>{icon}</Text>
              <Text style={s.quickLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#090b11' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topbar:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  greeting:        { color: '#fff', fontSize: 16, fontWeight: '800' },
  sub:             { color: '#8ba8d4', fontSize: 11, marginTop: 2 },
  avatar:          { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a4fff', justifyContent: 'center', alignItems: 'center' },
  avatarIcon:      { fontSize: 18 },
  scroll:          { padding: 16, paddingBottom: 40 },

  profileCard:     { backgroundColor: '#161d2e', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  profileAvatar:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a4fff22', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1a4fff44' },
  profileAvatarIcon:{ fontSize: 24 },
  profileName:     { color: '#fff', fontSize: 14, fontWeight: '700' },
  profileMeta:     { color: '#8ba8d4', fontSize: 10, marginTop: 2 },
  badgeRow:        { flexDirection: 'row', gap: 5, marginTop: 4 },
  badge:           { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  badgeText:       { fontSize: 9, fontWeight: '700' },
  arrow:           { color: '#2a3a5a', fontSize: 20 },

  contractBanner:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(201,162,39,0.08)', borderWidth: 1, borderColor: 'rgba(201,162,39,0.25)', borderRadius: 12, padding: 10, marginBottom: 10 },
  contractTitle:   { color: '#c9a227', fontSize: 12, fontWeight: '800' },
  contractSub:     { color: '#8ba8d4', fontSize: 9.5, marginTop: 2 },
  contractBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#c9a227', marginLeft: 8 },
  contractBtnText: { color: '#c9a227', fontSize: 10, fontWeight: '700' },

  statsGrid:       { flexDirection: 'row', gap: 6, marginBottom: 10 },
  statCard:        { flex: 1, backgroundColor: '#161d2e', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  statVal:         { fontSize: 16, fontWeight: '900' },
  statLbl:         { color: '#8ba8d4', fontSize: 9, marginTop: 3, textAlign: 'center' },

  card:            { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  commitRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring:            { width: 60, height: 60, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  ringFill:        { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#1a4fff' },
  ringCenter:      { justifyContent: 'center', alignItems: 'center' },
  ringPct:         { color: '#fff', fontSize: 13, fontWeight: '900' },
  commitTitle:     { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  commitSub:       { color: '#8ba8d4', fontSize: 10, lineHeight: 14 },

  wearableCard:    { backgroundColor: 'rgba(16,185,129,0.05)', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)' },
  wearableHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  wearableTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  wearableIcon:    { fontSize: 16 },
  wearableTitle:   { color: '#fff', fontSize: 12, fontWeight: '700' },
  disconnectedBadge:{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  disconnectedText:{ color: '#ef4444', fontSize: 8, fontWeight: '700' },
  wearableSub:     { color: '#8ba8d4', fontSize: 10, lineHeight: 14, marginBottom: 10 },
  connectBtn:      { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  connectBtnText:  { color: '#34d399', fontSize: 11, fontWeight: '700' },

  sectionTitle:    { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },
  quickGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:       { width: '47%', backgroundColor: '#161d2e', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  quickIcon:       { fontSize: 28, marginBottom: 8 },
  quickLabel:      { color: '#fff', fontSize: 12, fontWeight: '700' },
});

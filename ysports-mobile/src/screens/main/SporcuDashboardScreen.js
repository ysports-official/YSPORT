import { auth } from '../../services/FirebaseConfig';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getFirestore, doc, getDoc, collection, getDocs,
  query, where, orderBy, limit, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';

const DB  = () => getFirestore(getApp());
const BG  = '#090b11';
const CARD = '#161d2e';
const BDR  = '#1e2d4a';

const SGD_COLOR = (s) =>
  s >= 71 ? '#00b97a' : s >= 41 ? '#c9a227' : '#e84545';

// ponytail: simple month filter — works for current month only
const thisMonth = (ts) => {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

export default function SporcuDashboardScreen({ navigation }) {
  const [loading,   setLoading]   = useState(true);
  const [profile,   setProfile]   = useState(null);
  const [videoCount,setVideoCount] = useState(0);
  const [lastVideos,setLastVideos] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [matches,   setMatches]   = useState([]);
  const [uid,       setUid]       = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await auth.authStateReady();
        const u = auth.currentUser;
        if (!u || cancelled) { setLoading(false); return; }
        setUid(u.uid);
        const db = DB();

        const [profileSnap, perfSnap, contractSnap, matchSnap] = await Promise.all([
          getDoc(doc(db, 'users', u.uid)),
          getDocs(collection(db, 'sporcular', u.uid, 'performans')),
          getDocs(query(
            collection(db, 'sozlesmeler'),
            where('athleteId', '==', u.uid),
            limit(3),
          )),
          getDocs(query(
            collection(db, 'matches'),
            where('athleteId', '==', u.uid),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc'),
            limit(5),
          )),
        ]);

        if (cancelled) return;

        if (profileSnap.exists()) setProfile(profileSnap.data());

        const perfDocs = perfSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setVideoCount(perfDocs.filter(d => thisMonth(d.createdAt)).length);
        // ponytail: last 2 videos for media preview — already fetched, no extra query
        setLastVideos(perfDocs.sort((a, b) => {
          const ta = a.createdAt?.toDate?.() ?? 0;
          const tb = b.createdAt?.toDate?.() ?? 0;
          return tb - ta;
        }).slice(0, 2));

        setContracts(contractSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setMatches(matchSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn('SporcuDashboard load error:', e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleMatchAction = useCallback(async (matchId, status) => {
    try {
      await updateDoc(doc(DB(), 'matches', matchId), {
        status,
        ...(status === 'accepted' ? { acceptedAt: serverTimestamp() } : {}),
      });
      setMatches(prev => prev.filter(m => m.id !== matchId));
    } catch (e) {
      Alert.alert('Hata', e.message);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><ActivityIndicator color="#1a4fff" size="large" /></View>
      </SafeAreaView>
    );
  }

  const name    = profile?.displayName || profile?.ad || 'Sporcu';
  const sport   = profile?.sporDali || '';
  const city    = profile?.sehir    || '';
  const age     = profile?.yas      || '';
  const sgd     = typeof profile?.sgdScore === 'number' ? profile.sgdScore : 0;
  const marketV = profile?.marketValue || '—';
  const initial = name.charAt(0).toUpperCase();
  const pct     = Math.min(100, Math.round((videoCount / 2) * 100));
  const sgdCol  = SGD_COLOR(sgd);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* Header */}
      <View style={s.topbar}>
        <View>
          <Text style={s.greeting}>Merhaba, {name}!</Text>
          {sport ? <Text style={s.sub}>Profesyonel {sport}</Text> : null}
        </View>
        <TouchableOpacity
          style={[s.avatar, { backgroundColor: '#1a4fff' }]}
          onPress={() => navigation.navigate('ProfileSettings', { uid })}
        >
          <Text style={s.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* SGD Skor Kartı */}
        <View style={[s.card, { borderColor: sgdCol + '44', alignItems: 'center', paddingVertical: 24 }]}>
          <Text style={[s.sgdNumber, { color: sgdCol }]}>{sgd}</Text>
          <Text style={s.sgdLabel}>SGD Skoru</Text>
          <Text style={[s.sgdMarket, { color: '#4a6fa5' }]}>Piyasa Değeri: <Text style={{ color: '#00b97a' }}>{marketV}</Text></Text>
          <TouchableOpacity
            style={[s.outlineBtn, { borderColor: sgdCol, marginTop: 12 }]}
            onPress={() => Alert.alert(
              'SGD Skoru Nedir?',
              'Sporcu Gelişim ve Değer (SGD) skoru; performans videoları, sözleşme geçmişi, antrenman tutarlılığı ve scout değerlendirmelerine göre hesaplanan 0-100 arası bir endekstir.\n\n0-40: Gelişim aşaması\n41-70: Yükselen sporcu\n71-100: Profesyonel seviye',
            )}
          >
            <Text style={[s.outlineBtnText, { color: sgdCol }]}>SGD Skoru Nedir?</Text>
          </TouchableOpacity>
        </View>

        {/* Performans Video Tracker */}
        <View style={s.card}>
          <View style={s.commitRow}>
            <View style={s.ring}>
              <View style={[s.ringFill, { borderColor: pct >= 100 ? '#00b97a' : pct >= 50 ? '#c9a227' : '#1a4fff' }]} />
              <View style={s.ringCenter}>
                <Text style={s.ringPct}>{pct}%</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>Aylık Video: {videoCount} / 2</Text>
              <Text style={s.cardSub}>
                {pct >= 100 ? 'Taahhüt tamamlandı!' : 'Bu ay 2 video yüklemeniz gerekiyor.'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[s.solidBtn, { marginTop: 12 }]}
            onPress={() => Alert.alert(
              'Video Yükle',
              'AI Kamera ile analiz yapmak ister misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { text: 'Evet', onPress: () => navigation.navigate('AICamera', { uid }) },
              ],
            )}
          >
            <Text style={s.solidBtnText}>Video Yükle</Text>
          </TouchableOpacity>
        </View>

        {/* Aktif Sözleşmeler */}
        <Text style={s.sectionTitle}>AKTİF SÖZLEŞMELER</Text>
        {contracts.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Henüz sözleşme yok</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ScoutFeed', { uid })}
              style={[s.outlineBtn, { borderColor: '#1a4fff', marginTop: 8 }]}
            >
              <Text style={[s.outlineBtnText, { color: '#1a4fff' }]}>Scout Feed'e Git</Text>
            </TouchableOpacity>
          </View>
        ) : (
          contracts.map(c => (
            <View key={c.id} style={s.listCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{c.sponsorAd || c.sponsorId || 'Sponsor'}</Text>
                <Text style={s.cardSub}>{c.sure || ''}{c.deger ? ` · ${c.deger}` : ''}</Text>
              </View>
              {c.durum ? (
                <View style={[s.badge, {
                  backgroundColor: c.durum === 'aktif' ? '#00b97a22' : '#1a4fff22',
                  borderColor: c.durum === 'aktif' ? '#00b97a' : '#1a4fff',
                }]}>
                  <Text style={[s.badgeText, { color: c.durum === 'aktif' ? '#00b97a' : '#1a4fff' }]}>
                    {c.durum}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
        {contracts.length > 0 && (
          <TouchableOpacity
            style={[s.outlineBtn, { borderColor: BDR, marginBottom: 16 }]}
            onPress={() => navigation.navigate('ContractView', { uid })}
          >
            <Text style={[s.outlineBtnText, { color: '#4a6fa5' }]}>Tüm Sözleşmeler →</Text>
          </TouchableOpacity>
        )}

        {/* Scout Match Bildirimleri */}
        {matches.length > 0 && (
          <>
            <Text style={s.sectionTitle}>SCOUT EŞLEŞMELERİ</Text>
            {matches.map(m => (
              <View key={m.id} style={s.listCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{m.scoutAd || m.scoutId || 'Scout'}</Text>
                  <Text style={s.cardSub}>{m.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity
                    style={[s.badge, { backgroundColor: '#00b97a22', borderColor: '#00b97a' }]}
                    onPress={() => handleMatchAction(m.id, 'accepted')}
                  >
                    <Text style={[s.badgeText, { color: '#00b97a' }]}>Kabul</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.badge, { backgroundColor: '#e8454522', borderColor: '#e84545' }]}
                    onPress={() => handleMatchAction(m.id, 'rejected')}
                  >
                    <Text style={[s.badgeText, { color: '#e84545' }]}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Medya Merkezi Kısayolu */}
        <Text style={s.sectionTitle}>MEDYA MERKEZİ</Text>
        {lastVideos.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>Henüz video yüklenmedi</Text>
          </View>
        ) : (
          lastVideos.map(v => (
            <View key={v.id} style={s.listCard}>
              <Text style={s.cardTitle}>{v.baslik || v.title || 'Video'}</Text>
              <Text style={s.cardSub}>{v.createdAt?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</Text>
            </View>
          ))
        )}
        <TouchableOpacity
          style={[s.outlineBtn, { borderColor: BDR, marginBottom: 16 }]}
          onPress={() => navigation.navigate('MediaCenter', { uid })}
        >
          <Text style={[s.outlineBtnText, { color: '#4a6fa5' }]}>Medya Merkezine Git →</Text>
        </TouchableOpacity>

        {/* Hızlı Erişim */}
        <Text style={s.sectionTitle}>HIZLI ERİŞİM</Text>
        <View style={s.quickGrid}>
          {[
            { icon: '🎬', label: 'Medya Merkezi',   screen: 'MediaCenter'     },
            { icon: '📄', label: 'Sözleşmeler',     screen: 'ContractView'    },
            { icon: '🤖', label: 'AI Analiz',        screen: 'AICamera'        },
            { icon: '⚙️', label: 'Profil Ayarları', screen: 'ProfileSettings' },
          ].map(({ icon, label, screen }) => (
            <TouchableOpacity
              key={screen}
              style={s.quickCard}
              onPress={() => navigation.navigate(screen, { uid })}
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
  safe:          { flex: 1, backgroundColor: BG },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:        { padding: 16, paddingBottom: 40 },

  topbar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: BDR },
  greeting:      { color: '#fff', fontSize: 16, fontWeight: '800' },
  sub:           { color: '#8ba8d4', fontSize: 11, marginTop: 2 },
  avatar:        { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { color: '#fff', fontSize: 16, fontWeight: '800' },

  card:          { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BDR },
  listCard:      { backgroundColor: CARD, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: BDR, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyCard:     { backgroundColor: CARD, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: BDR, alignItems: 'center' },
  emptyText:     { color: '#4a6fa5', fontSize: 13 },

  sgdNumber:     { fontSize: 64, fontWeight: '900', lineHeight: 70 },
  sgdLabel:      { color: '#8ba8d4', fontSize: 13, marginTop: 2 },
  sgdMarket:     { fontSize: 12, marginTop: 6 },

  cardTitle:     { color: '#fff', fontSize: 13, fontWeight: '700', flex: 1 },
  cardSub:       { color: '#4a6fa5', fontSize: 11, marginTop: 2 },

  commitRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ring:          { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  ringFill:      { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: '#1a4fff' },
  ringCenter:    { justifyContent: 'center', alignItems: 'center' },
  ringPct:       { color: '#fff', fontSize: 13, fontWeight: '900' },

  badge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeText:     { fontSize: 10, fontWeight: '700' },

  solidBtn:      { backgroundColor: '#1a4fff', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  solidBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  outlineBtn:    { borderRadius: 10, paddingVertical: 9, alignItems: 'center', borderWidth: 1 },
  outlineBtnText:{ fontWeight: '700', fontSize: 12 },

  sectionTitle:  { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10, marginTop: 4 },
  quickGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard:     { width: '47%', backgroundColor: CARD, borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: BDR },
  quickIcon:     { fontSize: 28, marginBottom: 8 },
  quickLabel:    { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

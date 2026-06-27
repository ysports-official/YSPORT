import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, FlatList, StatusBar, StyleSheet, Alert,
} from 'react-native';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

const db = getFirestore(getApp());

const C = {
  bg: '#090b11', card: '#161d2e', border: '#1e2d4a',
  primary: '#1a4fff', purple: '#8b2fff', gold: '#c9a227',
  green: '#00b97a', red: '#e84545', muted: '#4a6fa5', white: '#fff',
};

export default function IlTemsilcisiPanelScreen({ navigation, route }) {
  const [uid, setUid]           = useState(route?.params?.uid || '');
  const [profile, setProfile]   = useState({ ad: '', soyad: '', email: '', telefon: '', il: '' });
  const [temsilci, setTemsilci] = useState({ il: '', ilce: [] });
  const [stats, setStats]       = useState({ sporcu: 0, kulup: 0, federasyon: 0, yeniKayit: 0 });
  const [pending, setPending]   = useState([]);
  const [duyurular, setDuyurular] = useState([]);
  const [duyuruText, setDuyuruText] = useState('');
  const [ilceInput, setIlceInput]   = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const scrollRef = useRef(null);

  // ── init ──
  useEffect(() => {
    (async () => {
      const auth = getAuth(getApp());
      await getAuth(getApp()).authStateReady();
      const currentUid = getAuth(getApp()).currentUser?.uid;
      if (currentUid) setUid(currentUid);
      const resolvedUid = currentUid || uid;
      if (!resolvedUid) { setLoading(false); return; }

      try {
        const [userSnap, temsilciSnap] = await Promise.all([
          getDoc(doc(db, 'users', resolvedUid)),
          getDoc(doc(db, 'ilTemsilcileri', resolvedUid)),
        ]);
        if (userSnap.exists()) setProfile(p => ({ ...p, ...userSnap.data() }));
        if (temsilciSnap.exists()) setTemsilci(t => ({ ...t, ...temsilciSnap.data() }));

        const il = temsilciSnap.data()?.il || '';
        await Promise.all([
          fetchStats(il),
          fetchPending(il),
          fetchDuyurular(il),
        ]);
      } catch (e) { console.warn('IlTemsilcisi init:', e); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchStats = async (il) => {
    if (!il) return;
    try {
      // ponytail: count queries via getDocs length — good enough for now, upgrade to count() aggregation if >10k docs
      const [sSnap, kSnap, fSnap] = await Promise.all([
        getDocs(query(collection(db, 'sporcular'), where('il', '==', il), limit(500))),
        getDocs(query(collection(db, 'kulupler'),  where('il', '==', il), limit(500))),
        getDocs(query(collection(db, 'federasyonlar'), where('il', '==', il), limit(500))),
      ]);
      const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
      const yeniSnap = await getDocs(query(
        collection(db, 'sporcular'),
        where('il', '==', il),
        where('createdAt', '>=', thisMonth),
        limit(500),
      ));
      setStats({ sporcu: sSnap.size, kulup: kSnap.size, federasyon: fSnap.size, yeniKayit: yeniSnap.size });
    } catch (e) { console.warn('fetchStats:', e); }
  };

  const fetchPending = async (il) => {
    if (!il) return;
    try {
      const snap = await getDocs(query(
        collection(db, 'pendingAthletes'),
        where('il', '==', il),
        orderBy('createdAt', 'desc'),
        limit(20),
      ));
      setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.warn('fetchPending:', e); }
  };

  const fetchDuyurular = async (il) => {
    if (!il) return;
    try {
      const snap = await getDocs(query(
        collection(db, 'duyurular'),
        where('il', '==', il),
        orderBy('createdAt', 'desc'),
        limit(5),
      ));
      setDuyurular(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.warn('fetchDuyurular:', e); }
  };

  const handleApprove = async (athlete) => {
    try {
      await setDoc(doc(db, 'sporcular', athlete.id), {
        approved: true, approvedBy: uid, approvedAt: serverTimestamp(),
      }, { merge: true });
      setPending(p => p.filter(a => a.id !== athlete.id));
    } catch (e) { console.warn('approve:', e); Alert.alert('Hata', 'Onaylama başarısız.'); }
  };

  const handleReject = async (athlete) => {
    try {
      await setDoc(doc(db, 'sporcular', athlete.id), {
        approved: false, rejectedReason: 'İl temsilcisi reddetti',
      }, { merge: true });
      setPending(p => p.filter(a => a.id !== athlete.id));
    } catch (e) { console.warn('reject:', e); Alert.alert('Hata', 'Reddetme başarısız.'); }
  };

  const handleDuyuru = async () => {
    if (!duyuruText.trim()) return;
    try {
      await addDoc(collection(db, 'duyurular'), {
        text: duyuruText.trim(), scope: 'il', il: temsilci.il,
        createdBy: uid, createdAt: serverTimestamp(),
      });
      setDuyuruText('');
      await fetchDuyurular(temsilci.il);
    } catch (e) { console.warn('duyuru:', e); Alert.alert('Hata', 'Duyuru gönderilemedi.'); }
  };

  const handleIlceEkle = async () => {
    if (!ilceInput.trim()) return;
    try {
      await addDoc(collection(db, 'ilTemsilcileri', uid, 'ilceler'), {
        ad: ilceInput.trim(), createdAt: serverTimestamp(),
      });
      setTemsilci(t => ({ ...t, ilce: [...(t.ilce || []), ilceInput.trim()] }));
      setIlceInput('');
    } catch (e) { console.warn('ilce:', e); }
  };

  const handleSaveProfile = async () => {
    setSaving(true); setSaved(false);
    try {
      await setDoc(doc(db, 'ilTemsilcileri', uid), { ...profile, il: temsilci.il }, { merge: true });
      await setDoc(doc(db, 'users', uid), profile, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.warn('saveProfile:', e); Alert.alert('Hata', 'Kaydedilemedi.'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <ActivityIndicator color={C.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.ilAdi}>{temsilci.il || 'İl Belirlenmedi'}</Text>
            <Text style={s.temsilciAdi}>{profile.ad} {profile.soyad}</Text>
            <View style={s.badge}>
              <Text style={s.badgeText}>📍 İl Temsilcisi</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            <Text style={s.editBtnText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* ── İstatistikler ── */}
        <Text style={s.sectionTitle}>İl İstatistikleri</Text>
        <View style={s.statsRow}>
          {[
            { label: 'Sporcu', val: stats.sporcu },
            { label: 'Kulüp', val: stats.kulup },
            { label: 'Federasyon', val: stats.federasyon },
            { label: 'Bu Ay', val: stats.yeniKayit },
          ].map(({ label, val }) => (
            <View key={label} style={s.statCard}>
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Bölge / İlçeler ── */}
        <Text style={s.sectionTitle}>Bölge — {temsilci.il || '?'}</Text>
        <View style={s.card}>
          <Text style={s.ilBig}>{temsilci.il || '—'}</Text>
          {(temsilci.ilce || []).length > 0 && (
            <Text style={s.ilceler}>{(temsilci.ilce || []).join('  •  ')}</Text>
          )}
          <View style={s.row}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
              placeholder="İlçe adı..."
              placeholderTextColor={C.muted}
              value={ilceInput}
              onChangeText={setIlceInput}
            />
            <TouchableOpacity style={s.smallBtn} onPress={handleIlceEkle}>
              <Text style={s.smallBtnText}>+ Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sporcu Onay Kuyruğu ── */}
        <Text style={s.sectionTitle}>Onay Kuyruğu ({pending.length})</Text>
        {pending.length === 0
          ? <View style={s.card}><Text style={s.muted}>Bekleyen sporcu yok.</Text></View>
          : pending.map(a => (
            <View key={a.id} style={s.pendingCard}>
              <View style={{ flex: 1 }}>
                <Text style={s.white}>{a.ad || a.name || a.id}</Text>
                <Text style={s.muted}>{a.spor || a.sport || ''}</Text>
              </View>
              <TouchableOpacity style={s.approveBtn} onPress={() => handleApprove(a)}>
                <Text style={s.approveTxt}>Onayla ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.rejectBtn} onPress={() => handleReject(a)}>
                <Text style={s.rejectTxt}>Reddet ✕</Text>
              </TouchableOpacity>
            </View>
          ))
        }

        {/* ── Duyuru ── */}
        <Text style={s.sectionTitle}>Duyuru Yayınla</Text>
        <View style={s.card}>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Duyuru metni..."
            placeholderTextColor={C.muted}
            value={duyuruText}
            onChangeText={setDuyuruText}
            multiline
          />
          <TouchableOpacity style={s.primaryBtn} onPress={handleDuyuru}>
            <Text style={s.primaryBtnText}>İle Yayınla 📢</Text>
          </TouchableOpacity>
          {duyurular.map(d => (
            <View key={d.id} style={s.duyuruItem}>
              <Text style={s.white}>{d.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Profil Ayarları ── */}
        <Text style={s.sectionTitle}>Profil Ayarları</Text>
        <View style={s.card}>
          {[
            ['Ad', 'ad'], ['Soyad', 'soyad'], ['Email', 'email'], ['Telefon', 'telefon'],
          ].map(([label, key]) => (
            <TextInput
              key={key}
              style={s.input}
              placeholder={label}
              placeholderTextColor={C.muted}
              value={profile[key] || ''}
              onChangeText={v => setProfile(p => ({ ...p, [key]: v }))}
              autoCapitalize="none"
            />
          ))}
          <TextInput
            style={s.input}
            placeholder="İl"
            placeholderTextColor={C.muted}
            value={temsilci.il || ''}
            onChangeText={v => setTemsilci(t => ({ ...t, il: v }))}
          />
          <TouchableOpacity style={s.primaryBtn} onPress={handleSaveProfile} disabled={saving}>
            {saving
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.primaryBtnText}>{saved ? 'Kaydedildi ✓' : 'Kaydet'}</Text>
            }
          </TouchableOpacity>
          {saved && <Text style={s.savedMsg}>Kaydedildi ✓</Text>}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  scroll:       { padding: 16 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  ilAdi:        { fontSize: 22, fontWeight: '800', color: C.white },
  temsilciAdi:  { fontSize: 14, color: C.muted, marginTop: 2 },
  badge:        { backgroundColor: C.primary, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 6 },
  badgeText:    { color: C.white, fontSize: 11, fontWeight: '700' },
  editBtn:      { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText:  { color: C.muted, fontSize: 13 },
  sectionTitle: { color: C.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  statCard:     { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  statVal:      { color: C.white, fontSize: 20, fontWeight: '800' },
  statLabel:    { color: C.muted, fontSize: 10, marginTop: 2 },
  card:         { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14, marginBottom: 4 },
  ilBig:        { color: C.white, fontSize: 24, fontWeight: '800', marginBottom: 6 },
  ilceler:      { color: C.muted, fontSize: 12, marginBottom: 10 },
  row:          { flexDirection: 'row', alignItems: 'center' },
  input:        { backgroundColor: '#0d1117', borderWidth: 1, borderColor: C.border, borderRadius: 8, color: C.white, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14 },
  smallBtn:     { backgroundColor: C.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  smallBtnText: { color: C.white, fontWeight: '700', fontSize: 13 },
  primaryBtn:   { backgroundColor: C.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
  pendingCard:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 8, gap: 8 },
  approveBtn:   { backgroundColor: C.green + '22', borderWidth: 1, borderColor: C.green, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  approveTxt:   { color: C.green, fontWeight: '700', fontSize: 12 },
  rejectBtn:    { backgroundColor: C.red + '22', borderWidth: 1, borderColor: C.red, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  rejectTxt:    { color: C.red, fontWeight: '700', fontSize: 12 },
  duyuruItem:   { borderTopWidth: 1, borderColor: C.border, paddingTop: 10, marginTop: 10 },
  savedMsg:     { color: C.green, textAlign: 'center', marginTop: 8, fontWeight: '700' },
  white:        { color: C.white, fontWeight: '600' },
  muted:        { color: C.muted, fontSize: 12 },
});

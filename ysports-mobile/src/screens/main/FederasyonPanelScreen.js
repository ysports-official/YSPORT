import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, TextInput,
  TouchableOpacity, ActivityIndicator, StatusBar,
  Modal, FlatList, Alert, StyleSheet,
} from 'react-native';
import {
  getFirestore, doc, getDoc, setDoc, collection,
  addDoc, getDocs, query, where, serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

const db = getFirestore(getApp());

export default function FederasyonPanelScreen({ navigation, route }) {
  const [uid, setUid]               = useState(route?.params?.uid || null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  // Profil
  const [fedAdi, setFedAdi]         = useState('');
  const [email, setEmail]           = useState('');
  const [telefon, setTelefon]       = useState('');

  // İstatistikler
  const [stats, setStats]           = useState({ sporcu: 0, kulup: 0, lisans: 0, sgd: 0 });

  // Duyurular
  const [duyuruText, setDuyuruText] = useState('');
  const [duyurular, setDuyurular]   = useState([]);
  const [duyuruSaving, setDuyuruSaving] = useState(false);

  // Modals
  const [sporcuModal, setSporcuModal]   = useState(false);
  const [sporcular, setSporcular]       = useState([]);
  const [onayModal, setOnayModal]       = useState(false);
  const [pendingList, setPendingList]   = useState([]);
  const [lisansModal, setLisansModal]   = useState(false);
  const [lisansAdi, setLisansAdi]       = useState('');
  const [lisansNo, setLisansNo]         = useState('');
  const [lisansSaving, setLisansSaving] = useState(false);

  // ─── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      const auth = getAuth(getApp());
      await getAuth(getApp()).authStateReady();
      const resolvedUid = getAuth(getApp()).currentUser?.uid || route?.params?.uid;
      if (!resolvedUid) { setLoading(false); return; }
      if (active) setUid(resolvedUid);

      try {
        const [fedSnap, sporcuSnap, duyuruSnap] = await Promise.all([
          getDoc(doc(db, 'federasyonlar', resolvedUid)),
          getDocs(collection(db, 'sporcular')),
          getDocs(query(collection(db, 'duyurular'), where('fedUid', '==', resolvedUid))),
        ]);

        if (!active) return;

        if (fedSnap.exists()) {
          const d = fedSnap.data();
          setFedAdi(d.fedAdi || '');
          setEmail(d.email || '');
          setTelefon(d.telefon || '');
          setStats({
            sporcu:  sporcuSnap.size,
            kulup:   d.kulupSayisi  || 0,
            lisans:  d.lisansSayisi || 0,
            sgd:     d.sgdOrtalama  || 0,
          });
        } else {
          setStats(s => ({ ...s, sporcu: sporcuSnap.size }));
        }

        const dList = [];
        duyuruSnap.forEach(s => dList.push({ id: s.id, ...s.data() }));
        dList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setDuyurular(dList.slice(0, 3));
      } catch (e) {
        console.warn('FederasyonPanel init error:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ─── Kaydet ─────────────────────────────────────────────────────
  const kaydet = useCallback(async () => {
    if (!uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'federasyonlar', uid), {
        fedAdi, email, telefon, updatedAt: serverTimestamp(),
      }, { merge: true });
      Alert.alert('Kaydedildi', 'Federasyon bilgileri güncellendi.');
    } catch (e) {
      console.warn('kaydet error:', e);
      Alert.alert('Hata', 'Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  }, [uid, fedAdi, email, telefon]);

  // ─── Sporcu listesi ─────────────────────────────────────────────
  const sporcuListesiGor = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'sporcular'));
      const list = [];
      snap.forEach(s => list.push({ id: s.id, ...s.data() }));
      setSporcular(list);
      setSporcuModal(true);
    } catch (e) {
      console.warn('sporcuListesi error:', e);
    }
  }, []);

  // ─── Bekleyen onaylar ───────────────────────────────────────────
  const onaylariGor = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(collection(db, 'sporcular'), where('onayDurumu', '==', 'bekliyor'))
      );
      const list = [];
      snap.forEach(s => list.push({ id: s.id, ...s.data() }));
      setPendingList(list);
      setOnayModal(true);
    } catch (e) {
      console.warn('onaylar error:', e);
    }
  }, []);

  const sporcuOnayla = useCallback(async (sporcuId) => {
    try {
      await setDoc(doc(db, 'sporcular', sporcuId), { onayDurumu: 'onaylı' }, { merge: true });
      setPendingList(prev => prev.filter(s => s.id !== sporcuId));
    } catch (e) {
      console.warn('onayla error:', e);
    }
  }, []);

  // ─── Lisans ver ─────────────────────────────────────────────────
  const lisansVer = useCallback(async () => {
    if (!lisansAdi.trim() || !lisansNo.trim()) {
      Alert.alert('Eksik Bilgi', 'Sporcu adı ve lisans numarası gerekli.');
      return;
    }
    setLisansSaving(true);
    try {
      await addDoc(collection(db, 'lisanslar'), {
        fedUid: uid, sporcuAdi: lisansAdi, lisansNo,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'federasyonlar', uid), {
        lisansSayisi: (stats.lisans || 0) + 1,
      }, { merge: true });
      setStats(s => ({ ...s, lisans: s.lisans + 1 }));
      setLisansAdi(''); setLisansNo('');
      setLisansModal(false);
      Alert.alert('Lisans Verildi', `${lisansAdi} adına lisans kaydedildi.`);
    } catch (e) {
      console.warn('lisansVer error:', e);
      Alert.alert('Hata', 'Lisans kaydı başarısız.');
    } finally {
      setLisansSaving(false);
    }
  }, [uid, lisansAdi, lisansNo, stats.lisans]);

  // ─── Duyuru yayınla ─────────────────────────────────────────────
  const duyuruYayinla = useCallback(async () => {
    if (!duyuruText.trim()) return;
    setDuyuruSaving(true);
    try {
      const ref = await addDoc(collection(db, 'duyurular'), {
        fedUid: uid, metin: duyuruText, createdAt: serverTimestamp(),
      });
      setDuyurular(prev => [{ id: ref.id, metin: duyuruText }, ...prev].slice(0, 3));
      setDuyuruText('');
    } catch (e) {
      console.warn('duyuru error:', e);
      Alert.alert('Hata', 'Duyuru kaydedilemedi.');
    } finally {
      setDuyuruSaving(false);
    }
  }, [uid, duyuruText]);

  // ─── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor="#090b11" />
        <ActivityIndicator color="#1a4fff" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Sporcu Modal */}
      <Modal visible={sporcuModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Sporcular</Text>
            <FlatList
              data={sporcular}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <Text style={s.modalItem}>{item.ad || item.displayName || item.id}</Text>
              )}
              ListEmptyComponent={<Text style={s.emptyText}>Kayıtlı sporcu yok.</Text>}
            />
            <TouchableOpacity activeOpacity={0.85} style={s.btnClose} onPress={() => setSporcuModal(false)}>
              <Text style={s.btnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Onay Modal */}
      <Modal visible={onayModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Bekleyen Onaylar</Text>
            <FlatList
              data={pendingList}
              keyExtractor={i => i.id}
              renderItem={({ item }) => (
                <View style={s.onayRow}>
                  <Text style={s.modalItem}>{item.ad || item.id}</Text>
                  <TouchableOpacity activeOpacity={0.85} style={s.btnGreen} onPress={() => sporcuOnayla(item.id)}>
                    <Text style={s.btnText}>Onayla</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={s.emptyText}>Bekleyen onay yok.</Text>}
            />
            <TouchableOpacity activeOpacity={0.85} style={s.btnClose} onPress={() => setOnayModal(false)}>
              <Text style={s.btnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lisans Modal */}
      <Modal visible={lisansModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Lisans Ver</Text>
            <TextInput
              style={s.input}
              placeholder="Sporcu Adı"
              placeholderTextColor="#4a6fa5"
              value={lisansAdi}
              onChangeText={setLisansAdi}
            />
            <TextInput
              style={s.input}
              placeholder="Lisans Numarası"
              placeholderTextColor="#4a6fa5"
              value={lisansNo}
              onChangeText={setLisansNo}
            />
            <TouchableOpacity activeOpacity={0.85} style={s.btnPrimary} onPress={lisansVer} disabled={lisansSaving}>
              {lisansSaving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Lisans Kaydet</Text>}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={s.btnClose} onPress={() => setLisansModal(false)}>
              <Text style={s.btnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerEmoji}>🏛️</Text>
          <Text style={s.headerTitle}>{fedAdi || 'Federasyon Adı'}</Text>
          <Text style={s.headerSub}>Federasyon Yönetim Paneli</Text>
        </View>

        {/* İstatistikler */}
        <View style={s.statsRow}>
          <StatCard label="Sporcu" value={stats.sporcu} color="#1a4fff" />
          <StatCard label="Kulüp"  value={stats.kulup}  color="#8b2fff" />
          <StatCard label="Lisans" value={stats.lisans} color="#c9a227" />
          <StatCard label="SGD Ort" value={stats.sgd}   color="#00b97a" />
        </View>

        {/* Sporcu Yönetimi */}
        <SectionTitle>Sporcu Yönetimi</SectionTitle>
        <View style={s.card}>
          <TouchableOpacity activeOpacity={0.85} style={s.btnPrimary} onPress={sporcuListesiGor}>
            <Text style={s.btnText}>Sporcu Listesi Gör</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.btnPurple, s.mt8]} onPress={onaylariGor}>
            <Text style={s.btnText}>Yeni Sporcu Onayla</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.btnGold, s.mt8]} onPress={() => setLisansModal(true)}>
            <Text style={s.btnText}>Lisans Ver</Text>
          </TouchableOpacity>
        </View>

        {/* Duyurular */}
        <SectionTitle>Duyuru Yayınla</SectionTitle>
        <View style={s.card}>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Duyuru metni..."
            placeholderTextColor="#4a6fa5"
            multiline
            numberOfLines={4}
            value={duyuruText}
            onChangeText={setDuyuruText}
          />
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.mt8]} onPress={duyuruYayinla} disabled={duyuruSaving}>
            {duyuruSaving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Yayınla</Text>}
          </TouchableOpacity>
          {duyurular.map(d => (
            <View key={d.id} style={s.duyuruItem}>
              <Text style={s.duyuruText}>{d.metin}</Text>
            </View>
          ))}
        </View>

        {/* Raporlar */}
        <SectionTitle>Raporlar</SectionTitle>
        <View style={s.card}>
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.btnGold]}
            onPress={() => Alert.alert('Rapor', 'PDF raporu hazırlanıyor...')}>
            <Text style={s.btnText}>Aylık Rapor İndir</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.btnPurple, s.mt8]}
            onPress={() => Alert.alert('AI Analiz', 'Performans analizi yakında aktif olacak.')}>
            <Text style={s.btnText}>Performans Analizi</Text>
          </TouchableOpacity>
        </View>

        {/* Ayarlar */}
        <SectionTitle>Ayarlar</SectionTitle>
        <View style={s.card}>
          <Text style={s.label}>Federasyon Adı</Text>
          <TextInput style={s.input} value={fedAdi} onChangeText={setFedAdi}
            placeholder="Federasyon adı" placeholderTextColor="#4a6fa5" />
          <Text style={[s.label, s.mt8]}>E-posta</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail}
            placeholder="iletisim@federasyon.org" placeholderTextColor="#4a6fa5"
            keyboardType="email-address" autoCapitalize="none" />
          <Text style={[s.label, s.mt8]}>Telefon</Text>
          <TextInput style={s.input} value={telefon} onChangeText={setTelefon}
            placeholder="+90 5xx xxx xx xx" placeholderTextColor="#4a6fa5"
            keyboardType="phone-pad" />
          <TouchableOpacity activeOpacity={0.85} style={[s.btnPrimary, s.mt8]} onPress={kaydet} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Kaydet</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[s.statCard, { borderTopColor: color }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#090b11' },
  scroll:       { padding: 16 },
  header:       { alignItems: 'center', marginBottom: 24 },
  headerEmoji:  { fontSize: 48, marginBottom: 8 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  headerSub:    { fontSize: 13, color: '#4a6fa5', marginTop: 4 },

  statsRow:     { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard:     { flex: 1, backgroundColor: '#161d2e', borderRadius: 12, padding: 12,
                  borderTopWidth: 3, alignItems: 'center',
                  borderColor: '#1e2d4a', borderWidth: 1 },
  statValue:    { fontSize: 20, fontWeight: '800' },
  statLabel:    { fontSize: 10, color: '#4a6fa5', marginTop: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#4a6fa5',
                  textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  card:         { backgroundColor: '#161d2e', borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: '#1e2d4a', marginBottom: 24 },

  label:        { fontSize: 12, color: '#4a6fa5', marginBottom: 4 },
  input:        { backgroundColor: '#0d1520', borderWidth: 1, borderColor: '#1e2d4a',
                  borderRadius: 10, padding: 12, color: '#fff', fontSize: 14 },
  textArea:     { height: 90, textAlignVertical: 'top' },

  btnPrimary:   { backgroundColor: '#1a4fff', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnPurple:    { backgroundColor: '#8b2fff' },
  btnGold:      { backgroundColor: '#c9a227' },
  btnGreen:     { backgroundColor: '#00b97a', borderRadius: 8, padding: 8 },
  btnClose:     { backgroundColor: '#1e2d4a', borderRadius: 10, padding: 12,
                  alignItems: 'center', marginTop: 8 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 14 },
  mt8:          { marginTop: 8 },

  duyuruItem:   { marginTop: 12, borderTopWidth: 1, borderTopColor: '#1e2d4a', paddingTop: 10 },
  duyuruText:   { color: '#fff', fontSize: 13, lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: '#161d2e', borderTopLeftRadius: 20, borderTopRightRadius: 20,
                  padding: 20, maxHeight: '75%' },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 16 },
  modalItem:    { color: '#fff', fontSize: 14, paddingVertical: 8,
                  borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  onayRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyText:    { color: '#4a6fa5', textAlign: 'center', paddingVertical: 20 },
});

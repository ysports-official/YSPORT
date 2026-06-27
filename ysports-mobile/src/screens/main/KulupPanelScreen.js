import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  FlatList, Modal, Alert, ActivityIndicator,
  StyleSheet, StatusBar, SafeAreaView,
} from 'react-native';
import {
  getFirestore, doc, getDoc, setDoc, collection,
  addDoc, getDocs, query, where, orderBy, limit,
  serverTimestamp,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const db   = getFirestore(getApp());
const auth = getAuth(getApp());

const C = {
  bg: '#090b11', card: '#161d2e', border: '#1e2d4a',
  primary: '#1a4fff', purple: '#8b2fff', gold: '#c9a227',
  green: '#00b97a', red: '#e84545', sec: '#4a6fa5', white: '#fff',
};

const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// ─── Small helpers ───────────────────────────────────────────────
function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}
function SectionTitle({ title }) {
  return <Text style={s.sectionTitle}>{title}</Text>;
}
function Btn({ label, onPress, color = C.primary, style }) {
  return (
    <TouchableOpacity style={[s.btn, { backgroundColor: color }, style]} onPress={onPress}>
      <Text style={s.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}
function Input({ style, ...props }) {
  return <TextInput style={[s.input, style]} placeholderTextColor={C.sec} {...props} />;
}
function Empty({ msg }) {
  return <Text style={s.empty}>{msg}</Text>;
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function KulupPanelScreen({ navigation, route }) {
  const uid  = route?.params?.uid  || auth.currentUser?.uid || '';
  const role = route?.params?.role || 'kulup';

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Kulüp bilgileri
  const [kulup, setKulup] = useState({
    kulupAdi: '', sehir: '', kurulisYili: '', email: '', telefon: '',
  });
  const [editKulup, setEditKulup] = useState({ ...kulup });

  // Veriler
  const [sporcular,      setSporcular]      = useState([]);
  const [sponsorlar,     setSponsorlar]     = useState([]);
  const [haberler,       setHaberler]       = useState([]);
  const [takvim,         setTakvim]         = useState({});

  // Modallar / formlar
  const [sporcuModal,  setSporcuModal]  = useState(false);
  const [sponsorModal, setSponsorModal] = useState(false);
  const [haberModal,   setHaberModal]   = useState(false);

  const [yeniSporcu,  setYeniSporcu]  = useState({ ad: '', soyad: '', sporDali: '', dogumYili: '' });
  const [yeniSponsor, setYeniSponsor] = useState({ sponsorAdi: '', miktar: '', sporDali: '' });
  const [yeniHaber,   setYeniHaber]   = useState({ baslik: '', icerik: '' });

  // ── Yükle ──
  const loadAll = useCallback(async () => {
    await auth.authStateReady();
    const kulupRef = doc(db, 'kulupler', uid);
    const snap = await getDoc(kulupRef);
    const data = snap.exists() ? snap.data() : {};
    const base = {
      kulupAdi: data.kulupAdi || '',
      sehir: data.sehir || '',
      kurulisYili: data.kurulisYili || '',
      email: data.email || '',
      telefon: data.telefon || '',
    };
    setKulup(base);
    setEditKulup(base);

    const kulupAdi = base.kulupAdi;

    // Sporcular
    if (kulupAdi) {
      const sq = query(collection(db, 'sporcular'), where('kulup', '==', kulupAdi));
      const ss = await getDocs(sq);
      setSporcular(ss.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    // Sponsorlar
    const sponsorSnap = await getDocs(collection(db, 'kulupler', uid, 'sponsorlar'));
    setSponsorlar(sponsorSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // Haberler (son 3)
    if (kulupAdi) {
      const hq = query(
        collection(db, 'haberler'),
        where('kulup', '==', kulupAdi),
        orderBy('createdAt', 'desc'),
        limit(3),
      );
      try {
        const hs = await getDocs(hq);
        setHaberler(hs.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (_) {
        // index yoksa sessiz geç
      }
    }

    // Takvim
    const takSnap = await getDocs(collection(db, 'kulupler', uid, 'takvim'));
    const tak = {};
    takSnap.docs.forEach(d => { tak[d.id] = d.data().saat || ''; });
    setTakvim(tak);

    setLoading(false);
  }, [uid]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Kulüp bilgisi kaydet ──
  const saveKulup = async () => {
    if (!editKulup.kulupAdi.trim()) { Alert.alert('Hata', 'Kulüp adı zorunlu'); return; }
    setSaving(true);
    await setDoc(doc(db, 'kulupler', uid), editKulup, { merge: true });
    setKulup(editKulup);
    setEditMode(false);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    loadAll();
  };

  // ── Sporcu ekle ──
  const addSporcu = async () => {
    const { ad, soyad, sporDali, dogumYili } = yeniSporcu;
    if (!ad.trim() || !soyad.trim() || !sporDali.trim()) {
      Alert.alert('Hata', 'Ad, Soyad ve Spor Dalı zorunlu'); return;
    }
    await addDoc(collection(db, 'sporcular'), {
      ad, soyad, sporDali, dogumYili,
      kulup: kulup.kulupAdi,
      createdAt: serverTimestamp(),
    });
    setYeniSporcu({ ad: '', soyad: '', sporDali: '', dogumYili: '' });
    setSporcuModal(false);
    loadAll();
  };

  // ── Sponsor teklifi ──
  const addSponsor = async () => {
    const { sponsorAdi, miktar, sporDali } = yeniSponsor;
    if (!sponsorAdi.trim()) { Alert.alert('Hata', 'Sponsor adı zorunlu'); return; }
    await addDoc(collection(db, 'sponsorTeklifleri'), {
      sponsorAdi, miktar, sporDali,
      kulup: kulup.kulupAdi,
      kulupUid: uid,
      createdAt: serverTimestamp(),
    });
    // ponytail: ayrıca kulüp sponsorlar subcollection'ına da yaz (liste görünümü için)
    await addDoc(collection(db, 'kulupler', uid, 'sponsorlar'), {
      sponsorAdi, miktar, sporDali, createdAt: serverTimestamp(),
    });
    setYeniSponsor({ sponsorAdi: '', miktar: '', sporDali: '' });
    setSponsorModal(false);
    loadAll();
  };

  // ── Haber yayınla ──
  const addHaber = async () => {
    const { baslik, icerik } = yeniHaber;
    if (!baslik.trim() || !icerik.trim()) { Alert.alert('Hata', 'Başlık ve içerik zorunlu'); return; }
    await addDoc(collection(db, 'haberler'), {
      baslik, icerik,
      kulup: kulup.kulupAdi,
      createdAt: serverTimestamp(),
    });
    setYeniHaber({ baslik: '', icerik: '' });
    setHaberModal(false);
    loadAll();
  };

  // ── Takvim kaydet ──
  const saveTakvim = async () => {
    setSaving(true);
    await Promise.all(
      DAYS.map(gun =>
        setDoc(doc(db, 'kulupler', uid, 'takvim', gun), { saat: takvim[gun] || '' }, { merge: true })
      )
    );
    setSaving(false);
    Alert.alert('✓', 'Takvim kaydedildi');
  };

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <ActivityIndicator color={C.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* ── 1. Header ── */}
        <Card style={s.headerCard}>
          <Text style={s.logo}>🏟️</Text>
          {editMode ? (
            <>
              <Input
                value={editKulup.kulupAdi}
                onChangeText={v => setEditKulup(p => ({ ...p, kulupAdi: v }))}
                placeholder="Kulüp Adı"
                style={s.headerInput}
              />
              <View style={s.row}>
                <Btn label={saving ? '...' : 'Kaydet'} onPress={saveKulup} style={{ flex: 1, marginRight: 6 }} />
                <Btn label="İptal" onPress={() => { setEditMode(false); setEditKulup(kulup); }} color={C.sec} style={{ flex: 1 }} />
              </View>
            </>
          ) : (
            <>
              <Text style={s.kulupAdi}>{kulup.kulupAdi || 'Kulüp Adı Yok'}</Text>
              <Text style={s.kulupMeta}>{kulup.sehir}{kulup.sehir && kulup.kurulisYili ? ' · ' : ''}{kulup.kurulisYili ? `Kuruluş ${kulup.kurulisYili}` : ''}</Text>
              <Btn label="Düzenle" onPress={() => setEditMode(true)} color={C.sec} style={s.editBtn} />
            </>
          )}
          {saved && <Text style={s.savedMsg}>✓ Kaydedildi</Text>}
        </Card>

        {/* ── 2. Özet İstatistikler ── */}
        <SectionTitle title="Özet" />
        <View style={s.statsRow}>
          <StatBox label="Sporcu"         value={sporcular.length} color={C.primary} />
          <StatBox label="Sponsor"        value={sponsorlar.length} color={C.gold}   />
          <StatBox label="Haber"          value={haberler.length}  color={C.purple}  />
        </View>

        {/* ── 3. Kadro ── */}
        <SectionTitle title="Sporcu Kadrosu" />
        <Card>
          {sporcular.length === 0
            ? <Empty msg="Henüz sporcu yok" />
            : sporcular.map(sp => (
              <View key={sp.id} style={s.listRow}>
                <Text style={s.listName}>{sp.ad} {sp.soyad}</Text>
                <Text style={s.listSub}>{sp.sporDali}</Text>
              </View>
            ))
          }
          <Btn label="+ Sporcu Ekle" onPress={() => setSporcuModal(true)} style={{ marginTop: 10 }} />
        </Card>

        {/* ── 4. Antrenman Takvimi ── */}
        <SectionTitle title="Antrenman Takvimi" />
        <Card>
          {DAYS.map(gun => (
            <View key={gun} style={s.takvimRow}>
              <Text style={s.takvimGun}>{gun}</Text>
              <Input
                value={takvim[gun] || ''}
                onChangeText={v => setTakvim(p => ({ ...p, [gun]: v }))}
                placeholder="saat (örn: 18:00)"
                style={s.takvimInput}
              />
            </View>
          ))}
          <Btn label={saving ? 'Kaydediliyor...' : 'Takvimi Kaydet'} onPress={saveTakvim} color={C.green} style={{ marginTop: 10 }} />
        </Card>

        {/* ── 5. Sponsorluk ── */}
        <SectionTitle title="Sponsorluk" />
        <Card>
          {sponsorlar.length === 0
            ? <Empty msg="Henüz sponsor yok" />
            : sponsorlar.map(sp => (
              <View key={sp.id} style={s.listRow}>
                <Text style={s.listName}>{sp.sponsorAdi}</Text>
                <Text style={s.listSub}>{sp.miktar ? `₺${sp.miktar}` : ''}{sp.sporDali ? ` · ${sp.sporDali}` : ''}</Text>
              </View>
            ))
          }
          <Btn label="+ Yeni Sponsor Teklifi" onPress={() => setSponsorModal(true)} color={C.gold} style={{ marginTop: 10 }} />
        </Card>

        {/* ── 6. Haberler ── */}
        <SectionTitle title="Haberler & Duyurular" />
        <Card>
          {haberler.length === 0
            ? <Empty msg="Henüz haber yok" />
            : haberler.map(h => (
              <View key={h.id} style={s.haberRow}>
                <Text style={s.haberBaslik}>{h.baslik}</Text>
                <Text style={s.haberIcerik} numberOfLines={2}>{h.icerik}</Text>
              </View>
            ))
          }
          <Btn label="+ Haber Yayınla" onPress={() => setHaberModal(true)} color={C.purple} style={{ marginTop: 10 }} />
        </Card>

        {/* ── 7. Kulüp Ayarları ── */}
        <SectionTitle title="Kulüp Ayarları" />
        <Card style={{ marginBottom: 32 }}>
          {[
            ['kulupAdi', 'Kulüp Adı'],
            ['sehir', 'Şehir'],
            ['kurulisYili', 'Kuruluş Yılı'],
            ['email', 'İletişim Email'],
            ['telefon', 'Telefon'],
          ].map(([field, label]) => (
            <View key={field} style={{ marginBottom: 10 }}>
              <Text style={s.fieldLabel}>{label}</Text>
              <Input
                value={editKulup[field]}
                onChangeText={v => setEditKulup(p => ({ ...p, [field]: v }))}
                placeholder={label}
                keyboardType={field === 'email' ? 'email-address' : field === 'telefon' ? 'phone-pad' : 'default'}
              />
            </View>
          ))}
          <Btn
            label={saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            onPress={saveKulup}
            style={{ marginTop: 4 }}
          />
          {saved && <Text style={s.savedMsg}>✓ Kaydedildi</Text>}
        </Card>
      </ScrollView>

      {/* ── Sporcu Modal ── */}
      <FormModal
        visible={sporcuModal}
        title="Sporcu Ekle"
        onClose={() => setSporcuModal(false)}
        onSave={addSporcu}
      >
        <Input value={yeniSporcu.ad}        onChangeText={v => setYeniSporcu(p=>({...p,ad:v}))}        placeholder="Ad"          style={s.mInput} />
        <Input value={yeniSporcu.soyad}     onChangeText={v => setYeniSporcu(p=>({...p,soyad:v}))}     placeholder="Soyad"       style={s.mInput} />
        <Input value={yeniSporcu.sporDali}  onChangeText={v => setYeniSporcu(p=>({...p,sporDali:v}))}  placeholder="Spor Dalı"   style={s.mInput} />
        <Input value={yeniSporcu.dogumYili} onChangeText={v => setYeniSporcu(p=>({...p,dogumYili:v}))} placeholder="Doğum Yılı"  style={s.mInput} keyboardType="numeric" />
      </FormModal>

      {/* ── Sponsor Modal ── */}
      <FormModal
        visible={sponsorModal}
        title="Sponsor Teklifi"
        onClose={() => setSponsorModal(false)}
        onSave={addSponsor}
      >
        <Input value={yeniSponsor.sponsorAdi} onChangeText={v => setYeniSponsor(p=>({...p,sponsorAdi:v}))} placeholder="Sponsor Adı"     style={s.mInput} />
        <Input value={yeniSponsor.miktar}     onChangeText={v => setYeniSponsor(p=>({...p,miktar:v}))}     placeholder="Teklif Miktarı ₺" style={s.mInput} keyboardType="numeric" />
        <Input value={yeniSponsor.sporDali}   onChangeText={v => setYeniSponsor(p=>({...p,sporDali:v}))}   placeholder="Spor Dalı"        style={s.mInput} />
      </FormModal>

      {/* ── Haber Modal ── */}
      <FormModal
        visible={haberModal}
        title="Haber Yayınla"
        onClose={() => setHaberModal(false)}
        onSave={addHaber}
      >
        <Input value={yeniHaber.baslik} onChangeText={v => setYeniHaber(p=>({...p,baslik:v}))} placeholder="Başlık" style={s.mInput} />
        <Input
          value={yeniHaber.icerik}
          onChangeText={v => setYeniHaber(p=>({...p,icerik:v}))}
          placeholder="İçerik"
          style={[s.mInput, { height: 80, textAlignVertical: 'top' }]}
          multiline
        />
      </FormModal>
    </SafeAreaView>
  );
}

// ── Reusable modal wrapper ──────────────────────────────────────
function FormModal({ visible, title, onClose, onSave, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <Text style={s.modalTitle}>{title}</Text>
          {children}
          <View style={s.row}>
            <Btn label="İptal"  onPress={onClose} color={C.sec}     style={{ flex: 1, marginRight: 6 }} />
            <Btn label="Kaydet" onPress={onSave}  color={C.primary} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={[s.statBox, { borderColor: color }]}>
      <Text style={[s.statVal, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  scroll:      { padding: 16 },
  card:        { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 },
  headerCard:  { alignItems: 'center', marginBottom: 16 },
  logo:        { fontSize: 56, marginBottom: 8 },
  kulupAdi:    { fontSize: 22, fontWeight: '800', color: C.white, textAlign: 'center' },
  kulupMeta:   { fontSize: 13, color: C.sec, marginTop: 4, marginBottom: 10 },
  editBtn:     { paddingHorizontal: 24, paddingVertical: 6 },
  headerInput: { textAlign: 'center', fontSize: 18, fontWeight: '700', marginBottom: 10, width: '100%' },
  savedMsg:    { color: C.green, marginTop: 8, fontWeight: '700' },
  sectionTitle:{ color: C.sec, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginTop: 4, textTransform: 'uppercase' },
  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox:     { flex: 1, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: 'center' },
  statVal:     { fontSize: 26, fontWeight: '800' },
  statLabel:   { color: C.sec, fontSize: 11, marginTop: 2 },
  listRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  listName:    { color: C.white, fontWeight: '600', fontSize: 14 },
  listSub:     { color: C.sec, fontSize: 12 },
  takvimRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  takvimGun:   { color: C.white, width: 90, fontSize: 13 },
  takvimInput: { flex: 1, paddingVertical: 6 },
  haberRow:    { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  haberBaslik: { color: C.white, fontWeight: '700', marginBottom: 2 },
  haberIcerik: { color: C.sec, fontSize: 12 },
  fieldLabel:  { color: C.sec, fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input:       { backgroundColor: '#0d1420', borderWidth: 1, borderColor: C.border, borderRadius: 8, color: C.white, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
  btn:         { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnText:     { color: C.white, fontWeight: '700', fontSize: 14 },
  empty:       { color: C.sec, textAlign: 'center', paddingVertical: 12, fontSize: 13 },
  row:         { flexDirection: 'row' },
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox:    { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: C.border },
  modalTitle:  { color: C.white, fontSize: 17, fontWeight: '800', marginBottom: 14 },
  mInput:      { marginBottom: 10 },
});

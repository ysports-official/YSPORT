import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { auth } from '../../../services/FirebaseConfig';

const SPORTS = [
  { value: 'Futbol',     label: '⚽ Futbol' },
  { value: 'Basketbol',  label: '🏀 Basketbol' },
  { value: 'Halter',     label: '🏋️ Halter' },
  { value: 'Okçuluk',    label: '🏹 Okçuluk' },
  { value: 'Yüzme',      label: '🏊 Yüzme' },
  { value: 'E-Spor',     label: '🎮 E-Spor' },
  { value: 'Karate',     label: '🥋 Karate' },
  { value: 'Jimnastik',  label: '🤸 Jimnastik' },
  { value: 'Atletizm',   label: '🏃 Atletizm' },
  { value: 'Boks',       label: '🥊 Boks' },
  { value: 'Voleybol',   label: '🏐 Voleybol' },
  { value: 'Diğer',      label: '🌟 Diğer Branşlar...' },
];

const SPORT_FIELDS = {
  Futbol:    [{ id: 'pozisyon', label: 'Pozisyon (Forvet / Orta Saha / Defans)' }, { id: 'dominantAyak', label: 'Dominant Ayak (Sağ / Sol)' }, { id: 'sprintHiz', label: 'Sprint Hızı (km/h)' }],
  Basketbol: [{ id: 'pozisyon', label: 'Pozisyon (Pivot / Kanat / Oyun Kurucu)' }, { id: 'boy', label: 'Boy (cm)' }, { id: 'dikeySicrama', label: 'Dikey Sıçrama (cm)' }],
  Halter:    [{ id: 'agirlikSinifi', label: 'Ağırlık Sınıfı (kg)' }, { id: 'snatch', label: 'En İyi Snatch (kg)' }, { id: 'cleanJerk', label: 'En İyi Clean & Jerk (kg)' }],
  Okçuluk:   [{ id: 'stil', label: 'Stil (Recurve / Compound / Geleneksel)' }, { id: 'mesafe', label: 'Yarışma Mesafesi (m)' }],
  Yüzme:     [{ id: 'stil', label: 'Tercih Stili (Serbest / Kelebek / Sırtüstü / Kurbağalama)' }, { id: 'mesafe', label: 'Ana Mesafe (50m / 100m / 200m+)' }],
  'E-Spor':  [{ id: 'oyun', label: 'Ana Oyun (Valorant / CS2 / LoL / PUBG / FIFA)' }, { id: 'rank', label: 'Anlık Rank/Rating' }],
  Karate:    [{ id: 'disiplin', label: 'Disiplin (Kata / Kumite)' }, { id: 'kusakRengi', label: 'Kuşak Rengi' }, { id: 'agirlikSinifi', label: 'Ağırlık Sınıfı (kg)' }],
  Jimnastik: [{ id: 'tur', label: 'Tür (Artistik / Ritmik / Trampolin)' }, { id: 'seviye', label: 'Seviye (Ülke / Bölge / Kulüp)' }],
  Atletizm:  [{ id: 'dal', label: 'Dal (100m / Uzun Atlama / Disk / Maraton...)' }, { id: 'kisselRecord', label: 'Kişisel Rekor' }],
  Boks:      [{ id: 'sinif', label: 'Ağırlık Sınıfı' }, { id: 'stil', label: 'Stil (Ortodoks / Southpaw)' }, { id: 'record', label: 'Maç Rekoru (G-B-B)' }],
  Voleybol:  [{ id: 'pozisyon', label: 'Pozisyon (Pasör / Smörör / Libero / Ortaoyuncu)' }, { id: 'boy', label: 'Boy (cm)' }],
};

export default function OnboardingScreen({ navigation, route }) {
  const uid  = route?.params?.uid  || '';
  const role = route?.params?.role || 'sporcu';

  const [selectedSport, setSelectedSport]   = useState('');
  const [showPicker,    setShowPicker]       = useState(false);
  const [fieldValues,   setFieldValues]      = useState({});
  const [saving,        setSaving]           = useState(false);

  const fields = SPORT_FIELDS[selectedSport] || [];

  const setField = (id, val) => setFieldValues(prev => ({ ...prev, [id]: val }));

  const complete = async () => {
    if (!selectedSport) {
      Alert.alert('Branş Seçin', 'Lütfen spor branşınızı seçin.');
      return;
    }
    setSaving(true);
    try {
      const u = auth.currentUser;
      if (!u) throw new Error('Oturum yok');
      await setDoc(doc(getFirestore(getApp()), 'users', u.uid), {
        sporDali: selectedSport,
        onboardingData: fieldValues,
        onboardingComplete: true,
        updatedAt: new Date(),
      }, { merge: true });
      navigation.replace('SporcuDashboard', { uid, role });
    } catch (e) {
      Alert.alert('Hata', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🚀</Text>
          <Text style={s.heroTitle}>Profilini Tamamla</Text>
          <Text style={s.heroSub}>
            Y SPORTS dünyasına hoş geldin! Seni daha iyi eşleştirmemiz için branşını ve atletik özelliklerini bilmemiz gerekiyor.
          </Text>
        </View>

        {/* Sport Picker */}
        <Text style={s.fieldLabel}>SPOR BRANŞIN</Text>
        <TouchableOpacity
          style={s.picker}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Text style={[s.pickerText, !selectedSport && { color: '#2a3a5a' }]}>
            {selectedSport
              ? SPORTS.find(x => x.value === selectedSport)?.label || selectedSport
              : 'Seçiniz...'}
          </Text>
          <Text style={s.pickerArrow}>{showPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showPicker && (
          <View style={s.dropdown}>
            {SPORTS.map(sp => (
              <TouchableOpacity
                key={sp.value}
                style={[s.dropdownItem, selectedSport === sp.value && s.dropdownItemActive]}
                onPress={() => { setSelectedSport(sp.value); setShowPicker(false); setFieldValues({}); }}
              >
                <Text style={[s.dropdownText, selectedSport === sp.value && { color: '#fff' }]}>{sp.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dynamic Fields */}
        {selectedSport !== '' && fields.length > 0 && (
          <View style={s.dynamicSection}>
            <View style={s.dynamicHeader}>
              <View style={s.dividerLine} />
              <Text style={s.dynamicTitle}>BRANŞ BİYO-METRİKLERİ</Text>
              <View style={s.dividerLine} />
            </View>

            {fields.map((field, i) => (
              <View key={field.id} style={[s.fieldWrap, i < fields.length - 1 && { marginBottom: 10 }]}>
                <Text style={s.fieldLabel2}>{field.label}</Text>
                <TextInput
                  style={s.input}
                  value={fieldValues[field.id] || ''}
                  onChangeText={v => setField(field.id, v)}
                  placeholderTextColor="#2a3a5a"
                  placeholder="Giriniz..."
                />
              </View>
            ))}

            <TouchableOpacity style={s.submitBtn} onPress={complete} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Sisteme Giriş Yap 🚀</Text>}
            </TouchableOpacity>
          </View>
        )}

        {selectedSport !== '' && fields.length === 0 && (
          <TouchableOpacity style={s.submitBtn} onPress={complete} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>Sisteme Giriş Yap 🚀</Text>}
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#090b11' },
  scroll:         { padding: 16, paddingBottom: 60 },

  hero:           { alignItems: 'center', paddingVertical: 24 },
  heroEmoji:      { fontSize: 40, marginBottom: 12 },
  heroTitle:      { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub:        { color: '#8ba8d4', fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: 16 },

  fieldLabel:     { color: '#8ba8d4', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },

  picker:         { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a', marginBottom: 2 },
  pickerText:     { color: '#fff', fontSize: 14 },
  pickerArrow:    { color: '#8ba8d4', fontSize: 12 },

  dropdown:       { backgroundColor: '#161d2e', borderRadius: 14, borderWidth: 1, borderColor: '#1e2d4a', marginBottom: 16, overflow: 'hidden' },
  dropdownItem:   { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  dropdownItemActive: { backgroundColor: '#1a4fff22' },
  dropdownText:   { color: '#8ba8d4', fontSize: 14 },

  dynamicSection: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e2d4a', marginTop: 12 },
  dynamicHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: '#1e2d4a' },
  dynamicTitle:   { color: '#1a4fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  fieldWrap:      {},
  fieldLabel2:    { color: '#8ba8d4', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  input:          { backgroundColor: '#0d1117', borderRadius: 12, padding: 14, color: '#fff', fontSize: 13, borderWidth: 1, borderColor: '#1e2d4a' },

  submitBtn:      { backgroundColor: '#1a4fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText:  { color: '#fff', fontSize: 15, fontWeight: '800' },
});

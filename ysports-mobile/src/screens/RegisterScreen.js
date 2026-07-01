import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../services/FirebaseConfig';

const SEHIRLER = ['Antalya', 'Samsun', 'İstanbul', 'Ankara', 'İzmir', 'Diğer'];
const SPOR_DALLARI = ['Atletizm', 'Yüzme', 'Güreş', 'Boks', 'Futbol', 'Karate', 'Diğer'];
const SEVIYELER = ['Olimpiyat/Dünya', 'Milli Sporcu', 'Süper Lig', 'Bölgesel', 'Amatör'];
const GELIR_ARALIKLARI = ['₺3.000–₺5.000', '₺5.000–₺10.000', '₺10.000–₺20.000', '₺20.000–₺50.000', '₺50.000+'];

const STEPS = ['1 · Kişisel', '2 · Spor', '3 · Tercih', '4 · Onay'];

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [dogumYili, setDogumYili] = useState('');
  const [cinsiyet, setCinsiyet] = useState('Erkek');
  const [tcKimlik, setTcKimlik] = useState('');
  const [sehir, setSehir] = useState(SEHIRLER[0]);
  const [telefon, setTelefon] = useState('');

  const [sporDali, setSporDali] = useState(SPOR_DALLARI[0]);
  const [kariyerYili, setKariyerYili] = useState('');
  const [seviye, setSeviye] = useState(SEVIYELER[0]);

  const [gelirBeklentisi, setGelirBeklentisi] = useState(GELIR_ARALIKLARI[0]);
  const [videoSayisi, setVideoSayisi] = useState('4');
  const [instagram, setInstagram] = useState('');

  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [kosullarOnay, setKosullarOnay] = useState(false);

  const canNext1 = ad.trim() && soyad.trim() && dogumYili.length === 4 && tcKimlik.length === 11 && telefon.replace(/\D/g, '').length >= 10;

  const handleComplete = async () => {
    if (!kvkkOnay || !kosullarOnay) {
      Alert.alert('Uyarı', 'Devam etmek için KVKK ve Kullanım Koşullarını onaylayın.');
      return;
    }
    setSaving(true);
    try {
      const res = await signInAnonymously(auth);
      const uid = res.user.uid;
      const db = getFirestore(getApp());
      await setDoc(doc(db, 'users', uid), {
        uid, role: 'sporcu', displayName: `${ad} ${soyad}`, phone: telefon,
        updatedAt: serverTimestamp(), createdAt: serverTimestamp(),
      }, { merge: true });
      await setDoc(doc(db, 'sporcular', uid), {
        uid, ad, soyad, dogumYili, cinsiyet, sehir, telefon,
        sporDali, kariyerYili, seviye,
        gelirBeklentisi, videoSayisi, instagram,
        updatedAt: serverTimestamp(), createdAt: serverTimestamp(),
      }, { merge: true });
      navigation.replace('Main', { role: 'sporcu', uid });
    } catch (e) {
      setSaving(false);
      Alert.alert('Hata', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()}>
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Sporcu Kaydı</Text>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{step}/4</Text></View>
          </View>

          <View style={styles.tabs}>
            {STEPS.map((s, i) => (
              <View key={s} style={[styles.tab, i + 1 === step && styles.tabOn, i + 1 < step && styles.tabDone]}>
                <Text style={[styles.tabText, i + 1 === step && styles.tabTextOn]}>{s}</Text>
              </View>
            ))}
          </View>

          {step === 1 && (
            <View style={styles.section}>
              <Field label="Ad *"><TextInput style={styles.inp} placeholder="Adınız" placeholderTextColor="#4a6fa5" value={ad} onChangeText={setAd} /></Field>
              <Field label="Soyad *"><TextInput style={styles.inp} placeholder="Soyadınız" placeholderTextColor="#4a6fa5" value={soyad} onChangeText={setSoyad} /></Field>
              <View style={styles.row2}>
                <Field style={{ flex: 1 }} label="Doğum Yılı *"><TextInput style={styles.inp} placeholder="2002" placeholderTextColor="#4a6fa5" keyboardType="number-pad" maxLength={4} value={dogumYili} onChangeText={setDogumYili} /></Field>
                <Field style={{ flex: 1 }} label="Cinsiyet">
                  <ChipSelect options={['Erkek', 'Kadın']} value={cinsiyet} onChange={setCinsiyet} />
                </Field>
              </View>
              <Field label="TC Kimlik No *"><TextInput style={styles.inp} placeholder="12345678901" placeholderTextColor="#4a6fa5" keyboardType="number-pad" maxLength={11} value={tcKimlik} onChangeText={setTcKimlik} /></Field>
              <Field label="Şehir *">
                <ChipSelect options={SEHIRLER} value={sehir} onChange={setSehir} />
              </Field>
              <Field label="Telefon *"><TextInput style={styles.inp} placeholder="05XX XXX XX XX" placeholderTextColor="#4a6fa5" keyboardType="phone-pad" value={telefon} onChangeText={setTelefon} /></Field>
              <TouchableOpacity style={[styles.btn, { opacity: canNext1 ? 1 : 0.4 }]} disabled={!canNext1} onPress={() => setStep(2)}>
                <Text style={styles.btnText}>Devam Et →</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.section}>
              <Field label="Spor Dalı *">
                <ChipSelect options={SPOR_DALLARI} value={sporDali} onChange={setSporDali} />
              </Field>
              <Field label="Kariyer Yılı *"><TextInput style={styles.inp} placeholder="8" placeholderTextColor="#4a6fa5" keyboardType="number-pad" value={kariyerYili} onChangeText={setKariyerYili} /></Field>
              <Field label="Rekabet Seviyesi *">
                <ChipSelect options={SEVIYELER} value={seviye} onChange={setSeviye} />
              </Field>
              <TouchableOpacity style={styles.btn} onPress={() => setStep(3)}><Text style={styles.btnText}>Devam Et →</Text></TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.section}>
              <Field label="Aylık Gelir Beklentisi">
                <ChipSelect options={GELIR_ARALIKLARI} value={gelirBeklentisi} onChange={setGelirBeklentisi} vertical />
              </Field>
              <Field label="Aylık Video Sayısı">
                <ChipSelect options={['2', '4', '6']} labels={{ '2': '2 video/ay', '4': '4 video/ay', '6': '6 video/ay' }} value={videoSayisi} onChange={setVideoSayisi} />
              </Field>
              <Field label="Instagram Takipçi"><TextInput style={styles.inp} placeholder="5000" placeholderTextColor="#4a6fa5" keyboardType="number-pad" value={instagram} onChangeText={setInstagram} /></Field>
              <TouchableOpacity style={styles.btn} onPress={() => setStep(4)}><Text style={styles.btnText}>Devam Et →</Text></TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.section}>
              <Text style={styles.stepIcon}>📄</Text>
              <Text style={styles.stepTitle}>Son Adım</Text>
              <View style={styles.kvkkBox}>
                <Text style={styles.kvkkText}>KVKK kapsamında verileriniz korunmaktadır.</Text>
              </View>
              <TouchableOpacity style={styles.checkRow} onPress={() => setKvkkOnay(!kvkkOnay)}>
                <View style={[styles.checkbox, kvkkOnay && styles.checkboxOn]}>{kvkkOnay && <Text style={styles.checkMark}>✓</Text>}</View>
                <Text style={styles.checkLabel}>KVKK Aydınlatma Metnini okudum, kabul ediyorum.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.checkRow} onPress={() => setKosullarOnay(!kosullarOnay)}>
                <View style={[styles.checkbox, kosullarOnay && styles.checkboxOn]}>{kosullarOnay && <Text style={styles.checkMark}>✓</Text>}</View>
                <Text style={styles.checkLabel}>Kullanım Koşullarını kabul ediyorum.</Text>
              </TouchableOpacity>
              {saving ? (
                <View style={styles.centerBox}><ActivityIndicator color="#c9a227" size="large" /><Text style={styles.loadMsg}>Kaydediliyor...</Text></View>
              ) : (
                <TouchableOpacity style={[styles.btn, { opacity: kvkkOnay && kosullarOnay ? 1 : 0.4 }]} disabled={!kvkkOnay || !kosullarOnay} onPress={handleComplete}>
                  <Text style={styles.btnText}>🎉 Kayıt Tamamla!</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children, style }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ChipSelect({ options, labels, value, onChange, vertical }) {
  return (
    <View style={vertical ? styles.chipCol : styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, value === opt && styles.chipOn, vertical && styles.chipFull]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.chipText, value === opt && styles.chipTextOn]}>{labels?.[opt] || opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b11' },
  scroll:    { flexGrow: 1, padding: 20 },
  topRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn:   { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { color: '#fff', fontSize: 32, fontWeight: '300' },
  title:     { flex: 1, color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginRight: 40 },
  stepBadge: { backgroundColor: 'rgba(74,63,255,.2)', borderWidth: 1, borderColor: 'rgba(74,63,255,.3)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  stepBadgeText: { color: '#a78bfa', fontSize: 10, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  tab:  { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#161d2e', alignItems: 'center' },
  tabOn: { backgroundColor: '#1a4fff' },
  tabDone: { backgroundColor: '#16324f' },
  tabText: { color: '#4a6fa5', fontSize: 9, fontWeight: '700' },
  tabTextOn: { color: '#fff' },
  section: { gap: 12 },
  row2: { flexDirection: 'row', gap: 10 },
  label: { color: '#8ba8d4', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  inp: { backgroundColor: '#161d2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#1e2d4a' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipCol: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#161d2e', borderWidth: 1, borderColor: '#1e2d4a' },
  chipFull: { alignSelf: 'stretch' },
  chipOn: { backgroundColor: '#1a4fff', borderColor: '#1a4fff' },
  chipText: { color: '#8ba8d4', fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  btn: { backgroundColor: '#1a4fff', borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  stepIcon: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  stepTitle: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  kvkkBox: { backgroundColor: 'rgba(74,63,255,.08)', borderWidth: 1, borderColor: 'rgba(74,63,255,.2)', borderRadius: 12, padding: 12, marginBottom: 12 },
  kvkkText: { color: '#a78bfa', fontSize: 11, lineHeight: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: '#4a6fa5', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxOn: { backgroundColor: '#1a4fff', borderColor: '#1a4fff' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '900' },
  checkLabel: { flex: 1, color: '#c8d8ff', fontSize: 12, lineHeight: 18 },
  centerBox: { alignItems: 'center', gap: 12, paddingTop: 20 },
  loadMsg: { color: '#fff', fontSize: 14 },
});

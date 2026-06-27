import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { signInAnonymously, getAuth } from 'firebase/auth';

const TEST_PHONE = '5550000000';
const TEST_CODE  = '123456';

const ROLE_META = {
  sporcu:     { icon: '🏃',  color: '#1a4fff' },
  federasyon: { icon: '🏛️', color: '#8b2fff' },
  kulup:      { icon: '🛡️', color: '#c9a227' },
  temsilci:   { icon: '🏙️', color: '#00b97a' },
};

async function saveUser(user, role) {
  try {
    const db = getFirestore(getApp());
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid, role,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    const cols = { sporcu: 'sporcular', federasyon: 'federasyonlar', kulup: 'kuluplar', temsilci: 'temsilciler' };
    if (cols[role]) {
      await setDoc(doc(db, cols[role], user.uid), {
        uid: user.uid, updatedAt: serverTimestamp(),
      }, { merge: true });
    }
  } catch (e) { console.warn('saveUser:', e.message); }
}

export default function LoginScreen({ navigation, route }) {
  const role      = route?.params?.role      || 'sporcu';
  const roleLabel = route?.params?.roleLabel || 'Sporcu Girişi';
  const roleColor = route?.params?.roleColor || '#1a4fff';
  const meta      = ROLE_META[role] || ROLE_META.sporcu;

  const [phone, setPhone] = useState('');
  const [otp,   setOtp]   = useState('');
  const [stage, setStage] = useState('idle');
  const [msg,   setMsg]   = useState('');

  const fmt = () => '+90' + phone.replace(/\D/g, '').slice(-10);

  const handlePhone = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Uyarı', 'Geçerli telefon numarası girin.'); return;
    }
    setStage('sending'); setMsg('Kod gönderiliyor...');
    await new Promise(r => setTimeout(r, 700));
    setStage('otp');
    setMsg(fmt() + ' numarasına kod gönderildi.');
  };

  const handleOtp = async () => {
    if (otp.length < 4) return;
    setStage('verifying'); setMsg('Doğrulanıyor...');
    const isTest = phone.replace(/\D/g, '').endsWith(TEST_PHONE) && otp === TEST_CODE;
    if (isTest) {
      try {
        const res = await signInAnonymously(getAuth(getApp()));
        await saveUser(res.user, role);
        setStage('done'); setMsg('Giriş başarılı!');
        setTimeout(() => navigation.replace('Main', { role, uid: res.user.uid }), 700);
      } catch (e) { setStage('otp'); setMsg('Hata: ' + e.message); }
    } else {
      setStage('otp'); setMsg('Hatalı kod. Lütfen tekrar deneyin.');
    }
  };

  const handleGoogle = async () => {
    setStage('sending'); setMsg('Bağlanılıyor...');
    try {
      const res = await signInAnonymously(getAuth(getApp()));
      await saveUser(res.user, role);
      setStage('done'); setMsg('Giriş başarılı!');
      setTimeout(() => navigation.replace('Main', { role, uid: res.user.uid }), 700);
    } catch (e) { setStage('idle'); Alert.alert('Hata', e.message); }
  };

  const loading = stage === 'sending' || stage === 'verifying';
  const showOtp = stage === 'otp';
  const done    = stage === 'done';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={[styles.badge, { borderColor: roleColor + '60', backgroundColor: roleColor + '18' }]}>
            <Text style={styles.badgeIcon}>{meta.icon}</Text>
            <Text style={[styles.badgeLabel, { color: roleColor }]}>{roleLabel}</Text>
          </View>

          <Text style={styles.title}>Giriş Yap</Text>
          <Text style={styles.sub}>Y SPORTS hesabınıza güvenli erişim</Text>

          {!showOtp && !loading && !done && (
            <View style={styles.section}>
              <Text style={styles.label}>Telefon Numarası</Text>
              <View style={styles.phoneRow}>
                <View style={styles.flagBox}><Text style={styles.flag}>🇹🇷 +90</Text></View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="555 000 0000"
                  placeholderTextColor="#1e2d4a"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phone}
                  onChangeText={setPhone}
                  autoFocus
                />
              </View>
              <TouchableOpacity style={[styles.btn, { backgroundColor: roleColor }]} onPress={handlePhone}>
                <Text style={styles.btnText}>Doğrulama Kodu Gönder</Text>
              </TouchableOpacity>
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>veya</Text>
                <View style={styles.orLine} />
              </View>
              <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleText}>Google ile Giriş Yap</Text>
              </TouchableOpacity>
              <Text style={styles.hint}>Test: 5550000000 / 123456</Text>
            </View>
          )}

          {showOtp && (
            <View style={styles.section}>
              <Text style={styles.otpMsg}>{msg}</Text>
              <TextInput
                style={[styles.otpInput, { borderColor: roleColor }]}
                placeholder="• • • • • •"
                placeholderTextColor="#1e2d4a"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: roleColor, opacity: otp.length >= 4 ? 1 : 0.4 }]}
                onPress={handleOtp}
                disabled={otp.length < 4}
              >
                <Text style={styles.btnText}>Doğrula</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.retryBtn} onPress={() => { setStage('idle'); setOtp(''); }}>
                <Text style={styles.retryText}>← Numarayı değiştir</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={roleColor} />
              <Text style={styles.loadMsg}>{msg}</Text>
            </View>
          )}

          {done && (
            <View style={styles.centerBox}>
              <Text style={styles.doneIcon}>✓</Text>
              <Text style={[styles.loadMsg, { color: '#00b97a' }]}>{msg}</Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b11' },
  scroll:    { flexGrow: 1, padding: 20 },
  backBtn:   { marginBottom: 20, width: 40, height: 40, justifyContent: 'center' },
  backArrow: { color: '#fff', fontSize: 32, fontWeight: '300' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 20 },
  badgeIcon:  { fontSize: 18 },
  badgeLabel: { fontSize: 13, fontWeight: '700' },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 6 },
  sub:   { color: '#4a6fa5', fontSize: 12, marginBottom: 28 },
  section: { gap: 12 },
  label:   { color: '#8ba8d4', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  phoneRow:   { flexDirection: 'row', gap: 10 },
  flagBox:    { backgroundColor: '#161d2e', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  flag:       { color: '#fff', fontSize: 14, fontWeight: '700' },
  phoneInput: { flex: 1, backgroundColor: '#161d2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: '#fff', fontSize: 18, fontWeight: '600', borderWidth: 1, borderColor: '#1e2d4a', letterSpacing: 1 },
  btn:     { borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  orRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  orLine:  { flex: 1, height: 1, backgroundColor: '#1e2d4a' },
  orText:  { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  googleBtn:  { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  googleG:    { color: '#4285F4', fontSize: 20, fontWeight: '900' },
  googleText: { color: '#1a1a1a', fontSize: 15, fontWeight: '700' },
  hint:       { color: '#2a3a5a', fontSize: 11, textAlign: 'center' },
  otpMsg:     { color: '#8ba8d4', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  otpInput:   { backgroundColor: '#161d2e', borderRadius: 14, paddingVertical: 20, textAlign: 'center', color: '#1a4fff', fontSize: 28, fontWeight: '900', letterSpacing: 8, borderWidth: 2, marginBottom: 4 },
  retryBtn:   { alignItems: 'center', paddingVertical: 12 },
  retryText:  { color: '#4a6fa5', fontSize: 13 },
  centerBox:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingTop: 60 },
  loadMsg:    { color: '#fff', fontSize: 15, textAlign: 'center' },
  doneIcon:   { fontSize: 56, color: '#00b97a' },
});

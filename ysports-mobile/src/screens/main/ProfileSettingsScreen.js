import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { auth } from '../../services/FirebaseConfig';

export default function ProfileSettingsScreen({ navigation, route }) {
  const uid  = route?.params?.uid  || '';
  const role = route?.params?.role || 'sporcu';

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [notifs,   setNotifs]   = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [wearable, setWearable] = useState(true);
  const [devMode,  setDevMode]  = useState(false);

  const [ad,      setAd]      = useState('');
  const [soyad,   setSoyad]   = useState('');
  const [yas,     setYas]     = useState('');
  const [sehir,   setSehir]   = useState('');
  const [branch,  setBranch]  = useState('');

  useEffect(() => {
    (async () => {
      try {
        await auth.authStateReady();
        const u = auth.currentUser;
        if (!u) { setLoading(false); return; }
        const snap = await getDoc(doc(getFirestore(getApp()), 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data();
          const parts = (d.displayName || '').split(' ');
          setAd(d.ad || parts[0] || '');
          setSoyad(d.soyad || parts.slice(1).join(' ') || '');
          setYas(String(d.yas || ''));
          setSehir(d.sehir || '');
          setBranch(d.sporDali || '');
        }
      } catch (e) {
        console.warn('ProfileSettings load:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const save = async () => {
    setSaving(true);
    try {
      const u = auth.currentUser;
      if (!u) throw new Error('Oturum yok');
      await setDoc(doc(getFirestore(getApp()), 'users', u.uid), {
        ad, soyad,
        displayName: `${ad} ${soyad}`.trim(),
        yas: Number(yas) || 0,
        sehir, sporDali: branch,
        updatedAt: new Date(),
      }, { merge: true });
      Alert.alert('Kaydedildi', 'Profiliniz güncellendi.');
    } catch (e) {
      Alert.alert('Hata', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}><ActivityIndicator color="#1a4fff" size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Header */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>⚙️ Ayarlar</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}><Text style={s.avatarIcon}>🧑</Text></View>
          <TouchableOpacity style={s.changePhotoBtn}>
            <Text style={s.changePhotoText}>Resim Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Hesap Ayarları */}
        <Text style={s.sectionHeader}>Hesap & Güvenlik</Text>
        <View style={s.group}>
          <Field label="Ad"    value={ad}     onChangeText={setAd} />
          <Field label="Soyad" value={soyad}  onChangeText={setSoyad} />
          <Field label="Yaş"   value={yas}    onChangeText={setYas}    keyboardType="numeric" />
          <Field label="Şehir" value={sehir}  onChangeText={setSehir} />
          <Field label="Branş" value={branch} onChangeText={setBranch} last />
          <TouchableOpacity style={s.saveBtn} onPress={save} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Kaydet ve Güncelle</Text>}
          </TouchableOpacity>
        </View>

        {/* Uygulama Tercihleri */}
        <Text style={s.sectionHeader}>Uygulama Tercihleri</Text>
        <View style={s.group}>
          <PrefRow
            title="Karanlık Mod (Dark Mode)"
            desc="Göz yormayan siyah arayüz"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <PrefRow
            title="Push Bildirimleri"
            desc="Sponsorluk tekliflerini anında al"
            value={notifs}
            onValueChange={setNotifs}
          />
          <PrefRow
            title="Giyilebilir Cihaz Senkronu"
            desc="Apple Watch, WHOOP arka plan veri aktarımı"
            value={wearable}
            onValueChange={setWearable}
            last
          />
        </View>

        {/* Hukuk & Sözleşmeler */}
        <Text style={s.sectionHeader}>Hukuk & Resmi Sözleşmeler</Text>
        <View style={s.group}>
          {[
            { icon: '🏃', title: 'Sporcu İmaj Sözleşmesi', sub: 'Performans ve KVKK Metni', type: 'sporcu', color: '#1a4fff' },
            { icon: '🤝', title: 'Sponsorluk Anlaşması',   sub: 'Küresel Rekabet Yasakları', type: 'sponsor', color: '#00b97a' },
            { icon: '🛡️', title: 'Kulüp İzleme Lisansı',  sub: 'Yetiştirme Bedeli Taahhüdü',type: 'kulup',  color: '#8b2fff' },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.type}
              style={[s.contractRow, i < arr.length - 1 && s.contractRowBorder]}
              onPress={() => navigation.navigate('ContractView', { uid, role, contractType: item.type })}
            >
              <View style={[s.contractIcon, { backgroundColor: item.color + '22' }]}>
                <Text style={s.contractIconText}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.contractTitle}>{item.title}</Text>
                <Text style={s.contractSub}>{item.sub}</Text>
              </View>
              <Text style={s.rowArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Geliştirici Modu */}
        <Text style={s.sectionHeader}>Geliştirici & Sistem</Text>
        <View style={s.group}>
          <PrefRow
            title="Kaldırım Mühendisi Modu"
            desc="Hata ayıklama ve derin analiz telemetrisi"
            value={devMode}
            onValueChange={(v) => {
              setDevMode(v);
              if (v) Alert.alert('KM Modu Aktif!', 'Debug telemetrisi açıldı.');
            }}
            titleColor="#c9a227"
            last
          />
        </View>

        {/* Çıkış */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() => Alert.alert('Çıkış', 'Hesabınızdan çıkmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış Yap', style: 'destructive', onPress: () => auth.signOut() },
          ])}
        >
          <Text style={s.logoutText}>Hesaptan Çıkış Yap</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, keyboardType, last }) {
  return (
    <View style={[styles.field, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        placeholderTextColor="#2a3a5a"
      />
    </View>
  );
}

function PrefRow({ title, desc, value, onValueChange, titleColor, last }) {
  return (
    <View style={[styles.prefRow, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.prefTitle, titleColor && { color: titleColor }]}>{title}</Text>
        <Text style={styles.prefDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#1e2d4a', true: '#1a4fff' }}
        thumbColor={value ? '#fff' : '#4a6fa5'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topbar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  backText:      { color: '#fff', fontSize: 28, lineHeight: 32 },
  title:         { color: '#fff', fontSize: 16, fontWeight: '800' },
  scroll:        { padding: 16, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatar:        { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1a4fff22', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1a4fff44', marginBottom: 8 },
  avatarIcon:    { fontSize: 36 },
  changePhotoBtn:{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d4a' },
  changePhotoText:{ color: '#8ba8d4', fontSize: 11 },

  sectionHeader: { color: '#8ba8d4', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  group:         { backgroundColor: '#161d2e', borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: '#1e2d4a', overflow: 'hidden' },
  saveBtn:       { backgroundColor: '#1a4fff', margin: 12, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText:   { color: '#fff', fontSize: 14, fontWeight: '800' },

  contractRow:   { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  contractRowBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  contractIcon:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  contractIconText:{ fontSize: 18 },
  contractTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  contractSub:   { color: '#8ba8d4', fontSize: 10, marginTop: 1 },
  rowArrow:      { color: '#2a3a5a', fontSize: 18 },

  logoutBtn:     { borderWidth: 1, borderColor: '#e8454544', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  logoutText:    { color: '#e84545', fontSize: 14, fontWeight: '700' },
});

const styles = StyleSheet.create({
  field:       { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 14, paddingVertical: 12 },
  fieldLabel:  { color: '#8ba8d4', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  fieldInput:  { color: '#fff', fontSize: 15, fontWeight: '600' },
  prefRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  prefTitle:   { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  prefDesc:    { color: '#8ba8d4', fontSize: 10 },
});

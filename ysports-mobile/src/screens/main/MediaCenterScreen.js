import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SAMPLE_VIDEOS = [
  { id: 1, title: 'Karate Kata Temel Çalışma Seansı', date: '12 Mayıs 2026', views: '1.2K', duration: '0:35', icon: '🥋', approved: true },
];

export default function MediaCenterScreen({ navigation, route }) {
  const uid  = route?.params?.uid  || '';
  const role = route?.params?.role || 'sporcu';

  const [scanState,   setScanState]   = useState('idle'); // idle | scanning | done
  const [scanResult,  setScanResult]  = useState(null);
  const [socialLink,  setSocialLink]  = useState('');
  const [socialScan,  setSocialScan]  = useState('idle');
  const [socialResult,setSocialResult]= useState(null);

  const triggerScan = () => {
    setScanState('scanning');
    setScanResult(null);
    const steps = ['Süre Doğrulanıyor...', 'Sponsor Marka Varlığı Aranıyor...', 'Sonuç Hesaplanıyor...'];
    steps.forEach((step, i) => {
      setTimeout(() => {
        if (i === steps.length - 1) {
          setScanState('done');
          setScanResult({ ok: true, label: '✓ AI ONAYLANDI', color: '#00b97a' });
        }
      }, (i + 1) * 1200);
    });
  };

  const triggerSocialScan = () => {
    if (!socialLink.trim()) {
      Alert.alert('Link Gerekli', 'Lütfen bir Instagram veya TikTok linki girin.');
      return;
    }
    setSocialScan('scanning');
    setSocialResult(null);
    setTimeout(() => {
      setSocialScan('done');
      setSocialResult({
        ok: Math.random() > 0.3,
        label: Math.random() > 0.3 ? '✓ @ysports etiketi bulundu' : '✗ Etiket bulunamadı',
      });
    }, 3000);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Header */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>🎬 Medya Merkezi</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* AI Scan Widget */}
        <View style={s.scanWidget}>
          <Text style={s.scanLabel}>🤖 AI Video Taahhüt Analizi</Text>
          {scanState === 'idle' && (
            <Text style={s.scanIdle}>Yeni video yüklemek için aşağıdaki butonu kullanın.</Text>
          )}
          {scanState === 'scanning' && (
            <View style={s.scanChecks}>
              <Text style={s.scanCheckItem}>⏳ Süre Doğrulanıyor (Min 15 sn)...</Text>
              <Text style={s.scanCheckItem}>⏳ Sponsor Marka Varlığı Aranıyor...</Text>
              <Text style={s.scanCheckItem}>⏳ Sonuç: Hesaplanıyor...</Text>
            </View>
          )}
          {scanState === 'done' && scanResult && (
            <View style={[s.scanResult, { borderColor: scanResult.ok ? '#00b97a44' : '#e8454544' }]}>
              <Text style={[s.scanResultText, { color: scanResult.ok ? '#00b97a' : '#e84545' }]}>
                {scanResult.label}
              </Text>
            </View>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={s.uploadBtn}
          onPress={() => {
            Alert.alert(
              'Video Yükle',
              'Dosya seçici yakında aktif olacak. Şimdilik simüle ediyoruz.',
              [{ text: 'Tamam', onPress: triggerScan }]
            );
          }}
        >
          <Text style={s.uploadBtnText}>+ Yeni Taahhüt Videosu Yükle</Text>
        </TouchableOpacity>

        <Text style={s.uploadHint}>
          Aylık en az <Text style={{ color: '#a78bfa', fontWeight: '700' }}>2 video</Text> yükümlülüğünüz var
        </Text>

        {/* Video Archive */}
        <Text style={s.sectionTitle}>VİDEO ARŞİVİ</Text>
        {SAMPLE_VIDEOS.map(v => (
          <TouchableOpacity key={v.id} style={s.videoCard} activeOpacity={0.8}>
            <View style={s.videoThumb}>
              <Text style={s.videoThumbIcon}>{v.icon}</Text>
              <Text style={s.videoDuration}>{v.duration}</Text>
              {v.approved && (
                <View style={s.approvedBadge}>
                  <Text style={s.approvedText}>AI ONAYLANDI ✓</Text>
                </View>
              )}
            </View>
            <View style={s.videoInfo}>
              <Text style={s.videoTitle}>{v.title}</Text>
              <View style={s.videoMeta}>
                <Text style={s.videoDate}>{v.date}</Text>
                <Text style={s.videoViews}>👁 {v.views}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Social Media Validator */}
        <View style={s.socialCard}>
          <View style={s.socialHeader}>
            <View style={s.socialTitleRow}>
              <Text style={s.socialIcon}>📱</Text>
              <Text style={s.socialTitle}>AI Sosyal Medya Doğrulayıcı</Text>
            </View>
            <View style={s.privacyBadge}>
              <Text style={s.privacyText}>Gizlilik Dostu</Text>
            </View>
          </View>

          <Text style={s.socialDesc}>
            Hesabınızı bağlamanıza gerek yok! Instagram veya TikTok gönderinizde{' '}
            <Text style={{ color: '#818cf8', fontWeight: '700' }}>@ysports</Text>{' '}
            etiketini kullanın, gönderinin açık linkini aşağıya yapıştırın.
          </Text>

          <View style={s.socialInputRow}>
            <TextInput
              style={s.socialInput}
              placeholder="https://www.instagram.com/p/..."
              placeholderTextColor="#2a3a5a"
              value={socialLink}
              onChangeText={setSocialLink}
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.socialBtn} onPress={triggerSocialScan}>
              <Text style={s.socialBtnText}>AI Doğrula</Text>
            </TouchableOpacity>
          </View>

          {socialScan === 'scanning' && (
            <View style={s.socialStatus}>
              <Text style={s.socialStatusText}>⏳ Taranıyor...</Text>
              <Text style={s.socialCheck}>⚪ Gönderi açık verileri çekiliyor...</Text>
              <Text style={s.socialCheck}>⚪ @ysports etiket veya hashtag araması...</Text>
              <Text style={s.socialCheck}>⚪ Vision AI: Logo & Yüz tanıma...</Text>
            </View>
          )}

          {socialScan === 'done' && socialResult && (
            <View style={[s.socialResult, { borderColor: socialResult.ok ? '#00b97a44' : '#e8454544' }]}>
              <Text style={[s.socialResultText, { color: socialResult.ok ? '#00b97a' : '#e84545' }]}>
                {socialResult.label}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#090b11' },
  topbar:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  backBtn:         { width: 36, height: 36, justifyContent: 'center' },
  backText:        { color: '#fff', fontSize: 28, lineHeight: 32 },
  title:           { color: '#fff', fontSize: 16, fontWeight: '800' },
  scroll:          { padding: 16, paddingBottom: 40 },

  scanWidget:      { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#8b2fff33' },
  scanLabel:       { color: '#a78bfa', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  scanIdle:        { color: '#4a6fa5', fontSize: 11 },
  scanChecks:      { gap: 4 },
  scanCheckItem:   { color: '#8ba8d4', fontSize: 11 },
  scanResult:      { borderRadius: 8, padding: 10, borderWidth: 1, marginTop: 4 },
  scanResultText:  { fontSize: 13, fontWeight: '800', textAlign: 'center' },

  uploadBtn:       { backgroundColor: '#1a4fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  uploadBtnText:   { color: '#fff', fontSize: 14, fontWeight: '800' },
  uploadHint:      { color: '#4a6fa5', fontSize: 11, textAlign: 'center', marginBottom: 20 },

  sectionTitle:    { color: '#4a6fa5', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  videoCard:       { backgroundColor: '#161d2e', borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a', overflow: 'hidden' },
  videoThumb:      { height: 110, backgroundColor: '#0d1117', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  videoThumbIcon:  { fontSize: 40 },
  videoDuration:   { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, fontWeight: '700' },
  approvedBadge:   { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,200,140,0.9)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  approvedText:    { color: '#fff', fontSize: 9, fontWeight: '700' },
  videoInfo:       { padding: 12 },
  videoTitle:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  videoMeta:       { flexDirection: 'row', gap: 12, marginTop: 4 },
  videoDate:       { color: '#4a6fa5', fontSize: 10 },
  videoViews:      { color: '#4a6fa5', fontSize: 10 },

  socialCard:      { backgroundColor: 'rgba(99,102,241,0.05)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)', marginTop: 6 },
  socialHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  socialTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  socialIcon:      { fontSize: 16 },
  socialTitle:     { color: '#fff', fontSize: 12, fontWeight: '700' },
  privacyBadge:    { backgroundColor: '#1a4fff22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  privacyText:     { color: '#1a4fff', fontSize: 9, fontWeight: '700' },
  socialDesc:      { color: '#8ba8d4', fontSize: 10, lineHeight: 14, marginBottom: 10 },
  socialInputRow:  { flexDirection: 'row', gap: 8, marginBottom: 8 },
  socialInput:     { flex: 1, backgroundColor: '#0d1117', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 11, borderWidth: 1, borderColor: '#1e2d4a' },
  socialBtn:       { backgroundColor: '#6366f1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  socialBtnText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  socialStatus:    { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  socialStatusText:{ color: '#818cf8', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  socialCheck:     { color: '#4a6fa5', fontSize: 9, lineHeight: 14 },
  socialResult:    { borderRadius: 8, padding: 10, borderWidth: 1, marginTop: 4 },
  socialResultText:{ fontSize: 12, fontWeight: '800', textAlign: 'center' },
});

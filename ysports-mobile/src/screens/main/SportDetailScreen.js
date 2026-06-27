import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/FirebaseConfig';

const CAT_COLORS = {
  Takım: '#1a4fff', Bireysel: '#00b97a', Dövüş: '#e84545',
  Kış: '#06b6d4', Su: '#3b82f6', Geleneksel: '#c9a227',
  Dijital: '#8b2fff', Zihinsel: '#ec4899', Diğer: '#6b82a8',
};

// ponytail: hardcoded fed data — no API needed, changes maybe once a decade
const FED_INFO = {
  'Futbol':     { fed: 'Türkiye Futbol Federasyonu',         kurul: 1923, web: 'tff.org',      lisansli: 850000 },
  'Basketbol':  { fed: 'Türkiye Basketbol Federasyonu',      kurul: 1937, web: 'tbf.org.tr',   lisansli: 45000  },
  'Voleybol':   { fed: 'Türkiye Voleybol Federasyonu',       kurul: 1958, web: 'tvf.org.tr',   lisansli: 120000 },
  'Güreş':      { fed: 'Türkiye Güreş Federasyonu',          kurul: 1923, web: 'tgf.gov.tr',   lisansli: 95000  },
  'Boks':       { fed: 'Türkiye Boks Federasyonu',           kurul: 1949, web: 'tbf.gov.tr',   lisansli: 35000  },
  'Yüzme':      { fed: 'Türkiye Yüzme Federasyonu',          kurul: 1957, web: 'tyf.org.tr',   lisansli: 28000  },
  'Atletizm':   { fed: 'Türkiye Atletizm Federasyonu',       kurul: 1922, web: 'taf.org.tr',   lisansli: 62000  },
  'Tenis':      { fed: 'Türkiye Tenis Federasyonu',          kurul: 1923, web: 'ttf.org.tr',   lisansli: 18000  },
  'Taekwondo':  { fed: 'Türkiye Taekwondo Federasyonu',      kurul: 1989, web: 'ttkf.org.tr',  lisansli: 120000 },
  'Karate':     { fed: 'Türkiye Karate Federasyonu',         kurul: 1971, web: 'tkf.org.tr',   lisansli: 95000  },
  'Judo':       { fed: 'Türkiye Judo Federasyonu',           kurul: 1958, web: 'tjf.org.tr',   lisansli: 32000  },
  'Halter':     { fed: 'Türkiye Halter Federasyonu',         kurul: 1947, web: 'thf.org.tr',   lisansli: 12000  },
  'Bisiklet':   { fed: 'Türkiye Bisiklet Federasyonu',       kurul: 1923, web: 'tbf.org.tr',   lisansli: 8000   },
  'Masa Tenisi':{ fed: 'Türkiye Masa Tenisi Federasyonu',    kurul: 1952, web: 'tmtf.org.tr',  lisansli: 15000  },
  'Badminton':  { fed: 'Türkiye Badminton Federasyonu',      kurul: 1990, web: 'tbf.org.tr',   lisansli: 5000   },
};
const DEFAULT_FED = { fed: 'Türkiye Spor Federasyonu', kurul: 2000, web: 'gsb.gov.tr', lisansli: 5000 };

export default function SportDetailScreen({ route, navigation }) {
  const { sport } = route.params;
  const fed = FED_INFO[sport.name] || DEFAULT_FED;
  const color = CAT_COLORS[sport.cat] || '#4a6fa5';

  const [sporcular, setSporcular] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getDocs(query(
      collection(db, 'sporcular'),
      where('sporDali', '==', sport.name),
      limit(10)
    ))
      .then(snap => setSporcular(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {}) // hata sessiz — UI boş gösterir
      .finally(() => setLoading(false));
  }, [sport.name]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Geri</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroIcon}>{sport.icon}</Text>
          <Text style={s.heroName}>{sport.name}</Text>
          <View style={[s.catBadge, { backgroundColor: color + '22' }]}>
            <Text style={[s.catBadgeText, { color }]}>{sport.cat}</Text>
          </View>
        </View>

        {/* Federasyon Kartı */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🏛️ Federasyon Bilgisi</Text>
          <View style={s.card}>
            <InfoRow icon="🏛️" label="Federasyon" value={fed.fed} />
            <InfoRow icon="📅" label="Kuruluş Yılı" value={String(fed.kurul)} />
            <InfoRow
              icon="🌐"
              label="Web Sitesi"
              value={fed.web}
              onPress={() => Alert.alert('Web Sitesi', `https://${fed.web}`)}
              pressable
            />
            <InfoRow icon="👥" label="Lisanslı Sporcu" value={fed.lisansli.toLocaleString('tr-TR') + ' kişi'} last />
          </View>
        </View>

        {/* Bu Branştaki Sporcular */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👤 Bu Branştaki Sporcular</Text>
          {loading ? (
            <ActivityIndicator color="#1a4fff" style={{ marginTop: 20 }} />
          ) : sporcular.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>Henüz bu branşta sporcu kaydı yok</Text>
            </View>
          ) : (
            sporcular.map(sp => (
              <View key={sp.id} style={s.sporcuRow}>
                <View style={s.sporcuAvatar}>
                  <Text style={{ fontSize: 16 }}>{sport.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.sporcuName}>{sp.ad || sp.displayName || 'İsimsiz'}</Text>
                  <Text style={s.sporcuSub}>{sp.sehir || sp.city || '—'}</Text>
                </View>
                {sp.sgd != null && (
                  <View style={s.sgdBadge}>
                    <Text style={s.sgdText}>{sp.sgd} SGD</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Scout CTA */}
        <TouchableOpacity
          style={[s.scoutBtn, { borderColor: color }]}
          onPress={() => navigation.navigate('Scout')}
          activeOpacity={0.8}
        >
          <Text style={[s.scoutBtnText, { color }]}>🔍 Bu Branşı Scout Et</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ icon, label, value, onPress, pressable, last }) {
  const content = (
    <View style={[s.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={s.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={[s.infoValue, pressable && { color: '#4a6fa5', textDecorationLine: 'underline' }]}>
          {value}
        </Text>
      </View>
    </View>
  );
  return pressable
    ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{content}</TouchableOpacity>
    : content;
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  header:        { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  backBtn:       { alignSelf: 'flex-start' },
  backText:      { color: '#4a6fa5', fontSize: 14, fontWeight: '700' },
  content:       { paddingBottom: 40 },
  hero:          { alignItems: 'center', paddingVertical: 28, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  heroIcon:      { fontSize: 64, marginBottom: 12 },
  heroName:      { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 10 },
  catBadge:      { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  catBadgeText:  { fontSize: 13, fontWeight: '700' },
  section:       { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle:  { color: '#4a6fa5', fontSize: 12, fontWeight: '800', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  card:          { backgroundColor: '#161d2e', borderRadius: 14, borderWidth: 1, borderColor: '#1e2d4a', overflow: 'hidden' },
  infoRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  infoIcon:      { fontSize: 18, marginRight: 12 },
  infoLabel:     { color: '#4a6fa5', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  infoValue:     { color: '#fff', fontSize: 13, fontWeight: '600' },
  empty:         { backgroundColor: '#161d2e', borderRadius: 14, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  emptyText:     { color: '#4a6fa5', fontSize: 13 },
  sporcuRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161d2e', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#1e2d4a' },
  sporcuAvatar:  { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1e2d4a', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sporcuName:    { color: '#fff', fontSize: 13, fontWeight: '700' },
  sporcuSub:     { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  sgdBadge:      { backgroundColor: '#c9a22722', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sgdText:       { color: '#c9a227', fontSize: 11, fontWeight: '700' },
  scoutBtn:      { margin: 16, marginTop: 24, borderRadius: 14, borderWidth: 2, padding: 16, alignItems: 'center' },
  scoutBtnText:  { fontSize: 15, fontWeight: '800' },
});

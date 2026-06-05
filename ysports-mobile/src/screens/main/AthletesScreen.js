import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';

export default function AthletesScreen() {
  const [athletes, setAthletes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const db = getFirestore(getApp());
        const snap = await getDocs(
          query(collection(db, 'sporcular'), orderBy('updatedAt', 'desc'), limit(50))
        );
        setAthletes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.warn('AthletesScreen error:', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = athletes.filter(a =>
    `${a.ad||''} ${a.soyad||''} ${a.displayName||''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#1a4fff" size="large" /></View>;
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Text style={s.title}>🏅 Sporcular</Text>
        <Text style={s.count}>{filtered.length} sporcu</Text>
      </View>

      <TextInput
        style={s.search}
        placeholder="Sporcu ara..."
        placeholderTextColor="#2a3a5a"
        value={search}
        onChangeText={setSearch}
      />

      {filtered.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🏅</Text>
          <Text style={s.emptyText}>Henüz sporcu kaydı yok.</Text>
          <Text style={s.emptySub}>İlk sporcu kayıt olduğunda burada görünecek.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => {
            const name = item.displayName || `${item.ad || ''} ${item.soyad || ''}`.trim() || 'İsimsiz';
            const initial = (name[0] || '?').toUpperCase();
            const sport = item.sporDali || 'Belirsiz';
            const city  = item.sehir || '';
            const colors = ['#1a4fff','#8b2fff','#c9a227','#00b97a','#e84545','#06b6d4'];
            const color  = colors[name.charCodeAt(0) % colors.length];
            return (
              <TouchableOpacity
                style={s.card}
                activeOpacity={0.8}
                onPress={() => Alert.alert(
                  name,
                  `Spor Dalı: ${sport}${city ? '\nŞehir: ' + city : ''}\n\nSGD profil sayfası yakında aktif olacak.`,
                  [{ text: 'Tamam' }]
                )}
              >
                <View style={[s.avatar, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                  <Text style={[s.avatarText, { color }]}>{initial}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.name}>{name}</Text>
                  <Text style={s.sport}>{sport}{city ? ` • ${city}` : ''}</Text>
                </View>
                <Text style={[s.arrow, { color }]}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#090b11' },
  center:     { flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center' },
  topbar:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  title:      { color: '#fff', fontSize: 16, fontWeight: '800' },
  count:      { color: '#4a6fa5', fontSize: 13, fontWeight: '700' },
  search:     { margin: 16, backgroundColor: '#161d2e', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1e2d4a' },
  list:       { paddingHorizontal: 16, paddingBottom: 40 },
  card:       { backgroundColor: '#161d2e', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  avatar:     { width: 44, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '900' },
  name:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  sport:      { color: '#4a6fa5', fontSize: 11, marginTop: 2 },
  arrow:      { fontSize: 24, fontWeight: '700' },
  empty:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyText:  { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub:   { color: '#4a6fa5', fontSize: 12, textAlign: 'center' },
});

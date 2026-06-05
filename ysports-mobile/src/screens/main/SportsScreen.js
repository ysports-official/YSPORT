import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPORTS = [
  { id: 1,  icon: '⚽', name: 'Futbol',           cat: 'Takım' },
  { id: 2,  icon: '🏀', name: 'Basketbol',         cat: 'Takım' },
  { id: 3,  icon: '🏐', name: 'Voleybol',          cat: 'Takım' },
  { id: 4,  icon: '🎾', name: 'Tenis',             cat: 'Bireysel' },
  { id: 5,  icon: '🥊', name: 'Boks',              cat: 'Dövüş' },
  { id: 6,  icon: '🤼', name: 'Güreş',             cat: 'Dövüş' },
  { id: 7,  icon: '🏊', name: 'Yüzme',             cat: 'Bireysel' },
  { id: 8,  icon: '🚴', name: 'Bisiklet',          cat: 'Bireysel' },
  { id: 9,  icon: '🏋️', name: 'Halter',            cat: 'Bireysel' },
  { id: 10, icon: '🤸', name: 'Cimnastik',         cat: 'Bireysel' },
  { id: 11, icon: '⛹️', name: 'Su Topu',           cat: 'Takım' },
  { id: 12, icon: '🏸', name: 'Badminton',         cat: 'Bireysel' },
  { id: 13, icon: '🏓', name: 'Masa Tenisi',       cat: 'Bireysel' },
  { id: 14, icon: '🥋', name: 'Judo',              cat: 'Dövüş' },
  { id: 15, icon: '🥋', name: 'Taekwondo',         cat: 'Dövüş' },
  { id: 16, icon: '🥋', name: 'Karate',            cat: 'Dövüş' },
  { id: 17, icon: '🏹', name: 'Okçuluk',           cat: 'Bireysel' },
  { id: 18, icon: '🤺', name: 'Eskrim',            cat: 'Dövüş' },
  { id: 19, icon: '🎳', name: 'Bowling',           cat: 'Bireysel' },
  { id: 20, icon: '🏌️', name: 'Golf',              cat: 'Bireysel' },
  { id: 21, icon: '🏇', name: 'Biniciliik',        cat: 'Bireysel' },
  { id: 22, icon: '⛷️', name: 'Kayak',             cat: 'Kış' },
  { id: 23, icon: '🏂', name: 'Snowboard',         cat: 'Kış' },
  { id: 24, icon: '🛷', name: 'Kızak',             cat: 'Kış' },
  { id: 25, icon: '⛸️', name: 'Buz Pateni',        cat: 'Kış' },
  { id: 26, icon: '🏒', name: 'Buz Hokeyi',        cat: 'Kış' },
  { id: 27, icon: '🚣', name: 'Kürek',             cat: 'Su' },
  { id: 28, icon: '🏄', name: 'Sörf',              cat: 'Su' },
  { id: 29, icon: '🤿', name: 'Dalış',             cat: 'Su' },
  { id: 30, icon: '🚤', name: 'Yelken',            cat: 'Su' },
  { id: 31, icon: '🏃', name: 'Atletizm',          cat: 'Bireysel' },
  { id: 32, icon: '🤾', name: 'Hentbol',           cat: 'Takım' },
  { id: 33, icon: '🏑', name: 'Hokey',             cat: 'Takım' },
  { id: 34, icon: '🏏', name: 'Kriket',            cat: 'Takım' },
  { id: 35, icon: '🥏', name: 'Frizbi',            cat: 'Takım' },
  { id: 36, icon: '🪃', name: 'Ragbi',             cat: 'Takım' },
  { id: 37, icon: '🥌', name: 'Curling',           cat: 'Kış' },
  { id: 38, icon: '🎿', name: 'Biatlon',           cat: 'Kış' },
  { id: 39, icon: '🏋️', name: 'Vücut Geliştirme', cat: 'Bireysel' },
  { id: 40, icon: '🤼', name: 'Serbest Güreş',     cat: 'Dövüş' },
  { id: 41, icon: '🤼', name: 'Grekoromen Güreş',  cat: 'Dövüş' },
  { id: 42, icon: '🥊', name: 'Kickboks',          cat: 'Dövüş' },
  { id: 43, icon: '🥋', name: 'MMA',               cat: 'Dövüş' },
  { id: 44, icon: '🧗', name: 'Tırmanma',          cat: 'Bireysel' },
  { id: 45, icon: '🚵', name: 'Dağ Bisikleti',     cat: 'Bireysel' },
  { id: 46, icon: '🤽', name: 'Kano',              cat: 'Su' },
  { id: 47, icon: '🎣', name: 'Olta Balıkçılığı',  cat: 'Bireysel' },
  { id: 48, icon: '🏊', name: 'Açık Su Yüzme',     cat: 'Su' },
  { id: 49, icon: '🤸', name: 'Ritmik Jimnastik',  cat: 'Bireysel' },
  { id: 50, icon: '🤸', name: 'Trampolin',         cat: 'Bireysel' },
  { id: 51, icon: '🚶', name: 'Yürüyüş',           cat: 'Bireysel' },
  { id: 52, icon: '🏃', name: 'Kros',              cat: 'Bireysel' },
  { id: 53, icon: '🎯', name: 'Atıcılık',          cat: 'Bireysel' },
  { id: 54, icon: '🏹', name: 'Köy Oyunları',      cat: 'Geleneksel' },
  { id: 55, icon: '🤺', name: 'Kılıç Oyunları',    cat: 'Geleneksel' },
  { id: 56, icon: '🎭', name: 'Gösteri Sporları',  cat: 'Diğer' },
  { id: 57, icon: '🎮', name: 'E-Spor',            cat: 'Dijital' },
  { id: 58, icon: '🧠', name: 'Satranç',           cat: 'Zihinsel' },
  { id: 59, icon: '🃏', name: 'Briç',              cat: 'Zihinsel' },
  { id: 60, icon: '🎱', name: 'Bilardo',           cat: 'Bireysel' },
  { id: 61, icon: '🎯', name: 'Dart',              cat: 'Bireysel' },
  { id: 62, icon: '🏋️', name: 'Powerlifting',      cat: 'Bireysel' },
  { id: 63, icon: '🤸', name: 'Parkur',            cat: 'Bireysel' },
  { id: 64, icon: '🏊', name: 'Triatlon',          cat: 'Bireysel' },
];

const CATS = ['Tümü', 'Takım', 'Bireysel', 'Dövüş', 'Kış', 'Su', 'Geleneksel', 'Dijital', 'Zihinsel', 'Diğer'];
const CAT_COLORS = { Takım: '#1a4fff', Bireysel: '#00b97a', Dövüş: '#e84545', Kış: '#06b6d4', Su: '#3b82f6', Geleneksel: '#c9a227', Dijital: '#8b2fff', Zihinsel: '#ec4899', Diğer: '#6b82a8' };

export default function SportsScreen() {
  const [search, setSearch]   = useState('');
  const [cat,    setCat]      = useState('Tümü');

  const filtered = SPORTS.filter(sp =>
    (cat === 'Tümü' || sp.cat === cat) &&
    sp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />
      <View style={s.topbar}>
        <Text style={s.title}>🏆 Spor Dalları</Text>
        <Text style={s.count}>{filtered.length}/64</Text>
      </View>

      <TextInput
        style={s.search}
        placeholder="Spor dalı ara..."
        placeholderTextColor="#2a3a5a"
        value={search}
        onChangeText={setSearch}
      />

      {/* Kategori scroll */}
      <FlatList
        horizontal
        data={CATS}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.catBtn, cat === item && { backgroundColor: CAT_COLORS[item] || '#1a4fff' }]}
            onPress={() => setCat(item)}
          >
            <Text style={[s.catText, cat === item && { color: '#fff' }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        numColumns={2}
        contentContainerStyle={s.grid}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const color = CAT_COLORS[item.cat] || '#4a6fa5';
          return (
            <TouchableOpacity
              style={[s.card, { borderColor: color + '33' }]}
              activeOpacity={0.8}
              onPress={() => Alert.alert(
                item.name,
                `Kategori: ${item.cat}\n\nY SPORTS'ta bu branştaki sporcuları keşfedin ve SGD puanlarını görün.`,
                [{ text: 'Tamam' }]
              )}
            >
              <Text style={s.cardIcon}>{item.icon}</Text>
              <Text style={s.cardName}>{item.name}</Text>
              <View style={[s.catTag, { backgroundColor: color + '22' }]}>
                <Text style={[s.catTagText, { color }]}>{item.cat}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#090b11' },
  topbar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  title:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  count:       { color: '#4a6fa5', fontSize: 13, fontWeight: '700' },
  search:      { margin: 16, marginBottom: 8, backgroundColor: '#161d2e', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#1e2d4a' },
  catList:     { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#161d2e', borderWidth: 1, borderColor: '#1e2d4a' },
  catText:     { color: '#4a6fa5', fontSize: 12, fontWeight: '700' },
  grid:        { paddingHorizontal: 16, paddingBottom: 40 },
  card:        { flex: 1, backgroundColor: '#161d2e', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10, borderWidth: 1 },
  cardIcon:    { fontSize: 28, marginBottom: 8 },
  cardName:    { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  catTag:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catTagText:  { fontSize: 9, fontWeight: '700' },
});

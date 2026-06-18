import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONTRACTS = {
  sporcu: {
    title: 'SPORCU İMAJ & PERFORMANS SÖZLEŞMESİ',
    docId: 'YS-2026-9482X',
    type:  'Sporcu Taahhüt Protokolü',
    text: `MADDE 1 — TARAFLAR
Y SPORTS Teknoloji A.Ş. (Bundan sonra "Platform" olarak anılacaktır) ile bu sözleşmeyi kabul eden sporcu (Bundan sonra "Sporcu" olarak anılacaktır) arasında akdedilmiştir.

MADDE 2 — KONU
Sporcu, Y SPORTS platformu üzerinden biyometrik verilerini, performans istatistiklerini ve imaj haklarını Platform ile paylaşmayı kabul eder.

MADDE 3 — VİDEO TAAHHÜDÜ
Sporcu, aktif sponsor sözleşmesi süresince ayda en az 2 (iki) adet tanıtım/performans videosu yüklemekle yükümlüdür. Eksik yükleme durumunda gecikme cezası uygulanabilir.

MADDE 4 — BİYOMETRİK VERİLER
Platform, sporcunun SGS (Sporcu Değerleme Skoru) puanını hesaplamak amacıyla biyometrik verileri işleyebilir. Bu işlem KVKK kapsamında gerçekleştirilir.

MADDE 5 — İMAJ HAKLARI
Sporcu, Platform'un onaylı reklam ve tanıtım materyallerinde adının ve fotoğrafının kullanılmasına onay verir.

MADDE 6 — GİZLİLİK
Taraflar, bu sözleşme kapsamında elde ettikleri bilgileri üçüncü taraflarla paylaşmayacağını taahhüt eder.

MADDE 7 — YETKİ
İşbu sözleşmeden doğacak uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Türk Hukuku uygulanır.

MADDE 8 — YÜRÜRLÜK
Bu sözleşme, taraflarca dijital olarak onaylandığı tarihten itibaren geçerlidir ve belirlenmiş süre boyunca yürürlükte kalır.`,
  },
  sponsor: {
    title: 'SPONSORLUK YATIRIM PROTOKOLÜ',
    docId: 'YS-2026-SP-7731',
    type:  'Sponsor Taahhüt Protokolü',
    text: `MADDE 1 — TARAFLAR
Y SPORTS Teknoloji A.Ş. ile Sponsor kurum/şahıs arasında akdedilmiştir.

MADDE 2 — KONU
Sponsor, Platform üzerinde belirlenen sporcu(lar)a finansal destek sağlamayı ve belirlenen yükümlülükleri yerine getirmeyi kabul eder.

MADDE 3 — AKILLI YATIRIM
Platform, sponsor yatırımının %72'sinin doğrudan sporcuya, %18'inin Platform altyapısına ve %10'unun fon havuzuna aktarılacağını taahhüt eder.

MADDE 4 — BİYO-VERİ KULLANIM HAKLARI
Sponsor, desteklediği sporcunun anonim biyometrik performans verilerine Platform üzerinden erişim hakkı kazanır.

MADDE 5 — VİDEO YÜKÜMLÜLÜK TAKİBİ
Platform, sponsor adına sporcunun aylık video yükümlülüklerini AI doğrulama sistemiyle takip eder ve raporlar.

MADDE 6 — REKABET YASAĞI
Sponsor, aynı branşta rakip sporculara Platform dışı doğrudan sponsor olamaz.

MADDE 7 — YETKİ
İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
  },
  kulup: {
    title: 'KULÜP İZLEME LİSANSI',
    docId: 'YS-2026-KL-4456',
    type:  'Kulüp Yetiştirme Taahhüdü',
    text: `MADDE 1 — TARAFLAR
Y SPORTS Teknoloji A.Ş. ile lisanslı spor kulübü arasında akdedilmiştir.

MADDE 2 — KONU
Kulüp, Platform'dan altyapı lisansı edinerek bünyesindeki sporcuların verilerini yönetme hakkı kazanır.

MADDE 3 — YETİŞTİRME BEDELİ TAAHHÜDÜ
Kulüpten ayrılan ve profesyonelleşen sporcudan yapılan transfer/sponsor gelirinin %3'ü yetiştirme bedeli olarak Kulüp'e aktarılır.

MADDE 4 — VERİ YÖNETİMİ
Kulüp, bünyesindeki sporculara ait biometrik verileri yalnızca eğitim ve geliştirme amacıyla kullanabilir.

MADDE 5 — DENETİM
Platform, yıllık lisans denetim hakkını saklı tutar.

MADDE 6 — YETKİ
İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.`,
  },
};

export default function ContractScreen({ navigation, route }) {
  const contractType = route?.params?.contractType || 'sporcu';
  const contract = CONTRACTS[contractType] || CONTRACTS.sporcu;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090b11" />

      {/* Header */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.topTitle}>📄 Dijital Sözleşme</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.contractWrap}>

          {/* Seal Header */}
          <View style={s.sealHeader}>
            <Text style={s.sealEmoji}>🛡️</Text>
            <Text style={s.sealTitle}>{contract.title}</Text>
            <Text style={s.sealDocId}>DOCID: {contract.docId}</Text>
          </View>

          {/* Contract Text */}
          <Text style={s.contractText}>{contract.text}</Text>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerLabel}>Hukuki Yürürlük Durumu:</Text>
            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>AKTİF & ONAYLANDI ✓</Text>
            </View>
          </View>

        </View>

        {/* Type info */}
        <View style={s.typeBox}>
          <Text style={s.typeText}>📋 {contract.type}</Text>
          <Text style={s.typeNote}>Bu belge Y SPORTS dijital hukuk altyapısı tarafından oluşturulmuştur.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#090b11' },
  topbar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  backBtn:       { width: 36, height: 36, justifyContent: 'center' },
  backText:      { color: '#fff', fontSize: 28, lineHeight: 32 },
  topTitle:      { color: '#fff', fontSize: 16, fontWeight: '800' },
  scroll:        { padding: 16, paddingBottom: 40 },

  contractWrap:  { backgroundColor: 'rgba(30,41,59,0.98)', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },

  sealHeader:    { alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.06)', paddingBottom: 14, marginBottom: 16 },
  sealEmoji:     { fontSize: 28, marginBottom: 6 },
  sealTitle:     { color: '#c9a227', fontSize: 14, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  sealDocId:     { color: '#4a6fa5', fontSize: 9, textTransform: 'uppercase', marginTop: 4 },

  contractText:  { color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace', lineHeight: 18, textAlign: 'justify' },

  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  footerLabel:   { color: '#4a6fa5', fontSize: 9 },
  activeBadge:   { backgroundColor: 'rgba(0,185,122,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#00b97a44' },
  activeBadgeText:{ color: '#00b97a', fontSize: 9, fontWeight: '700' },

  typeBox:       { backgroundColor: '#161d2e', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#1e2d4a' },
  typeText:      { color: '#8ba8d4', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  typeNote:      { color: '#4a6fa5', fontSize: 10, lineHeight: 14 },
});

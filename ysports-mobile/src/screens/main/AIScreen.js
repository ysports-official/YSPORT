import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { useAssets } from 'expo-asset';

// AI Kamera ekranı WebView olarak kalır — MediaPipe browser ortamı gerektirir
export default function AIScreen({ route, navigation }) {
  const uid  = route?.params?.uid  || '';
  const role = route?.params?.role || 'sporcu';
  const [assets] = useAssets([require('../../../assets/app_bundle.html')]);
  const [fileUri, setFileUri] = useState(null);
  const [error,   setError]   = useState(null);

  React.useEffect(() => {
    if (!assets?.[0]) return;
    const dest   = FileSystem.documentDirectory + 'app_bundle.html';
    const srcUri = assets[0].localUri || assets[0].uri;
    FileSystem.copyAsync({ from: srcUri, to: dest })
      .then(() => setFileUri(dest))
      .catch(() => srcUri ? setFileUri(srcUri) : setError('Dosya yüklenemedi'));
  }, [assets]);

  const injectedJS = `
    (function() {
      window.ysportsNativeUser = { uid: "${uid}", role: "${role}" };
      // AI kamera ekranına doğrudan git
      if (typeof pg === 'function') pg('pg50');
      else window.addEventListener('ysportsReady', () => pg('pg50'));
    })(); true;
  `;

  if (error) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.err}>{error}</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!fileUri) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator color="#1a4fff" size="large" />
          <Text style={s.loading}>AI Kamera yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.close} onPress={() => navigation.goBack()}>
        <Text style={s.closeText}>✕ Kapat</Text>
      </TouchableOpacity>
      <WebView
        source={{ uri: fileUri }}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        style={s.webview}
        onError={(e) => setError('WebView hatası: ' + (e.nativeEvent?.description || 'bilinmiyor'))}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#090b11' },
  container: { flex: 1, backgroundColor: '#090b11' },
  webview:   { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loading:   { color: '#4a6fa5', fontSize: 14, marginTop: 16 },
  err:       { color: '#e84545', fontSize: 14, textAlign: 'center', padding: 20 },
  close:     { position: 'absolute', top: 50, right: 16, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  closeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  backBtn:   { backgroundColor: '#161d2e', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  backText:  { color: '#fff', fontWeight: '700' },
});

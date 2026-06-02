import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAssets } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export default function MainScreen({ route }) {
  const role = route?.params?.role || 'sporcu';
  const uid  = route?.params?.uid  || '';

  const [assets] = useAssets([require('../../assets/app_bundle.html')]);
  const [html, setHtml] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!assets || !assets[0]) return;
    const uri = assets[0].localUri || assets[0].uri;
    FileSystem.readAsStringAsync(uri)
      .then(content => setHtml(content))
      .catch(err => setError(err.message));
  }, [assets]);

  const injectedJS = `
    (function() {
      window.ysportsNativeUser = { uid: "${uid}", role: "${role}" };
      window.dispatchEvent(new CustomEvent('ysportsNativeAuth', {
        detail: { uid: "${uid}", role: "${role}" }
      }));
    })();
    true;
  `;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Hata: {error}</Text>
      </View>
    );
  }

  if (!html) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a4fff" />
        <Text style={styles.loading}>Y SPORTS yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: '' }}
        style={styles.webview}
        injectedJavaScript={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        bounces={false}
        overScrollMode="never"
        onMessage={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090b11' },
  webview:   { flex: 1 },
  center:    { flex: 1, backgroundColor: '#090b11', justifyContent: 'center', alignItems: 'center' },
  loading:   { color: '#4a6fa5', marginTop: 16, fontSize: 14 },
  err:       { color: '#e84545', padding: 20, textAlign: 'center' },
});

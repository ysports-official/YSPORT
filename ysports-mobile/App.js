import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { useAssets } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export default function App() {
  const [assets] = useAssets([require('./assets/app_bundle.html')]);
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadHtml() {
      try {
        if (assets && assets[0]) {
          const uri = assets[0].localUri || assets[0].uri;
          const content = await FileSystem.readAsStringAsync(uri);
          setHtmlContent(content);
        }
      } catch (err) {
        setError(err.message);
      }
    }
    loadHtml();
  }, [assets]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={{color:'red', marginTop:100, padding: 20}}>Hata: {error}</Text>
      </View>
    );
  }

  if (!htmlContent) {
    return (
      <View style={styles.container}>
        <Text style={{color:'white', marginTop:100, textAlign: 'center'}}>Y SPORTS Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" hidden={true} />
      <WebView 
        source={{ html: htmlContent, baseUrl: '' }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});

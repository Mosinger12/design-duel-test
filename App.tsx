import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/ui/AppContext';
import type { Route } from './src/ui/nav';
import { AgeGate } from './src/ui/screens/AgeGate';
import { Briefs } from './src/ui/screens/Briefs';
import { Collection } from './src/ui/screens/Collection';
import { Home } from './src/ui/screens/Home';
import { Play } from './src/ui/screens/Play';
import { Result } from './src/ui/screens/Result';
import { Settings } from './src/ui/screens/Settings';
import { colors } from './src/ui/theme';

function Router() {
  const { ready, state } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'home' });
  if (!ready) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!state.settings.ageConfirmed) return <AgeGate />;
  switch (route.name) {
    case 'briefs': return <Briefs nav={setRoute} />;
    case 'play': return <Play key={route.briefId + (route.from ? ':again' : '')} nav={setRoute} briefId={route.briefId} from={route.from} />;
    case 'result': return <Result nav={setRoute} composition={route.composition} />;
    case 'collection': return <Collection nav={setRoute} />;
    case 'settings': return <Settings nav={setRoute} />;
    default: return <Home nav={setRoute} />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.root}>
        <View style={styles.inner}>
          <Router />
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

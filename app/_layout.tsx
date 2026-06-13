import '../src/polyfills';

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBar } from '../src/components/TabBar';
import { loadPersistedState, loadThemePreference, useApp } from '../src/state/store';
import { bgFor, C, ThemeMode } from '../src/theme';

/**
 * Theme crossfade — on a light/dark switch the palette swaps instantly, which
 * looks harsh. This overlays the *previous* background colour at full opacity
 * and fades it out, so the newly-themed UI dissolves in smoothly instead of
 * snapping. Rendered above everything (incl. the tab bar).
 */
function ThemeFade({ mode }: { mode: ThemeMode }) {
  const prev = useRef(mode);
  const fade = useRef(new Animated.Value(0)).current;
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    if (prev.current === mode) return;
    setCover(bgFor(prev.current));
    prev.current = mode;
    fade.setValue(1);
    Animated.timing(fade, {
      toValue: 0,
      duration: 340,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => finished && setCover(null));
  }, [mode, fade]);

  if (!cover) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cover, opacity: fade }}
    />
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});
loadThemePreference();
loadPersistedState();

export default function RootLayout() {
  const themeMode = useApp((s) => s.themeMode);
  const [loaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: C.bg },
        }}
      />
      {/* One persistent tab bar for all tab routes — never remounts on switch */}
      <TabBar />
      <ThemeFade mode={themeMode} />
    </SafeAreaProvider>
  );
}

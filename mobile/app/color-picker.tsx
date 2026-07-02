import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from '@/components/ui/Icon';
import PressableScale from '@/components/ui/PressableScale';
import ColorPicker from '@/components/ColorPicker';

/** Feuille modale du color picker (ouverte depuis Welcome et Profil). */
export default function ColorPickerScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <PressableScale onPress={() => router.back()} style={styles.headerBtn}>
          <Icon name="arrow_back" size={22} color={c.txt} />
        </PressableScale>
        <Text style={[styles.title, { color: c.txt }]}>Choisis ton ambiance</Text>
        <PressableScale onPress={() => router.back()} style={styles.headerBtn}>
          <Icon name="check" size={22} color={c.accent} />
        </PressableScale>
      </View>
      <ColorPicker />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: { padding: 6 },
  title: { fontFamily: fonts.display, fontSize: 16 },
});

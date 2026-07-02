import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PRESET_SWATCHES, useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import { deriveAccent } from '@/theme/deriveAccent';
import { hexToHsl, hslToHex } from '@/lib/color';
import GradientSlider from './ui/HueSlider';
import PressableScale from './ui/PressableScale';
import Icon from './ui/Icon';

/**
 * Color picker GymAI :
 * - bascule mode de base (Sombre / Rose),
 * - rangée de swatches préréglés,
 * - picker HSL maison (3 sliders Reanimated + gesture-handler),
 * - aperçu live qui se met à jour immédiatement (via setAccent -> ThemeProvider).
 *
 * Note d'implémentation : `reanimated-color-picker` exige expo@56 en peer
 * dependency ; le projet étant en SDK 54, on a opté pour ce picker HSL maison
 * (autosuffisant, basé sur Reanimated + gesture-handler), conformément au brief.
 */
export function ColorPicker() {
  const { c, mode, accent, setAccent, setModeWithDefaultAccent } = useTheme();

  // État HSL local pour piloter les sliders, synchronisé avec l'accent courant.
  const [hsl, setHsl] = useState(() => hexToHsl(accent));

  // Si l'accent change ailleurs (swatch, bascule mode) on resynchronise.
  useEffect(() => {
    setHsl(hexToHsl(accent));
  }, [accent]);

  const apply = (next: { h?: number; s?: number; l?: number }) => {
    const merged = { ...hsl, ...next };
    setHsl(merged);
    setAccent(hslToHex(merged));
  };

  const preview = deriveAccent(accent);

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Bascule mode de base */}
      <Text style={[styles.label, { color: c.muted2 }]}>Mode de base</Text>
      <View style={styles.modeRow}>
        {(
          [
            { key: 'dark', label: 'Sombre', icon: 'dark_mode' },
            { key: 'rose', label: 'Rose', icon: 'favorite' },
          ] as const
        ).map((opt) => {
          const active = mode === opt.key;
          return (
            <PressableScale
              key={opt.key}
              onPress={() => setModeWithDefaultAccent(opt.key)}
              style={[
                styles.modePill,
                {
                  borderColor: active ? c.accent : c.line,
                  backgroundColor: active ? c.accentDim : c.surface,
                },
              ]}
            >
              <Icon name={opt.icon} size={18} color={active ? c.accent : c.muted} />
              <Text
                style={[
                  styles.modePillTxt,
                  { color: active ? c.accent : c.muted },
                ]}
              >
                {opt.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      {/* Aperçu live */}
      <Text style={[styles.label, { color: c.muted2 }]}>Aperçu</Text>
      <View
        style={[
          styles.preview,
          { backgroundColor: c.surface, borderColor: c.line },
        ]}
      >
        <View
          style={[
            styles.previewSwatch,
            { backgroundColor: accent, shadowColor: accent },
          ]}
        >
          <Icon name="bolt" size={26} color={preview.onAccent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.previewHex, { color: c.txt }]}>
            {accent.toUpperCase()}
          </Text>
          <Text style={[styles.previewSub, { color: c.muted }]}>
            Texte sur accent : {preview.onAccent}
          </Text>
        </View>
        <View
          style={[
            styles.previewBtn,
            { backgroundColor: accent },
          ]}
        >
          <Text style={[styles.previewBtnTxt, { color: preview.onAccent }]}>
            Action
          </Text>
        </View>
      </View>

      {/* Swatches préréglés */}
      <Text style={[styles.label, { color: c.muted2 }]}>Préréglages</Text>
      <View style={styles.swatchRow}>
        {PRESET_SWATCHES.map((sw) => {
          const active = accent.toLowerCase() === sw.hex.toLowerCase();
          return (
            <PressableScale
              key={sw.hex}
              onPress={() => setAccent(sw.hex)}
              style={[
                styles.swatch,
                {
                  backgroundColor: sw.hex,
                  borderColor: active ? c.txt : 'transparent',
                },
              ]}
            >
              {active ? <Icon name="check" size={20} color="#fff" /> : null}
            </PressableScale>
          );
        })}
      </View>

      {/* Sliders HSL */}
      <Text style={[styles.label, { color: c.muted2 }]}>Couleur personnalisée</Text>

      <Text style={[styles.sliderLabel, { color: c.muted }]}>Teinte</Text>
      <GradientSlider
        value={hsl.h / 360}
        onChange={(v) => apply({ h: v * 360 })}
        thumbColor={hslToHex({ h: hsl.h, s: 1, l: 0.5 })}
        gradient={[
          '#ff0000',
          '#ffff00',
          '#00ff00',
          '#00ffff',
          '#0000ff',
          '#ff00ff',
          '#ff0000',
        ]}
      />

      <Text style={[styles.sliderLabel, { color: c.muted }]}>Saturation</Text>
      <GradientSlider
        value={hsl.s}
        onChange={(v) => apply({ s: v })}
        thumbColor={accent}
        gradient={[
          hslToHex({ h: hsl.h, s: 0, l: hsl.l }),
          hslToHex({ h: hsl.h, s: 1, l: hsl.l }),
        ]}
      />

      <Text style={[styles.sliderLabel, { color: c.muted }]}>Luminosité</Text>
      <GradientSlider
        value={hsl.l}
        onChange={(v) => apply({ l: v })}
        thumbColor={accent}
        gradient={[
          '#000000',
          hslToHex({ h: hsl.h, s: hsl.s, l: 0.5 }),
          '#ffffff',
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 6, paddingBottom: 40 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  modePillTxt: { fontFamily: fonts.display, fontSize: 13.5 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  previewSwatch: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  previewHex: { fontFamily: fonts.display, fontSize: 18 },
  previewSub: { fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  previewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  previewBtnTxt: { fontFamily: fonts.display, fontSize: 13 },
  swatchRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  swatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12.5,
    marginTop: 16,
    marginBottom: 8,
  },
});

export default ColorPicker;

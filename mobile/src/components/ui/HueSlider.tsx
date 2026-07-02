import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { clamp } from '@/lib/color';

export interface SliderProps {
  /** Valeur normalisée 0..1. */
  value: number;
  onChange: (v: number) => void;
  /** Couleurs du dégradé de fond (au moins 2). */
  gradient: string[];
  thumbColor: string;
  height?: number;
}

const THUMB = 26;

/**
 * Slider générique animé (Reanimated + gesture-handler) : un dégradé de fond,
 * un thumb draggable. Sert de brique aux 3 sliders Teinte / Saturation / Lum.
 */
export function GradientSlider({
  value,
  onChange,
  gradient,
  thumbColor,
  height = 22,
}: SliderProps) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);

  // Position du thumb dérivée de la valeur et de la largeur mesurée.
  const usable = Math.max(0, width - THUMB);
  x.value = value * usable;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const update = (px: number) => {
    if (usable <= 0) return;
    onChange(clamp(px / usable, 0, 1));
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      const px = clamp(e.x - THUMB / 2, 0, usable);
      x.value = px;
      runOnJS(update)(px);
    })
    .onUpdate((e) => {
      const px = clamp(e.x - THUMB / 2, 0, usable);
      x.value = px;
      runOnJS(update)(px);
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.row, { height: THUMB }]} onLayout={onLayout}>
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.track, { height, borderRadius: height / 2 }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { backgroundColor: thumbColor, borderColor: '#fff' },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
  },
  track: {
    width: '100%',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
});

export default GradientSlider;

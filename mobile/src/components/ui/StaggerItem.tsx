import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface StaggerItemProps {
  /** Index de la carte : sert à décaler l'apparition (delay = index * step). */
  index?: number;
  /** Pas de décalage en ms entre deux cartes (défaut 90). */
  step?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Apparition en cascade : fade + translation verticale, décalée par index.
 * Enveloppe chaque carte du dashboard pour le stagger demandé.
 */
export function StaggerItem({ index = 0, step = 90, style, children }: StaggerItemProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * step,
      withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, step, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export default StaggerItem;

import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** Progression 0..1 (ex. sessions_done / sessions_target). */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Gros chiffre au centre (ex. « 25% »). */
  centerLabel?: string;
  /** Petit texte sous le chiffre (ex. « assiduité »). */
  centerSub?: string;
  color?: string;
}

/**
 * Anneau de progression unique animé (Reanimated), réutilisé par « Mon défi ».
 * strokeDashoffset animé = remplissage progressif. Dérivé de ProgressRings.
 */
export function ProgressRing({
  progress,
  size = 148,
  strokeWidth = 12,
  centerLabel,
  centerSub,
  color,
}: ProgressRingProps) {
  const { c } = useTheme();
  const stroke = color ?? c.accent;

  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  const p = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    p.value = withTiming(clamped, {
      duration: 950,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, p]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - p.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke={c.line} strokeWidth={strokeWidth} />
        <G rotation={-90} origin={`${cx}, ${cx}`}>
          <AnimatedCircle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      {(centerLabel || centerSub) && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          {centerLabel ? (
            <Text style={[styles.big, { color: c.txt }]}>{centerLabel}</Text>
          ) : null}
          {centerSub ? (
            <Text style={[styles.sub, { color: c.muted }]}>{centerSub}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: fonts.display, fontSize: 34, letterSpacing: -1 },
  sub: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

export default ProgressRing;

import React, { useEffect } from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Double anneau de progression (Calories = violet ; Séances = accent), porté du
 * SVG de Home.tsx. strokeDashoffset animé (Reanimated) = remplissage progressif.
 */
export function ProgressRings({
  caloriesPct = 0.78,
  sessionsPct = 0.8,
}: {
  caloriesPct?: number;
  sessionsPct?: number;
}) {
  const { c } = useTheme();

  const C_OUTER = 2 * Math.PI * 44; // 276.5
  const C_INNER = 2 * Math.PI * 32; // 201.06

  const p1 = useSharedValue(0);
  const p2 = useSharedValue(0);

  useEffect(() => {
    p1.value = withTiming(caloriesPct, { duration: 900, easing: Easing.out(Easing.cubic) });
    p2.value = withTiming(sessionsPct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [caloriesPct, sessionsPct, p1, p2]);

  const outerProps = useAnimatedProps(() => ({
    strokeDashoffset: C_OUTER * (1 - p1.value),
  }));
  const innerProps = useAnimatedProps(() => ({
    strokeDashoffset: C_INNER * (1 - p2.value),
  }));

  return (
    <Svg width={116} height={116} viewBox="0 0 116 116">
      <Circle cx={58} cy={58} r={44} fill="none" stroke={c.line} strokeWidth={9} />
      <Circle cx={58} cy={58} r={32} fill="none" stroke={c.line} strokeWidth={9} />
      <G rotation={-90} origin="58, 58">
        <AnimatedCircle
          cx={58}
          cy={58}
          r={44}
          fill="none"
          stroke={c.violet}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={C_OUTER}
          animatedProps={outerProps}
        />
        <AnimatedCircle
          cx={58}
          cy={58}
          r={32}
          fill="none"
          stroke={c.accent}
          strokeWidth={9}
          strokeLinecap="round"
          strokeDasharray={C_INNER}
          animatedProps={innerProps}
        />
      </G>
    </Svg>
  );
}

export default ProgressRings;

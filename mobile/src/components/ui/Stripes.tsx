import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';

export interface StripesProps {
  color1: string;
  color2: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Motif de rayures diagonales (équivalent du repeating-linear-gradient 135deg
 * de la maquette web) en SVG. Sert de fond « placeholder photo » sur Welcome.
 */
export function Stripes({ color1, color2, style }: StripesProps) {
  return (
    <View style={style}>
      <Svg width="100%" height="100%">
        <Defs>
          {/* tuile de 26 px : moitié color1, moitié color2, inclinée à 45° */}
          <Pattern
            id="stripes"
            patternUnits="userSpaceOnUse"
            width={26}
            height={26}
            patternTransform="rotate(45)"
          >
            <Rect x={0} y={0} width={26} height={26} fill={color1} />
            <Line x1={6.5} y1={0} x2={6.5} y2={26} stroke={color2} strokeWidth={13} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#stripes)" />
      </Svg>
    </View>
  );
}

export default Stripes;

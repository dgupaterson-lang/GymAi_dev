import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';

/**
 * Équivalent mobile de l'Icon web (Material Symbols Rounded).
 * On porte les glyphes vers @expo/vector-icons > MaterialIcons (Material Icons
 * « Material Symbols » étant la version variable des mêmes glyphes).
 * `MAP` traduit les noms snake_case utilisés côté web vers le nom MaterialIcons.
 */
type MIName = React.ComponentProps<typeof MaterialIcons>['name'];

const MAP: Record<string, MIName> = {
  fitness_center: 'fitness-center',
  dark_mode: 'dark-mode',
  favorite: 'favorite',
  bolt: 'bolt',
  exercise: 'fitness-center',
  schedule: 'schedule',
  local_fire_department: 'local-fire-department',
  play_arrow: 'play-arrow',
  monitor_weight: 'monitor-weight',
  straighten: 'straighten',
  water_drop: 'water-drop',
  auto_awesome: 'auto-awesome',
  chevron_right: 'chevron-right',
  signal_cellular_alt: 'signal-cellular-alt',
  wifi: 'wifi',
  battery_full: 'battery-full',
  home: 'home',
  person: 'person',
  groups: 'groups',
  palette: 'palette',
  check: 'check',
  arrow_back: 'arrow-back',
  tune: 'tune',
  smart_toy: 'smart-toy',
  mail: 'mail-outline',
  lock: 'lock-outline',
  visibility: 'visibility',
  visibility_off: 'visibility-off',
  error_outline: 'error-outline',
  logout: 'logout',
  arrow_forward: 'arrow-forward',
  add: 'add',
  close: 'close',
  delete: 'delete-outline',
  share: 'ios-share',
  qr_code: 'qr-code-2',
  content_copy: 'content-copy',
  link: 'link',
  group_add: 'group-add',
  people: 'people-outline',
  check_circle: 'check-circle',
  emoji_events: 'emoji-events',
  military_tech: 'military-tech',
  calendar_today: 'calendar-today',
  trending_up: 'trending-up',
  redeem: 'redeem',
  add_circle: 'add-circle-outline',
  remove_circle: 'remove-circle-outline',
};

export interface IconProps {
  /** Nom (snake_case) tel qu'utilisé côté web, ou un nom MaterialIcons direct. */
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  const resolved = (MAP[name] ?? (name as MIName)) as MIName;
  return <MaterialIcons name={resolved} size={size} color={color} style={style} />;
}

export default Icon;

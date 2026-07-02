import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '@/theme';
import { fonts } from '@/theme/fonts';
import Icon from './Icon';
import PressableScale from './PressableScale';

export interface AuthFieldProps extends TextInputProps {
  label: string;
  /** Icône (snake_case) affichée à gauche. */
  icon?: string;
  /** Champ mot de passe : ajoute un bouton œil pour révéler. */
  secure?: boolean;
}

/**
 * Champ de saisie stylé thème, réutilisé par login/register.
 * Focus -> bordure accent. Support mot de passe avec toggle de visibilité.
 */
export function AuthField({
  label,
  icon,
  secure = false,
  style,
  ...rest
}: AuthFieldProps) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: c.muted2 }]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            backgroundColor: c.surface,
            borderColor: focused ? c.accent : c.line,
          },
        ]}
      >
        {icon ? (
          <Icon name={icon} size={19} color={focused ? c.accent : c.muted} />
        ) : null}
        <TextInput
          style={[styles.input, { color: c.txt }, style]}
          placeholderTextColor={c.muted2}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure ? (
          <PressableScale onPress={() => setHidden((v) => !v)} hitSlop={8}>
            <Icon
              name={hidden ? 'visibility' : 'visibility_off'}
              size={19}
              color={c.muted}
            />
          </PressableScale>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
});

export default AuthField;

import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

/**
 * QR code d'un lien d'invitation (docs/16 : lien partageable via QR).
 * Encadré blanc pour rester scannable quel que soit le thème.
 */
export function InviteQR({ value, size = 168 }: { value: string; size?: number }) {
  return (
    <View style={styles.frame}>
      <QRCode value={value} size={size} backgroundColor="#ffffff" color="#0b0d13" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
  },
});

export default InviteQR;

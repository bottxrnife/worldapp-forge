/**
 * QR — wraps react-native-qrcode-svg with a graceful fallback.
 *
 * If the package isn't installed the component degrades to showing the raw
 * payload, so screens that render a QR never crash (consistent with the repo's
 * "every integration degrades gracefully" rule). Install the package to get the
 * real scannable code:  npx expo install react-native-qrcode-svg
 */
import React from 'react';
import { View } from 'react-native';
import { C } from '../theme';
import { Txt } from './ui';

let QRCode: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  QRCode = require('react-native-qrcode-svg').default;
} catch {
  QRCode = null;
}

export function QR({ value, size = 184 }: { value: string; size?: number }) {
  if (QRCode) {
    return (
      <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, alignSelf: 'center' }}>
        <QRCode value={value} size={size} backgroundColor="#FFFFFF" color="#0B0E17" />
      </View>
    );
  }
  return (
    <View
      style={{
        padding: 18,
        backgroundColor: C.surface,
        borderRadius: 20,
        alignItems: 'center',
        alignSelf: 'stretch',
      }}
    >
      <Txt size={12} color={C.text3} center>
        Scannable code unavailable — share this:
      </Txt>
      <Txt size={12.5} w={700} color={C.text} center style={{ marginTop: 8 }} numberOfLines={2}>
        {value}
      </Txt>
    </View>
  );
}

import { View } from 'react-native';
import { Screen, Txt } from '../src/components/ui';
import { C } from '../src/theme';

/** Placeholder route until onboarding ships in step 7. */
export default function Index() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <Txt size={26} w={800}>
          DappDock
        </Txt>
        <Txt size={14} color={C.text2}>
          Shell ready — screens coming next.
        </Txt>
      </View>
    </Screen>
  );
}

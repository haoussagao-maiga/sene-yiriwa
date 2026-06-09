declare module 'react-native-keyboard-aware-scroll-view' {
  import type { ComponentType } from 'react';
  import type { ScrollViewProps } from 'react-native';

  export const KeyboardAwareScrollView: ComponentType<ScrollViewProps & {
    enableOnAndroid?: boolean;
    extraScrollHeight?: number;
  }>;
}

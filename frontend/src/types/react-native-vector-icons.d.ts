declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { StyleProp, TextStyle, ViewStyle } from 'react-native';

  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle> | StyleProp<ViewStyle>;
  }

  const Icon: ComponentType<IconProps>;
  export default Icon;
}

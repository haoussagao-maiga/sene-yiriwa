declare module 'expo-localization' {
  export const locale: string;
  export const timezone: string;
  export const region: string;
  export const country: string;
  export const isoCurrencyCodes: string[];

  const Localization: {
    locale: string;
    timezone: string;
    region: string;
    country: string;
    isoCurrencyCodes: string[];
  };

  export default Localization;
}

import { Platform } from 'react-native';

const darkPalette = {
  background: '#030409',
  surface: '#0c0f1d',
  surfaceSoft: '#111428',
  surfaceLift: '#181d2f',
  accent: '#6bfffe',
  accentWarm: '#ffb347',
  accentStrong: '#ff6b6b',
  text: '#f7f7ff',
  mutedText: '#8e92a8',
  border: '#1f2334',
  glow: 'rgba(107, 255, 254, 0.35)',
  success: '#2cc78a',
};

const lightPalette = {
  background: '#f5f6fb',
  surface: '#ffffff',
  surfaceSoft: '#f0f1f6',
  surfaceLift: '#f8f9ff',
  accent: '#4169ff',
  accentWarm: '#ff914d',
  accentStrong: '#ff405f',
  text: '#181c2a',
  mutedText: '#5b6075',
  border: '#dfe2ef',
  glow: 'rgba(65, 105, 255, 0.3)',
  success: '#38b169',
};

export const Colors = {
  light: {
    text: lightPalette.text,
    background: lightPalette.background,
    tint: lightPalette.accent,
    icon: lightPalette.accentWarm,
    tabIconDefault: lightPalette.mutedText,
    tabIconSelected: lightPalette.accent,
  },
  dark: {
    text: darkPalette.text,
    background: darkPalette.background,
    tint: darkPalette.accent,
    icon: darkPalette.accentWarm,
    tabIconDefault: darkPalette.mutedText,
    tabIconSelected: darkPalette.accent,
  },
};

export const ThemeTokens = {
  colors: {
    dark: darkPalette,
    light: lightPalette,
  },
  fonts: {
    heading: 'PlusJakartaSans_600SemiBold',
    display: 'PlusJakartaSans_700Bold',
    body: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    strong: 'Outfit_600SemiBold',
  },
  spacing: {
    nano: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radii: {
    sm: 12,
    md: 18,
    lg: 26,
    pill: 999,
  },
  shadows: {
    card: '0px 20px 45px rgba(0, 0, 0, 0.45)',
    glow: '0px 0px 24px rgba(107, 255, 254, 0.45)',
  },
  muscleEmoji: {
    Chest: '💪',
    Shoulders: '🛡️',
    Back: '🌀',
    Legs: '🏋️',
    Arms: '⚡',
    Core: '🔥',
    Glutes: '🍑',
    Cardio: '🏃',
    Calves: '🐾',
    Forearms: '🪢',
    Hamstrings: '🦵',
    Triceps: '🎯',
    Biceps: '💥',
    Abs: '🦾',
    'Other': '✨',
  } as Record<string, string>,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

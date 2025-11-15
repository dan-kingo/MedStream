import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    /* 🌿 Primary tones – Emerald & Teal */
    primary: '#00B894',            // fresh emerald green
    primaryContainer: '#C8FCEA',   // very light mint container
    secondary: '#2D3436',          // deep slate gray for contrast
    secondaryContainer: '#E8EAED', // cool neutral container

    /* ✨ Accent / Tertiary */
    tertiary: '#FF8C42',           // warm orange for call-to-action buttons
    tertiaryContainer: '#FFE7D0',  // soft peach background

    /* ❌ Feedback colors */
    error: '#EF4444',              // bright coral red
    errorContainer: '#FECACA',

    /* 🧱 Surfaces & Backgrounds */
    surface: '#FFFFFF',            // card & modal background
    surfaceVariant: '#F5FFFA',     // mint-tinted background
    background: '#F5FFFA',         // overall app background (different from MediMap’s pure white)

    /* 🖋️ Text & Content */
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onSurface: '#222F3E',          // deep slate text
    onSurfaceVariant: '#636E72',   // muted gray text
    onBackground: '#222F3E',

    /* 🪶 Borders & Outlines */
    outline: '#B2BEC3',
    outlineVariant: '#DFE6E9',
  },
  roundness: 14,                   // slightly softer corners for a friendly, modern feel
};

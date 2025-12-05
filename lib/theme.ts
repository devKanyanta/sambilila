// lib/theme.ts

export const colors = {
  // Primary Colors - Sophisticated Sage Green
  primary: {
    50: '#f4f7f5',
    100: '#e3ede6',
    200: '#c7dccf',
    300: '#a0c4ab',
    400: '#73a582',
    500: '#52876a',  // DEFAULT
    600: '#3f6b53',
    700: '#335644',
    800: '#2b4638',
    900: '#243a2f',
  },
  
  // Secondary Colors - Warm Terracotta
  secondary: {
    50: '#fdf6f3',
    100: '#fae8e0',
    200: '#f5d0c1',
    300: '#edb197',
    400: '#e3886b',
    500: '#d96a48',  // DEFAULT
    600: '#c4543a',
    700: '#a44332',
    800: '#85392f',
    900: '#6d3229',
  },
  
  // Neutral Colors - Warm Grays
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',  // DEFAULT
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  
  // Accent Colors - Dusty Blue
  accent: {
    50: '#f4f6f8',
    100: '#e6ebf0',
    200: '#d0dae4',
    300: '#adbecf',
    400: '#839db5',
    500: '#67819d',  // DEFAULT
    600: '#526782',
    700: '#44546a',
    800: '#3a4759',
    900: '#333d4b',
  },
  
  // Success - Muted Forest Green
  success: {
    50: '#f3f6f3',
    100: '#e3ebe4',
    200: '#c8d8ca',
    300: '#a0bda5',
    400: '#729b7a',
    500: '#527d5b',  // DEFAULT
    600: '#3f6347',
    700: '#344f3b',
    800: '#2c4032',
    900: '#26362b',
  },
  
  // Warning - Golden Amber
  warning: {
    50: '#fefbf3',
    100: '#fdf4e0',
    200: '#fae7c2',
    300: '#f5d498',
    400: '#efb865',
    500: '#e59f3e',  // DEFAULT
    600: '#d08329',
    700: '#ad6624',
    800: '#8c5024',
    900: '#724321',
  },
  
  // Error - Muted Clay Red
  error: {
    50: '#fdf5f4',
    100: '#fae8e6',
    200: '#f5d4d1',
    300: '#edb3ad',
    400: '#e18880',
    500: '#d0655b',  // DEFAULT
    600: '#b84c43',
    700: '#9a3f38',
    800: '#803834',
    900: '#6c3331',
  },
}

// Pre-defined gradients for easy use
export const gradients = {
  primary: 'linear-gradient(135deg, #52876a 0%, #67819d 100%)',
  warm: 'linear-gradient(135deg, #d96a48 0%, #e59f3e 100%)',
  earth: 'linear-gradient(135deg, #52876a 0%, #d96a48 100%)',
  sunset: 'linear-gradient(135deg, #e59f3e 0%, #d0655b 100%)',
  forest: 'linear-gradient(135deg, #527d5b 0%, #52876a 100%)',
  subtle: 'linear-gradient(135deg, rgba(82, 135, 106, 0.08) 0%, rgba(103, 129, 157, 0.08) 100%)',
  neutral: 'linear-gradient(135deg, #fafaf9 0%, #e7e5e4 100%)',
}

// Theme configuration for different contexts
export const theme = {
  // Backgrounds
  backgrounds: {
    main: '#fdfcfb',            // Warm off-white
    card: '#ffffff',
    sidebar: '#fafaf9',
    navbar: 'rgba(255, 255, 255, 0.95)',
    overlay: 'rgba(28, 25, 23, 0.6)',
    dark: colors.neutral[900],
    subtle: colors.neutral[50],
  },
  
  // Borders
  borders: {
    light: colors.neutral[200],    // #e7e5e4
    medium: colors.neutral[300],   // #d6d3d1
    dark: colors.neutral[500],     // #78716c
    accent: colors.primary[400],   // #73a582
    focus: colors.accent[500],     // #67819d
  },
  
  // Text
  text: {
    primary: colors.neutral[900],  // #1c1917
    secondary: colors.neutral[600], // #57534e
    light: colors.neutral[500],    // #78716c
    inverted: '#ffffff',
    accent: colors.primary[600],   // #3f6b53
    link: colors.accent[600],      // #526782
  },
  
  // Interactive States
  states: {
    hover: {
      light: colors.neutral[100],     // #f5f5f4
      primary: colors.primary[50],    // #f4f7f5
      secondary: colors.secondary[50], // #fdf6f3
    },
    active: {
      light: colors.neutral[200],      // #e7e5e4
      primary: colors.primary[100],    // #e3ede6
      secondary: colors.secondary[100], // #fae8e0
    },
    focus: {
      ring: colors.primary[500],       // #52876a
      secondary: colors.accent[500],   // #67819d
    },
    disabled: {
      bg: colors.neutral[100],         // #f5f5f4
      text: colors.neutral[400],       // #a8a29e
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    colored: {
      primary: '0 8px 24px -4px rgba(82, 135, 106, 0.2)',
      secondary: '0 8px 24px -4px rgba(217, 106, 72, 0.2)',
      accent: '0 8px 24px -4px rgba(103, 129, 157, 0.2)',
    },
  },
  
  // Natural textures
  surfaces: {
    paper: '#fdfcfb',
    linen: '#faf9f7',
    canvas: '#f5f4f2',
    stone: '#eae8e5',
  },
}

// Semantic color aliases
export const semantic = {
  brand: colors.primary[500],
  info: colors.accent[500],
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
  
  // Status indicators
  online: colors.success[500],
  away: colors.warning[500],
  busy: colors.error[500],
  offline: colors.neutral[400],
}
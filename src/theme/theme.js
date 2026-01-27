// Color Palette
export const colors = {
    // Primary Colors
    primary: '#2563EB', // Blue
    primaryDark: '#1E40AF',
    primaryLight: '#60A5FA',

    // Secondary Colors
    secondary: '#10B981', // Green
    secondaryDark: '#059669',
    secondaryLight: '#34D399',

    // Accent Colors
    accent: '#F59E0B', // Amber
    accentDark: '#D97706',
    accentLight: '#FBBF24',

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',

    // Semantic Colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    surface: '#FFFFFF',

    // Text
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
};

// Typography
export const typography = {
    // Font Families
    fontRegular: 'System',
    fontMedium: 'System',
    fontBold: 'System',
    fontSemiBold: 'System',

    // Font Sizes
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,

    // Line Heights
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,

    // Font Weights
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
};

// Border Radius
export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
};

// Shadows
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
};

// Layout
export const layout = {
    screenPadding: spacing.md,
    containerMaxWidth: 480,
};

// Export default theme object
const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    layout,
};

export default theme;

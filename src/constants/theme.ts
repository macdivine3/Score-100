// Score 100 - Premium Dark Theme Design System

export const COLORS = {
    // Backgrounds
    bg: '#000000',
    bgCard: 'rgba(255, 255, 255, 0.05)',
    bgCardBorder: 'rgba(255, 255, 255, 0.08)',
    bgElevated: 'rgba(255, 255, 255, 0.03)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    textMuted: 'rgba(255, 255, 255, 0.35)',

    // Accent — The blue CTA
    accent: '#3B82F6',
    accentGlow: 'rgba(59, 130, 246, 0.3)',

    // Task Gradient Colors (Orange → Coral → Purple → Blue)
    taskOrange: '#FF8C00',
    taskCoral: '#FF6347',
    taskPurple: '#9932CC',
    taskBlue: '#1E90FF',

    // Score Ring Gradient
    ringStart: '#3B82F6',   // Blue
    ringEnd: '#10B981',     // Green/Teal

    // Status
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.2)',
    danger: '#EF4444',
    warning: '#F59E0B',

    // Loop section
    loopBg: 'rgba(30, 30, 40, 0.95)',
    loopBorder: 'rgba(255, 255, 255, 0.1)',
};

// Task card gradient stops based on position
export const TASK_GRADIENTS = [
    ['#FF8C00', '#FF7B00'],   // Orange
    ['#FF6347', '#E8533A'],   // Coral/Red-Orange
    ['#9932CC', '#8B2FC0'],   // Purple
    ['#1E90FF', '#187BDB'],   // Blue
    ['#10B981', '#0EA572'],   // Teal
    ['#F59E0B', '#D97706'],   // Amber
];

// Timeline dot colors matching gradient
export const TIMELINE_COLORS = [
    '#FF8C00', // Orange
    '#FF6347', // Coral
    '#9932CC', // Purple
    '#1E90FF', // Blue
    '#10B981', // Teal
    '#F59E0B', // Amber
];

export const FONTS = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

export const SIZES = {
    // Spacing
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,

    // Border Radius
    radiusSm: 8,
    radiusMd: 12,
    radiusLg: 16,
    radiusXl: 24,
    radiusFull: 999,

    // Font Sizes
    fontXs: 10,
    fontSm: 12,
    fontMd: 14,
    fontLg: 16,
    fontXl: 20,
    font2xl: 24,
    font3xl: 32,
    font4xl: 40,
    font5xl: 48,
};

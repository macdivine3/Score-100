import React from 'react';
import { View, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SIZES } from '../constants/theme';

interface BottomNavBarProps {
    currentScreen: 'home' | 'reflection' | string;
    onNavigate: (screen: 'home' | 'reflection') => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Subtle Glowing Top Border */}
                <View style={styles.topBorderLine}>
                    <LinearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={COLORS.ringStart} stopOpacity={0.2} />
                        <Stop offset="50%" stopColor={COLORS.ringEnd} stopOpacity={0.3} />
                        <Stop offset="100%" stopColor={COLORS.ringStart} stopOpacity={0.2} />
                    </LinearGradient>
                    <View style={[styles.glowLine, { backgroundColor: COLORS.bgCardBorder }]} />
                </View>

                <View style={styles.navRow}>
                    {/* Home Button */}
                    <Pressable
                        onPress={() => onNavigate('home')}
                        style={styles.navBtn}
                    >
                        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M3 9.5L12 3L21 9.5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9.5Z"
                                stroke={currentScreen === 'home' ? COLORS.accent : COLORS.textMuted}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <Path
                                d="M9 21V12H15V21"
                                stroke={currentScreen === 'home' ? COLORS.accent : COLORS.textMuted}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </Svg>
                        {currentScreen === 'home' && <View style={styles.activeDot} />}
                    </Pressable>

                    {/* Reflection Button (Score Ring Icon) */}
                    <Pressable
                        onPress={() => onNavigate('reflection')}
                        style={styles.navBtn}
                    >
                        <View style={styles.reflectionIconContainer}>
                            <Svg width="24" height="24" viewBox="0 0 24 24">
                                <Defs>
                                    <LinearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <Stop offset="0%" stopColor={COLORS.ringStart} />
                                        <Stop offset="100%" stopColor={COLORS.ringEnd} />
                                    </LinearGradient>
                                </Defs>
                                <Circle
                                    cx="12"
                                    cy="12"
                                    r="8"
                                    stroke={currentScreen === 'reflection' ? "url(#iconGradient)" : COLORS.textMuted}
                                    strokeWidth="2.5"
                                    fill="none"
                                />
                                {currentScreen === 'reflection' && (
                                    <Circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                        fill="url(#iconGradient)"
                                    />
                                )}
                            </Svg>
                        </View>
                        {currentScreen === 'reflection' && <View style={styles.activeDotReflection} />}
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#1E1E2E', // Solid anchored background
    },
    container: {
        width: '100%',
        height: 65,
        backgroundColor: '#1E1E2E',
    },
    topBorderLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
    },
    glowLine: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
    navRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: SIZES.xl,
    },
    navBtn: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reflectionIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
        marginTop: 4,
        position: 'absolute',
        bottom: 0,
    },
    activeDotReflection: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.ringEnd,
        marginTop: 4,
        position: 'absolute',
        bottom: 0,
    },
});

export default BottomNavBar;

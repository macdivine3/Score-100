import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS, SIZES } from '../constants/theme';

interface FloatingNavBarProps {
    currentScreen: 'home' | 'reflection' | string;
    onNavigate: (screen: 'home' | 'reflection') => void;
}

const FloatingNavBar: React.FC<FloatingNavBarProps> = ({ currentScreen, onNavigate }) => {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {/* Home Icon */}
                <Pressable
                    onPress={() => onNavigate('home')}
                    style={[styles.navBtn, currentScreen === 'home' && styles.activeBtn]}
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
                </Pressable>

                <View style={styles.divider} />

                {/* Reflection Icon (Glowing Circle) */}
                <Pressable
                    onPress={() => onNavigate('reflection')}
                    style={[styles.navBtn, currentScreen === 'reflection' && styles.activeBtn]}
                >
                    <View style={styles.reflectionIconContainer}>
                        {currentScreen === 'reflection' && (
                            <View style={styles.glow} />
                        )}
                        <Svg width="22" height="22" viewBox="0 0 22 22">
                            <Defs>
                                <LinearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <Stop offset="0%" stopColor={COLORS.ringStart} />
                                    <Stop offset="100%" stopColor={COLORS.ringEnd} />
                                </LinearGradient>
                            </Defs>
                            <Circle
                                cx="11"
                                cy="11"
                                r="8"
                                stroke={currentScreen === 'reflection' ? "url(#iconGradient)" : COLORS.textMuted}
                                strokeWidth="2.5"
                                fill="none"
                            />
                        </Svg>
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 30, 46, 0.9)',
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 20,
    },
    navBtn: {
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeBtn: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    divider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 4,
    },
    reflectionIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.ringStart,
        shadowColor: COLORS.ringStart,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        opacity: 0.4,
    },
});

export default FloatingNavBar;

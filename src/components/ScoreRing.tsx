import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming, withRepeat, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { COLORS, SIZES } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ScoreRingProps {
    score?: number;
    size?: number;
    strokeWidth?: number;
    isCritical?: boolean;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score = 0, size = 260, strokeWidth = 14, isCritical = false }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);
    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        progress.value = withTiming(Math.min(score / 100, 1), {
            duration: 2000,
            easing: Easing.bezier(0.2, 0, 0, 1),
        });
    }, [score]);

    // Pulse animation when critical
    useEffect(() => {
        if (isCritical) {
            pulseAnim.value = withRepeat(
                withTiming(0.4, { duration: 800 }),
                -1, // infinite
                true  // reverse
            );
        } else {
            pulseAnim.value = withTiming(1, { duration: 400 });
        }
    }, [isCritical]);

    const glowAnimStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value,
    }));

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    const getScoreMessage = (score: number) => {
        if (score === 100) return "Perfection, Achiever!";
        if (score >= 80) return "Great Job, Achiever!";
        if (score >= 60) return "Good job, Achiever!";
        if (score >= 40) return "Keep pushing!";
        return "New start tomorrow.";
    };

    // Dynamic gradient colors
    const ringStartColor = isCritical ? '#FF4444' : COLORS.ringStart;
    const ringEndColor = isCritical ? '#CC0000' : COLORS.ringEnd;

    return (
        <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
            {/* Outer Glow Path (Blurred SVG duplicate) */}
            <Animated.View style={[StyleSheet.absoluteFill, glowAnimStyle]}>
                <Svg width={size + 40} height={size + 40} viewBox={`-20 -20 ${size + 40} ${size + 40}`}>
                    <Defs>
                        <SvgGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={ringStartColor} stopOpacity={0.4} />
                            <Stop offset="100%" stopColor={ringEndColor} stopOpacity={0.4} />
                        </SvgGradient>
                    </Defs>
                    <AnimatedCircle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="url(#glowGradient)"
                        strokeWidth={strokeWidth + 4}
                        fill="none"
                        strokeOpacity={0.6}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </Svg>
            </Animated.View>

            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Defs>
                    <SvgGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor={ringStartColor} />
                        <Stop offset="100%" stopColor={ringEndColor} />
                    </SvgGradient>
                </Defs>

                {/* Background Ring */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress Ring */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#ringGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>

            {/* Centered Text */}
            <View style={styles.textContainer}>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreNumber}>{score}</Text>
                    <Text style={styles.scoreLabel}> / 100</Text>
                </View>
                <Text style={styles.message}>{getScoreMessage(score)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    scoreNumber: {
        color: COLORS.textPrimary,
        fontSize: 56,
        fontWeight: '800',
    },
    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 2,
    },
    message: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.5,
    },
});

export default ScoreRing;

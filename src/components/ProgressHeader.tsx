import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';

const ProgressHeader: React.FC = () => {
    const { currentScore, yesterdayScore } = useApp();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'GOOD MORNING';
        if (hour < 17) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
    };

    const scoreDiff = yesterdayScore !== null ? currentScore - yesterdayScore : null;

    return (
        <View style={styles.container}>
            <View style={styles.greetingRow}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.name}>Achiever</Text>
                </View>
                <View style={styles.avatar}>
                    <Text style={styles.avatarIcon}>👤</Text>
                </View>
            </View>

            <View style={styles.progressCard}>
                <Text style={styles.progressLabel}>TODAY'S PROGRESS</Text>
                <View style={styles.scoreRow}>
                    <Text style={styles.scoreNumber}>{currentScore}</Text>
                    <Text style={styles.scoreTotal}> / 100</Text>
                    {scoreDiff !== null && (
                        <Text style={[styles.scoreDiff, { color: scoreDiff >= 0 ? COLORS.success : COLORS.danger }]}>
                            {scoreDiff >= 0 ? '+' : ''}{scoreDiff} from yesterday
                        </Text>
                    )}
                </View>

                <View style={styles.progressBarBg}>
                    <LinearGradient
                        colors={[COLORS.ringStart, COLORS.ringEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${Math.min(currentScore, 100)}%` }]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xl,
    },
    greetingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    greeting: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontXs,
        fontWeight: '600',
        letterSpacing: 1,
    },
    name: {
        color: COLORS.textPrimary,
        fontSize: SIZES.font3xl,
        fontWeight: '800',
        marginTop: -4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
    },
    avatarIcon: {
        fontSize: 20,
    },
    progressCard: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
    },
    progressLabel: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontXs,
        letterSpacing: 2,
        fontWeight: '400',
        marginBottom: SIZES.xs,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: SIZES.md,
    },
    scoreNumber: {
        color: COLORS.textPrimary,
        fontSize: SIZES.font3xl,
        fontWeight: '700',
    },
    scoreTotal: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontXl,
        fontWeight: '400',
    },
    scoreDiff: {
        fontSize: SIZES.fontSm,
        marginLeft: 'auto',
        fontWeight: '500',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default ProgressHeader;

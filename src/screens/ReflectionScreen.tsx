import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import ScoreRing from '../components/ScoreRing';
import { getTodaysPrompt } from '../constants/journalPrompts';

interface ReflectionScreenProps {
    onFinish: () => void;
}

const ReflectionScreen: React.FC<ReflectionScreenProps> = ({ onFinish }) => {
    const { currentScore, journalEntry, closeDay, weeklyAverage, streakCount } = useApp();
    const [reflection, setReflection] = useState(journalEntry);
    const prompt = getTodaysPrompt();

    const handleFinish = async () => {
        await closeDay(reflection);
        onFinish();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.ringSection}>
                        <ScoreRing score={currentScore} />

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>7-DAY AVG</Text>
                                <Text style={[styles.statValue, { color: weeklyAverage >= 90 ? COLORS.success : COLORS.textPrimary }]}>
                                    {weeklyAverage}
                                </Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statLabel}>STREAK</Text>
                                <View style={styles.streakRow}>
                                    <Text style={styles.statValue}>{streakCount}</Text>
                                    <Text style={styles.streakFire}>🔥</Text>
                                </View>
                            </View>
                        </View>

                        {weeklyAverage >= 95 && (
                            <View style={styles.perfectWeekBadge}>
                                <Text style={styles.perfectWeekEmoji}>💎</Text>
                                <Text style={styles.perfectWeekText}>PERFECT WEEK</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.reflectionCard}>
                        <Text style={styles.sectionTitle}>Daily Reflection</Text>
                        <Text style={styles.prompt}>{prompt}</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.journalInput}
                                placeholder="Write your thoughts here..."
                                placeholderTextColor={COLORS.textMuted}
                                value={reflection}
                                onChangeText={setReflection}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Pressable
                        style={styles.finishButton}
                        onPress={handleFinish}
                    >
                        <Text style={styles.finishButtonText}>Save & Close Day</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xxl,
        paddingBottom: 100,
    },
    ringSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.xl,
        marginTop: SIZES.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.md,
        backgroundColor: 'rgba(255,255,255,0.04)',
        width: '100%',
        borderRadius: SIZES.radiusMd,
        marginTop: SIZES.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '800',
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakFire: {
        fontSize: 14,
        marginLeft: 4,
    },
    perfectWeekBadge: {
        marginTop: SIZES.md,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: SIZES.md,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    perfectWeekEmoji: {
        fontSize: 12,
        marginRight: 6,
    },
    perfectWeekText: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    reflectionCard: {
        width: '100%',
        backgroundColor: '#1E1E2E', // Solid opaque dark color
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: SIZES.xs,
    },
    prompt: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: SIZES.lg,
        lineHeight: 20,
    },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: SIZES.radiusMd,
        minHeight: 180,
        padding: SIZES.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    journalInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        lineHeight: 22,
    },
    footer: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.sm, // Reduced bottom padding since safe area is in nav bar
        paddingTop: SIZES.sm,
        backgroundColor: COLORS.bg,
    },
    finishButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusLg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default ReflectionScreen;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ProgressHeader, TaskCard, TheLoopSection, ScoreRing } from '../components';
import Animated, { useSharedValue, withRepeat, withTiming, withSpring, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { useEffect } from 'react';

interface HomeScreenProps {
    onAddTask: () => void;
    onCompleteDay: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAddTask, onCompleteDay }) => {
    const { tasks, currentScore, yesterdayScore, dayStatus, totalPlanned, startDay, completeTask, skipTask, loopItems, loopChecks, weeklyAverage, streakCount, resetDay, hasTomorrowTasks } = useApp();

    const isPlanning = dayStatus === 'planning';
    const isActive = dayStatus === 'active';

    // Critical State: Score under 50% or missed a habit
    const uncheckedLoopCount = loopItems.filter(item => !loopChecks[item.id]).length;
    const isCritical = isActive && (currentScore < 50 || uncheckedLoopCount > 0);

    const handleReset = () => {
        Alert.alert(
            "Reset Day",
            "This will clear all tasks and reset your progress for today. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => resetDay()
                }
            ]
        );
    };

    // Smart Sorting Logic
    const sortedTasks = React.useMemo(() => {
        const parseTimeToMinutes = (timeStr: string) => {
            if (!timeStr) return 0;
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + (minutes || 0);
        };

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        return [...tasks].sort((a, b) => {
            // Priority 1: Completion status (Incomplete first)
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // Priority 2: For incomplete tasks, check if time has passed
            if (!a.completed) {
                const timeA = parseTimeToMinutes(a.startTime);
                const timeB = parseTimeToMinutes(b.startTime);
                const isAPassed = timeA < currentMinutes;
                const isBPassed = timeB < currentMinutes;

                if (isAPassed !== isBPassed) {
                    return isAPassed ? 1 : -1;
                }

                // Both passed or both upcoming: sort by time
                return timeA - timeB;
            }

            // For both completed tasks: keep original time order
            return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
        });
    }, [tasks]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Fixed Header Section */}
                <View style={styles.fixedHeader}>
                    <ProgressHeader />
                    <View style={styles.tasksSectionHeader}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.titleRow}>
                                <Text style={styles.sectionTitle}>Today's Tasks</Text>
                                {tasks.length > 0 && (
                                    <Pressable onPress={handleReset} style={styles.resetTextBtn}>
                                        <Text style={styles.resetText}>RESET</Text>
                                    </Pressable>
                                )}
                            </View>
                            {!isPlanning && tasks.length > 0 && (
                                <Text style={styles.swipeHint}>Swipe to complete</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Scrollable Task List Section */}
                <View style={styles.taskListContainer}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {tasks.length === 0 ? (
                            <View style={styles.emptyTasks}>
                                {hasTomorrowTasks ? (
                                    <>
                                        <Text style={styles.emptyText}>All set for tomorrow.</Text>
                                        <Text style={styles.emptySubtext}>Get some rest! 🌙</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.emptyText}>No tasks planned yet.</Text>
                                        {isPlanning && (
                                            <Text style={styles.emptySubtext}>Add targets to reach 100 points.</Text>
                                        )}
                                    </>
                                )}
                            </View>
                        ) : (
                            <View style={styles.taskList}>
                                {sortedTasks.map((task, index) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        onComplete={() => completeTask(task.id)}
                                        onSkip={() => skipTask(task.id)}
                                        isLast={index === sortedTasks.length - 1}
                                    />
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>

                <TheLoopSection
                    onAddTask={onAddTask}
                    onStartDay={startDay}
                    onCloseDay={onCompleteDay}
                    dayStatus={dayStatus}
                    totalPlanned={totalPlanned}
                />
            </View>
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
    fixedHeader: {
        backgroundColor: COLORS.bg,
        zIndex: 10,
    },
    tasksSectionHeader: {
        paddingHorizontal: SIZES.lg,
        marginTop: SIZES.sm,
        paddingBottom: SIZES.xs,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.sm,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: SIZES.xl,
        borderRadius: SIZES.radiusMd,
        marginTop: -SIZES.md,
        zIndex: 11,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statLabel: {
        color: COLORS.textMuted,
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 2,
    },
    statValue: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '800',
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakFire: {
        fontSize: 12,
        marginLeft: 2,
    },
    perfectWeekBadge: {
        position: 'absolute',
        top: 20,
        right: SIZES.xl,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    perfectWeekEmoji: {
        fontSize: 10,
        marginRight: 4,
    },
    perfectWeekText: {
        color: COLORS.accent,
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    taskListContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: 240, // Increased space between last card and tray
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    sectionTitle: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: SIZES.sm,
    },
    resetTextBtn: {
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
    },
    resetText: {
        color: COLORS.danger,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    swipeHint: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontXs,
    },
    emptyTasks: {
        marginTop: SIZES.xl,
        paddingVertical: SIZES.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bgElevated,
        borderRadius: SIZES.radiusLg,
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontSm,
        marginTop: SIZES.xs,
    },
    taskList: {
        marginTop: SIZES.sm,
    },
});

export default HomeScreen;

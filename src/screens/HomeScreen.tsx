import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { ProgressHeader, TaskCard, TheLoopSection } from '../components';

interface HomeScreenProps {
    onAddTask: () => void;
    onCompleteDay: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAddTask, onCompleteDay }) => {
    const { tasks, dayStatus, startDay, totalPlanned } = useApp();

    const isPlanning = dayStatus === 'planning';
    const isActive = dayStatus === 'active';

    // Smart Sorting Logic
    const sortedTasks = React.useMemo(() => {
        const parseTimeToMinutes = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            return hours * 60 + minutes;
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
                const timeA = parseTimeToMinutes(a.time);
                const timeB = parseTimeToMinutes(b.time);
                const isAPassed = timeA < currentMinutes;
                const isBPassed = timeB < currentMinutes;

                if (isAPassed !== isBPassed) {
                    return isAPassed ? 1 : -1;
                }

                // Both passed or both upcoming: sort by time
                return timeA - timeB;
            }

            // For both completed tasks: keep original time order
            return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
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
                            <Text style={styles.sectionTitle}>Today's Tasks</Text>
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
                                <Text style={styles.emptyText}>No tasks planned yet.</Text>
                                {isPlanning && (
                                    <Text style={styles.emptySubtext}>Add targets to reach 100 points.</Text>
                                )}
                            </View>
                        ) : (
                            <View style={styles.taskList}>
                                {sortedTasks.map((task, index) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        index={index}
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
        marginTop: SIZES.md,
        paddingBottom: SIZES.xs,
    },
    taskListContainer: {
        height: 360, // Fits roughly 4 cards
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

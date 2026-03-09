import React from 'react';
import {
    View, Text, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    runOnJS, interpolate, Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES, TASK_GRADIENTS, TIMELINE_COLORS } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Task } from '../types';

interface TaskCardProps {
    task: Task;
    index: number;
    isLast: boolean;
    onComplete?: () => void;
    onSkip?: () => void;
}

const SWIPE_THRESHOLD_COMPLETE = -100;
const SWIPE_THRESHOLD_SKIP = 100;

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isLast, onComplete, onSkip }) => {
    const { completeTask, skipTask } = useApp();
    const translateX = useSharedValue(0);

    const gradientColors = TASK_GRADIENTS[index % TASK_GRADIENTS.length];
    const dotColor = TIMELINE_COLORS[index % TIMELINE_COLORS.length];
    const nextDotColor = TIMELINE_COLORS[(index + 1) % TIMELINE_COLORS.length];

    const handleComplete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (onComplete) {
            onComplete();
        } else {
            completeTask(task.id);
        }
    };

    const handleSkip = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onSkip) {
            onSkip();
        } else {
            skipTask(task.id);
        }
    };

    const pan = Gesture.Pan()
        .activeOffsetX([-20, 20]) // Allow vertical scrolling to take priority
        .onUpdate((e) => {
            translateX.value = Math.max(Math.min(e.translationX, 150), -150);
        })
        .onEnd((e) => {
            if (e.translationX < SWIPE_THRESHOLD_COMPLETE) {
                translateX.value = withTiming(-400, { duration: 300 });
                runOnJS(handleComplete)();
            } else if (e.translationX > SWIPE_THRESHOLD_SKIP) {
                translateX.value = withTiming(400, { duration: 300 });
                runOnJS(handleSkip)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const cardAnimStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: interpolate(
            translateX.value,
            [-400, -200, 0, 200, 400],
            [0, 0.8, 1, 0.8, 0],
            Extrapolation.CLAMP,
        ),
    }));

    const renderTimeline = (color: string, nextColor: string, opacity: number = 1) => (
        <View style={styles.timelineCol}>
            <View style={styles.dotContainer}>
                <View style={[styles.dot, { backgroundColor: color, opacity }]} />
                <View style={[styles.horizontalLine, { backgroundColor: color, opacity: opacity * 0.3 }]} />
            </View>
            {!isLast && (
                <View style={styles.lineWrapper}>
                    <LinearGradient
                        colors={[color, nextColor]}
                        style={[styles.line, { opacity: opacity * 0.4 }]}
                    />
                    <View style={[styles.arrowHead, { borderTopColor: color, opacity: opacity * 0.6 }]} />
                </View>
            )}
        </View>
    );

    if (task.completed) {
        return (
            <View style={styles.timelineRow}>
                {renderTimeline(dotColor, nextDotColor, 0.4)}
                <View style={[styles.completedCard]}>
                    <View style={styles.cardInfoRow}>
                        <View style={[styles.leftAccentPill, { backgroundColor: dotColor, opacity: 0.4 }]} />
                        <View style={styles.cardContent}>
                            <Text style={[styles.taskName, { textDecorationLine: 'line-through', opacity: 0.5 }]}>{task.name}</Text>
                            <Text style={[styles.taskTime, { opacity: 0.4 }]}>{task.startTime} — {task.endTime}</Text>
                        </View>
                    </View>
                    <Text style={[styles.points, { opacity: 0.5, color: COLORS.success }]}>{task.points} pts</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.timelineRow}>
            {renderTimeline(dotColor, nextDotColor)}

            <View style={styles.cardWrapper}>
                <View style={styles.skipReveal}>
                    <Text style={styles.skipRevealText}>↷</Text>
                    <Text style={styles.skipLabel}>SKIP</Text>
                </View>

                <View style={styles.swipeReveal}>
                    <Text style={styles.swipeRevealText}>✓</Text>
                    <Text style={styles.completeLabel}>DONE</Text>
                </View>

                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.card, cardAnimStyle]}>
                        <LinearGradient
                            colors={gradientColors as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0.2 }}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardInfoRow}>
                                <View style={[styles.leftAccentPill, { backgroundColor: 'rgba(255,255,255,0.4)' }]} />
                                <View style={styles.cardContent}>
                                    <Text style={styles.taskName} numberOfLines={1}>{task.name}</Text>
                                    <Text style={styles.taskTime}>{task.startTime} — {task.endTime}</Text>
                                </View>
                            </View>
                            <Text style={styles.points}>{task.points} pts</Text>
                        </LinearGradient>
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    timelineRow: {
        flexDirection: 'row',
        marginBottom: 12,
        minHeight: 75,
    },
    timelineCol: {
        width: 40,
        alignItems: 'center',
        paddingTop: 18,
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 40,
        justifyContent: 'center',
        paddingLeft: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        zIndex: 2,
    },
    horizontalLine: {
        width: 20,
        height: 2,
        marginLeft: -1,
    },
    lineWrapper: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        marginTop: -2,
    },
    line: {
        width: 2,
        flex: 1,
    },
    arrowHead: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -4,
        marginBottom: 4,
    },
    cardWrapper: {
        flex: 1,
        position: 'relative',
    },
    swipeReveal: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        borderRadius: SIZES.radiusMd,
    },
    swipeRevealText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    completeLabel: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '800',
        marginTop: 2,
    },
    skipReveal: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.danger,
        borderRadius: SIZES.radiusMd,
    },
    skipRevealText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    skipLabel: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '800',
        marginTop: 2,
    },
    card: {
        borderRadius: SIZES.radiusLg,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusLg,
        minHeight: 75,
    },
    completedCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusLg,
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.lg,
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
        minHeight: 75,
    },
    cardInfoRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftAccentPill: {
        width: 4,
        height: 32,
        borderRadius: 2,
        marginRight: SIZES.sm,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    taskName: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
    },
    taskTime: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: SIZES.fontXs,
        marginTop: 2,
    },
    points: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '600',
    },
});

export default TaskCard;

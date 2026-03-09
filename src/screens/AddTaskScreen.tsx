import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Dimensions,
    Modal,
    ScrollView
} from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { getTodayKey, getTomorrowKey } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AddTaskScreenProps {
    onBack: () => void;
}

interface DraftTask {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    priority: number;
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ onBack }) => {
    const { setTasksForDate, tasks: existingTasks } = useApp();
    const [selection, setSelection] = useState<'today' | 'tomorrow'>(() => {
        const hour = new Date().getHours();
        return hour >= 20 ? 'tomorrow' : 'today';
    });

    const [draftTasks, setDraftTasks] = useState<DraftTask[]>(() => {
        // Load existing tasks if they match the initial selection
        if (existingTasks && existingTasks.length > 0) {
            return existingTasks.map(t => ({
                id: t.id,
                name: t.name,
                startTime: t.startTime,
                endTime: t.endTime,
                priority: t.priority
            }));
        }
        return [{ id: Date.now().toString(), name: '', startTime: '09:00 AM', endTime: '10:00 AM', priority: 5 }];
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Time Picker State
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTimeType, setEditingTimeType] = useState<'start' | 'end'>('start');

    const handleAddCard = () => {
        const newId = Date.now().toString();
        const lastTask = draftTasks[draftTasks.length - 1];
        setDraftTasks([...draftTasks, {
            id: newId,
            name: '',
            startTime: lastTask?.endTime || '09:00 AM',
            endTime: '10:00 AM',
            priority: 5
        }]);
        // Scroll to new card after a short delay to allow state update
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleRemoveCard = (id: string) => {
        if (draftTasks.length <= 1) return; // Keep at least one card
        setDraftTasks(prev => prev.filter(t => t.id !== id));
    };

    const updateDraft = (id: string, updates: Partial<DraftTask>) => {
        setDraftTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const calculatePoints = (drafts: DraftTask[]): Task[] => {
        const totalPriority = drafts.reduce((sum, t) => sum + t.priority, 0);
        if (totalPriority === 0) return [];

        let remainingPoints = 100;
        const result: Task[] = drafts.map((d, index) => {
            let pts = Math.round((d.priority / totalPriority) * 100);

            // Adjust last item to ensure sum is exactly 100
            if (index === drafts.length - 1) {
                pts = remainingPoints;
            } else {
                remainingPoints -= pts;
            }

            return {
                id: d.id,
                name: d.name,
                startTime: d.startTime,
                endTime: d.endTime,
                priority: d.priority,
                points: pts,
                completed: false
            };
        });

        return result;
    };

    const handleFinishPlanning = () => {
        // Validate
        const validDrafts = draftTasks.filter(t => t.name.trim().length > 0);
        if (validDrafts.length === 0) return;

        const calculatedTasks = calculatePoints(validDrafts);
        const dateKey = selection === 'today' ? getTodayKey() : getTomorrowKey();

        setTasksForDate(calculatedTasks, dateKey);
        onBack();
    };

    const openTimePicker = (taskId: string, type: 'start' | 'end') => {
        setEditingTaskId(taskId);
        setEditingTimeType(type);
        setTimePickerVisible(true);
    };

    const renderPrioritySelector = (id: string, current: number) => {
        return (
            <View style={styles.priorityContainer}>
                <Text style={styles.label}>PRIORITY (1-10)</Text>
                <View style={styles.priorityRow}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <Pressable
                            key={num}
                            style={[
                                styles.priorityBtn,
                                current === num && styles.priorityBtnActive
                            ]}
                            onPress={() => updateDraft(id, { priority: num })}
                        >
                            <Text style={[
                                styles.priorityBtnText,
                                current === num && styles.priorityBtnTextActive
                            ]}>{num}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    };

    const renderTaskCard = ({ item }: { item: DraftTask }) => {
        return (
            <View style={styles.cardContainer}>
                <View style={styles.card}>
                    {draftTasks.length > 1 && (
                        <Pressable
                            style={styles.removeCardBtn}
                            onPress={() => handleRemoveCard(item.id)}
                        >
                            <Text style={styles.removeCardIcon}>×</Text>
                        </Pressable>
                    )}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WHAT'S THE GOAL?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Deep Work"
                            placeholderTextColor={COLORS.textMuted}
                            value={item.name}
                            onChangeText={(text) => updateDraft(item.id, { name: text })}
                        />
                    </View>

                    <View style={styles.timeRow}>
                        <Pressable
                            style={[styles.timeInputGroup, { flex: 1 }]}
                            onPress={() => openTimePicker(item.id, 'start')}
                        >
                            <Text style={styles.label}>START TIME</Text>
                            <View style={styles.timeDisplay}>
                                <Text style={styles.timeText}>{item.startTime}</Text>
                            </View>
                        </Pressable>

                        <Pressable
                            style={[styles.timeInputGroup, { flex: 1 }]}
                            onPress={() => openTimePicker(item.id, 'end')}
                        >
                            <Text style={styles.label}>END TIME</Text>
                            <View style={styles.timeDisplay}>
                                <Text style={styles.timeText}>{item.endTime}</Text>
                            </View>
                        </Pressable>
                    </View>

                    {renderPrioritySelector(item.id, item.priority)}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>Cancel</Text>
                    </Pressable>

                    <View style={styles.toggleContainer}>
                        <Pressable
                            style={[styles.toggleBtn, selection === 'today' && styles.toggleBtnActive]}
                            onPress={() => setSelection('today')}
                        >
                            <Text style={[styles.toggleText, selection === 'today' && styles.toggleTextActive]}>Today</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.toggleBtn, selection === 'tomorrow' && styles.toggleBtnActive]}
                            onPress={() => setSelection('tomorrow')}
                        >
                            <Text style={[styles.toggleText, selection === 'tomorrow' && styles.toggleTextActive]}>Tomorrow</Text>
                        </Pressable>
                    </View>

                    <Pressable onPress={handleFinishPlanning} style={styles.doneButton}>
                        <Text style={styles.doneText}>Start</Text>
                    </Pressable>
                </View>

                {/* Point Regulator Bar */}
                <View style={styles.regulatorContainer}>
                    <View style={styles.regulatorLabelRow}>
                        <Text style={styles.regulatorLabel}>POINT DISTRIBUTION</Text>
                        <Text style={styles.regulatorValue}>100 Total</Text>
                    </View>
                    <View style={styles.regulatorBar}>
                        {calculatePoints(draftTasks).map((task, idx) => (
                            <View
                                key={task.id}
                                style={[
                                    styles.regulatorSegment,
                                    {
                                        width: `${task.points}%`,
                                        backgroundColor: idx % 2 === 0 ? COLORS.accent : 'rgba(59, 130, 246, 0.5)',
                                        borderLeftWidth: idx === 0 ? 0 : 1,
                                    }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={draftTasks}
                    renderItem={renderTaskCard}
                    keyExtractor={item => item.id}
                    horizontal
                    pagingEnabled={false} // Disable paging for custom snap
                    snapToInterval={SCREEN_WIDTH * 0.85 + SIZES.md} // Match card width + gap
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => {
                        const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH * 0.85 + SIZES.md));
                        setActiveIndex(index);
                    }}
                    style={styles.carousel}
                    contentContainerStyle={styles.carouselContent}
                />

                <View style={styles.footer}>
                    <View style={styles.pagination}>
                        {draftTasks.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, activeIndex === i && styles.dotActive]}
                            />
                        ))}
                    </View>

                    <Pressable style={styles.plusButton} onPress={handleAddCard}>
                        <Text style={styles.plusIcon}>+</Text>
                    </Pressable>
                </View>

                {/* Custom Time Picker Modal */}
                <Modal visible={timePickerVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Set {editingTimeType === 'start' ? 'Start' : 'End'} Time</Text>
                                <Pressable onPress={() => setTimePickerVisible(false)}>
                                    <Text style={styles.modalCloseText}>Done</Text>
                                </Pressable>
                            </View>

                            <View style={styles.pickerRow}>
                                {/* Hours */}
                                <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerColumn}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                        <Pressable
                                            key={h}
                                            onPress={() => {
                                                if (!editingTaskId) return;
                                                const task = draftTasks.find(t => t.id === editingTaskId);
                                                if (!task) return;
                                                const currentTime = editingTimeType === 'start' ? task.startTime : task.endTime;
                                                const [_, rest] = currentTime.split(':');
                                                const hStr = h.toString().padStart(2, '0');
                                                const newTime = `${hStr}:${rest}`;
                                                updateDraft(editingTaskId, editingTimeType === 'start' ? { startTime: newTime } : { endTime: newTime });
                                            }}
                                            style={styles.pickerItem}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                editingTaskId && (editingTimeType === 'start' ? draftTasks.find(t => t.id === editingTaskId)?.startTime : draftTasks.find(t => t.id === editingTaskId)?.endTime)?.startsWith(h.toString().padStart(2, '0')) && styles.pickerItemTextActive
                                            ]}>{h.toString().padStart(2, '0')}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>

                                <Text style={styles.pickerSeparator}>:</Text>

                                {/* Minutes */}
                                <ScrollView showsVerticalScrollIndicator={false} style={styles.pickerColumn}>
                                    {['00', '15', '30', '45'].map(m => (
                                        <Pressable
                                            key={m}
                                            onPress={() => {
                                                if (!editingTaskId) return;
                                                const task = draftTasks.find(t => t.id === editingTaskId);
                                                if (!task) return;
                                                const currentTime = editingTimeType === 'start' ? task.startTime : task.endTime;
                                                const [h, rest] = currentTime.split(':');
                                                const [_, period] = rest.split(' ');
                                                const newTime = `${h}:${m} ${period}`;
                                                updateDraft(editingTaskId, editingTimeType === 'start' ? { startTime: newTime } : { endTime: newTime });
                                            }}
                                            style={styles.pickerItem}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                editingTaskId && (editingTimeType === 'start' ? draftTasks.find(t => t.id === editingTaskId)?.startTime : draftTasks.find(t => t.id === editingTaskId)?.endTime)?.includes(`:${m}`) && styles.pickerItemTextActive
                                            ]}>{m}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>

                                {/* Period */}
                                <View style={styles.pickerColumn}>
                                    {['AM', 'PM'].map(p => (
                                        <Pressable
                                            key={p}
                                            onPress={() => {
                                                if (!editingTaskId) return;
                                                const task = draftTasks.find(t => t.id === editingTaskId);
                                                if (!task) return;
                                                const currentTime = editingTimeType === 'start' ? task.startTime : task.endTime;
                                                const [timePart, _] = currentTime.split(' ');
                                                const newTime = `${timePart} ${p}`;
                                                updateDraft(editingTaskId, editingTimeType === 'start' ? { startTime: newTime } : { endTime: newTime });
                                            }}
                                            style={styles.pickerItem}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                editingTaskId && (editingTimeType === 'start' ? draftTasks.find(t => t.id === editingTaskId)?.startTime : draftTasks.find(t => t.id === editingTaskId)?.endTime)?.endsWith(p) && styles.pickerItemTextActive
                                            ]}>{p}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xl, // Increased top padding
        paddingBottom: SIZES.md,
    },
    backButton: {
        padding: SIZES.sm,
    },
    backText: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontMd,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontLg,
        fontWeight: '700',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 2,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 18,
    },
    toggleBtnActive: {
        backgroundColor: COLORS.accent,
    },
    toggleText: {
        color: COLORS.textMuted,
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toggleTextActive: {
        color: '#fff',
    },
    doneButton: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusMd,
    },
    doneText: {
        color: '#fff',
        fontWeight: '700',
    },
    carousel: {
        flex: 1,
    },
    carouselContent: {
        alignItems: 'center',
        paddingHorizontal: SIZES.lg, // Give some starting cushion
    },
    cardContainer: {
        width: SCREEN_WIDTH * 0.85,
        marginRight: SIZES.md,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusXl,
        padding: SIZES.xl,
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
        gap: SIZES.xl,
        position: 'relative',
    },
    removeCardBtn: {
        position: 'absolute',
        top: SIZES.md,
        right: SIZES.md,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    removeCardIcon: {
        color: COLORS.textMuted,
        fontSize: 18,
        fontWeight: '300',
        marginTop: -2,
    },
    inputGroup: {
        gap: SIZES.sm,
    },
    label: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontXs,
        fontWeight: '600',
        letterSpacing: 1.5,
    },
    input: {
        color: COLORS.textPrimary,
        fontSize: SIZES.font2xl,
        fontWeight: '600',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        paddingVertical: SIZES.sm,
    },
    timeRow: {
        flexDirection: 'row',
        gap: SIZES.md,
    },
    timeInputGroup: {
        gap: SIZES.sm,
    },
    timeDisplay: {
        paddingVertical: SIZES.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    timeText: {
        color: COLORS.accent,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
    },
    priorityContainer: {
        gap: SIZES.md,
    },
    priorityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
    },
    priorityBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    priorityBtnActive: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    priorityBtnText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    priorityBtnTextActive: {
        color: '#fff',
    },
    footer: {
        paddingBottom: SIZES.xxl,
        alignItems: 'center',
        gap: SIZES.xl,
    },
    pagination: {
        flexDirection: 'row',
        gap: SIZES.sm,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dotActive: {
        backgroundColor: COLORS.accent,
        width: 20,
    },
    plusButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plusIcon: {
        color: COLORS.textPrimary,
        fontSize: 32,
        fontWeight: '300',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1E1E2E',
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
        padding: SIZES.xl,
        maxHeight: '60%',
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        marginBottom: SIZES.lg,
        textAlign: 'center',
    },
    timePickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SIZES.md,
    },
    timeItem: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: SIZES.radiusMd,
        minWidth: 80,
        alignItems: 'center',
    },
    timeItemText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
    },
    closeBtn: {
        marginTop: SIZES.xl,
        paddingVertical: SIZES.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
    },
    closeBtnText: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.lg,
    },
    modalCloseText: {
        color: COLORS.accent,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 250,
    },
    pickerColumn: {
        flex: 1,
    },
    pickerItem: {
        paddingVertical: SIZES.md,
        alignItems: 'center',
    },
    pickerItemText: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontXl,
        fontWeight: '500',
    },
    pickerItemTextActive: {
        color: COLORS.accent,
        fontSize: SIZES.font2xl,
        fontWeight: '700',
    },
    pickerSeparator: {
        color: COLORS.textMuted,
        fontSize: SIZES.font2xl,
        fontWeight: '300',
        paddingHorizontal: SIZES.sm,
    },
    regulatorContainer: {
        paddingHorizontal: SIZES.lg,
        marginBottom: SIZES.md,
    },
    regulatorLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    regulatorLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    regulatorValue: {
        color: COLORS.accent,
        fontSize: 10,
        fontWeight: '700',
    },
    regulatorBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 3,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    regulatorSegment: {
        height: '100%',
        borderColor: COLORS.bg,
    },
});

export default AddTaskScreen;

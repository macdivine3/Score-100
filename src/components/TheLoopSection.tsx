import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ScrollView, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { LoopItem } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRESETS = [
    { name: 'Hydration', icon: '💧', interval: 3, time: '08:00 AM' },
    { name: 'Movement', icon: '👟', interval: 4, time: '09:00 AM' },
    { name: 'Deep Work', icon: '🧘', interval: undefined, time: '09:00 AM' },
    { name: 'Reading', icon: '📖', interval: undefined, time: '08:00 PM' },
    { name: 'Journal', icon: '✍️', interval: undefined, time: '07:00 AM' },
];

const EMOJIS = ['💧', '👟', '🧘', '📖', '✍️', '🍎', '💪', '💊', '🔋', '🎯'];

interface TheLoopSectionProps {
    onAddTask: () => void;
    onStartDay: () => void;
    onCloseDay: () => void;
    dayStatus: 'planning' | 'active' | 'completed';
    totalPlanned: number;
}

const TheLoopSection: React.FC<TheLoopSectionProps> = ({
    onAddTask,
    onStartDay,
    onCloseDay,
    dayStatus,
    totalPlanned
}) => {
    const { loopItems, loopChecks, toggleLoopCheck, updateLoopItems, resetDay } = useApp();
    const [expanded, setExpanded] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<LoopItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editInterval, setEditInterval] = useState('');
    const [editIcon, setEditIcon] = useState('✨');

    const handleToggle = (itemId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleLoopCheck(itemId);
    };

    const handleEditItem = (item: LoopItem) => {
        setEditingItem(item);
        setEditName(item.name);
        setEditTime(item.time);
        setEditInterval(item.intervalHours?.toString() || '');
        setEditIcon(item.icon || '✨');
        setEditModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (!editName.trim()) return;
        const interval = parseInt(editInterval);

        let updated: LoopItem[];
        if (editingItem) {
            // Update existing
            updated = loopItems.map(item =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        name: editName.trim(),
                        time: editTime.trim(),
                        intervalHours: isNaN(interval) ? undefined : interval,
                        icon: editIcon
                    }
                    : item
            );
        } else {
            // Add new
            const newItem: LoopItem = {
                id: Date.now().toString(),
                name: editName.trim(),
                time: editTime.trim(),
                intervalHours: isNaN(interval) ? undefined : interval,
                icon: editIcon
            };
            updated = [...loopItems, newItem];
        }

        updateLoopItems(updated);
        setEditModalVisible(false);
        setEditingItem(null);
    };

    const handleAddItem = () => {
        setEditingItem(null);
        setEditName('');
        setEditTime('08:00 AM');
        setEditInterval('');
        setEditIcon('✨');
        setEditModalVisible(true);
    };

    const handleDeleteItem = (itemId: string) => {
        const updated = loopItems.filter(item => item.id !== itemId);
        updateLoopItems(updated);
        setEditModalVisible(false);
    };

    const handleResetRhythms = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const defaults: LoopItem[] = [
            { id: '1', name: 'Hydration', time: '08:00 AM', icon: '💧', intervalHours: 3 },
            { id: '2', name: 'Movement', time: '09:00 AM', icon: '👟', intervalHours: 4 },
            { id: '3', name: 'Journal', time: '07:00 AM', icon: '✍️' },
        ];
        updateLoopItems(defaults);
    };

    const handleResetDay = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        resetDay();
        setExpanded(false);
    };

    return (
        <>
            {expanded && (
                <Pressable
                    style={styles.overlay}
                    onPress={() => setExpanded(false)}
                />
            )}
            <View style={[styles.container, expanded && styles.containerExpanded]}>
                <View style={styles.tray}>
                    <Pressable style={styles.handleWrapper} onPress={() => setExpanded(!expanded)}>
                        <View style={styles.pillHandle}>
                            <View style={styles.handleLine} />
                            <View style={styles.handleLine} />
                        </View>
                    </Pressable>

                    <View style={styles.headerRow}>
                        <Text style={styles.title}>THE LOOP</Text>
                        <View style={styles.subtitleRow}>
                            <Text style={styles.subtitle}>{dayStatus === 'planning' ? 'NON-NEGOTIABLES' : 'PENALTY: -5 PTS EACH'}</Text>
                        </View>
                    </View>

                    {expanded && (
                        <View style={styles.expandedContent}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                                style={styles.habitsScroll}
                            >
                                {loopItems.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        style={styles.itemCard}
                                        onPress={() => handleToggle(item.id)}
                                        onLongPress={() => handleEditItem(item)}
                                    >
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemIcon}>{item.icon || '✨'}</Text>
                                            <View style={[
                                                styles.checkbox,
                                                loopChecks[item.id] && styles.checkboxChecked,
                                            ]}>
                                                {loopChecks[item.id] && <Text style={styles.checkmark}>✓</Text>}
                                            </View>
                                        </View>
                                        {!loopChecks[item.id] && dayStatus !== 'planning' && (
                                            <View style={styles.penaltyBadge}>
                                                <Text style={styles.penaltyBadgeText}>-5</Text>
                                            </View>
                                        )}
                                        <Text style={styles.itemTime}>
                                            {item.intervalHours ? `Every ${item.intervalHours}h` : item.time}
                                        </Text>
                                    </Pressable>
                                ))}

                                <Pressable style={styles.addHabitCard} onPress={handleAddItem}>
                                    <View style={styles.addHabitIcon}>
                                        <Text style={styles.addHabitIconText}>+</Text>
                                    </View>
                                    <Text style={styles.addHabitLabel}>Add Habit</Text>
                                </Pressable>
                            </ScrollView>

                            {(dayStatus === 'active' || dayStatus === 'completed') && (
                                <View style={styles.expandedBottomActions}>
                                    <Pressable style={styles.secondaryCloseBtn} onPress={onCloseDay}>
                                        <Text style={styles.secondaryCloseText}>
                                            {dayStatus === 'active' ? 'Close & Reflect' : 'Day Summary'}
                                        </Text>
                                    </Pressable>
                                    <Pressable style={styles.resetBtn} onPress={handleResetRhythms}>
                                        <Text style={styles.resetBtnText}>Reset Rhythms</Text>
                                    </Pressable>
                                    <View style={styles.resetSeparator} />
                                    <Pressable style={styles.resetBtn} onPress={handleResetDay}>
                                        <Text style={[styles.resetBtnText, { color: COLORS.danger }]}>Reset My Day</Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    )}

                    <View style={styles.bottomActions}>
                        {dayStatus === 'planning' ? (
                            <>
                                <Pressable style={styles.addTasksButton} onPress={onAddTask}>
                                    <Text style={styles.addTasksButtonText}>+ Add Tasks</Text>
                                </Pressable>
                                {totalPlanned > 0 && (
                                    <Pressable
                                        style={styles.startDayButton}
                                        onPress={onStartDay}
                                    >
                                        <Text style={styles.startDayText}>
                                            🚀 Start Day
                                        </Text>
                                    </Pressable>
                                )}
                            </>
                        ) : (
                            <Pressable style={styles.addTasksButton} onPress={onAddTask}>
                                <Text style={styles.addTasksButtonText}>+ Add Tasks</Text>
                            </Pressable>
                        )}
                    </View>
                </View>

                <Modal
                    visible={editModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Design Rhythm</Text>
                                <Pressable onPress={() => setEditModalVisible(false)}>
                                    <Text style={styles.modalCloseText}>Done</Text>
                                </Pressable>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Preset Grid */}
                                <Text style={styles.modalSublabel}>QUICK PRESETS</Text>
                                <View style={styles.presetGrid}>
                                    {PRESETS.map((p) => (
                                        <Pressable
                                            key={p.name}
                                            style={styles.presetItem}
                                            onPress={() => {
                                                setEditName(p.name);
                                                setEditIcon(p.icon);
                                                setEditInterval(p.interval?.toString() || '');
                                                setEditTime(p.time);
                                            }}
                                        >
                                            <Text style={styles.presetIcon}>{p.icon}</Text>
                                            <Text style={styles.presetLabel}>{p.name}</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                {/* Emoji Picker */}
                                <Text style={styles.modalSublabel}>IDENTITY</Text>
                                <View style={styles.emojiRow}>
                                    {EMOJIS.map(e => (
                                        <Pressable
                                            key={e}
                                            onPress={() => setEditIcon(e)}
                                            style={[styles.emojiBtn, editIcon === e && styles.emojiBtnActive]}
                                        >
                                            <Text style={styles.emojiBtnText}>{e}</Text>
                                        </Pressable>
                                    ))}
                                </View>

                                {/* Inputs */}
                                <Text style={styles.modalSublabel}>DETAILS</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editName}
                                    onChangeText={setEditName}
                                    placeholder="Habit name"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                                <View style={styles.modalInputRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputMiniLabel}>START TIME</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            value={editTime}
                                            onChangeText={setEditTime}
                                            placeholder="06:00 AM"
                                            placeholderTextColor={COLORS.textMuted}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputMiniLabel}>INTERVAL (HRS)</Text>
                                        <TextInput
                                            style={styles.modalInput}
                                            value={editInterval}
                                            onChangeText={setEditInterval}
                                            placeholder="e.g. 3"
                                            placeholderTextColor={COLORS.textMuted}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                {editInterval && parseInt(editInterval) > 0 && (
                                    <View style={styles.intervalSummary}>
                                        <Text style={styles.summaryText}>
                                            🚀 This rhythm will nudge you {Math.floor(16 / parseInt(editInterval))} times today.
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.modalButtons}>
                                    <Pressable style={styles.deleteBtn} onPress={() => editingItem && handleDeleteItem(editingItem.id)}>
                                        <Text style={styles.deleteBtnText}>Delete Habit</Text>
                                    </Pressable>
                                    <Pressable style={styles.saveBtn} onPress={handleSaveEdit}>
                                        <Text style={styles.saveBtnText}>Save Rhythm</Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 999,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    containerExpanded: {
        // No specific shift needed if handle is fixed
    },
    tray: {
        backgroundColor: '#1E1E2E',
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingBottom: SIZES.xs,
    },
    handleWrapper: {
        alignItems: 'center',
        marginTop: -15,
        marginBottom: SIZES.sm,
    },
    pillHandle: {
        width: 60,
        height: 30,
        backgroundColor: 'rgba(45, 45, 65, 1)',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    handleLine: {
        width: 18,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.xs,
        paddingBottom: SIZES.sm,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subtitleRow: {
        marginLeft: 'auto',
        alignItems: 'flex-end',
    },
    subtitle: {
        color: COLORS.textMuted,
        fontSize: 9,
        letterSpacing: 1,
        fontWeight: '600',
    },
    expandedContent: {
        marginTop: SIZES.xs,
    },
    habitsScroll: {
        width: '100%',
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
        gap: SIZES.sm,
        paddingBottom: SIZES.md,
    },
    itemCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.sm,
        alignItems: 'center',
        width: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        position: 'relative',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: SIZES.xs,
    },
    itemIcon: {
        fontSize: 16,
    },
    penaltyBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(255,0,0,0.1)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,0,0,0.2)',
    },
    penaltyBadgeText: {
        color: COLORS.danger,
        fontSize: 8,
        fontWeight: '800',
    },
    addHabitCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.sm,
        alignItems: 'center',
        width: 100,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    addHabitIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    addHabitIconText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '700',
    },
    addHabitLabel: {
        color: COLORS.textMuted,
        fontSize: 9,
        fontWeight: '600',
    },
    checkbox: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.accent,
    },
    checkmark: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
    },
    itemTime: {
        color: COLORS.textMuted,
        fontSize: 9,
        marginTop: 1,
    },
    bottomActions: {
        paddingHorizontal: SIZES.lg,
        marginTop: SIZES.xs,
    },
    addTasksButton: {
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
    addTasksButtonText: {
        color: '#FFFFFF',
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeDayButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusLg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeDayText: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
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
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xl,
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    modalCloseText: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '700',
    },
    modalSublabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: SIZES.md,
        marginTop: SIZES.sm,
    },
    presetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
        marginBottom: SIZES.xl,
    },
    presetItem: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
        borderRadius: SIZES.radiusMd,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        flexDirection: 'row',
        gap: 8,
    },
    presetIcon: {
        fontSize: 14,
    },
    presetLabel: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    emojiRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SIZES.sm,
        marginBottom: SIZES.xl,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    emojiBtnActive: {
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    emojiBtnText: {
        fontSize: 20,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        color: COLORS.textPrimary,
        fontSize: SIZES.fontMd,
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalInputRow: {
        flexDirection: 'row',
        gap: SIZES.md,
        marginBottom: SIZES.lg,
    },
    inputMiniLabel: {
        color: COLORS.textMuted,
        fontSize: 8,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 1,
    },
    intervalSummary: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: SIZES.md,
        borderRadius: SIZES.radiusMd,
        marginBottom: SIZES.xl,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    summaryText: {
        color: COLORS.accent,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SIZES.lg,
        gap: SIZES.md,
    },
    saveBtn: {
        backgroundColor: COLORS.accent,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusLg,
        alignItems: 'center',
        flex: 2,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
    deleteBtn: {
        paddingVertical: SIZES.md,
        alignItems: 'center',
        flex: 1,
    },
    deleteBtnText: {
        color: COLORS.danger,
        fontWeight: '600',
    },
    startDayButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusLg,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.sm,
    },
    startDayText: {
        color: '#FFFFFF',
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    startDayTextDisabled: {
        color: COLORS.textMuted,
    },
    expandedBottomActions: {
        paddingHorizontal: SIZES.lg,
        paddingBottom: SIZES.md,
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    secondaryCloseBtn: {
        width: '100%',
        paddingVertical: SIZES.md,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
    },
    secondaryCloseText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    resetBtn: {
        marginTop: SIZES.sm,
        padding: SIZES.sm,
    },
    resetBtnText: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    resetSeparator: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: SIZES.sm,
    },
});

export default TheLoopSection;

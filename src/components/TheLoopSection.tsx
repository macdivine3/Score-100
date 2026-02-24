import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, ScrollView, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { LoopItem } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const { loopItems, loopChecks, toggleLoopCheck, updateLoopItems } = useApp();
    const [expanded, setExpanded] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<LoopItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editTime, setEditTime] = useState('');

    const handleToggle = (itemId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleLoopCheck(itemId);
    };

    const handleEditItem = (item: LoopItem) => {
        setEditingItem(item);
        setEditName(item.name);
        setEditTime(item.time);
        setEditModalVisible(true);
    };

    const handleSaveEdit = () => {
        if (!editingItem || !editName.trim()) return;
        const updated = loopItems.map(item =>
            item.id === editingItem.id
                ? { ...item, name: editName.trim(), time: editTime.trim() }
                : item
        );
        updateLoopItems(updated);
        setEditModalVisible(false);
    };

    const handleAddItem = () => {
        const newItem: LoopItem = {
            id: Date.now().toString(),
            name: 'New Habit',
            time: '08:00 AM',
        };
        updateLoopItems([...loopItems, newItem]);
    };

    const handleDeleteItem = (itemId: string) => {
        const updated = loopItems.filter(item => item.id !== itemId);
        updateLoopItems(updated);
        setEditModalVisible(false);
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
                        <Text style={styles.subtitle}>NON-NEGOTIABLES</Text>
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
                                        <View style={[
                                            styles.checkbox,
                                            loopChecks[item.id] && styles.checkboxChecked,
                                        ]}>
                                            {loopChecks[item.id] && <Text style={styles.checkmark}>✓</Text>}
                                        </View>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.itemName,
                                                loopChecks[item.id] && styles.itemNameChecked,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                        <Text style={styles.itemTime}>{item.time}</Text>
                                    </Pressable>
                                ))}

                                <Pressable style={styles.addHabitCard} onPress={handleAddItem}>
                                    <View style={styles.addHabitIcon}>
                                        <Text style={styles.addHabitIconText}>+</Text>
                                    </View>
                                    <Text style={styles.addHabitLabel}>Add Habit</Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.bottomActions}>
                        {dayStatus === 'planning' ? (
                            <Pressable style={styles.addTasksButton} onPress={onAddTask}>
                                <Text style={styles.addTasksButtonText}>+ Add Tasks</Text>
                            </Pressable>
                        ) : (dayStatus === 'active' || dayStatus === 'completed') ? (
                            <Pressable style={styles.closeDayButton} onPress={onCloseDay}>
                                <Text style={styles.closeDayText}>
                                    {dayStatus === 'active' ? 'Close & Reflect' : 'Day Summary'}
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>

                <Modal
                    visible={editModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit Habit</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Habit name"
                                placeholderTextColor={COLORS.textMuted}
                            />
                            <TextInput
                                style={styles.modalInput}
                                value={editTime}
                                onChangeText={setEditTime}
                                placeholder="Time (e.g. 06:00 AM)"
                                placeholderTextColor={COLORS.textMuted}
                            />
                            <View style={styles.modalButtons}>
                                <Pressable style={styles.deleteBtn} onPress={() => editingItem && handleDeleteItem(editingItem.id)}>
                                    <Text style={styles.deleteBtnText}>Delete</Text>
                                </Pressable>
                                <View style={{ flexDirection: 'row', gap: SIZES.sm }}>
                                    <Pressable style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable style={styles.saveBtn} onPress={handleSaveEdit}>
                                        <Text style={styles.saveBtnText}>Save</Text>
                                    </Pressable>
                                </View>
                            </View>
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
        backgroundColor: '#1E1E2E', // Solid opaque dark color
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingBottom: SIZES.xs, // Reduced padding for anchored look
    },
    handleWrapper: {
        alignItems: 'center',
        marginTop: -15, // Lift the pill handle so it overlaps the border
        marginBottom: SIZES.sm,
    },
    pillHandle: {
        width: 60,
        height: 30,
        backgroundColor: 'rgba(45, 45, 65, 1)', // Dark solid pill as per image
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
    subtitle: {
        color: COLORS.textMuted,
        fontSize: 9,
        marginLeft: 'auto',
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
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.md,
        alignItems: 'center',
        width: 105,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    addHabitCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: SIZES.radiusMd,
        paddingVertical: SIZES.md,
        paddingHorizontal: SIZES.md,
        alignItems: 'center',
        width: 105,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    },
    addHabitIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.xs,
    },
    addHabitIconText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
    },
    addHabitLabel: {
        color: COLORS.textMuted,
        fontSize: 10,
        fontWeight: '600',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.xs,
    },
    checkboxChecked: {
        backgroundColor: COLORS.accent,
    },
    checkmark: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
    },
    itemName: {
        color: COLORS.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    itemNameChecked: {
        opacity: 0.5,
        textDecorationLine: 'line-through',
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: SIZES.lg,
    },
    modalContent: {
        backgroundColor: '#1E1E2E',
        borderRadius: SIZES.radiusLg,
        padding: SIZES.lg,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        marginBottom: SIZES.lg,
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
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SIZES.sm,
    },
    deleteBtn: {
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
    },
    deleteBtnText: {
        color: COLORS.danger,
        fontWeight: '600',
    },
    cancelBtn: {
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.md,
    },
    cancelBtnText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: COLORS.accent,
        paddingVertical: SIZES.sm,
        paddingHorizontal: SIZES.lg,
        borderRadius: SIZES.radiusMd,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export default TheLoopSection;

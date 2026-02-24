import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';

interface AddTaskScreenProps {
    onBack: () => void;
}

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ onBack }) => {
    const { addTask, totalPlanned } = useApp();
    const [name, setName] = useState('');
    const [points, setPoints] = useState('');
    const [time, setTime] = useState('');

    const handleAdd = () => {
        if (!name || !points || !time) return;

        const pts = parseInt(points);
        if (isNaN(pts) || pts <= 0) return;

        if (totalPlanned + pts > 100) {
            alert(`That would exceed 100 points! You only have ${100 - totalPlanned} points left.`);
            return;
        }

        addTask({
            name,
            points: pts,
            time,
        });
        onBack();
    };

    const pointsRemaining = 100 - totalPlanned;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backText}>← Back</Text>
                    </Pressable>
                    <Text style={styles.title}>New Target</Text>
                    <View style={styles.headerRight}>
                        <Text style={styles.ptsLeft}>{pointsRemaining} left</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WHAT'S THE GOAL?</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Deep Work, Client Meeting, etc."
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>POINTS (WEIGHT)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="20"
                                placeholderTextColor={COLORS.textMuted}
                                value={points}
                                onChangeText={setPoints}
                                keyboardType="number-pad"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>TIME</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="09:00 AM"
                                placeholderTextColor={COLORS.textMuted}
                                value={time}
                                onChangeText={setTime}
                            />
                        </View>
                    </View>

                    <Text style={styles.hint}>
                        Pro tip: High-intensity tasks should have more points to keep you focused.
                    </Text>
                </View>

                <Pressable
                    style={[styles.addButton, { opacity: (name && points && time) ? 1 : 0.5 }]}
                    onPress={handleAdd}
                    disabled={!name || !points || !time}
                >
                    <Text style={styles.addButtonText}>Add Target</Text>
                </Pressable>
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
        padding: SIZES.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.xxl,
    },
    backButton: {
        padding: SIZES.sm,
    },
    backText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.fontMd,
    },
    title: {
        color: COLORS.textPrimary,
        fontSize: SIZES.fontXl,
        fontWeight: '700',
    },
    headerRight: {
        padding: SIZES.sm,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: SIZES.radiusSm,
    },
    ptsLeft: {
        color: COLORS.accent,
        fontSize: SIZES.fontSm,
        fontWeight: '600',
    },
    form: {
        flex: 1,
        gap: SIZES.xl,
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
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        color: COLORS.textPrimary,
        fontSize: SIZES.fontLg,
        borderWidth: 1,
        borderColor: COLORS.bgCardBorder,
    },
    row: {
        flexDirection: 'row',
        gap: SIZES.md,
    },
    hint: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontSm,
        lineHeight: 20,
        marginTop: SIZES.md,
    },
    addButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: SIZES.lg,
        borderRadius: SIZES.radiusFull,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.md,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: SIZES.fontLg,
        fontWeight: '700',
    },
});

export default AddTaskScreen;

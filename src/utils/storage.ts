import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { Task, LoopItem, DayStatus } from '../types';

const KEYS = {
    TASKS: 'score100_tasks',
    LOOP: 'score100_loop',
    SCORES: 'score100_scores',
    JOURNAL: 'score100_journal',
    DAY_STATUS: 'score100_day_status',
    LAST_OPEN: 'score100_last_open',
};

// Get date key (e.g. "2026-02-23")
export const getDateKey = (date: Date = new Date()) => format(date, 'yyyy-MM-dd');
export const getTodayKey = () => getDateKey(new Date());
export const getTomorrowKey = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getDateKey(tomorrow);
};

// Tasks
export const saveTasks = async (tasks: Task[], dateKey: string = getTodayKey()) => {
    const key = `${KEYS.TASKS}_${dateKey}`;
    await AsyncStorage.setItem(key, JSON.stringify(tasks));
};

export const loadTasks = async (dateKey: string = getTodayKey()): Promise<Task[]> => {
    const key = `${KEYS.TASKS}_${dateKey}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
};

// Loop (Non-Negotiables)
export const saveLoop = async (loopItems: LoopItem[]) => {
    await AsyncStorage.setItem(KEYS.LOOP, JSON.stringify(loopItems));
};

export const loadLoop = async (): Promise<LoopItem[]> => {
    const data = await AsyncStorage.getItem(KEYS.LOOP);
    return data ? JSON.parse(data) : [
        { id: '1', name: 'Hydrate', time: '06:00 AM' },
        { id: '2', name: 'Meditate', time: '07:30 AM' },
        { id: '3', name: 'No Screen', time: '08:00 PM' },
    ];
};

// Save today's checked status for loop items
export const saveLoopChecks = async (checks: Record<string, boolean>, dateKey: string = getTodayKey()) => {
    const key = `${KEYS.LOOP}_checks_${dateKey}`;
    await AsyncStorage.setItem(key, JSON.stringify(checks));
};

export const loadLoopChecks = async (dateKey: string = getTodayKey()): Promise<Record<string, boolean>> => {
    const key = `${KEYS.LOOP}_checks_${dateKey}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : {};
};

// Scores history
export const saveScore = async (score: number) => {
    const scores = await loadScores();
    scores[getTodayKey()] = score;
    await AsyncStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
};

export const loadScores = async (): Promise<Record<string, number>> => {
    const data = await AsyncStorage.getItem(KEYS.SCORES);
    return data ? JSON.parse(data) : {};
};

export const getYesterdayScore = async (): Promise<number | null> => {
    const scores = await loadScores();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const key = format(yesterday, 'yyyy-MM-dd');
    return scores[key] || null;
};

// Journal entries
export const saveJournal = async (entry: string) => {
    const key = `${KEYS.JOURNAL}_${getTodayKey()}`;
    await AsyncStorage.setItem(key, entry);
};

export const loadJournal = async (): Promise<string> => {
    const key = `${KEYS.JOURNAL}_${getTodayKey()}`;
    const data = await AsyncStorage.getItem(key);
    return data || '';
};

// Day Status
export const saveDayStatus = async (status: DayStatus, dateKey: string = getTodayKey()) => {
    const key = `${KEYS.DAY_STATUS}_${dateKey}`;
    await AsyncStorage.setItem(key, status);
};

export const loadDayStatus = async (dateKey: string = getTodayKey()): Promise<DayStatus> => {
    const key = `${KEYS.DAY_STATUS}_${dateKey}`;
    const data = await AsyncStorage.getItem(key) as DayStatus | null;
    return data || 'planning';
};

// Last Open Date
export const saveLastOpenDate = async (date: string) => {
    await AsyncStorage.setItem(KEYS.LAST_OPEN, date);
};

export const loadLastOpenDate = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(KEYS.LAST_OPEN);
};

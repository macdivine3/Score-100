import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    saveTasks, loadTasks,
    saveLoop, loadLoop,
    saveLoopChecks, loadLoopChecks,
    saveScore, getYesterdayScore, loadScores,
    saveJournal, loadJournal,
    saveDayStatus, loadDayStatus,
    saveLastOpenDate, loadLastOpenDate,
    getTodayKey, getDateKey,
} from '../utils/storage';
import { Task, LoopItem, DayStatus, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [tasks, setTasksInternal] = useState<Task[]>([]);
    const [loopItems, setLoopItems] = useState<LoopItem[]>([]);
    const [loopChecks, setLoopChecks] = useState<Record<string, boolean>>({});
    const [yesterdayScore, setYesterdayScore] = useState<number | null>(null);
    const [scoreHistory, setScoreHistory] = useState<Record<string, number>>({});
    const [journalEntry, setJournalEntry] = useState('');
    const [dayStatus, setDayStatus] = useState<DayStatus>('planning');
    const [isLoading, setIsLoading] = useState(true);

    // Weekly average (last 7 days including today)
    const calculateWeeklyAverage = useCallback(() => {
        const scores = Object.values(scoreHistory);
        if (scores.length === 0) return 0;
        const last7 = scores.slice(-7);
        const sum = last7.reduce((a, b) => a + b, 0);
        return Math.round(sum / last7.length);
    }, [scoreHistory]);

    // Streak count (consecutive days with a score recorded)
    const calculateStreak = useCallback(() => {
        const keys = Object.keys(scoreHistory).sort();
        if (keys.length === 0) return 0;

        let streak = 0;
        let checkDate = new Date();

        // If today doesn't have a score yet, start check from yesterday
        const todayKey = getTodayKey();
        if (!scoreHistory[todayKey]) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            const key = getDateKey(checkDate);
            if (scoreHistory[key] !== undefined) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    }, [scoreHistory]);

    const weeklyAverage = calculateWeeklyAverage();
    const streakCount = calculateStreak();

    // Calculate raw task score
    const rawTaskScore = tasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + t.points, 0);

    // Loop "Score Tax": 5% penalty per unchecked Loop item
    const uncheckedLoopCount = loopItems.filter(item => !loopChecks[item.id]).length;
    const loopPenalty = uncheckedLoopCount * 5; // 5% per missed habit
    const currentScore = Math.max(0, rawTaskScore - loopPenalty);

    // Calculate total planned points
    const totalPlanned = tasks.reduce((sum, t) => sum + t.points, 0);

    // Load everything on mount
    useEffect(() => {
        const init = async () => {
            try {
                const today = getTodayKey();
                const lastOpen = await loadLastOpenDate();

                // If it's a new day, we might need a reset (though keys mostly handle it)
                // This ensures that any data not keyed by date is also considered.
                if (lastOpen && lastOpen !== today) {
                    // It's a new day! 🌅
                    // The keyed storage (tasks, loopChecks, dayStatus) will already return defaults.
                    // We can also trigger specific 'new day' logic here if needed.
                    console.log('Welcome to a new day! Score 100 reset.');
                }

                const [loadedTasks, loadedLoop, loadedChecks, loadedYesterday, loadedScores, loadedJournal, loadedStatus] = await Promise.all([
                    loadTasks(),
                    loadLoop(),
                    loadLoopChecks(),
                    getYesterdayScore(),
                    loadScores(),
                    loadJournal(),
                    loadDayStatus(),
                ]);

                setTasksInternal(loadedTasks);
                setLoopItems(loadedLoop);
                setLoopChecks(loadedChecks);
                setYesterdayScore(loadedYesterday);
                setScoreHistory(loadedScores);
                setJournalEntry(loadedJournal);
                setDayStatus(loadedStatus);

                await saveLastOpenDate(today);
            } catch (e) {
                console.warn('Error loading data:', e);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Add a new task
    const addTask = useCallback(async (task: Omit<Task, 'id' | 'completed'>) => {
        const updated: Task[] = [...tasks, { ...task, id: Date.now().toString(), completed: false }];
        setTasksInternal(updated);
        await saveTasks(updated);
    }, [tasks]);

    // Bulk set tasks
    const setTasks = useCallback(async (newTasks: Task[]) => {
        setTasksInternal(newTasks);
        await saveTasks(newTasks);
    }, []);

    // Set tasks for a specific date (Night-before planning)
    const setTasksForDate = useCallback(async (newTasks: Task[], dateKey: string) => {
        if (dateKey === getTodayKey()) {
            setTasksInternal(newTasks);
        }
        await saveTasks(newTasks, dateKey);
        // When setting tasks, the status should be set to 'active' for that day
        await saveDayStatus('active', dateKey);
    }, []);

    // Remove a task
    const removeTask = useCallback(async (taskId: string) => {
        const updated = tasks.filter(t => t.id !== taskId);
        setTasks(updated);
        await saveTasks(updated);
    }, [tasks]);

    // Complete a task
    const completeTask = useCallback(async (taskId: string) => {
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, completed: true } : t
        );
        setTasks(updated);
        await saveTasks(updated);
    }, [tasks]);

    // Skip a task
    const skipTask = useCallback(async (taskId: string) => {
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, completed: false, skipped: true } : t
        );
        setTasksInternal(updated);
        await saveTasks(updated);
    }, [tasks]);

    // Toggle loop item check
    const toggleLoopCheck = useCallback(async (itemId: string) => {
        const updated = { ...loopChecks, [itemId]: !loopChecks[itemId] };
        setLoopChecks(updated);
        await saveLoopChecks(updated);
    }, [loopChecks]);

    // Update loop items
    const updateLoopItems = useCallback(async (items: LoopItem[]) => {
        setLoopItems(items);
        await saveLoop(items);
    }, []);

    // Start the day
    const startDay = useCallback(async () => {
        setDayStatus('active');
        await saveDayStatus('active');
    }, []);

    // Close the day
    const closeDay = useCallback(async (journal: string) => {
        setJournalEntry(journal);
        setDayStatus('completed');
        await Promise.all([
            saveJournal(journal),
            saveScore(currentScore),
            saveDayStatus('completed'),
        ]);
    }, [currentScore]);

    return (
        <AppContext.Provider value={{
            tasks,
            loopItems,
            loopChecks,
            currentScore,
            totalPlanned,
            yesterdayScore,
            weeklyAverage,
            streakCount,
            journalEntry,
            dayStatus,
            isLoading,
            addTask,
            setTasks,
            setTasksForDate,
            removeTask,
            completeTask,
            skipTask,
            toggleLoopCheck,
            updateLoopItems,
            startDay,
            closeDay,
            setJournalEntry,
        }}>
            {children}
        </AppContext.Provider>
    );
};

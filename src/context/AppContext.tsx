import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    saveTasks, loadTasks,
    saveLoop, loadLoop,
    saveLoopChecks, loadLoopChecks,
    saveScore, getYesterdayScore,
    saveJournal, loadJournal,
    saveDayStatus, loadDayStatus,
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
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loopItems, setLoopItems] = useState<LoopItem[]>([]);
    const [loopChecks, setLoopChecks] = useState<Record<string, boolean>>({});
    const [yesterdayScore, setYesterdayScore] = useState<number | null>(null);
    const [journalEntry, setJournalEntry] = useState('');
    const [dayStatus, setDayStatus] = useState<DayStatus>('planning');
    const [isLoading, setIsLoading] = useState(true);

    // Calculate current score
    const currentScore = tasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + t.points, 0);

    // Calculate total planned points
    const totalPlanned = tasks.reduce((sum, t) => sum + t.points, 0);

    // Load everything on mount
    useEffect(() => {
        const init = async () => {
            try {
                const [loadedTasks, loadedLoop, loadedChecks, loadedYesterday, loadedJournal, loadedStatus] = await Promise.all([
                    loadTasks(),
                    loadLoop(),
                    loadLoopChecks(),
                    getYesterdayScore(),
                    loadJournal(),
                    loadDayStatus(),
                ]);
                setTasks(loadedTasks);
                setLoopItems(loadedLoop);
                setLoopChecks(loadedChecks);
                setYesterdayScore(loadedYesterday);
                setJournalEntry(loadedJournal);
                setDayStatus(loadedStatus);
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
        setTasks(updated);
        await saveTasks(updated);
    }, [tasks]);

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
        setTasks(updated);
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
            journalEntry,
            dayStatus,
            isLoading,
            addTask,
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

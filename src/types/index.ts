export interface Task {
    id: string;
    name: string;
    points: number;
    priority: number; // 1-10
    startTime: string;
    endTime: string;
    completed: boolean;
    skipped?: boolean;
}

export interface LoopItem {
    id: string;
    name: string;
    time: string;
    intervalHours?: number;
    icon?: string;
}

export type DayStatus = 'planning' | 'active' | 'completed';

export interface AppContextType {
    tasks: Task[];
    loopItems: LoopItem[];
    loopChecks: Record<string, boolean>;
    currentScore: number;
    totalPlanned: number;
    yesterdayScore: number | null;
    weeklyAverage: number;
    streakCount: number;
    journalEntry: string;
    dayStatus: DayStatus;
    isLoading: boolean;
    hasTomorrowTasks: boolean;
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    setTasks: (tasks: Task[]) => Promise<void>;
    setTasksForDate: (tasks: Task[], dateKey: string) => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;
    skipTask: (taskId: string) => Promise<void>;
    toggleLoopCheck: (itemId: string) => Promise<void>;
    updateLoopItems: (items: LoopItem[]) => Promise<void>;
    startDay: () => Promise<void>;
    closeDay: (journal: string) => Promise<void>;
    resetDay: () => Promise<void>;
    setJournalEntry: (entry: string) => void;
}

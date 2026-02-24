export interface Task {
    id: string;
    name: string;
    points: number;
    time: string;
    completed: boolean;
    skipped?: boolean;
}

export interface LoopItem {
    id: string;
    name: string;
    time: string;
}

export type DayStatus = 'planning' | 'active' | 'completed';

export interface AppContextType {
    tasks: Task[];
    loopItems: LoopItem[];
    loopChecks: Record<string, boolean>;
    currentScore: number;
    totalPlanned: number;
    yesterdayScore: number | null;
    journalEntry: string;
    dayStatus: DayStatus;
    isLoading: boolean;
    addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;
    skipTask: (taskId: string) => Promise<void>;
    toggleLoopCheck: (itemId: string) => Promise<void>;
    updateLoopItems: (items: LoopItem[]) => Promise<void>;
    startDay: () => Promise<void>;
    closeDay: (journal: string) => Promise<void>;
    setJournalEntry: (entry: string) => void;
}

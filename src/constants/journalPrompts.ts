// Daily Reflection Prompts - Rotated each day
const JOURNAL_PROMPTS = [
    "What was your biggest win today?",
    "What's one thing you'd do differently tomorrow?",
    "What made you feel most accomplished today?",
    "What was the hardest task today and why?",
    "What are you most grateful for today?",
    "What drained your energy today? How can you avoid it?",
    "What's one habit that helped you succeed today?",
    "If you could relive today, what would you change?",
    "What did you learn about yourself today?",
    "What task surprised you — was easier or harder than expected?",
    "Who or what inspired you today?",
    "What distraction cost you the most today?",
    "What's one small thing you did today that you're proud of?",
    "How did your energy levels change throughout the day?",
    "What's one thing you want to carry into tomorrow?",
];

export const getTodaysPrompt = () => {
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return JOURNAL_PROMPTS[dayOfYear % JOURNAL_PROMPTS.length];
};

export default JOURNAL_PROMPTS;

import { useEffect } from 'react';

const Timer = ({ initialTime, onTimeUp, isRunning }) => {
    // initialTime is in minutes. We handle seconds internally or by parent?
    // Let's assume parent manages state or we manage local state.
    // Better: Parent passes *seconds remaining* or *end timestamp*.
    // Simplest: Parent passes secondsRemaining. 

    // Actually, to avoid re-renders on every second in parent, let's keep timer state here.
    // BUT we need auto-save.

    // Let's expect `timeLeft` (seconds) from parent to sync.
    // OR: We just take duration (minutes) and fire onTimeUp. Parent syncs specific checks.

    return (
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-mono text-xl">
            {/* This is a placeholder as the parent ExamPortal will likely manage the exact countdown for sync */}
            {/* We will just display formatting. */}
            <span>Time Left: </span>
            <span>{Math.floor(initialTime / 60).toString().padStart(2, '0')}:{(initialTime % 60).toString().padStart(2, '0')}</span>
        </div>
    );
};
export default Timer;

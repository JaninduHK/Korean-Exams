import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function ExamTimer({
  initialTime,
  onTimeUp,
  onTick,
  isPaused = false,
  compact = false
}) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const intervalRef = useRef(null);

  const isWarning = timeRemaining <= 300; // 5 minutes warning
  const isCritical = timeRemaining <= 60; // 1 minute critical

  useEffect(() => {
    if (isPaused) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (onTick) {
          onTick(newTime);
        }

        if (newTime <= 0) {
          clearInterval(intervalRef.current);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isPaused, onTimeUp, onTick]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`
        flex items-center font-mono font-semibold transition-all duration-300 rounded-lg
        ${compact ? 'gap-1 px-2 py-1 text-sm' : 'gap-2 px-4 py-2 text-lg'}
        ${isCritical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isWarning
            ? 'bg-yellow-100 text-yellow-700 timer-warning'
            : 'bg-gray-100 text-gray-700'
        }
      `}
    >
      {isWarning ? (
        <AlertTriangle className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
      ) : (
        <Clock className={compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
      )}
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
}

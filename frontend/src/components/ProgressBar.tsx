import React from 'react';
import { cn } from '../utils/cn';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, label, className }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <div className="flex justify-between text-body text-muted">
          <span>{label}</span>
          <span>{current} / {max} XP</span>
        </div>
      )}
      <div 
        style={{ 
          height: '12px', 
          backgroundColor: 'var(--surface-color)', 
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)'
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, var(--secondary-color) 0%, var(--primary-color) 100%)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 10px var(--primary-transparent)'
          }}
        />
      </div>
    </div>
  );
};

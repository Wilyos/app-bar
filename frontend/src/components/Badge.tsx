import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps {
  name: string;
  icon: React.ReactNode;
  locked?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ name, icon, locked = false, className }) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4",
        "card",
        locked && "opacity-50 grayscale",
        className
      )}
      style={{
        border: locked ? '1px dashed var(--border-color)' : '1px solid var(--primary-color)',
        background: locked ? 'var(--surface-color)' : 'var(--primary-transparent)',
      }}
    >
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-full mb-2",
        !locked && "animate-pulse"
      )}
      style={{
        background: locked ? 'var(--bg-color)' : 'linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%)',
        boxShadow: locked ? 'none' : '0 0 15px var(--primary-transparent)'
      }}>
        {icon}
      </div>
      <span className="text-body font-semibold text-center" style={{ color: locked ? 'var(--text-muted)' : 'var(--primary-color)' }}>
        {name}
      </span>
    </div>
  );
};

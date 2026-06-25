import React from 'react';
import { cn } from '../utils/cn';

interface BadgeProps {
  name: string;
  icon: React.ReactNode;
  locked?: boolean;
  className?: string;
  colorTheme?: 'primary' | 'secondary' | 'accent';
}

export const Badge: React.FC<BadgeProps> = ({ name, icon, locked = false, className, colorTheme = 'primary' }) => {
  const getColors = () => {
    switch(colorTheme) {
      case 'secondary': return { main: 'var(--secondary-color)', glow: 'rgba(102, 35, 131, 0.2)' };
      case 'accent': return { main: 'var(--accent-color)', glow: 'rgba(148, 193, 31, 0.2)' };
      case 'primary':
      default: return { main: 'var(--primary-color)', glow: 'var(--primary-transparent)' };
    }
  };

  const theme = getColors();

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4",
        "card",
        locked && "opacity-50 grayscale",
        className
      )}
      style={{
        border: locked ? '1px dashed var(--border-color)' : `1px solid ${theme.main}`,
        background: locked ? 'var(--surface-color)' : theme.glow,
      }}
    >
      <div className={cn(
        "flex items-center justify-center w-16 h-16 rounded-full mb-2",
        !locked && "animate-pulse"
      )}
      style={{
        background: locked ? 'var(--bg-color)' : `linear-gradient(135deg, ${theme.main} 0%, rgba(255,255,255,0.2) 100%)`,
        boxShadow: locked ? 'none' : `0 0 15px ${theme.glow}`
      }}>
        {icon}
      </div>
      <span className="text-body font-semibold text-center" style={{ color: locked ? 'var(--text-muted)' : theme.main }}>
        {name}
      </span>
    </div>
  );
};

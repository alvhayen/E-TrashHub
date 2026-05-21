import React from 'react';
import { motion } from 'motion/react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: React.Key;
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  hoverable?: boolean;
}

export default function Card({ variant = 'default', padding = 'md', className = '', onClick, children, style = {} }: CardProps) {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '0';
      case 'sm': return '1rem';
      case 'md': return '1.5rem';
      case 'lg': return '2rem';
      default: return '1.5rem';
    }
  };

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: 'var(--radius-lg)',
      padding: getPadding(),
      backgroundColor: variant === 'ghost' ? 'transparent' : 'var(--color-bg-secondary)',
      boxShadow: variant === 'elevated' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 
                 variant === 'default' ? 'var(--shadow-card)' : 'none',
      border: variant === 'bordered' ? '1px solid var(--color-border)' : 
              variant === 'default' ? '1px solid rgba(0,0,0,0.05)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
    };
    return { ...base, ...style };
  };

  if (onClick) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        whileTap={{ y: 0, scale: 0.98 }}
        onClick={onClick}
        className={className}
        style={getStyles()}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={className} style={getStyles()}>
      {children}
    </div>
  );
}

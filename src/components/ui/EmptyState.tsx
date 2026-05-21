import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--color-border)'
      }}
    >
      <div style={{
        width: '4rem',
        height: '4rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-secondary)',
        marginBottom: '1.5rem'
      }}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      
      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      
      {subtitle && (
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '24rem', marginBottom: action ? '1.5rem' : 0 }}>
          {subtitle}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </motion.div>
  );
}

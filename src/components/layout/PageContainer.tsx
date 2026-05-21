import React from 'react';
import { motion } from 'motion/react';

interface Action {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | 'full';
}

export default function PageContainer({ title, subtitle, actions, children, maxWidth = 'xl' }: PageContainerProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'md': return '768px';
      case 'lg': return '1024px';
      case 'xl': return '1280px';
      case 'full': return '100%';
      default: return '1280px';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '2rem',
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        width: '100%'
      }}
    >
      {(title || subtitle || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            {title && <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h1>}
            {subtitle && <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>{subtitle}</p>}
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div>
        {children}
      </div>
    </motion.div>
  );
}

import React from 'react';

type BadgeVariant = 'pending' | 'on_the_way' | 'collected' | 'verified' | 'completed' | 'ready' | 'processing' | 'sold_out';

interface BadgeProps {
  status: string;
  pulse?: boolean;
}

export default function Badge({ status, pulse = false }: BadgeProps) {
  const normalizedStatus = status.toLowerCase() as BadgeVariant;
  
  let bgColor = '';
  let textColor = '';
  let dotColor = '';
  let label = status.replace(/_/g, ' ').toUpperCase();

  switch (normalizedStatus) {
    case 'pending':
      bgColor = '#fef3c7';
      textColor = '#d97706';
      dotColor = '#f59e0b';
      break;
    case 'on_the_way':
      bgColor = '#e0f2fe';
      textColor = '#0369a1';
      dotColor = '#0ea5e9';
      break;
    case 'collected':
      bgColor = '#ffedd5';
      textColor = '#ea580c';
      dotColor = '#f97316';
      break;
    case 'verified':
      bgColor = '#f3e8ff';
      textColor = '#7e22ce';
      dotColor = '#a855f7';
      break;
    case 'completed':
    case 'ready':
      bgColor = '#d1fae5';
      textColor = '#047857';
      dotColor = '#10b981';
      break;
    case 'processing':
      bgColor = '#fef3c7';
      textColor = '#d97706';
      dotColor = '#f59e0b';
      break;
    case 'sold_out':
      bgColor = '#fee2e2';
      textColor = '#b91c1c';
      dotColor = '#ef4444';
      break;
    default:
      bgColor = '#f1f5f9';
      textColor = '#475569';
      dotColor = '#64748b';
  }

  const isPulsing = pulse || normalizedStatus === 'on_the_way';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.25rem 0.625rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.05em',
      backgroundColor: bgColor,
      color: textColor,
    }}>
      <span style={{ position: 'relative', display: 'flex', height: '6px', width: '6px' }}>
        {isPulsing && (
          <span style={{
            position: 'absolute',
            display: 'inline-flex',
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            backgroundColor: dotColor,
            opacity: 0.7,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></span>
        )}
        <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '6px', width: '6px', backgroundColor: dotColor }}></span>
      </span>
      {label}
    </span>
  );
}

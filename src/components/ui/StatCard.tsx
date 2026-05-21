import React, { useEffect, useState } from 'react';
import Card from './Card';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  delta?: string | number;
  deltaType?: 'up' | 'down' | 'neutral';
  icon?: React.ElementType;
  color?: string;
  prefix?: string;
  suffix?: string;
}

export default function StatCard({ label, value, delta, deltaType, icon: Icon, color = 'var(--color-primary)', prefix = '', suffix = '' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value === 'number') {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / 1000, 1);
        setDisplayValue(Math.floor(progress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };
      window.requestAnimationFrame(step);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const getDeltaColor = () => {
    if (deltaType === 'up') return '#10b981';
    if (deltaType === 'down') return '#ef4444';
    return 'var(--color-text-secondary)';
  };

  return (
    <Card variant="default" style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            {prefix && <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{prefix}</span>}
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
            </span>
            {suffix && <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{suffix}</span>}
          </div>
        </div>
        {Icon && (
          <div style={{ width: '3rem', height: '3rem', borderRadius: 'var(--radius-lg)', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {delta && (
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: getDeltaColor() }}>
          {deltaType === 'up' && <ArrowUpRight size={14} />}
          {deltaType === 'down' && <ArrowDownRight size={14} />}
          <span>{delta}</span>
        </div>
      )}
    </Card>
  );
}

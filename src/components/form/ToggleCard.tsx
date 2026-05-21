import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToggleCardProps {
  key?: React.Key;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}

export default function ToggleCard({ icon: Icon, label, sublabel, selected, onClick }: ToggleCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: selected ? 'rgba(16, 185, 129, 0.05)' : '#fff',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
        textAlign: 'left'
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--color-primary)' }}>
          <CheckCircle2 size={24} fill="var(--color-primary)" color="#fff" />
        </div>
      )}
      
      <div style={{ 
        width: '3rem', 
        height: '3rem', 
        borderRadius: 'var(--radius-md)', 
        backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-bg-primary)',
        color: selected ? '#fff' : 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        transition: 'all 0.2s'
      }}>
        <Icon size={24} />
      </div>

      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</div>
      {sublabel && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{sublabel}</div>
      )}
    </motion.button>
  );
}

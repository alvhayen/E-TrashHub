import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  icon?: React.ElementType;
  error?: string;
  hint?: string;
  type?: string;
  style?: React.CSSProperties;
}

export default function Input({ label, icon: Icon, error, hint, type = 'text', style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%', ...style }}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</label>}
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '1rem', color: isFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'color 0.2s' }}>
            <Icon size={18} />
          </div>
        )}
        
        <input
          type={inputType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: `0.75rem 1rem 0.75rem ${Icon ? '2.75rem' : '1rem'}`,
            paddingRight: isPassword ? '2.75rem' : '1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? '#ef4444' : isFocused ? 'var(--color-primary)' : 'var(--color-border)'}`,
            backgroundColor: '#fff',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: isFocused && !error ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
            color: 'var(--color-text-primary)'
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem'
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{hint}</span>
      ) : null}
    </div>
  );
}

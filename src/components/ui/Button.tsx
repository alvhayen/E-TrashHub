import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ElementType;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  ghost?: boolean;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon: Icon,
  fullWidth = false,
  disabled,
  style,
  ...props 
}: ButtonProps) {
  
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' };
      case 'secondary':
        return { backgroundColor: 'transparent', color: 'var(--color-secondary)', border: '2px solid var(--color-secondary)' };
      case 'danger':
        return { backgroundColor: '#ef4444', color: '#fff', border: 'none' };
      case 'outline':
        return { backgroundColor: 'transparent', color: 'var(--color-primary)', border: '2px solid var(--color-primary)' };
      case 'ghost':
        return { backgroundColor: 'transparent', color: 'var(--color-text-primary)', border: 'none' };
      default:
        return { backgroundColor: 'var(--color-primary)', color: '#fff', border: 'none' };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm': return { padding: '0.375rem 0.75rem', fontSize: '0.75rem' };
      case 'md': return { padding: '0.625rem 1.25rem', fontSize: '0.875rem' };
      case 'lg': return { padding: '0.875rem 1.5rem', fontSize: '1rem' };
      default: return { padding: '0.625rem 1.25rem', fontSize: '0.875rem' };
    }
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      style={{
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        transition: 'background-color 0.2s, color 0.2s',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} style={{ animation: 'spin 1s linear infinite' }} />
      ) : Icon && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
      {children}
    </motion.button>
  );
}

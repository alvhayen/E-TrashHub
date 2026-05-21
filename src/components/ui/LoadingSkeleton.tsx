import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius = '0.25rem', className = '', style = {} }: SkeletonProps) {
  return (
    <div 
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        backgroundImage: 'linear-gradient(90deg, #e2e8f0 0px, #f1f5f9 40px, #e2e8f0 80px)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        ...style
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
      <Skeleton width="40%" height="1.5rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="4rem" style={{ marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton width="25%" height="1rem" />
        <Skeleton width="25%" height="1rem" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} style={{ flex: 1 }}>
          <Skeleton width={i === 0 ? '70%' : '100%'} height="1.25rem" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = '300px' }: { height?: string | number }) {
  return (
    <div style={{ width: '100%', height, display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
          <Skeleton width="100%" height={`${Math.random() * 60 + 20}%`} borderRadius="0.25rem 0.25rem 0 0" />
        </div>
      ))}
    </div>
  );
}

export function injectSkeletonStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'skeleton-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-inject styles
injectSkeletonStyles();

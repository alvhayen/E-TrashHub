import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface BottomNavProps {
  navItems: NavItem[];
  accentColor: string;
}

export default function BottomNav({ navItems, accentColor }: BottomNavProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      borderTop: '1px solid var(--color-border)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '64px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
      zIndex: 50
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: isActive ? accentColor : 'var(--color-text-secondary)',
            position: 'relative',
            flex: 1,
            height: '100%',
          })}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: '50%',
                    height: '3px',
                    backgroundColor: accentColor,
                    borderBottomLeftRadius: '4px',
                    borderBottomRightRadius: '4px'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <item.icon size={24} fill={isActive ? accentColor : 'none'} strokeWidth={isActive ? 2 : 1.5} />
                <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              </motion.div>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

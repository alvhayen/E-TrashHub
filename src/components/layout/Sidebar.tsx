import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  navItems: NavItem[];
  accentColor: string;
  roleName: string;
}

export default function Sidebar({ navItems, accentColor, roleName }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobile(true);
      } else {
        setIsCollapsed(false);
        setIsMobile(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        backgroundColor: 'var(--color-secondary)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <div style={{ width: '2rem', height: '2rem', backgroundColor: accentColor, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '1rem', height: '1rem', backgroundColor: '#fff', borderRadius: '2px' }}></div>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>e-TrashHub</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>
          {isCollapsed ? <Menu size={24} /> : <X size={24} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
              backgroundColor: isActive ? accentColor : 'transparent',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s',
              borderLeft: isActive && !isCollapsed ? `4px solid #fff` : '4px solid transparent'
            })}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!isCollapsed && (
              <span style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-full)', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div style={{ border: 'none' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.6, fontStyle: 'italic', color: accentColor, whiteSpace: 'nowrap' }}>{roleName}</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.5rem' }}>
              <LogOut size={20} />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button onClick={logout} style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '1rem 0 0 0', display: 'flex', justifyContent: 'center' }}>
            <LogOut size={20} />
          </button>
        )}
      </div>
    </motion.aside>
  );
}

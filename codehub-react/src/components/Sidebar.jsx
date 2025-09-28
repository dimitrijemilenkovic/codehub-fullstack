import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

export default function Sidebar({ isCollapsed, onToggle }) {
  const { isAuthed } = useAuth();

  if (!isAuthed) return null;

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav style={{ padding: "var(--spacing-4)" }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: "var(--spacing-6)" 
        }}>
          {!isCollapsed && (
            <h2 style={{ 
              fontSize: "1.5rem", 
              fontWeight: 700, 
              color: "var(--color-gray-900)",
              margin: 0
            }}>
              CodeHub
            </h2>
          )}
          <button 
            className="sidebar-toggle"
            onClick={onToggle}
            title={isCollapsed ? 'Proširi sidebar' : 'Smanji sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              ) : (
                <path d="M18 6L6 18M6 6l12 12"/>
              )}
            </svg>
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
          <NavLink to="/dashboard" className="sidebar-link" title="Dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>
          
          <NavLink to="/tasks" className="sidebar-link" title="Taskovi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3l8-8"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.5 0 2.91.37 4.15 1.02"/>
            </svg>
            {!isCollapsed && <span>Taskovi</span>}
          </NavLink>
          
          <NavLink to="/snippets" className="sidebar-link" title="Snippeti">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16,18 22,12 16,6"/>
              <polyline points="8,6 2,12 8,18"/>
            </svg>
            {!isCollapsed && <span>Snippeti</span>}
          </NavLink>

          <NavLink to="/pomodoro" className="sidebar-link" title="Pomodoro Timer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {!isCollapsed && <span>Pomodoro</span>}
          </NavLink>

          <NavLink to="/achievements" className="sidebar-link" title="Achievements">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1.25.5c-.5.2-1.28.2-1.78 0l-1.25-.5A1.25 1.25 0 0 1 4 17v-2.34"/>
              <path d="M20 14.66V17c0 .55.47.98.97 1.21l1.25.5c.5.2 1.28.2 1.78 0l1.25-.5A1.25 1.25 0 0 0 20 17v-2.34"/>
              <path d="M12 14.66V17c0 .55.47.98.97 1.21l1.25.5c.5.2 1.28.2 1.78 0l1.25-.5A1.25 1.25 0 0 0 18 17v-2.34"/>
            </svg>
            {!isCollapsed && <span>Achievements</span>}
          </NavLink>
          
          <NavLink to="/profile" className="sidebar-link" title="Profil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {!isCollapsed && <span>Profil</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

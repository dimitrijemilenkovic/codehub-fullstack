import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('sidebar_collapsed', false);
  const location = useLocation();

  function toggleSidebar() {
    setSidebarCollapsed(!sidebarCollapsed);
  }

  // Check if we're on the dashboard page
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  return (
    <div
      className={isDashboard ? "dashboard-container" : ""}
      style={{
        display: "grid",
        gridTemplateColumns: sidebarCollapsed ? "80px 1fr" : "260px 1fr",
        minHeight: "100dvh",
        transition: "grid-template-columns 0.3s ease"
      }}
    >
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main 
          className={`container-page ${isDashboard ? 'page-transition' : ''}`} 
          style={{ 
            flex: 1, 
            overflow: 'auto',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

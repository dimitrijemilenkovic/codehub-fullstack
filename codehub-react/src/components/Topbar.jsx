import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate, useLocation } from "react-router-dom";

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Taskovi',
  '/snippets': 'Snippeti',
  '/profile': 'Profil'
}

export default function Topbar() {
  const { isAuthed, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const currentPage = pageTitles[location.pathname] || 'CodeHub';

  function onLogout() {
    logout();
    nav("/login");
  }

  return (
    <header className="topbar">
      <h1 className="topbar-title">
        {currentPage}
      </h1>
      <div className="topbar-actions">
        <ThemeToggle />
        {isAuthed && (
          <button className="btn btn-outline" onClick={onLogout}>
            Odjavi se
          </button>
        )}
      </div>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, GitBranch, Terminal } from 'lucide-react';
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Shield },
    { path: '/changelog', label: 'Changelog', icon: GitBranch },
  ];

  return (
    <nav className="nav">
      <div className="nav-content">
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <Shield size={20} style={{ marginRight: 8, color: "#5ecfff", verticalAlign: "middle" }} />
          <span style={{ color: "#5ecfff", fontWeight: "bold", letterSpacing: "1px" }}>BYOVD</span>
          <span style={{ color: "#b6e3ff", fontWeight: "normal" }}>Watchdog</span>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              <Shield style={{ marginRight: 4 }} size={18} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/changelog"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              <GitBranch style={{ marginRight: 4 }} size={18} />
              Changelog
            </NavLink>
          </li>
        </ul>
        <div className="nav-status" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="status-dot" /> SYSTEM ONLINE
          <a
            href="https://github.com/pwnfuzz/byovd-watchdog"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#b6e3ff', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            aria-label="GitHub Repository"
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" style={{ verticalAlign: 'middle' }}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
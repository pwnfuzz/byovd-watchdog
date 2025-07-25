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
        <div className="nav-status">
          <span className="status-dot" /> SYSTEM ONLINE
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
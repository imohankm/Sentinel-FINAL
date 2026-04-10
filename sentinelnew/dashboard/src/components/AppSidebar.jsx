import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Home, Target, Database, LogOut, User
} from 'lucide-react';

export default function AppSidebar({ view, setView, user, onLogout, onOpenProfile }) {
  const navItems = [
    { id: 'home', label: 'Mission Overview', icon: Home },
    { id: 'targets', label: 'Assigned Targets', icon: Target },
    { id: 'history', label: 'Security Archives', icon: Database },
  ];

  return (
    <aside className="sidebar">
      {/* 1. LOGO */}
      <div className="sidebar-logo">
        <div className="w-40 h-40 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Shield size={24} />
        </div>
        <span className="font-accent font-black tracking-widest text-sm text-primary">SENTINEL</span>
      </div>

      {/* 2. PRIMARY NAV */}
      <nav className="flex flex-col flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              className={`nav-item ${view === item.id ? 'active' : ''}`}
              onClick={() => setView(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

    </aside>
  );
}

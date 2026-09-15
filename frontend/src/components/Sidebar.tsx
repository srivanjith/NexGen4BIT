import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  GitCompare, 
  AlertTriangle, 
  FileCheck2, 
  BarChart3, 
  Settings,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Analysis', path: '/analysis', icon: GitCompare },
    { label: 'Conflicts', path: '/conflicts', icon: AlertTriangle },
    { label: 'Evidence', path: '/evidence', icon: FileCheck2 },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gov-navy text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-700 shadow-xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-700 hidden lg:block">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Document Intelligence</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gov-teal text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Phase Indicator Badge Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/40 text-xs text-slate-400">
          <div className="flex items-center justify-between font-mono text-[11px] mb-1 text-slate-300">
            <span>Phase 1 System</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Foundation
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Government Document Conflict Detection & Verification Platform.
          </p>
        </div>
      </aside>
    </>
  );
};

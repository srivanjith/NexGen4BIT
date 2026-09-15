import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { apiService } from '../services/api';
import { HealthResponse } from '../types';
import { Activity, Server, Database, Menu, X, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const [health, setHealth] = useState<HealthResponse>({
    status: 'checking',
    database: 'checking',
    backend: 'checking',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboardView = location.pathname !== '/';

  useEffect(() => {
    const fetchHealth = async () => {
      const data = await apiService.getHealth();
      setHealth(data);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isDbConnected = health.database === 'connected';
  const isBackendOnline = health.backend === 'online';

  return (
    <header className="bg-white border-b border-gov-border sticky top-0 z-30 shadow-gov-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left section: Logo & Mobile sidebar toggle */}
          <div className="flex items-center gap-4">
            {isDashboardView && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md text-gov-navy hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
            <Link to="/" className="flex items-center">
              <Logo size="md" showSubtitle={false} />
            </Link>
          </div>

          {/* Center Navigation (Landing page mode) */}
          {!isDashboardView && (
            <nav className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-gov-navy hover:text-gov-teal transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm font-medium text-gov-navy hover:text-gov-teal transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-medium text-gov-navy hover:text-gov-teal transition-colors">
                About
              </a>
            </nav>
          )}

          {/* Right section: System Connection Indicators & Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Health indicators */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span>Backend:</span>
                <span className={`inline-block w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className={isBackendOnline ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                  {isBackendOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>DB:</span>
                <span className={`inline-block w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className={isDbConnected ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                  {isDbConnected ? 'Connected' : 'Fallback'}
                </span>
              </div>
            </div>

            {!isDashboardView ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gov-navy hover:bg-slate-800 rounded-md shadow-sm transition-all"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <Link
                to="/documents"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-md shadow-sm transition-all"
              >
                + Upload Documents
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

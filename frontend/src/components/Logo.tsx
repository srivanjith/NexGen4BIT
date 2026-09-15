import React from 'react';
import { ShieldCheck, FileSearch } from 'lucide-react';

interface LogoProps {
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ showSubtitle = false, size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center p-2 rounded-lg bg-gov-navy text-white shadow-gov-card border border-slate-700">
        <FileSearch className={`${iconSizes[size]} text-gov-teal-light`} />
        <ShieldCheck className="w-4 h-4 text-amber-400 absolute -bottom-1 -right-1 bg-gov-navy rounded-full p-0.5 border border-slate-600" />
      </div>
      <div>
        <div className={`font-bold tracking-tight text-gov-dark flex items-center gap-1 ${textSizes[size]}`}>
          <span>Gov</span>
          <span className="text-gov-teal font-extrabold">Verify</span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] text-gov-muted uppercase tracking-wider font-medium font-sans">
            Government Document Intelligence Platform
          </p>
        )}
      </div>
    </div>
  );
};

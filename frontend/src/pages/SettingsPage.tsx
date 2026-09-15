import React from 'react';
import { Settings, Sliders, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-gov-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
          System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure application preferences, document storage, and conflict detection thresholds.
        </p>
      </div>

      <div className="space-y-6">
        {/* Application Settings */}
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-gov-card space-y-4">
          <div className="flex items-center gap-2 text-gov-navy border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-gov-teal" />
            <h2 className="text-base font-bold">Application Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform Environment</label>
              <input
                type="text"
                disabled
                value="Development / Phase 1 Foundation"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">FastAPI Backend URL</label>
              <input
                type="text"
                disabled
                value={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Analysis Preferences */}
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-gov-card space-y-4">
          <div className="flex items-center gap-2 text-gov-navy border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-gov-teal" />
            <h2 className="text-base font-bold">Analysis Preferences</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-gov-navy block">Semantic Similarity Threshold</span>
                <span className="text-slate-500 text-[11px]">Minimum cosine similarity to group statements into topics</span>
              </div>
              <span className="font-mono font-bold text-gov-teal text-sm bg-white px-3 py-1 rounded border border-slate-200">0.82</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-gov-navy block">Conflict Detection Engine</span>
                <span className="text-slate-500 text-[11px]">Rule-based + NLI hybrid contradiction check</span>
              </div>
              <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold border border-emerald-200">Enabled</span>
            </div>
          </div>
        </div>

        {/* Document Storage Settings */}
        <div className="bg-white rounded-xl border border-gov-border p-6 shadow-gov-card space-y-4">
          <div className="flex items-center gap-2 text-gov-navy border-b border-slate-100 pb-3">
            <Database className="w-5 h-5 text-gov-teal" />
            <h2 className="text-base font-bold">Document & Storage Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Upload File Size</label>
              <input
                type="text"
                disabled
                value="10 MB"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Database Store</label>
              <input
                type="text"
                disabled
                value="MongoDB (govverify collection)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



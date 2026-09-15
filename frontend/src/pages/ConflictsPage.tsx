import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ConflictItem } from '../types';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Filter, 
  FileText, 
  Sparkles, 
  Eye, 
  X, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const ConflictsPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [docScope, setDocScope] = useState<'uploaded' | 'all'>('uploaded');
  const [seeding, setSeeding] = useState(false);

  // Selected conflict for detailed Side-by-Side comparison modal
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);

  const fetchConflicts = async () => {
    setLoading(true);
    try {
      const isUserOnly = docScope === 'uploaded';
      const data = await apiService.getConflicts(undefined, undefined, isUserOnly);
      setConflicts(data);
    } catch (err) {
      console.error(err);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflicts();
  }, [docScope]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiService.seedDemoData();
      await fetchConflicts();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  const filters = [
    'All',
    'High Severity',
    'Medium Severity',
    'Eligibility Conflict',
    'Numeric Conflict',
    'Conditional Difference',
    'Policy Change'
  ];

  const getBadgeStyle = (type: string, severity: string) => {
    if (severity === 'HIGH' || type === 'DIRECT_CONFLICT' || type === 'ELIGIBILITY_CONFLICT') {
      return { label: '🔴 Eligibility / Direct Conflict', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (type === 'NUMERIC_CONFLICT') {
      return { label: '🔴 Numeric Conflict', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (type === 'CONDITIONAL_DIFFERENCE') {
      return { label: '🟠 Conditional Difference', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (type === 'POLICY_CHANGE') {
      return { label: '🔵 Policy Change', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    return { label: '🟡 Possible Conflict', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  };

  const filteredConflicts = conflicts.filter((c) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'High Severity') return c.severity === 'HIGH';
    if (activeFilter === 'Medium Severity') return c.severity === 'MEDIUM';
    if (activeFilter === 'Eligibility Conflict') return c.conflictType === 'ELIGIBILITY_CONFLICT';
    if (activeFilter === 'Numeric Conflict') return c.conflictType === 'NUMERIC_CONFLICT';
    if (activeFilter === 'Conditional Difference') return c.conflictType === 'CONDITIONAL_DIFFERENCE';
    if (activeFilter === 'Policy Change') return c.conflictType === 'POLICY_CHANGE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
            Detected Conflicts & Contradictions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review side-by-side statement claims, confidence metrics, and deterministic evidence for uploaded documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scope selector tabs */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setDocScope('uploaded')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                docScope === 'uploaded' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:text-gov-navy'
              }`}
            >
              Uploaded Documents Only
            </button>
            <button
              onClick={() => setDocScope('all')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                docScope === 'all' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:text-gov-navy'
              }`}
            >
              All Documents (Incl. Dataset)
            </button>
          </div>

          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{seeding ? 'Seeding...' : 'Seed Sample'}</span>
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0 mr-1" />
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-gov-navy text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* CONFLICT LIST */}
      {filteredConflicts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gov-border p-12 text-center shadow-gov-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gov-navy">
              No conflicts detected for {docScope === 'uploaded' ? 'uploaded documents' : 'this filter'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Upload 2 or more custom documents and run the analysis pipeline in the Analysis Console to compare claims and detect contradictions.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/analysis"
              className="px-4 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg transition-all shadow-xs"
            >
              Go to Analysis Console →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredConflicts.map((c) => {
            const badge = getBadgeStyle(c.conflictType, c.severity);
            const docATitle = c.docATitle || c.documentAName || 'Document A';
            const docBTitle = c.docBTitle || c.documentBName || 'Document B';
            const stmtAText = c.stmtAText || c.statementAText || `Claim from ${docATitle}`;
            const stmtBText = c.stmtBText || c.statementBText || `Claim from ${docBTitle}`;

            return (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-gov-border shadow-gov-card p-6 space-y-4 hover:shadow-gov-hover transition-all"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <h3 className="text-base font-bold text-gov-navy">{c.topic || 'Document Conflict'}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>Confidence: <strong className="text-gov-teal">{(c.confidence * 100).toFixed(0)}%</strong></span>
                    <span>•</span>
                    <span>Severity: <strong className="text-slate-800">{c.severity}</strong></span>
                    <button
                      onClick={() => setSelectedConflict(c)}
                      className="ml-2 px-3 py-1 bg-slate-100 hover:bg-gov-teal hover:text-white rounded text-slate-700 font-sans font-semibold transition-all flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Side-by-Side
                    </button>
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  <strong>Conflict Reason:</strong> {c.reason}
                </p>

                {/* Side-by-Side Preview Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gov-navy border-b border-slate-200 pb-2">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gov-teal" />
                        {docATitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">Page {c.pageA || 1} • {c.sectionA || 'General'}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic font-serif leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                      "{stmtAText}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gov-navy border-b border-rose-200 pb-2">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-600" />
                        {docBTitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">Page {c.pageB || 1} • {c.sectionB || 'General'}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic font-serif leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                      "{stmtBText}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED SIDE-BY-SIDE COMPARISON MODAL */}
      {selectedConflict && (() => {
        const modalDocATitle = selectedConflict.docATitle || selectedConflict.documentAName || 'Document A';
        const modalDocBTitle = selectedConflict.docBTitle || selectedConflict.documentBName || 'Document B';
        const modalStmtAText = selectedConflict.stmtAText || selectedConflict.statementAText || `Claim statement from ${modalDocATitle}`;
        const modalStmtBText = selectedConflict.stmtBText || selectedConflict.statementBText || `Claim statement from ${modalDocBTitle}`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-gov-navy text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-gov-teal-light" />
                  <div>
                    <h3 className="font-bold text-lg">{selectedConflict.topic || 'Document Conflict'}</h3>
                    <p className="text-xs text-slate-300 font-mono">Detailed Side-by-Side Statement Audit</p>
                  </div>
                </div>
                <button onClick={() => setSelectedConflict(null)} className="text-slate-300 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* Conflict Metrics Banner */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 text-center">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Conflict Type</span>
                    <strong className="text-gov-navy font-mono text-sm">{selectedConflict.conflictType}</strong>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-slate-500 text-[11px] block">Confidence Score</span>
                    <strong className="text-gov-teal font-mono text-sm">{(selectedConflict.confidence * 100).toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Severity Level</span>
                    <strong className="text-rose-700 font-mono text-sm">{selectedConflict.severity}</strong>
                  </div>
                </div>

                {/* Side-by-Side Detailed Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                    <div className="border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-gov-navy block">{modalDocATitle}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Page {selectedConflict.pageA || 1} • Section: {selectedConflict.sectionA || 'General'}</span>
                    </div>
                    <p className="text-slate-800 italic font-serif leading-relaxed bg-white p-3 rounded border border-slate-200">
                      "{modalStmtAText}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-300 space-y-3">
                    <div className="border-b border-rose-200 pb-2">
                      <span className="text-xs font-bold text-gov-navy block">{modalDocBTitle}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Page {selectedConflict.pageB || 1} • Section: {selectedConflict.sectionB || 'General'}</span>
                    </div>
                    <p className="text-slate-800 italic font-serif leading-relaxed bg-white p-3 rounded border border-slate-200">
                      "{modalStmtBText}"
                    </p>
                  </div>
                </div>

              {/* Reasoning */}
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1">
                <span className="font-bold text-teal-900 block">AI Explainability Reasoning:</span>
                <p className="text-slate-700 leading-relaxed">{selectedConflict.reason}</p>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <Link
                  to="/evidence"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg transition-all"
                >
                  View Source Evidence Audit →
                </Link>
                <button
                  onClick={() => setSelectedConflict(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Close Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

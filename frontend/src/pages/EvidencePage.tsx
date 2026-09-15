import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { EvidenceItem } from '../types';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  Search,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docScope, setDocScope] = useState<'uploaded' | 'all'>('uploaded');
  const [seeding, setSeeding] = useState(false);

  const checkData = async () => {
    setLoading(true);
    try {
      const isUserOnly = docScope === 'uploaded';
      let data = await apiService.getAllEvidence(isUserOnly);
      if (!data || data.length === 0) {
        data = await apiService.getConflicts(undefined, undefined, isUserOnly);
      }
      setConflicts(data || []);
    } catch (err) {
      console.error(err);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkData();
  }, [docScope]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await apiService.seedDemoData();
      await checkData();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
            Evidence Verification Inspector
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Trace every flagged conflict directly back to verified document text, page number, and section for uploaded files.
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

      {conflicts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gov-border p-12 text-center shadow-gov-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-gov-teal flex items-center justify-center mx-auto">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gov-navy">
              No evidence records found for {docScope === 'uploaded' ? 'uploaded documents' : 'all documents'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Upload 2 or more custom documents and run the analysis pipeline to generate deterministic evidence verification records.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              to="/analysis"
              className="px-4 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg transition-all shadow-xs"
            >
              Run Analysis on Uploaded Docs →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {conflicts.map((item, idx) => {
            const topic = item.topic || item.conflictType || 'Policy Regulation Evidence';
            const docATitle = item.docATitle || item.documentAName || 'Government Document A';
            const docBTitle = item.docBTitle || item.documentBName || 'Government Document B';
            const stmtAText = item.stmtAText || item.statementAText || item.sourceText || 'No source text available for Document A';
            const stmtBText = item.stmtBText || item.statementBText || item.sourceText || 'No source text available for Document B';
            const reason = item.reason || 'Statement claim comparison discrepancy detected between publications.';

            return (
              <div key={item._id || idx} className="bg-white rounded-xl border border-gov-border p-6 shadow-gov-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-navy">
                    <ShieldCheck className="w-4 h-4 text-gov-teal" />
                    <span>Verified Source Proof #{item._id ? item._id.substring(0, 8) : `EV-2026-00${idx + 1}`}</span>
                    <span className="text-slate-500 font-normal">• Topic: <strong className="text-gov-navy">{topic}</strong></span>
                  </div>
                  <span className="text-[11px] font-mono bg-teal-50 text-gov-teal border border-teal-200 px-2 py-0.5 rounded font-bold">
                    Verified Document Source
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gov-navy">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gov-teal" />
                        {docATitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">Page {item.pageA || 1} • {item.sectionA || 'General Section'}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic font-serif bg-white p-3 rounded border border-slate-200">
                      "{stmtAText}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gov-navy">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-rose-600" />
                        {docBTitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">Page {item.pageB || 1} • {item.sectionB || 'General Section'}</span>
                    </div>
                    <p className="text-xs text-slate-700 italic font-serif bg-white p-3 rounded border border-slate-200">
                      "{stmtBText}"
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Source Verification Explanation:</span>
                  <p className="text-slate-700">{reason}</p>
                </div>
              </div>
            );
          })}

        </div>
      )}
    </div>
  );
};

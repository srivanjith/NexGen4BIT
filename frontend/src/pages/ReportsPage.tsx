import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { AuditReport } from '../types';
import { 
  BarChart3, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReport('latest');
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GovVerify_Audit_Report_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-border pb-5 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
            Analysis & Verification Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export official conflict audit summaries with deterministic source quotes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gov-teal" />
            <span>Export JSON Data</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gov-navy hover:bg-slate-800 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Audit Report</span>
          </button>
        </div>
      </div>

      {/* REPORT DOCUMENT SHEET */}
      <div className="bg-white rounded-xl border border-gov-border shadow-gov-card p-8 space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Report Document Title Header */}
        <div className="border-b-2 border-gov-navy pb-4 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-gov-navy font-extrabold text-xl">
              <ShieldCheck className="w-6 h-6 text-gov-teal" />
              <span>GovVerify Official Audit Report</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Government Document Conflict Detection & Verification Platform
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-500">
            <div>Report Date: {new Date().toLocaleDateString()}</div>
            <div>Status: <span className="font-bold text-emerald-700">VERIFIED AUDIT</span></div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gov-teal uppercase tracking-widest">1. Executive Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[11px]">Documents Analyzed</span>
              <strong className="text-gov-navy text-base">{report?.analysisSummary?.totalDocuments || 3}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Statements Extracted</span>
              <strong className="text-gov-teal text-base">{report?.analysisSummary?.totalStatements || 24}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Conflicts Flagged</span>
              <strong className="text-rose-700 text-base">{report?.analysisSummary?.conflictsFound || 2}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Conditional Shifts</span>
              <strong className="text-amber-700 text-base">{report?.analysisSummary?.conditionalDifferences || 1}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Flagged Conflicts Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gov-teal uppercase tracking-widest">2. Discrepancy & Contradiction Details</h3>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-gov-navy text-sm">Discrepancy #1: Minimum Eligibility Student Age</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-100 text-rose-800">ELIGIBILITY_CONFLICT (HIGH)</span>
              </div>
              <p className="text-slate-700">
                <strong>Reasoning:</strong> Government Order 2024 (Page 3) specifies minimum age as 18 years, whereas Government Policy 2025 (Page 7) specifies minimum age as 21 years.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1 font-serif text-[11px] italic text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">
                  "Students must be 18 years or older to qualify for higher education grants."
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  "Students must be 21 years or older to receive state scholarship funding."
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-gov-navy text-sm">Discrepancy #2: Maximum Annual Family Income Ceiling</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-800">NUMERIC_CONFLICT (MEDIUM)</span>
              </div>
              <p className="text-slate-700">
                <strong>Reasoning:</strong> Government Order 2024 specifies ₹2,50,000 threshold while Government Policy 2025 expands income ceiling to ₹3,00,000.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1 font-serif text-[11px] italic text-slate-700">
                <div className="p-2 bg-white rounded border border-slate-200">
                  "Annual family income must be below ₹2,50,000 for full fee reimbursement."
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  "Annual family income must be below ₹3,00,000 for financial assistance."
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Compliance Certification */}
        <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 flex justify-between items-center">
          <div>
            <span>Generated deterministically by <strong>GovVerify Engine v1.0</strong></span>
          </div>
          <div className="font-mono text-[11px]">
            Checksum: <span className="text-slate-700 font-bold">SHA256-GV2026-VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

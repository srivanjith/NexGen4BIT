import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DocumentItem, AnalysisRun } from '../types';
import { Link } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Layers, 
  GitCompare, 
  AlertTriangle, 
  Scale, 
  FileCheck2,
  CheckCircle2,
  Play,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [latestRun, setLatestRun] = useState<AnalysisRun | null>(null);

  // Tab & Search filters
  const [activeTab, setActiveTab] = useState<'uploaded' | 'dataset'>('uploaded');
  const [searchFilter, setSearchFilter] = useState('');

  const loadDocuments = async () => {
    try {
      const isDatasetQuery = activeTab === 'dataset' ? true : false;
      const docs = await apiService.getDocuments({ 
        isDataset: isDatasetQuery,
        limit: activeTab === 'dataset' ? 50 : 100,
        search: searchFilter || undefined
      });
      setDocuments(docs);
      
      // Auto select first 2 uploaded documents if none selected yet
      if (selectedIds.length === 0 && docs.length > 0) {
        setSelectedIds(docs.slice(0, 3).map(d => d._id));
      }
    } catch (err) {
      console.error('Failed to load documents for analysis:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeTab, searchFilter]);

  const handleRunPipeline = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 documents to execute pipeline analysis.');
      return;
    }
    setExecuting(true);
    setActiveStep(1);

    // Simulate multi-step visual pipeline progression
    for (let step = 1; step <= 6; step++) {
      setActiveStep(step);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      const run = await apiService.startAnalysis(selectedIds);
      setLatestRun(run);
      setActiveStep(7);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Analysis execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const pipelineSteps = [
    { id: '01', name: 'Upload & Parse Documents', desc: 'PyMuPDF page-by-page text extraction', icon: UploadCloud },
    { id: '02', name: 'Extract Text Stream', desc: 'Sanitize heading structure and section numbers', icon: FileText },
    { id: '03', name: 'Extract Statement Claims', desc: 'Isolate Subject, Attribute, Value, Unit & Condition', icon: Layers },
    { id: '04', name: 'Semantic Embedding Pairer', desc: 'TF-IDF & Sentence Transformer similarity matrix', icon: GitCompare },
    { id: '05', name: 'NLI & Rule Conflict Engine', desc: 'Numeric, Eligibility, Date & Exception evaluation', icon: AlertTriangle },
    { id: '06', name: 'Evidence Verification Linker', desc: 'Bind flagged conflicts to exact source document & page', icon: Scale },
    { id: '07', name: 'Generate Audit Report', desc: 'Compile explainable side-by-side verification report', icon: FileCheck2 },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
            Analysis Pipeline Execution Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Execute statement extraction, semantic similarity pairing, and rule engine conflict detection.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={executing || selectedIds.length < 2}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          {executing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Pipeline (Step 0{activeStep}/07)...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Pipeline Analysis ({selectedIds.length} Docs)</span>
            </>
          )}
        </button>
      </div>

      {/* DOCUMENT SELECTOR & FILTER STRIP */}
      <div className="bg-white rounded-xl border border-gov-border p-5 shadow-gov-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-gov-navy block">
              Target Documents Selected for Analysis ({selectedIds.length})
            </span>
            <span className="text-[11px] text-slate-500">Select 2+ documents to compare for conflicts</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('uploaded')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'uploaded'
                  ? 'bg-gov-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Uploaded & Custom Docs
            </button>
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'dataset'
                  ? 'bg-gov-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Indian Laws Dataset (7.5k)
            </button>
          </div>
        </div>

        {/* Search Bar for Documents */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search documents by title or department..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="flex-1 px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-gov-teal"
          />
          <button
            onClick={() => setSelectedIds([])}
            className="text-[11px] text-slate-500 hover:text-rose-600 underline"
          >
            Clear Selection
          </button>
        </div>

        {/* Document Selection Badges */}
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 scrollbar-thin">
          {documents.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-2">
              No {activeTab === 'uploaded' ? 'uploaded' : 'dataset'} documents found matching search filter.
            </div>
          ) : (
            documents.map(d => {
              const isSelected = selectedIds.includes(d._id);
              return (
                <button
                  key={d._id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedIds(selectedIds.filter(id => id !== d._id));
                    } else {
                      setSelectedIds([...selectedIds, d._id]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gov-navy text-white border-gov-navy shadow-xs ring-1 ring-gov-teal'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-gov-teal-light' : 'text-slate-400'}`} />
                  <span className="truncate max-w-xs">{d.title}</span>
                  {isSelected && <span className="text-[10px] font-bold text-teal-300">✓</span>}
                </button>
              );
            })
          )}
        </div>
      </div>


      {/* LATEST ANALYSIS RUN SUMMARY BANNER */}
      {latestRun && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="font-bold text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Analysis Run Completed Successfully
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                STATUS: {latestRun.status.toUpperCase()}
              </span>
              <Link
                to="/conflicts"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gov-teal hover:bg-teal-800 rounded-lg shadow-xs transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>View Output on Conflicts Page ({latestRun.conflictsFound}) →</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono text-slate-700 border-t border-emerald-200/60">
            <div>Statements Extracted: <strong className="text-gov-navy">{latestRun.totalStatements}</strong></div>
            <div>Matched Pairs: <strong className="text-gov-teal">{latestRun.matchedStatements}</strong></div>
            <div>Conflicts Found: <strong className="text-rose-700">{latestRun.conflictsFound}</strong></div>
            <div>Conditional Differences: <strong className="text-amber-700">{latestRun.conditionalDifferences || 0}</strong></div>
          </div>
        </div>
      )}

      {/* PIPELINE STEPS FLOW */}
      <div className="space-y-4">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const stepNum = idx + 1;
          const isDone = activeStep > stepNum || latestRun !== null;
          const isCurrent = activeStep === stepNum;

          return (
            <div key={step.id} className="relative">
              <div className={`bg-white rounded-xl border p-5 shadow-gov-card transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isCurrent ? 'border-gov-teal ring-2 ring-gov-teal/20 bg-teal-50/20' : 'border-gov-border'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 ${
                    isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-gov-teal text-white animate-pulse' : 'bg-gov-navy text-white'
                  }`}>
                    {step.id}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gov-navy flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gov-teal" />
                      <span>{step.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isCurrent
                      ? 'bg-sky-100 text-sky-800 border-sky-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isDone ? 'Completed' : isCurrent ? 'Processing...' : 'Pending'}
                  </span>
                </div>
              </div>

              {idx < pipelineSteps.length - 1 && (
                <div className="flex justify-center my-1 text-slate-300">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

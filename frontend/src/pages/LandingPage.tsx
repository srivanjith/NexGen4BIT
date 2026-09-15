import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { 
  FileCheck, 
  Search, 
  GitCompare, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Layers,
  Scale,
  BrainCircuit,
  Lock,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gov-bg flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-white to-gov-bg border-b border-gov-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-gov-teal uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-gov-teal" />
                <span>Government Document Intelligence Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gov-dark tracking-tight leading-tight">
                Detect Conflicts. <br />
                <span className="text-gov-teal">Verify the Evidence.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
                Analyze multiple government orders, policies, and circulars. Identify conflicting statements and trace every single result back to its original source.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/documents"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-gov-navy hover:bg-slate-800 rounded-lg shadow-md transition-all gap-2 group"
                >
                  <span>Analyze Documents</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-gov-navy bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-all"
                >
                  See How It Works
                </a>
              </div>

              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-teal" />
                  <span>Deterministic Evidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-teal" />
                  <span>Zero Hallucination</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-teal" />
                  <span>Document Traceability</span>
                </div>
              </div>
            </div>

            {/* Architecture Pipeline Visual (NOT a Chatbot) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-gov-hover border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold text-gov-muted uppercase tracking-wider">Analysis Architecture Workflow</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-50 text-gov-teal border border-teal-200">
                    Phase 1 Active
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="p-2 rounded bg-slate-200 text-gov-navy">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gov-navy">01. Government Documents</div>
                      <div className="text-[11px] text-slate-500 font-sans">Orders, Policies, Circulars, Notifications</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-300 font-bold">↓</div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="p-2 rounded bg-teal-100 text-gov-teal">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-gov-navy">02. Statement Extraction</div>
                      <div className="text-[11px] text-slate-500 font-sans">Atomic claims & eligibility rules</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-300 font-bold">↓</div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
                    <div className="p-2 rounded bg-amber-100 text-amber-700">
                      <GitCompare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">03. Conflict Engine</div>
                      <div className="text-[11px] text-amber-700 font-sans">Numeric, Date & Policy contradictions</div>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-300 font-bold">↓</div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                    <div className="p-2 rounded bg-emerald-100 text-emerald-700">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900">04. Evidence Verification</div>
                      <div className="text-[11px] text-emerald-700 font-sans">Exact Document + Page + Section proof</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-b border-gov-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-gov-teal uppercase tracking-widest mb-2">System Methodology</h2>
            <h3 className="text-3xl font-bold text-gov-dark tracking-tight">How GovVerify Operates</h3>
            <p className="mt-4 text-slate-600 text-base">
              Unlike generic LLM chatbots that summarize without accountability, GovVerify relies on rigorous statement indexing and deterministic verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stage 1 */}
            <div className="p-6 rounded-xl bg-gov-bg border border-slate-200 relative group hover:border-gov-teal transition-all">
              <div className="text-3xl font-extrabold text-gov-teal/30 mb-2 font-mono">01</div>
              <h4 className="text-lg font-bold text-gov-navy mb-2">Upload Documents</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload multiple official PDF, DOCX, or TXT documents related to the same government policy or scheme.
              </p>
              <div className="mt-4 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded inline-block">
                Ready in Phase 1
              </div>
            </div>

            {/* Stage 2 */}
            <div className="p-6 rounded-xl bg-gov-bg border border-slate-200 relative group hover:border-gov-teal transition-all">
              <div className="text-3xl font-extrabold text-gov-teal/30 mb-2 font-mono">02</div>
              <h4 className="text-lg font-bold text-gov-navy mb-2">Extract Statements</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                System identifies individual claims, eligibility criteria, dates, and quantitative requirements.
              </p>
              <div className="mt-4 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded inline-block">
                Pipeline Stage (Phase 2)
              </div>
            </div>

            {/* Stage 3 */}
            <div className="p-6 rounded-xl bg-gov-bg border border-slate-200 relative group hover:border-gov-teal transition-all">
              <div className="text-3xl font-extrabold text-gov-teal/30 mb-2 font-mono">03</div>
              <h4 className="text-lg font-bold text-gov-navy mb-2">Detect Conflicts</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Semantic matching algorithms compare claims discussing the same topic to surface contradictions.
              </p>
              <div className="mt-4 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded inline-block">
                Pipeline Stage (Phase 2)
              </div>
            </div>

            {/* Stage 4 */}
            <div className="p-6 rounded-xl bg-gov-bg border border-slate-200 relative group hover:border-gov-teal transition-all">
              <div className="text-3xl font-extrabold text-gov-teal/30 mb-2 font-mono">04</div>
              <h4 className="text-lg font-bold text-gov-navy mb-2">Verify Evidence</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every detected discrepancy highlights side-by-side original text with exact document name, page, and section.
              </p>
              <div className="mt-4 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded inline-block">
                Pipeline Stage (Phase 2)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-gov-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-gov-teal uppercase tracking-widest mb-2">Core Capabilities</h2>
            <h3 className="text-3xl font-bold text-gov-dark tracking-tight">Built for Enterprise & Public Sector Precision</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-gov-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-gov-teal flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gov-navy">Semantic Statement Matching</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Locate and pair statements discussing the same concept or regulation even when different departments use entirely distinct legal phrasing.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-gov-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <GitCompare className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gov-navy">Multi-Type Conflict Engine</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Detect numeric mismatches (amounts, age limits), date & deadline conflicts, requirement changes, and conditional policy shifts between documents.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-gov-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gov-navy">Evidence Verification Audit Trail</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every insight links directly to document source metadata: Document Title, Page Number, Clause / Section ID, and unmodified original quote.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white border border-slate-200 shadow-gov-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-gov-navy">Explainable Intelligence Reports</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clear, transparent reasoning explaining why two statements were flagged as conflicting without black-box generative assumptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="mt-auto bg-gov-navy text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-800">
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gov-teal-light" />
                <span>GovVerify</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Government Document Conflict Detection & Evidence Verification System
              </p>
            </div>
            <div className="flex gap-6 text-sm text-slate-300">
              <Link to="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</Link>
              <Link to="/documents" className="hover:text-teal-400 transition-colors">Documents</Link>
              <Link to="/conflicts" className="hover:text-teal-400 transition-colors">Conflicts</Link>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row justify-between text-xs text-slate-400 gap-4">
            <p>© 2026 GovVerify. All rights reserved.</p>
            <p className="font-mono text-[11px] text-slate-400">Phase 1 Foundation Release</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiService, apiClient } from '../services/api';
import { DocumentItem, DocumentTextPage } from '../types';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  File, 
  Plus,
  RefreshCw,
  Search,
  Eye,
  Layers
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Text Drawer state
  const [selectedDocForText, setSelectedDocForText] = useState<DocumentItem | null>(null);
  const [extractedPages, setExtractedPages] = useState<DocumentTextPage[]>([]);
  const [loadingText, setLoadingText] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('Government Order');
  const [department, setDepartment] = useState('Higher Education');
  const [documentDate, setDocumentDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['pdf', 'docx', 'txt'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !validExtensions.includes(fileExt)) {
        setUploadError('Invalid file type. Only PDF, DOCX, and TXT files are permitted.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size exceeds 10MB limit.');
        setSelectedFile(null);
        return;
      }

      setUploadError(null);
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', documentType);
    formData.append('department', department);
    if (documentDate) {
      formData.append('documentDate', documentDate);
    }

    try {
      await apiService.uploadDocument(formData);
      setSelectedFile(null);
      setIsModalOpen(false);
      await fetchDocuments();
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || 'Failed to upload document. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await apiService.deleteDocument(id);
        await fetchDocuments();
      } catch (err) {
        alert('Failed to delete document.');
      }
    }
  };

  const [extractedStatements, setExtractedStatements] = useState<any[]>([]);

  const handleInspectText = async (doc: DocumentItem) => {
    setSelectedDocForText(doc);
    setLoadingText(true);
    try {
      const [pages, stmts] = await Promise.all([
        apiService.getDocumentText(doc._id),
        apiService.getDocumentStatements(doc._id)
      ]);
      setExtractedPages(pages);
      setExtractedStatements(stmts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingText(false);
    }
  };

  const [importingDataset, setImportingDataset] = useState(false);

  const handleSeedData = async () => {
    setLoading(true);
    try {
      await apiService.seedDemoData();
      await fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportDataset = async () => {
    setImportingDataset(true);
    try {
      const res = await apiService.importDataset();
      alert(res?.message || 'Dataset imported successfully into MongoDB!');
      await fetchDocuments();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to import dataset.');
    } finally {
      setImportingDataset(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-dark tracking-tight">
            Government Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage official orders, policies, circulars, and guidelines for statement extraction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleImportDataset}
            disabled={importingDataset || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-300 rounded-lg hover:bg-teal-100 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gov-teal ${importingDataset ? 'animate-spin' : ''}`} />
            <span>{importingDataset ? 'Importing 10.6k Laws...' : 'Import Indian Laws Dataset'}</span>
          </button>

          <button
            onClick={handleSeedData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Seed Demo Data</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        </div>
      </div>


      {/* SEARCH AND FILTERS */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gov-border shadow-gov-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search documents by title, department, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-gov-teal text-gov-dark"
          />
        </div>
        <div className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-gov-navy">{filteredDocuments.length}</span> documents
        </div>
      </div>

      {/* DOCUMENT TABLE */}
      <div className="bg-white rounded-xl border border-gov-border shadow-gov-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gov-teal" />
            <span className="text-xs font-medium">Loading documents from MongoDB...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gov-navy">No documents uploaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload PDF, DOCX, or TXT government documents to begin statement extraction.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg transition-all"
              >
                Upload First Document
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Document Title</th>
                  <th className="py-3.5 px-4">Document Type</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Doc Date</th>
                  <th className="py-3.5 px-4">Pages</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploaded At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gov-navy">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gov-teal flex-shrink-0" />
                        <span className="truncate max-w-xs">{doc.title}</span>
                        {doc.isDemo && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-800 rounded font-bold">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.documentType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{doc.department}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{doc.documentDate || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{doc.pageCount}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          doc.status === 'analyzed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'processing'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleInspectText(doc)}
                          className="p-1.5 text-slate-600 hover:text-gov-teal hover:bg-teal-50 rounded transition-colors"
                          title="Inspect Extracted Text"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id, doc.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TEXT INSPECTOR DRAWER */}
      {selectedDocForText && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white max-w-2xl w-full h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gov-navy text-white">
              <div>
                <h3 className="font-bold text-base">{selectedDocForText.title}</h3>
                <p className="text-xs text-slate-300 font-mono">Live Extraction Output Stream & Atomic Claims</p>
              </div>
              <button onClick={() => setSelectedDocForText(null)} className="p-1 text-slate-300 hover:text-white">✕</button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-6 text-xs">
              {loadingText ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gov-teal" />
                  <span>Parsing PyMuPDF text & statement claims...</span>
                </div>
              ) : (
                <>
                  {/* Extracted Claims Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-gov-navy text-sm">Extracted Claims ({extractedStatements.length})</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        MongoDB Statements Collection
                      </span>
                    </div>

                    {extractedStatements.length === 0 ? (
                      <p className="text-slate-400 italic">No structured claims extracted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {extractedStatements.map((stmt, idx) => (
                          <div key={idx} className="p-3 bg-teal-50/40 border border-teal-200 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-gov-navy">
                              <span>Subject: <strong className="text-gov-teal">{stmt.subject || 'General'}</strong></span>
                              <span>Attribute: <strong className="text-slate-700">{stmt.attribute || 'Policy'}</strong></span>
                              {stmt.value && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Val: {stmt.value}</span>}
                            </div>
                            <p className="text-[11px] text-slate-700 italic font-serif">"{stmt.statementText}"</p>
                            {stmt.condition && (
                              <p className="text-[10px] text-amber-700 font-sans">
                                <strong>Condition:</strong> {stmt.condition}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Raw Page Text Stream */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="font-bold text-gov-navy text-sm border-b border-slate-200 pb-2">Page-by-Page Raw Text Stream</h4>
                    {extractedPages.map(page => (
                      <div key={page.pageNumber} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-bold text-gov-navy flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-gov-teal" />
                            Page {page.pageNumber}
                          </span>
                          <span className="font-mono text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {page.section}
                          </span>
                        </div>
                        <p className="text-slate-700 font-mono leading-relaxed bg-white p-3 rounded border border-slate-200 text-[11px]">
                          {page.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-gov-teal" />
                <h3 className="font-bold text-gov-navy text-lg">Upload Government Document</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div
                onDragOver={(e) => e.preventDefault()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  selectedFile
                    ? 'border-gov-teal bg-teal-50/50'
                    : 'border-slate-300 hover:border-gov-teal bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-1">
                    <File className="w-8 h-8 text-gov-teal mx-auto" />
                    <p className="text-xs font-bold text-gov-navy">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-gov-navy">
                        Drag & Drop document here or <span className="text-gov-teal underline">Browse Files</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Supported formats: PDF, DOCX, TXT (Max 10MB)
                      </p>
                    </div>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-gov-navy"
                  >
                    <option value="Government Order">Government Order</option>
                    <option value="Government Policy">Government Policy</option>
                    <option value="Government Notification">Government Notification</option>
                    <option value="Government Circular">Government Circular</option>
                    <option value="Government Guidelines">Government Guidelines</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Higher Education"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-gov-navy"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gov-teal hover:bg-teal-800 rounded-lg disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Upload & Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export interface DocumentItem {
  _id: string;
  title: string;
  fileName: string;
  documentType: string;
  department: string;
  documentDate?: string;
  filePath: string;
  fileSize: number;
  pageCount: number;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed' | string;
  isDemo?: boolean;
  createdAt: string;
}

export interface DocumentTextPage {
  pageNumber: number;
  section: string;
  text: string;
}

export interface StatementItem {
  _id: string;
  documentId: string;
  pageNumber: number;
  section?: string;
  statementText: string;
  subject?: string;
  attribute?: string;
  value?: any;
  unit?: string;
  condition?: string;
  createdAt: string;
}

export interface ConflictItem {
  _id: string;
  statementAId: string;
  statementBId: string;
  docAId?: string;
  docBId?: string;
  conflictType: 'NUMERIC_CONFLICT' | 'DATE_CONFLICT' | 'CONDITIONAL_DIFFERENCE' | 'POLICY_CHANGE' | 'DIRECT_CONFLICT' | 'ELIGIBILITY_CONFLICT' | 'REQUIREMENT_CONFLICT' | 'POSSIBLE_CONFLICT' | string;
  confidence: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  topic?: string;
  docATitle?: string;
  docBTitle?: string;
  stmtAText?: string;
  stmtBText?: string;
  documentAName?: string;
  documentBName?: string;
  statementAText?: string;
  statementBText?: string;
  pageA?: number;
  pageB?: number;
  sectionA?: string;
  sectionB?: string;
  reason: string;
  isException?: boolean;
  createdAt: string;
}

export interface EvidenceItem {
  _id: string;
  conflictId: string;
  documentId: string;
  pageNumber: number;
  section?: string;
  sourceText: string;
  createdAt: string;
}

export interface AnalysisRun {
  _id: string;
  documentIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalStatements: number;
  matchedStatements: number;
  conflictsFound: number;
  possibleConflicts: number;
  conditionalDifferences?: number;
  consistentStatements?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface AuditReport {
  reportTitle: string;
  generatedAt: string;
  analysisSummary: {
    analysisId?: string;
    totalDocuments: number;
    totalStatements: number;
    matchedStatements: number;
    conflictsFound: number;
    possibleConflicts: number;
    conditionalDifferences?: number;
    startedAt?: string;
    completedAt?: string;
  };
  documents: DocumentItem[];
  conflicts: ConflictItem[];
}

export interface HealthResponse {
  status: string;
  database: string;
  backend: string;
}

export interface StatsResponse {
  documentsAnalyzed: number;
  statementsExtracted: number;
  conflictsFound: number;
  possibleConflicts: number;
}

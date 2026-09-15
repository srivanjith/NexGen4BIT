import axios from 'axios';
import { 
  HealthResponse, 
  StatsResponse, 
  DocumentItem, 
  DocumentTextPage,
  StatementItem,
  ConflictItem, 
  EvidenceItem, 
  AnalysisRun,
  AuditReport
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const apiService = {
  // System Health
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await apiClient.get<HealthResponse>('/api/health');
      return response.data;
    } catch (error) {
      return {
        status: 'degraded',
        database: 'disconnected',
        backend: 'offline',
      };
    }
  },

  // Dashboard Stats
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await apiClient.get<StatsResponse>('/api/stats');
      return response.data;
    } catch (error) {
      return {
        documentsAnalyzed: 0,
        statementsExtracted: 0,
        conflictsFound: 0,
        possibleConflicts: 0,
      };
    }
  },

  // Document Management
  async getDocuments(params?: { isDataset?: boolean; limit?: number; search?: string }): Promise<DocumentItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.isDataset !== undefined) queryParams.append('isDataset', params.isDataset.toString());
      if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<DocumentItem[]>(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  },


  async getDocument(id: string): Promise<DocumentItem | null> {
    try {
      const response = await apiClient.get<DocumentItem>(`/api/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch document ${id}:`, error);
      return null;
    }
  },

  async getDocumentText(id: string): Promise<DocumentTextPage[]> {
    try {
      const response = await apiClient.get<DocumentTextPage[]>(`/api/documents/${id}/text`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch text for document ${id}:`, error);
      return [];
    }
  },

  async getDocumentStatements(id: string): Promise<StatementItem[]> {
    try {
      const response = await apiClient.get<StatementItem[]>(`/api/documents/${id}/statements`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch statements for document ${id}:`, error);
      return [];
    }
  },

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const response = await apiClient.post<DocumentItem>('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<{ message: string; id: string }> {
    const response = await apiClient.delete<{ message: string; id: string }>(`/api/documents/${id}`);
    return response.data;
  },

  async seedDemoData(): Promise<{ message: string; documentsCount: number }> {
    const response = await apiClient.post<{ message: string; documentsCount: number }>('/api/documents/seed');
    return response.data;
  },

  async importDataset(maxRecords?: number): Promise<any> {
    const params = new URLSearchParams();
    if (maxRecords) params.append('max_records', maxRecords.toString());
    const response = await apiClient.post(`/api/documents/import-dataset?${params.toString()}`);
    return response.data;
  },

  // ML Training
  async trainMlModel(maxSamples?: number): Promise<any> {
    const response = await apiClient.post('/api/ml/train', { max_samples: maxSamples });
    return response.data;
  },

  async getMlStatus(): Promise<any> {
    try {
      const response = await apiClient.get('/api/ml/status');
      return response.data;
    } catch (error) {
      return { status: 'untrained' };
    }
  },



  // Analysis Pipeline
  async startAnalysis(documentIds: string[]): Promise<AnalysisRun> {
    const response = await apiClient.post<AnalysisRun>('/api/analysis/start', { documentIds });
    return response.data;
  },

  async getAnalyses(): Promise<AnalysisRun[]> {
    try {
      const response = await apiClient.get<AnalysisRun[]>('/api/analysis');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  // Conflicts
  async getConflicts(severity?: string, conflictType?: string, userOnly?: boolean): Promise<ConflictItem[]> {
    try {
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      if (conflictType) params.append('conflictType', conflictType);
      if (userOnly !== undefined) params.append('userOnly', userOnly.toString());
      
      const response = await apiClient.get<ConflictItem[]>(`/api/conflicts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
      return [];
    }
  },

  async getConflict(id: string): Promise<ConflictItem | null> {
    try {
      const response = await apiClient.get<ConflictItem>(`/api/conflicts/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Evidence
  async getAllEvidence(userOnly?: boolean): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (userOnly !== undefined) params.append('userOnly', userOnly.toString());
      const response = await apiClient.get<any[]>(`/api/evidence?${params.toString()}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getEvidence(conflictId: string): Promise<EvidenceItem[]> {
    try {
      const response = await apiClient.get<EvidenceItem[]>(`/api/evidence/${conflictId}`);
      return response.data;
    } catch (error) {
      return [];
    }
  },


  // Reports
  async getReport(analysisId: string): Promise<AuditReport> {
    const response = await apiClient.get<AuditReport>(`/api/reports/${analysisId}`);
    return response.data;
  }
};

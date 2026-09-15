# GovVerify — Government Document Conflict Detection & Verification System

> **Subtitle:** Government Document Conflict Detection & Evidence Verification Platform

---

## 1. Problem Statement

Government policies, circulars, notifications, guidelines, and orders are published incrementally across multiple departments and years. Often, new circulars contradict or modify preceding orders regarding eligibility, quantitative limits (age, income thresholds), deadlines, and procedural requirements.

Existing search tools and generative AI chatbots often attempt to generate a single synthesized answer from multiple documents, masking subtle contradictions or introducing unverified AI hallucinations.

---

## 2. System Objective

**GovVerify** is designed to compare multiple official government documents, identify explicit and semantic conflicts, and expose the disagreement with deterministic traceability back to the exact source document, page number, and section/clause.

---

## 3. Core Workflow

```text
Upload multiple government documents
        ↓
Extract text & metadata
        ↓
Extract individual statements & claims
        ↓
Find statements discussing the same topic
        ↓
Compare their meaning and quantitative values
        ↓
Detect conflicts & contradictions
        ↓
Show conflicting statements side-by-side
        ↓
Show exact source document + page + section
        ↓
Provide an explainable verification report
```

---

## 4. Current Phase: Phase 1 — Project Foundation

This repository contains **Phase 1 (Project Foundation)** of GovVerify:
- **Frontend Architecture:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios.
- **Backend Architecture:** Python, FastAPI, PyMongo, Pydantic, Uvicorn.
- **Database Architecture:** MongoDB (`documents`, `statements`, `conflicts`, `evidence`, `analyses`, `users`).
- **File Storage:** Upload pipeline saving files to `uploads/` with metadata persistence in MongoDB.
- **UI Suite:** Landing Page (`/`), Dashboard (`/dashboard`), Documents Management (`/documents`), Analysis Pipeline (`/analysis`), Conflicts (`/conflicts`), Evidence (`/evidence`), Reports (`/reports`), and Settings (`/settings`).
- **Health Verification:** `/api/health` checking FastAPI backend and MongoDB connectivity.
- **Development Seed Engine:** Pre-seeded demo scholarship documents and conflicts for UI and database verification.

---

## 5. Technology Stack

### Frontend
- **Framework:** React.js 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Navy `#1F3347`, Teal `#0F766E`, Dark `#17212B`, Background `#F8F9F7`)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend
- **Language & Framework:** Python 3.10+ & FastAPI
- **Database Client:** PyMongo / MongoDB Atlas compatible
- **Server:** Uvicorn
- **Data Schemas:** Pydantic v2
- **File Uploads:** `python-multipart`

---

## 6. Future Architecture (Upcoming Phases)

```text
                 GOVERNMENT DOCUMENTS
                         │
                         ▼
                 Document Processing
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          PDF          DOCX         OCR
        Extraction    Extraction   Scanned
             │           │           │
             └──────────┼───────────┘
                         ▼
                  Statement Extraction
                         │
                         ▼
                 Structured Claims
                         │
                         ▼
               Sentence Transformer
                         │
                         ▼
                Semantic Embeddings
                         │
                         ▼
                 Similarity Matching
                         │
                         ▼
                    NLI Model
                         │
                         ▼
                 Conflict Engine
                         │
              ┌──────────┼───────────┐
              ▼          ▼           ▼
           Numeric      Date      Semantic
            Rules       Rules      Analysis
              │          │           │
              └──────────┼───────────┘
                         ▼
                  Conflict Results
                         │
                         ▼
                 Evidence Verification
                         │
                         ▼
                 Explainable Dashboard
```

---

## 7. Folder Structure

```text
government-document-conflict/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Logo.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── AnalysisPage.tsx
│   │   │   ├── ConflictsPage.tsx
│   │   │   ├── EvidencePage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── documents.py
│   │   │       ├── stats.py
│   │   │       └── router.py
│   │   ├── database/
│   │   │   └── mongodb.py
│   │   ├── schemas/
│   │   │   ├── document.py
│   │   │   ├── statement.py
│   │   │   ├── conflict.py
│   │   │   ├── evidence.py
│   │   │   └── analysis.py
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── uploads/
│   └── .gitkeep
├── .env.example
└── README.md
```

---

## 8. Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=govverify
FRONTEND_URL=http://localhost:5173
SECRET_KEY=govverify_dev_secret_key_2026
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## 9. How to Setup and Run

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# Install dependencies:
pip install -r requirements.txt

# Start backend server:
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite development server:
npm run dev
```

Open browser at `http://localhost:5173`.

---

## 10. API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | API Root Message |
| `GET` | `/api/health` | Health Check (Backend & MongoDB status) |
| `GET` | `/api/stats` | Dashboard Statistics |
| `GET` | `/api/documents` | List uploaded documents |
| `GET` | `/api/documents/{id}` | Get document by ID |
| `POST` | `/api/documents/upload` | Upload document file & save metadata |
| `DELETE` | `/api/documents/{id}` | Delete document & file |
| `POST` | `/api/documents/seed` | Seed demo scholarship data for testing |

---

## 11. Current Phase Acceptance Checklist

- [x] Landing page (`/`)
- [x] Dashboard (`/dashboard`)
- [x] Documents page (`/documents`)
- [x] Analysis page (`/analysis`)
- [x] Conflicts page (`/conflicts`)
- [x] Evidence page (`/evidence`)
- [x] Reports page (`/reports`)
- [x] Settings page (`/settings`)
- [x] Responsive layout & mobile navigation
- [x] FastAPI server startup
- [x] `/` & `/api/health` health endpoints
- [x] PyMongo MongoDB database connection & fallback handling
- [x] Configured CORS
- [x] Document upload API & file storage

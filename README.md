# 🏫 SchoolMate - Multi-Tenant School Management Platform

An enterprise-grade, multi-tenant School Management & Learning Platform (SaaS) engineered with a **classic, formal, and authoritative institutional aesthetic**, internal SQL database storage, zero setup cost, and full facilities for **Teachers, Students, and Parents**.

---

## 🌟 Comprehensive Stakeholder Portals

### 1. 👨‍🏫 Teacher Command Center & Workspaces (Web UI)
- **Live Instruction Period Indicator**: Real-time indicator of active instruction periods (e.g. *Grade 9-A Physics & Mechanics in Room 302*) with 1-click roll call launch.
- **Smart Daily Attendance**: 1-click **"Mark All Present"** batch operation, quick toggles (Present, Late, Absent, Excused), absent counter, and parent SMS/push alert trigger preview.
- **Interactive Matrix Gradebook**: Full continuous assessment spreadsheet with real-time percentages, letter grade bands, and **Export to CSV**.
- **Speed Grading Studio**: Canvas LMS-inspired side-by-side submission inspector, score grading, and AI-suggested constructive feedback.
- **Teacher AI Studio**: Evidence-based report card comment writer, 45-min inquiry lesson planner (Toddle/IB framework), 4-tier rubric builder, early intervention radar, and property/DB-based model configuration for **NVIDIA Build NIM** (`meta/llama-3.3-70b-instruct`) with zero-cost offline local fallback.
- **Parent Communications Channel**: Private inbox to review and reply to confidential inquiries from parents.

### 2. 🎒 Student Portal (Web UI)
- **Coursework & Homework Hub**: View assigned tasks, due dates, and open the interactive **"Turn In Assignment / Homework"** modal to submit answers online.
- **Continuous Academic Report Card**: View evaluated projects, scores earned, and teacher remarks.
- **Student Dashboard**: 100% attendance rate, 94% GPA average, positive conduct merits (+5 pts).
- **🔒 PIN-Protected Parent Zone (Parent Lock)**: Designed for shared family devices. Allows a parent to enter a 4-digit Parent Security PIN (`1234`) to unlock a confidential discussion room with teachers directly on the student's screen, keeping sensitive communications hidden from the child.

### 3. 👨‍👩‍👧 Parent Portal (Web UI)
- **Supervising Child Progress**: Daily attendance radar, morning arrival verification, and academic scorecards.
- **Confidential Parent-Teacher Discussion Room**: Direct 1-on-1 private messaging channel with Dr. Sarah Jenkins (and other subject educators) with instant reply capability.
- **Character & Merits Feed**: Live stream of positive behavior badges awarded to their child.

### 4. 🏫 Multi-Tenant SaaS & Data Isolation
- Any number of schools can register, log in, and operate with complete data sovereignty.
- Request-level tenant resolution via `x-tenant-code` headers and JWT token claims.
- **Instant School Switcher**: Pre-seeded with **Oakridge Global Academy** (`OAKRIDGE`) and **St. Jude High School** (`STJUDE`).

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd backend
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
*Backend runs on: `http://localhost:5000`*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🔑 1-Click Demo Login Personas

On `http://localhost:5173`, you can use the instant 1-click buttons:

| Stakeholder Role | Name | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- | :--- |
| 👨‍🏫 **Teacher (Faculty)** | Dr. Sarah Jenkins | `sarah.jenkins@oakridge.edu` | `password123` | Roll call, matrix gradebook, AI studio, parent messages |
| 🎒 **Student** | Leo Vance | `leo.vance@student.oakridge.edu` | `password123` | Turn in homework, view grades, unlock Parent Zone with PIN (`1234`) |
| 👨‍👩‍👧 **Parent** | David Vance | `david.vance@parent.oakridge.edu` | `password123` | Attendance radar, marks, confidential teacher discussion room |
| 🏫 **School Tenant 2** | Mr. Robert Vance | `robert.vance@stjude.edu` | `password123` | St. Jude High School tenant isolation |

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite (`schoolmate.db` zero-config default, PostgreSQL compatible), JWT, Bcrypt.
- **Frontend**: React 18, Vite, TypeScript, Custom Formal CSS Design System (Oxford Navy & Slate), Lucide React icons.
- **AI Orchestration**: NVIDIA Build / NIM API (`https://integrate.api.nvidia.com/v1`, `meta/llama-3.3-70b-instruct`) with local zero-cost fallback engine.

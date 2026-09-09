# Project Handoff & Technical Architecture Document (SIH26035)

**Project Name:** WeighMaster — Automated Test Report Generation System for Non-Automatic Weighing Instruments (NAWI)  
**Problem Statement:** SIH26035  
**Governing Standard:** OIML R 76-1 (2006) / ISO/IEC 17025  

---

## 1. What This Project Does
The application automates the end-to-end verification, calibration error calculation, legal metrology compliance assessment, and test report generation for Non-Automatic Weighing Instruments (NAWI) across Accuracy Classes I, II, III, and IIII. It eliminates manual rounding errors using the standard changeover point method, runs real-time statistical anomaly detection, and generates client-side ISO/IEC 17025 compliant test certificates in PDF format.

---

## 2. Tech Stack Overview

### Frontend
- **Framework:** Next.js 14 (App Router & Pages API Hybrid)
- **Library:** React 18
- **Styling:** Custom CSS with Government of India Portal Theme (`#f8fafc` canvas, `#0b2545` navy top-ribbon, tricolor accent, high-contrast accessible typography)
- **Icons & Visuals:** SVG & Lucide-React
- **PDF Engine:** jsPDF & jspdf-autotable (100% client-side offline capable)

### Backend
- **Runtime:** Node.js v20.x
- **API Framework:** Next.js Serverless Route Handlers (`/pages/api/*`)
- **Compliance Logic:** Modular mathematical metrology engines (OIML R-76, Bayesian Uncertainty, IQR Outliers)

### Database
- **Engine:** PostgreSQL (Target: PostgreSQL 14+)
- **Driver:** `pg` (Node-Postgres Connection Pool)
- **Schema:** Relational schema defined in `schema.sql` with UUID keys and audit timestamps

---

## 3. Current Features Completed

1. **Strict Authentication & Role Gating:**
   - Dual-role login: **Employee (Metrology Inspector)** & **Manager (Laboratory Admin)**.
   - Session preservation via local storage with global route guard in `AppShell.jsx`.
   - Dedicated sign-in page styled as an official Government of India portal.
2. **OIML R-76-1 (2006) Compliance Engine:**
   - Standard changeover point method: $P = I + 0.5e - \Delta L$, $E = P - L$, $E_c = E - E_0$.
   - Automatic evaluation against Maximum Permissible Error (MPE) thresholds for Classes I, II, III, and IIII.
   - Repeatability Standard Deviation and Reproducibility cross-set testing.
   - Type A Bayesian measurement uncertainty calculation ($k = 2$, 95% confidence).
3. **Interactive Test Wizard & Live Testing:**
   - Step-by-step guided workflow (Instrument Setup $\rightarrow$ Environmental Baseline $\rightarrow$ Multi-point Load Testing $\rightarrow$ Verification Verdict).
   - Instant real-time pass/fail indicators per load point.
4. **Statistical AI/ML Anomaly & Drift Detector:**
   - Interquartile Range (IQR) outlier detection on repeated readings.
   - Linear regression trend analysis to detect calibration drift slopes.
   - Skewness analysis to detect mechanical eccentricity or unlevel platforms.
5. **ISO/IEC 17025 PDF Generation:**
   - Client-side downloadable test certificate with certificate ID, laboratory header, tabular error breakdown, and dual inspector/manager signature blocks.
6. **Smart Analytics & Predictive Maintenance:**
   - Instrument ranking based on pass rates and stability scores.
   - Failure mode root-cause distribution.
   - Predictive days-to-maintenance estimation based on uncertainty growth curves.
7. **Instrument Registry:**
   - Full registry table with interactive "+ Register New Instrument" modal form.
8. **Comprehensive Multilingual Support (i18n):**
   - 6 official languages supported: English, Hindi (हिंदी), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), and Bengali (বাংলা).
   - Global reactive language switcher in the top government ribbon.
   - Persistent language selection stored in `localStorage`.
   - Complete UI coverage: navigation, dashboard KPIs, instrument modal, OIML calculator, report tables, settings tabs, and government footers.
9. **Strict Route-Level Authentication Guard:**
   - Unauthenticated visitors are strictly blocked and immediately redirected to `/login`.
   - Metrological credentials verification spinner prevents unauthorized content flashing.
   - Automatic redirection to `/` once authenticated.

10. **System & Laboratory Settings:**
   - 4-tab configuration panel for Laboratory Profile, OIML Parameters, IoT/Sensor ports, and Database connection status.

---

## 4. File Structure & Component Directory

```
sih26035-app/
├── app/
│   ├── analytics/
│   │   └── page.jsx           # Analytics, failure root-causes & predictive maintenance
│   ├── instruments/
│   │   └── page.jsx           # Instrument registry & management
│   ├── login/
│   │   └── page.jsx           # Official Government portal login page
│   ├── settings/
│   │   └── page.jsx           # System configuration & lab profile settings
│   ├── tests/
│   │   └── page.jsx           # Test reports history, details view & PDF export
│   ├── globals.css            # Official Government white/navy theme stylesheet
│   ├── layout.jsx             # Top-level layout wrapper
│   └── page.jsx               # Main dashboard & live OIML calculator
├── components/
│   ├── AppShell.jsx           # Top government bar, branding banner, auth gate & sidebar
│   ├── OimlCalculator.jsx     # Standalone single-point changeover method calculator
│   └── TestWizard.jsx         # Guided multi-step NAWI verification wizard
├── lib/
│   ├── analytics-engine.js    # Performance scoring, failure classification & maintenance prediction
│   ├── anomaly-detector.js    # IQR, drift regression & skewness calculations
│   ├── db.js                  # PostgreSQL pool initialization
│   ├── oiml-engine.js         # Core OIML R-76 compliance & uncertainty formulas
│   └── pdf-generator.js       # jsPDF report builder
├── pages/api/
│   ├── analytics.js           # REST endpoint for analytics metrics
│   ├── anomalies.js           # REST endpoint for anomaly analysis
│   ├── instruments.js         # REST endpoint for instrument CRUD
│   ├── login.js               # REST endpoint for user authentication
│   ├── tests/
│   │   └── index.js           # REST endpoint for test sessions
│   └── validate.js            # REST endpoint for OIML batch measurement validation
├── next.config.js             # Next.js build configuration
├── package.json               # Dependencies and scripts
└── schema.sql                 # PostgreSQL relational schema
```

---

## 5. Database Schema (`schema.sql`)

The database consists of three core tables:
- **`instruments`**: `id` (UUID PK), `manufacturer`, `model`, `serial_number` (UNIQUE), `accuracy_class` (CHECK I, II, III, IIII), `max_capacity`, `min_capacity`, `verification_scale_interval_e`, `created_at`.
- **`test_sessions`**: `id` (UUID PK), `instrument_id` (FK to instruments), `inspector_name`, `test_date`, `temperature`, `humidity`, `barometric_pressure`, `status`.
- **`weighing_tests`**: `id` (UUID PK), `session_id` (FK to test_sessions), `applied_load_l`, `indication_i`, `additional_load_dl`, `zero_error_e0`, `calculated_p`, `calculated_error_e`, `corrected_error_ec`, `mpe_allowed`, `result` (PASS/FAIL), `created_at`.

---

## 6. Environment Variables Required (for Cloud/Production Database)

Create a `.env.local` file in the project root with:
```env
DATABASE_URL=postgresql://<username>:<password>@<host>:5432/<database_name>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Is This App Fully Deployable? What Remains Before Live Production?

### Currently Working (Ready for Hackathon Demo & Local Presentation)
- ✅ All front-end workflows, calculators, and wizards run without errors.
- ✅ Client-side PDF generation works directly in browser with no external server dependencies.
- ✅ Mock data fallback operates seamlessly if PostgreSQL is not connected locally.
- ✅ Node.js v20 portable environment is configured and dev server is running on port 3000.

### What to Add for a Production Cloud Deployment (e.g. Vercel, AWS, Railway)
1. **Live PostgreSQL Instance**: Connect a live hosted PostgreSQL instance (e.g., Supabase, Neon, or AWS RDS) and execute `schema.sql`.
2. **Server-Side Session Cookies / JWT**: Replace `localStorage` token storage with `httpOnly` secure cookies for enterprise security audits.
3. **Hardware Serial Link (Web Serial API)**: Connect RS-232 / USB digital scale indicators via the browser's native `navigator.serial` API for automated live weight capture.
4. **Digital Signature Certificates (DSC)**: Integrate Indian PKI / eSign services for cryptographically tamper-evident legal metrology certificates.

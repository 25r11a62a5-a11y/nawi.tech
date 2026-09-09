# SIH26035 - Non-Automatic Weighing Instruments (NAWI) Automated Compliance & Analytics System

Winning Hackathon Solution for Problem Statement **SIH26035** (Development of a Software Program/Application for Generation of Test Reports for Non-Automatic Weighing Instruments).

---

## 🚀 Key Features

- 📐 **OIML R-76 (2006) Compliance Engine**: Automated calculation of Maximum Permissible Errors (MPE), repeatability standard deviation, reproducibility, and Type A Bayesian measurement uncertainty.
- 🤖 **AI/ML Anomaly Detection**: Real-time statistical analysis using Interquartile Range (IQR) outlier detection, linear regression drift detection, and skewness analysis.
- 📊 **Smart Analytics Dashboard**: Multi-tab analytics covering instrument rankings, failure root-cause analysis, predictive maintenance alerts, and compliance trends.
- 📄 **ISO/IEC 17025 PDF Generation**: Automated client-side generation of standardized test reports.
- 🗄️ **PostgreSQL Database Schema**: Production-ready SQL schema with relations, audit fields, and sample insertions.

---

## 📁 Project Structure

```
sih26035-app/
├── app/
│   ├── analytics/page.jsx       # Analytics & Predictive Maintenance Dashboard
│   ├── instruments/page.jsx     # Instrument Registry & Management
│   ├── tests/page.jsx           # Test Session History & Search
│   ├── globals.css              # Glassmorphism & Cyberpunk-inspired Styling
│   ├── layout.jsx               # Navigation & App Shell
│   └── page.jsx                 # Main Dashboard & OIML Calculator
├── components/
│   ├── OimlCalculator.jsx       # Real-time OIML R-76 Compliance Evaluator
│   └── TestWizard.jsx           # Guided 4-Step Test Wizard with Live Anomaly Alerts
├── lib/
│   ├── analytics-engine.js      # Business Intelligence & Ranking Engine
│   ├── anomaly-detector.js      # Statistical Anomaly & Drift Detector
│   ├── db.js                    # PostgreSQL Connection Pool Configuration
│   ├── oiml-engine.js           # OIML R-76 Standard Calculation Core
│   └── pdf-generator.js         # ISO/IEC 17025 Test Report Generator
├── pages/api/
│   ├── analytics.js             # Analytics REST Endpoint
│   ├── anomalies.js             # Anomaly Detection REST Endpoint
│   ├── instruments.js           # Instrument CRUD REST Endpoint
│   ├── validate.js              # OIML R-76 Validation REST Endpoint
│   └── tests/index.js           # Test Sessions REST Endpoint
├── package.json                 # Node Dependencies
├── next.config.js               # Next.js Configuration
└── schema.sql                   # Production PostgreSQL Database Schema
```

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Running Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Database Setup (Optional)
Import `schema.sql` into your PostgreSQL database instance:
```bash
psql -U postgres -d nawi_db -f schema.sql
```
Set your connection string in `.env.local`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/nawi_db
```

<p align="center">
  <img src="https://img.shields.io/badge/BIM-Quality%20Assurance-emerald?style=for-the-badge" alt="BIM QA"/>
  <img src="https://img.shields.io/badge/IFC-4.0-blue?style=for-the-badge" alt="IFC 4.0"/>
  <img src="https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge" alt="AI Powered"/>
</p>

# 🚢 Ship the BIM

**Ship the BIM** is an AI-powered BIM (Building Information Modeling) quality assurance platform that validates IFC files against configurable compliance profiles. It combines deterministic rule checking with LLM-powered analysis to ensure your BIM models are ready for delivery.

## ✨ Features

### 🔍 Intelligent Validation Pipeline
- **Deterministic Scanning**: Rule-based validation using ifcOpenShell for property existence, value checks, naming conventions, and numeric constraints
- **AI-Powered Analysis**: LLM + MCP (Model Context Protocol) for complex custom rule validation
- **Context-Aware Reasoning**: Deduplication, enrichment, and intelligent suggestions using Gemini/OpenAI/MiniMax

### 📋 Compliance Profiles
- Pre-built profiles for regional standards (e.g., German BIM requirements)
- Customizable rules for:
  - Property existence (`PROPERTY_EXISTENCE`)
  - Property values (`PROPERTY_VALUE`)
  - Numeric constraints (`PROPERTY_NUMERIC_GT`)
  - Naming conventions (`NAMING_NORMALIZATION`)
  - Terminology drift detection (`TERMINOLOGY_DRIFT`)
  - Custom AI-powered checks (`CUSTOM`)

### 🌐 bSDD Integration
- buildingSMART Data Dictionary (bSDD) integration for:
  - Allowed values lookup
  - Classification search
  - Terminology normalization
  - Multi-language support (EN/DE)

### 📊 Readiness Scoring
- Overall readiness score calculation
- Category-specific scores:
  - Object Classification
  - Property Sets
  - Naming Conventions
- "Ready to Ship" status indicator

### 🔧 Auto-Fix Capabilities
- Apply suggested fixes directly to IFC files
- Property value corrections
- Terminology standardization
- Download fixed IFC files

### 📤 Export Options
- Excel reports with multiple sheets
- BCF (BIM Collaboration Format) export
- Detailed issue summaries

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  Dashboard  │  │ Readiness Report │  │     Settings      │  │
│  └─────────────┘  └──────────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Pipeline Orchestrator                  │   │
│  │  ┌────────────────┐  ┌─────────────┐  ┌───────────────┐  │   │
│  │  │  Deterministic │  │  AI Agent   │  │   Reasoner    │  │   │
│  │  │    Scanner     │  │  (LLM+MCP)  │  │   (Enricher)  │  │   │
│  │  └────────────────┘  └─────────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │   IFC MCP     │  │  bSDD Client  │  │  Supabase Store   │   │
│  │   Server      │  │               │  │                   │   │
│  └───────────────┘  └───────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Python** 3.12+
- **Node.js** 18+
- **pnpm** (recommended) or npm
- **uv** (Python package manager)
- **Supabase** account (for database)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NSVEGUR/ship-the-dam-bim.git
   cd ship-the-dam-bim
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   # LLM Providers
   GOOGLE_API_KEY=your-google-api-key
   OPENAI_API_KEY=your-openai-api-key
   MINIMAX_API_KEY=your-minimax-api-key
   
   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-service-role-key
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
   
   Fill in your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Installation & Running

1. **Install Backend Dependencies**
   ```bash
   cd backend
   uv sync
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   uv run uvicorn main:app --reload
   ```
   The API will run at `http://localhost:8000`

4. **Start Frontend Server**
   ```bash
   cd frontend
   pnpm dev
   ```
   The app will run at `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/profiles` | List available compliance profiles |
| `POST` | `/scan` | Upload IFC/CSV and run validation pipeline |
| `POST` | `/fix` | Apply suggested fixes to IFC file |

### Scan Request Example

```bash
curl -X POST "http://localhost:8000/scan" \
  -F "file=@model.ifc" \
  -F "profile_id=Germany Demo Profile" \
  -F "project_id=123" \
  -F "llm_provider=gemini"
```

## 🗄️ Database Schema (Supabase)

### Tables
- **projects** - Project metadata
- **profiles** - Compliance profile definitions
- **reports** - Scan report metadata and scores
- **missing_properties** - Detailed issue records
- **terminology_mappings** - Terminology normalization data
- **issue_summaries** - Aggregated rule statistics

## 🤖 LLM Providers

Ship the BIM supports multiple LLM providers:

| Provider | Model | Use Case |
|----------|-------|----------|
| **Gemini** | gemini-2.5-flash-lite | Default, fast reasoning |
| **OpenAI** | gpt-5.2 | Fallback, high quality |
| **MiniMax** | M2-her | Alternative provider |

## 📁 Project Structure

```
ship-the-dam-bim/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints.py    # REST API routes
│   │   ├── mcp/
│   │   │   ├── ifc_mcp.py      # MCP server for IFC tools
│   │   │   └── ifc_util.py     # IFC utility functions
│   │   ├── pipeline/
│   │   │   ├── orchestrator.py # Main pipeline coordinator
│   │   │   ├── deterministic.py# Rule-based scanning
│   │   │   ├── ai.py           # LLM + MCP AI agent
│   │   │   ├── reasoner.py     # Context-aware enrichment
│   │   │   ├── ifc_fixer.py    # Auto-fix application
│   │   │   ├── models.py       # Pydantic data models
│   │   │   └── llm_providers.py# LLM abstraction layer
│   │   ├── storage/
│   │   │   ├── supabase_store.py # Database operations
│   │   │   └── profiles.py     # Profile management
│   │   └── terminology/
│   │       └── bsdd_client.py  # bSDD API client
│   └── pyproject.toml
│
└── frontend/
    ├── app/
    │   ├── page.tsx            # Dashboard
    │   ├── readiness-report/   # Report page
    │   ├── settings/           # Settings page
    │   └── user/               # User profile
    ├── components/
    │   ├── dashboard/          # Dashboard components
    │   ├── report/             # Report components
    │   └── ui/                 # shadcn/ui components
    └── package.json
```

## 🔧 Validation Rules

### Built-in Check Types

| Check Type | Description | Example |
|------------|-------------|---------|
| `PROPERTY_EXISTENCE` | Verify property exists | Fire rating on doors |
| `PROPERTY_VALUE` | Validate against allowed values | Occupancy types |
| `PROPERTY_NUMERIC_GT` | Numeric greater-than check | Door dimensions > 0 |
| `NAMING_NORMALIZATION` | Consistent naming patterns | Element naming |
| `TERMINOLOGY_DRIFT` | Detect terminology inconsistencies | Value standardization |
| `CUSTOM` | AI-powered custom validation | Complex logic |

### Example Profile Rule

```json
{
  "id": "DE-D01",
  "name": "Doors: FireRating required",
  "check_type": "PROPERTY_EXISTENCE",
  "entity_type": "IfcDoor",
  "property_set": "Pset_DoorCommon",
  "property_name": "FireRating",
  "allowed_values": ["EI30", "EI60", "EI90", "F30", "F60", "F90"],
  "severity": "BLOCKER",
  "description": "Required for submission QA"
}
```

## 🧪 Testing with Streamlit

A Streamlit test interface is included for backend testing:

```bash
cd backend
uv run streamlit run app/test/streamlit_app.py
```

## 📝 Issue Types

| Type | Description |
|------|-------------|
| `MISSING_PROPERTY` | Required property not found |
| `INVALID_VALUE` | Property value not in allowed list |
| `TERMINOLOGY_MISMATCH` | Inconsistent terminology detected |
| `GEOMETRY_ERROR` | Geometric validation failure |

## 🎯 Severity Levels

| Level | Description |
|-------|-------------|
| `BLOCKER` | Must fix before delivery |
| `CRITICAL` | Serious issue |
| `MAJOR` | Significant problem |
| `MINOR` | Minor improvement |
| `INFO` | Informational |

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern async Python web framework
- **ifcOpenShell** - IFC file parsing and manipulation
- **LangChain** - LLM orchestration framework
- **LangGraph** - ReAct agent implementation
- **MCP** - Model Context Protocol for tool calling
- **Supabase** - PostgreSQL database
- **bsdd** - buildingSMART Data Dictionary client

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase JS** - Database client
- **xlsx** - Excel export

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

* **Mia** 🧙‍♀️✨ (Making magic happen)
* **Irfan** 🚀🔥 (Shipping at lightspeed)
* **Nagasai** 🧠💡 (The Big Brain)
* **Levin** 🥷👾 (The Code Ninja)
* **Ozan** ☕💻 (Powered by caffeine)


## Built with ❤️ for the AEC industry

---

<p align="center">
  <strong>Ship the BIM</strong> - Because every BIM deserves to be delivered with confidence 🚢
</p>



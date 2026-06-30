# 🚀 Intelligent Next Best Action Platform

> An AI-powered, Planner-Based Multi-Agent Decision Intelligence Platform that helps organizations make faster, smarter, and explainable business decisions using Retrieval-Augmented Generation (RAG), Google Gemini, and Human-in-the-Loop validation.

---

## 📌 Overview

The **Intelligent Next Best Action Platform** is an enterprise-grade Decision Intelligence System designed to assist organizations in analyzing incidents, retrieving enterprise knowledge, evaluating risks, and generating explainable recommendations.

Unlike traditional AI chatbots, this platform utilizes a **Planner-Based Multi-Agent Architecture** that dynamically orchestrates specialized AI agents to solve complex business problems.

The platform has been demonstrated in the **Enterprise Cybersecurity Incident Response** domain but is designed to be reusable across multiple industries including Healthcare, Banking, HR, Customer Success, Sales, and IT Operations.

---

# ✨ Key Features

- 🤖 Planner-Based Multi-Agent Architecture
- 🧠 Google Gemini Powered AI
- 📚 Retrieval-Augmented Generation (RAG)
- 🗂 Enterprise Knowledge Retrieval
- 📈 Risk Assessment Engine
- 💡 Explainable Next Best Action Recommendations
- 🧠 Shared Organizational Memory
- 👨‍💼 Human-in-the-Loop (HITL) Validation
- 📊 Incident Dashboard & Analytics
- 🔒 Authentication & Authorization
- 📂 File Upload & Evidence Processing
- ⚡ FastAPI REST APIs
- 🌐 Modern React Dashboard

---

# 🏗 System Architecture

```
                    User Dashboard
                           │
                           ▼
                 FastAPI Backend APIs
                           │
                           ▼
              Planner Agent (Orchestrator)
                           │
 ┌───────────┬──────────┬───────────┬─────────────┬─────────────┐
 │           │          │           │             │             │
 ▼           ▼          ▼           ▼             ▼             ▼
Incident   Context   History    Memory        Risk       Recommendation
 Agent      Agent     Agent      Agent         Agent         Agent
                           │
                           ▼
          Enterprise Knowledge Base (RAG)
                           │
                           ▼
               Human-in-the-Loop Review
                           │
                           ▼
              MongoDB + Shared Memory
```

---

# 🧠 AI Agents

## 1. Planner Agent

Acts as the central orchestrator.

Responsibilities:

- Understands incoming requests
- Creates execution plans
- Dynamarily selects specialized AI agents
- Coordinates agent communication

---

## 2. Incident Agent

Responsible for:

- Incident understanding
- Severity classification
- Entity extraction
- Security issue identification

---

## 3. Context Agent

Responsible for:

- Collecting missing information
- Customer history retrieval
- Asset information retrieval
- Business context enrichment

---

## 4. History Agent

Responsible for:

- Similar incident retrieval
- Previous resolutions
- Historical pattern analysis

---

## 5. Memory Agent

Responsible for:

- Long-term organizational memory
- Learning from analyst feedback
- Recommendation history
- Resolution history

---

## 6. Risk Assessment Agent

Responsible for:

- Business impact analysis
- Severity estimation
- Risk scoring
- Incident prioritization

---

## 7. Recommendation Agent

Responsible for generating:

- Next Best Actions
- Supporting evidence
- AI reasoning
- Confidence score

---

# 📚 Enterprise Knowledge Sources

The RAG pipeline retrieves information from:

- Security Playbooks
- Organizational Policies
- Threat Intelligence
- Customer History
- Asset Inventory
- Security Documentation
- Best Practices
- Internal Knowledge Base

---

# 🔄 Workflow

### Step 1

User submits an incident.

↓

### Step 2

Backend validates and stores the request.

↓

### Step 3

Planner Agent creates an execution plan.

↓

### Step 4

Incident Agent analyzes the incident.

↓

### Step 5

Context Agent gathers missing information.

↓

### Step 6

History Agent retrieves similar incidents.

↓

### Step 7

Memory Agent retrieves previous recommendations.

↓

### Step 8

RAG retrieves enterprise knowledge.

↓

### Step 9

Risk Assessment Agent evaluates business impact.

↓

### Step 10

Recommendation Agent generates explainable actions.

↓

### Step 11

Human Expert reviews recommendations.

↓

### Step 12

Approved recommendation is stored in MongoDB and Shared Memory.

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Backend

- FastAPI
- Python

## Database

- MongoDB

## AI

- Google Gemini
- Planner-Based Multi-Agent Architecture
- Retrieval-Augmented Generation (RAG)

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```
enterprise-decision-platform/

│
├── backend/
│   ├── agents/
│   ├── services/
│   ├── api/
│   ├── database/
│   ├── models/
│   ├── prompts/
│   ├── shared/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── App.tsx
│
├── docs/
├── README.md
└── requirements.txt
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/enterprise-decision-platform.git
```

```
cd enterprise-decision-platform
```

---

## Backend Setup

Create virtual environment

```bash
python -m venv venv
```

Activate environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
python -m uvicorn backend.main:app --reload
```

Backend URL

```
http://localhost:8000
```

---

## Frontend Setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🔐 Environment Variables

Example `.env`

```
MONGODB_URI=your_mongodb_connection_string

DATABASE_NAME=enterprise_decision_platform

GEMINI_API_KEY=your_google_gemini_key

JWT_SECRET_KEY=your_secret_key
```

---

# 🎯 Business Applications

This platform can be adapted for:

- Enterprise Cybersecurity
- Customer Success
- Sales Intelligence
- Healthcare
- Banking & Finance
- Human Resources
- IT Operations
- Energy & Utilities

---

# 📈 Future Enhancements

- Multi-LLM Support
- Agent Marketplace
- Voice-Based Incident Reporting
- Real-Time Streaming Responses
- Kubernetes Deployment
- Vector Database Integration
- Fine-Tuned Enterprise Models
- Advanced Analytics Dashboard

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a feature branch

```
git checkout -b feature/new-feature
```

3. Commit changes

```
git commit -m "Add new feature"
```

4. Push branch

```
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Authors

**Eshwar Pokala**

AI Developer | Full Stack Developer

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.
"# Enterprise-AI-" 

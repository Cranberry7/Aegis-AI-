<h1 align="center">Aegis AI</h1>
<p align="center">Enterprise AI Knowledge Platform</p>

<div align="center">
  
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-22.13-green.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)
![React](https://img.shields.io/badge/React-18.3-blue.svg)

**An enterprise-grade AI-powered customer support platform leveraging multi-agent orchestration, RAG, and real-time streaming**

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Docker](#running-with-docker)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Aegis AI** is a production-ready, microservices-based intelligent customer support platform that automates query resolution using advanced AI techniques. The system combines **Retrieval-Augmented Generation (RAG)**, **multi-agent orchestration**, and **real-time streaming** to provide context-aware, accurate responses to customer queries.

### Key Highlights

- 🎯 **Multi-Agent AI System** - Coordinated team of specialized agents for query processing
- 📚 **RAG Pipeline** - Semantic search over documents, PDFs, videos, and web content
- ⚡ **Real-time Streaming** - SSE-based response streaming with live status updates
- 🔐 **Enterprise Security** - JWT authentication, RBAC, multi-tenant architecture
- 📊 **Observability** - Comprehensive logging, tracing, and monitoring
- 🐳 **Production Ready** - Dockerized microservices with Traefik reverse proxy

---

## ✨ Features

### 🤖 AI & Intelligence

- **Multi-Agent Orchestration** using **Agno** framework
  - Query expansion agent for better search results
  - Video search agent for multimedia content
  - Descriptor agent for content analysis
  - Customer support team lead for coordination
- **RAG (Retrieval-Augmented Generation)** with Milvus vector database
- **Semantic Search** with sentence-transformers embeddings
- **Re-ranking** for improved retrieval accuracy
- **Agentic Memory** - Persistent conversation history and user context
- **Structured Outputs** using Instructor library

### 📄 Document Processing

- **Multi-format Support**
  - PDF documents with OCR (Mistral AI)
  - Markdown files
  - OpenAPI specifications
  - YouTube video transcripts
  - Web scraping (Crawl4AI, Playwright)
- **Intelligent Chunking** - Semantic text segmentation
- **Batch Processing** - Asynchronous document ingestion via Celery
- **AWS S3 Integration** - Scalable document storage
- **Video Processing** - FFmpeg-based video handling

### 💬 Real-time Communication

- **Server-Sent Events (SSE)** for streaming responses
- **RabbitMQ** event-driven architecture
- **Redis Pub/Sub** for real-time updates
- **WebSocket-ready** infrastructure

### 🎨 User Interface

- **Modern React Frontend** with TypeScript
- **Real-time Chat Interface** with markdown rendering
- **Syntax Highlighting** for code blocks
- **PDF Viewer** integration
- **Infinite Scroll** conversations
- **Dark/Light Theme** support
- **Admin Dashboard**
  - User management
  - Document history
  - Conversation analytics
  - Training material upload

### 🔒 Security & Access Control

- **JWT Authentication** with refresh tokens
- **Role-Based Access Control (RBAC)**
- **Multi-tenant Architecture**
- **Rate Limiting** (SlowAPI)
- **Email Verification**
- **Secure Cookie Management**

### 📊 Observability & Monitoring

- **Langfuse** - LLM tracing and analytics
- **OpenTelemetry** - Distributed tracing
- **Winston CloudWatch** - Centralized logging
- **OpenLit** - AI observability
- **Request ID Tracking** - End-to-end request tracing

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Traefik Reverse Proxy                    │
│                         (Port 80, 8080)                          │
└────────────┬────────────────────────────┬───────────────────────┘
             │                            │
             │                            │
    ┌────────▼─────────┐        ┌────────▼──────────┐
    │  Agent Frontend  │        │  Agent Backend    │
    │   (React/Vite)   │        │    (NestJS)       │
    │   Port: 5173     │        │   Port: 7082      │
    └──────────────────┘        └────────┬──────────┘
                                         │
                                         │
                          ┌──────────────┼──────────────┐
                          │              │              │
                 ┌────────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
                 │  PostgreSQL  │  │ RabbitMQ │  │   AWS    │
                 │  (Prisma)    │  │  Events  │  │    S3    │
                 │  Port: 5433  │  │Port: 5673│  │ Storage  │
                 └──────────────┘  └──────────┘  └──────────┘
                          
                          ┌──────────────────────────────┐
                          │      Agent Core (FastAPI)    │
                          │        Port: 8082            │
                          └────────┬─────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
           ┌────────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
           │    Redis     │  │  Milvus  │  │  Celery  │
           │  Streaming   │  │  Vector  │  │  Worker  │
           │  Port: 6379  │  │    DB    │  │  Tasks   │
           └──────────────┘  └──────────┘  └──────────┘
```

### System Flow

1. **User Query** → Frontend sends query to Backend
2. **Backend** → Authenticates, validates, forwards to Agent Core via RabbitMQ
3. **Agent Core** → Multi-agent team processes query
   - Query expansion for better search
   - Vector search in Milvus knowledge base
   - Re-ranking and context retrieval
   - LLM generates response with RAG
4. **Streaming Response** → Redis Pub/Sub → SSE → Frontend
5. **Persistence** → Conversation saved to PostgreSQL

---

## 🛠️ Tech Stack

### Backend (agent-backend)

| Category | Technologies |
|----------|-------------|
| **Framework** | NestJS 10.0, TypeScript 5.1 |
| **Database** | PostgreSQL, Prisma ORM 6.12 |
| **Message Queue** | RabbitMQ (AMQP), amqp-connection-manager |
| **Authentication** | JWT, bcrypt, cookie-parser |
| **Storage** | AWS S3 SDK, Multer |
| **Email** | Nodemailer, @nestjs/mailer |
| **Logging** | Winston, winston-cloudwatch |
| **API Docs** | Scalar API Reference, OpenAPI |
| **Validation** | class-validator, class-transformer |
| **Testing** | Jest, Supertest |

### AI Core (agent-core)

| Category | Technologies |
|----------|-------------|
| **Framework** | FastAPI 0.115, Python 3.12+ |
| **AI/ML** | Agno, Google Gemini, Groq, Mistral AI, Ollama |
| **Embeddings** | sentence-transformers, HuggingFace |
| **Vector DB** | Milvus (pymilvus) |
| **LLM Tools** | Instructor, Langchain components |
| **Task Queue** | Celery 5.4, Redis 5.2 |
| **Web Scraping** | Crawl4AI, Playwright, BeautifulSoup |
| **Document Processing** | pdf2image, PyPDF2, python-docx |
| **Video** | youtube-transcript-api, FFmpeg |
| **Observability** | Langfuse, OpenTelemetry, OpenLit, Loguru |
| **Optimization** | ONNX Runtime, model quantization |
| **Rate Limiting** | SlowAPI |

### Frontend (agent-frontend)

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18.3, TypeScript 5.6, Vite 6.0 |
| **Styling** | TailwindCSS 4.0, SASS, Emotion |
| **UI Components** | Radix UI, shadcn/ui |
| **State Management** | Zustand 5.0 |
| **Forms** | React Hook Form 7.54, Zod validation |
| **Routing** | React Router DOM 7.1 |
| **Animation** | Framer Motion 12.4 |
| **Markdown** | react-markdown, remark-gfm |
| **Code Highlighting** | react-syntax-highlighter |
| **PDF Viewer** | react-pdf 10.0 |
| **HTTP Client** | Axios 1.7 |
| **Tables** | TanStack Table 8.21 |
| **Notifications** | Notistack 3.0 |

### Infrastructure

- **Containerization**: Docker, Docker Compose
- **Reverse Proxy**: Traefik 3.0
- **CI/CD**: GitLab CI
- **Code Quality**: ESLint, Prettier, Husky, Ruff (Python)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 22.13
- **Python** >= 3.12
- **Docker** & Docker Compose
- **PostgreSQL** 15+
- **Redis** 7+
- **RabbitMQ** 3.x
- **Milvus** 2.5+ (Vector Database)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sarvaha-ai.git
cd sarvaha-ai
```

#### 2. Setup Agent Backend (NestJS)

```bash
cd agent-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:deploy

# Start development server
npm run start:dev
```

The backend will be available at `http://localhost:7082`

#### 3. Setup Agent Core (FastAPI/Python)

```bash
cd agent-core

# Run setup script (creates venv, installs dependencies)
bash setup.sh

# Or manual setup:
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install --upgrade pip
poetry install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
poetry run start:dev

# Start Celery worker (in separate terminal)
poetry run run:celery
```

The core API will be available at `http://localhost:8082`

#### 4. Setup Agent Frontend (React)

```bash
cd agent-frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running with Docker

#### Create Docker Network

```bash
docker network create ai_agents_nw
```

#### Start All Services

```bash
# Start backend services
cd agent-backend
docker-compose up -d

# Start core services
cd ../agent-core
docker-compose up -d

# Start frontend
cd ../agent-frontend
docker-compose up -d
```

#### Access Services

- **Frontend**: http://localhost (via Traefik)
- **Backend API**: http://localhost/agent-backend
- **Core API**: http://localhost/core
- **Traefik Dashboard**: http://localhost:8080
- **Backend API Docs**: http://localhost:7082/agent-backend/docs
- **RabbitMQ Management**: http://localhost:15673

---

## 📁 Project Structure

```
sarvaha-ai/
├── agent-backend/              # NestJS Backend Service
│   ├── src/
│   │   ├── account/           # Account management
│   │   ├── auth/              # Authentication & authorization
│   │   ├── aws/               # AWS S3 integration
│   │   ├── common/            # Shared utilities, guards, filters
│   │   ├── communication/     # Email service
│   │   ├── conversations/     # Chat conversation management
│   │   ├── document/          # Document CRUD operations
│   │   ├── prisma/            # Prisma ORM module
│   │   ├── rabbitmq/          # RabbitMQ messaging
│   │   ├── sessions/          # User session management
│   │   ├── training/          # Training material processing
│   │   └── user/              # User management
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── agent-core/                 # FastAPI AI Core Service
│   ├── app/
│   │   ├── common/            # Constants, enums, prompts
│   │   ├── config/            # Configuration management
│   │   ├── middlewares/       # FastAPI middlewares
│   │   ├── modules/
│   │   │   ├── core/          # AI agent orchestration
│   │   │   │   ├── agents/    # Specialized AI agents
│   │   │   │   ├── teams/     # Multi-agent teams
│   │   │   │   ├── tools/     # Agent tools
│   │   │   │   └── workflows/ # Agent workflows
│   │   │   ├── data/          # Embeddings & chunking
│   │   │   ├── db/            # Database connections
│   │   │   ├── training/      # Document processing
│   │   │   ├── rabbitmq/      # Event handling
│   │   │   └── streaming/     # SSE streaming
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helper functions
│   ├── scripts/               # Utility scripts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pyproject.toml
│
└── agent-frontend/             # React Frontend
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Route pages
    │   ├── features/          # Feature modules
    │   ├── hooks/             # Custom React hooks
    │   ├── services/          # API services
    │   ├── store/             # Zustand state management
    │   ├── types/             # TypeScript types
    │   ├── utils/             # Utility functions
    │   └── App.tsx            # Main application
    ├── public/
    ├── Dockerfile
    ├── docker-compose.yml
    └── package.json
```

---

## 📚 API Documentation

### Backend API

Interactive API documentation is available via Scalar:

- **Development**: http://localhost:7082/agent-backend/docs
- **Production**: https://your-domain.com/agent-backend/docs

### Core API

FastAPI auto-generated documentation:

- **Swagger UI**: http://localhost:8082/docs
- **ReDoc**: http://localhost:8082/redoc
- **OpenAPI Schema**: http://localhost:8082/openapi.json

### Key Endpoints

#### Authentication
```
POST   /agent-backend/auth/login          # User login
POST   /agent-backend/auth/register       # User registration
POST   /agent-backend/auth/logout         # User logout
GET    /agent-backend/auth/verify-email   # Email verification
```

#### Chat & Conversations
```
POST   /core/chat                         # Send chat message (SSE stream)
GET    /agent-backend/sessions            # Get user sessions
POST   /agent-backend/sessions            # Create new session
GET    /agent-backend/conversations/:id   # Get conversation history
```

#### Training & Documents
```
POST   /agent-backend/training/upload     # Upload training materials
GET    /agent-backend/documents           # List documents
DELETE /agent-backend/documents/:id       # Delete document
POST   /core/training/process             # Process documents (async)
```

#### User Management (Admin)
```
GET    /agent-backend/users               # List all users
POST   /agent-backend/users/invite        # Invite users
PUT    /agent-backend/users/:id           # Update user
DELETE /agent-backend/users/:id           # Delete user
```

---

## ⚙️ Configuration

### Environment Variables

#### Agent Backend (.env)

```env
# Environment & Service
ENVIRONMENT=DEV
SERVICE_NAME=sarvaha-ai
BACKEND_PORT=7082
FRONTEND_BASE_URL=http://localhost:5173
AGENT_CORE_URL=http://localhost:8082

# Database
DATABASE_URL=postgresql://user:password@localhost:5433/sarvaha_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=100d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=sarvaha-documents
AWS_CLOUDWATCH_LOGGER_GROUP=/sarvaha/backend

# RabbitMQ
RABBIT_MQ_URL=amqp://guest:guest@localhost:5673

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Agent Core (.env)

```env
# Application
ENVIRONMENT=DEV
AGENT_CORE_PORT=8082
CORS_ORIGINS=http://localhost:5173

# LLM
LLM_API_KEY=your-gemini-api-key
LLM_MODEL_NAME=gemini-2.0-flash-exp

# Vector Database (Milvus)
VECTOR_DB_URI=http://localhost:19530
VECTOR_DB_TOKEN=your-milvus-token
TEXT_COLLECTION_NAME=sarvaha_text_kb
VIDEO_COLLECTION_NAME=sarvaha_video_kb
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Celery
CELERY_BROKER=redis://localhost:6379/0

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5673

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=sarvaha-documents
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Observability
LANGFUSE_PUBLIC_KEY=your-public-key
LANGFUSE_SECRET_KEY=your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com
ENABLE_TRACING=true

# Rate Limiting
GLOBAL_RATE_LIMIT_COUNT=100
GLOBAL_RATE_LIMIT_UNIT=minute
CHAT_RATE_LIMIT_COUNT=10
CHAT_RATE_LIMIT_UNIT=minute
```

#### Agent Frontend (.env)

```env
VITE_BACKEND_URL=http://localhost:7082/agent-backend
VITE_CORE_URL=http://localhost:8082
```

---

## 💻 Development

### Backend Development

```bash
cd agent-backend

# Run in watch mode
npm run start:dev

# Run tests
npm run test
npm run test:e2e
npm run test:cov

# Linting & formatting
npm run lint
npm run format

# Database operations
npm run prisma:generate      # Generate Prisma client
npm run prisma:dev           # Create migration
npm run prisma:deploy        # Apply migrations
npm run prisma:db-seed       # Seed database
```

### Core Development

```bash
cd agent-core

# Run with auto-reload
poetry run start:dev

# Run Celery worker
poetry run run:celery

# Linting & formatting
poetry run run:linter
poetry run run:linter:fix

# Pre-commit hooks
poetry run run:pre-commit

# Model optimization
poetry run run:quantize-reranker
```

### Frontend Development

```bash
cd agent-frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting & formatting
npm run lint
npm run format
```

---

## 🚢 Deployment

### Production Build

#### Backend
```bash
cd agent-backend
npm run build
npm run start:prod
```

#### Core
```bash
cd agent-core
poetry run start:prod
```

#### Frontend
```bash
cd agent-frontend
npm run build
# Serve the dist/ folder with nginx or similar
```

### Docker Production

```bash
# Build and run all services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale core=3
```

### Environment Considerations

- Set `ENVIRONMENT=PROD` in all services
- Use strong `JWT_SECRET`
- Enable HTTPS with proper SSL certificates
- Configure CloudWatch logging
- Set up proper database backups
- Enable rate limiting
- Configure CORS for production domains
- Use managed services (RDS, ElastiCache, etc.) for databases

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

⭐ Star this repo if you find it helpful!

</div>

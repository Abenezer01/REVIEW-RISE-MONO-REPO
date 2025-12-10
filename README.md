# 🚀 Platform Monorepo: AI-Powered Local Marketing & SEO

This monorepo contains the complete codebase for the platform, an AI-powered SaaS application focused on:

- Local Search Engine Optimization (SEO)
- Google Business Profile (GBP) management
- Review response automation (SmartReviews)
- Social media content scheduling (SocialRise)

The codebase is structured around a multi-service, shared-database architecture to ensure high scalability, transactional integrity, and clear separation of business concerns.

---

## 🧱 Architecture Overview

| Component | Technology | Description |
|-----------|------------|-------------|
| Monorepo Manager | pnpm Workspaces | Manages dependencies efficiently, links shared packages, and orchestrates scripts across all microservices and libraries. |
| Frontend/Gateway | Next.js | Provides the user interface and serves as the primary API Gateway (`/api`) for client-side requests. |
| Backend | Express / TypeScript | Collection of independent microservices (e.g., `express-auth`, `express-ai`) optimized for specific business domains. |
| Data Layer | PostgreSQL / Prisma | Single shared database for transactional integrity, with Row-Level Security (RLS) managed by Prisma Middleware for multi-tenancy. |
| Asynchronous Jobs | Redis / BullMQ | Decouples latency-sensitive API calls from heavy processing tasks (e.g., LLM generation, scheduled crawling). |
| Deployment | Docker / Kubernetes | All services are independently containerized for scalable deployment via Kubernetes. |

---

## ⚙️ Local Development Setup

### Prerequisites

- Node.js (LTS/20.x or higher)  
- pnpm (preferred package manager for monorepo efficiency)  
- Docker & Docker Compose (for local database and queue infrastructure)  

### Getting Started (3 Steps)

1. **Install Dependencies**  

```bash
pnpm install
This links all shared packages so they can be imported across apps and services.

Start Infrastructure

bash
Copy code
docker compose -f infra/docker-compose.yml up -d
Launches PostgreSQL and Redis for local development.

Run Development Servers

bash
Copy code
pnpm dev:all
Starts all necessary microservices and the Next.js frontend concurrently.
The application is accessible at http://localhost:3000.

🗺️ Workspace Map
Applications (apps/) – Deployable Services
Service Directory	Core Responsibility
next-web	Frontend UI and API Gateway
express-auth	User Authentication, Billing, and Atomic Quota Debit
express-reviews	Review Ingestion and Reply Workflow Orchestration
express-ai	LLM Prompting, Auditing, and Token Cost Calculation
worker-jobs	Long-running background tasks (e.g., SEO Crawls, bulk data sync)

Packages (packages/) – Shared Libraries
Package Name	Purpose
@platform/db	Centralized Prisma Schema, Database Client, and Migration files
@platform/types	Shared TypeScript interfaces and Data Transfer Objects (DTOs)
@platform/auth	JWT Validation, RBAC, and Async Local Storage setup for multi-tenancy
@platform/queues	Standardized BullMQ queue definitions and event types

⚡ Key Monorepo Commands
Command	Description
pnpm install	Installs all dependencies and links workspaces
pnpm dev:all	Starts all applications in watch/development mode
pnpm build:all	Compiles TypeScript for all services and runs Next.js production build
pnpm lint	Runs ESLint and Prettier across all apps/ and packages/
pnpm test	Executes unit and integration tests across the entire codebase

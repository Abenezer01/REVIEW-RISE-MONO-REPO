🚀 Platform Monorepo: AI-Powered Local Marketing & SEO
This monorepo contains the complete codebase for the platform, an AI-powered SaaS application focused on local search engine optimization (SEO), Google Business Profile (GBP) management, review response automation (SmartReviews), and social media content scheduling (SocialRise).

The codebase is structured around a multi-service, shared-database architecture to ensure high scalability, transactional integrity, and clear separation of business concerns.

🧱 Architecture Overview
Component	Technology	Description
Monorepo Manager	pnpm Workspaces	Used to manage dependencies efficiently, link shared packages, and orchestrate scripts across all microservices and libraries.
Frontend/Gateway	Next.js	Provides the user interface and serves as the primary API Gateway (/api) for client-side requests.
Backend	Express / TypeScript	A collection of independent microservices (e.g., express-auth, express-ai) optimized for specific business domains.
Data Layer	PostgreSQL / Prisma	Single shared database for transactional integrity, with Row-Level Security (RLS) managed by Prisma Middleware for multi-tenancy .
Asynchronous Jobs	Redis / BullMQ	
Used for decoupling latency-sensitive API calls from heavy processing tasks (e.g., LLM generation, scheduled crawling).

Deployment	Docker / Kubernetes	
All services are independently containerized for scalable deployment via Kubernetes.

⚙️ Local Development Setup
Prerequisites
You must have the following installed locally:

Node.js (LTS/20.x or higher)

pnpm (Preferred package manager for monorepo efficiency)

Docker & Docker Compose (for running local database and queue infrastructure)

Getting Started (3 Steps)
Install Dependencies: Run the installation and link workspaces. This satisfies the requirement that Shared packages are importable and correctly linked.

Bash

pnpm install
Start Infrastructure: Launch the shared database (PostgreSQL) and message broker (Redis).

Bash

docker compose -f infra/docker-compose.yml up -d
Run Development Servers: Start all necessary microservices and the Next.js frontend concurrently.

Bash

pnpm dev:all
The application should be accessible at http://localhost:3000 (Next.js web).

🗺️ Workspace Map
The repository is divided into two primary directories, ensuring that deployable applications (apps/) are isolated from shared business logic (packages/).

Applications (apps/) - Deployable Services
Service Directory	Core Responsibility
next-web	Frontend UI and API Gateway
express-auth	
User Authentication, Billing, and Atomic Quota Debit 

express-reviews	Review Ingestion and Reply Workflow Orchestration
express-ai	
LLM Prompting, Auditing, and Token Cost Calculation 

worker-jobs	Long-running background tasks (e.g., SEO Crawls, bulk data sync)
Packages (packages/) - Shared Libraries
Package Name	Purpose
@platform/db	
Centralized Prisma Schema, Database Client, and Migration files.

@platform/types	Shared TypeScript interfaces and Data Transfer Objects (DTOs).
@platform/auth	
JWT Validation, RBAC, and Async Local Storage setup for multi-tenancy.

@platform/queues	Standardized BullMQ queue definitions and event types.
⚡ Key Monorepo Commands
These root scripts allow for universal execution across all workspaces, which is key for CI/CD pipeline automation.

Command	Description
pnpm install	Installs all dependencies and links workspaces.
pnpm dev:all	Starts all applications in watch/development mode.
pnpm build:all	Compiles TypeScript for all services and runs the Next.js production build.
pnpm lint	Runs ESLint and Prettier across all apps/ and packages/.
pnpm test	Executes unit and integration tests across the entire codebase.
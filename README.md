<div align="center">

# 🏠 Apartment Survival

**Full-Stack Modular Household Ledger & Management Platform**

<p>
  <i>"No more chasing roommates for Wi-Fi money."</i>
</p>

[![Java](https://img.shields.io/badge/Java-21-C1793D?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Modulith](https://img.shields.io/badge/Spring-Modulith_2.1-3E6B48?style=flat-square)](https://spring.io/projects/spring-modulith)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-v5-4338CA?style=flat-square)](https://zustand.docs.pmnd.rs/)

<p align="center">
  <b>✓ Docker-first local development</b> &nbsp;•&nbsp;
  <b>✓ One-tap WhatsApp payment nudges</b> &nbsp;•&nbsp;
  <b>✓ Deterministic debt graph engine</b> &nbsp;•&nbsp;
  <b>✓ Connected pantry inventory</b>
</p>

</div>

---

### 🖥️ Live Product Vignette

<p align="center">
  <img src="docs/assets/hero-mockup-dark.svg" alt="Apartment Survival Interface Preview" width="100%" />
</p>

---

## 📐 Architecture Overview

<p align="center">
  <img src="docs/assets/architecture-dark.svg" alt="Apartment Survival Modular Monolith Architecture" width="100%" />
</p>

---

## ⭐ Engineering Highlights

- **Domain-Driven Modular Monolith**: Built with Spring Modulith to enforce strict business module isolation (`iam`, `household`, `expense`, `bill`, `pantry`) within a single deployable artifact without microservice overhead.
- **Deterministic Financial Engine**: Dedicated domain calculations isolate splitting algorithms, net balance aggregation, and circular debt reduction from persistence and HTTP layers.
- **Household-Scoped Authorization (IDOR/BOLA Protection)**: Contextual method-level security (`@PreAuthorize("@householdSecurity.isHouseholdMember(#householdId)")`) prevents cross-tenant and cross-household data leakage.
- **Stateful Session Security**: HttpOnly session cookies (`JSESSIONID`), BCrypt password hashing, session fixation mitigation, and strict double-submit CSRF protection.
- **Event-Driven Module Communication**: Decoupled interactions via Spring Modulith domain events with persistent event publication.
- **Feature-Driven React Architecture**: React 19 + TypeScript organized by domain feature slices with TanStack Query v5 managing server cache and Zustand v5 holding client UI state.
- **PostgreSQL + Flyway Schema Management**: Versioned migration scripts with clean baseline configuration and automated startup validation.

---

## 💡 Why I Built This

Living with roommates creates a continuous stream of shared state:
- Who paid for rent, Wi-Fi, and utilities?
- Who owes whom, and how can cascading, multi-party IOUs be simplified?
- What groceries or household supplies are running low?
- How can expenses with uneven shares or custom splits be handled deterministically?

**Apartment Survival** centralizes these workflows into a unified platform while maintaining strict architectural boundaries, verifiable authorization rules, and a tested mathematical calculation engine.

---

## 💸 Financial Domain Engine

Financial calculations are treated as pure domain logic rather than ad-hoc database queries:

```text
Expense Logged
   ↓
Split Strategy (Equal / Exact MAD / Percentage)
   ↓
Member Allocations & Debits
   ↓
Net Balance Aggregation
   ↓
Debt Graph Simplification (Collapses circular debts)
   ↓
Minimal Direct Settlements (1-Tap WhatsApp Nudges)
```

<p align="center">
  <img src="docs/assets/split-engine-dark.svg" alt="Financial Split Engine and Debt Simplification Pipeline" width="100%" />
</p>

### Key Capabilities
- **Flexible Splitting Strategies**: Equal splits with remainder penny handling, exact custom amounts, and proportional percentages.
- **Net Balance Computation**: Aggregates all historical debits, credits, and settlements into an exact net financial position per roommate.
- **Debt Graph Simplification**: Greedy flow algorithm collapses circular multi-party debts into the minimum possible number of direct peer-to-peer transactions.
- **1-Tap WhatsApp Nudges**: Generates pre-formatted `wa.me` settlement deep links containing itemized receipt breakdowns and payment totals for instant mobile reconciliation.

---

## 🧩 Backend Modules

| Module | Responsibility | Public Interface |
| :--- | :--- | :--- |
| `iam` | User registration, authentication, BCrypt hashing, and session management | IAM Services & DTOs |
| `household` | Household lifecycle, membership roster, role assignment, invite codes | Household APIs & Domain Events |
| `expense` | Expense logging, split strategies, balance calculation, debt simplification, settlements | Expense APIs & Balance Services |
| `bill` | Recurring utility and rent tracking, payment logging, schedule forecasting | Bill APIs |
| `pantry` | Household inventory, grocery checklists, item restock status | Pantry APIs |

---

## 🔐 Security Architecture

- **Authentication**: Stateful sessions via `JSESSIONID` with `HttpOnly`, `SameSite=Lax`, and `Secure` flags.
- **Session Protection**: Automatic session fixation mitigation on login and strict invalidation on logout.
- **Authorization Boundaries**: Contextual method security evaluated per household identifier.
- **CSRF Defense**: Cookie-backed CSRF tokens with automatic header synchronization on state-mutating requests.
- **Credential Safety**: Zero plaintext credentials stored; passwords hashed using BCrypt.

---

## 🛠️ Tech Stack

### Backend
- **Runtime & Language**: Java 21 (Virtual Threads / Project Loom enabled)
- **Framework**: Spring Boot 4.1 (`4.1.1`), Spring Modulith 2.1 (`2.1.0`)
- **Security**: Spring Security 6.x (Stateful `JSESSIONID`, BCrypt, Method-level `@PreAuthorize`)
- **Persistence**: Spring Data JPA, Hibernate, HikariCP
- **Database**: PostgreSQL 16 (Managed via Docker Compose & Flyway)

### Frontend
- **Framework**: React 19 (`19.2.8`), TypeScript 5.7+, Vite 8
- **Styling**: Tailwind CSS v4, Semantic Design Tokens (`tokens.css`)
- **UI & Icons**: `@base-ui/react`, `@tabler/icons-react`, Lucide React, Sonner Toast
- **Server State**: TanStack React Query v5
- **Client State**: Zustand v5
- **HTTP Client**: Axios (with centralized `ProblemDetail` error handling)

### Infrastructure & Tooling
- **Containerization**: Docker Compose (PostgreSQL 16 Alpine container with healthchecks)
- **Testing**: JUnit 5, AssertJ, Spring Boot Test, Vitest 3, React Testing Library

---

## 📁 Repository Structure

```text
apartment-survival/
│
├── docker-compose.yml              # PostgreSQL 16 local database container
│
├── Java-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/apartment/survival/
│   │   │   │   ├── iam/            # Auth, Sessions, User Entity
│   │   │   │   ├── household/      # Household, Members, Roles, Invites
│   │   │   │   ├── expense/        # Splits, Balances, Debt Engine, Settlements
│   │   │   │   ├── bill/           # Recurring Rent & Utilities Tracking
│   │   │   │   ├── pantry/         # Inventory & Dynamic Grocery Checklist
│   │   │   │   └── common/         # Global Exception & ProblemDetail Handling
│   │   │   └── resources/
│   │   │       ├── db/migration/   # Flyway SQL schema migrations
│   │   │       └── application.yml # Virtual threads & datasource config
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── features/               # Domain-oriented React features (auth, bills, expenses, etc.)
│   │   ├── domain/                 # Client-side splitting & currency math engines
│   │   ├── styles/                 # Design tokens (tokens.css) & global styles
│   │   ├── services/               # Axios API client & error normalizers
│   │   └── stores/                 # Zustand UI & Auth state stores
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── assets/                     # Dark & Light vector SVG diagrams
│   └── API_CONTRACTS.md            # Canonical API contract specification
└── README.md
```

---

## 📡 API Contract Reference

The backend exposes a standardized REST interface under `/api` conforming to RFC 7807 `ProblemDetail`.

| Area | Base Path | Core Endpoints |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `POST /logout`, `GET /me` |
| **Households** | `/api/households` | `GET /`, `POST /`, `GET /{id}`, `POST /{id}/invites`, `POST /join` |
| **Expenses** | `/api/expenses` | `GET /?householdId={id}`, `POST /`, `GET /balances?householdId={id}`, `POST /settlements` |
| **Bills** | `/api/bills` | `GET /?householdId={id}`, `POST /`, `POST /{id}/payments` |
| **Pantry** | `/api/pantry` | `GET /?householdId={id}`, `POST /`, `PATCH /{id}/toggle` |

> For comprehensive request/response schemas, DTOs, and sync status, see [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md).

---

## 🚀 Getting Started (Docker-First)

### Prerequisites
- **Docker & Docker Compose**
- **Java 21 JDK**
- **Node.js 20+** & **npm**

---

### Step 1: Start PostgreSQL via Docker

Start the isolated PostgreSQL database container in the background:

```bash
docker compose up -d
```

Verify the container is healthy:

```bash
docker compose ps
```

*Default Database Configuration:*
- **Host**: `localhost:5432`
- **Database**: `apartment_survival`
- **User**: `postgres`
- **Password**: `postgres`

---

### Step 2: Run Backend (Spring Boot)

```bash
cd Java-backend
./mvnw spring-boot:run
```
*(On Windows: `.\mvnw.cmd spring-boot:run`)*

Flyway automatically connects to the Docker database and applies schema migrations on startup. The API starts on `http://localhost:8080`.

---

### Step 3: Run Frontend (React 19)

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:5173`.

---

## 🧪 Testing

### Backend Test Suite
Run JUnit 5 and Spring Modulith verification tests:
```bash
cd Java-backend
./mvnw test
```

### Frontend Test Suite
Run Vitest unit and domain calculation tests:
```bash
cd frontend
npm test
```

To run Vitest in interactive watch mode:
```bash
npm run test:watch
```

---

## 🛑 Stopping the Environment

To stop the PostgreSQL container while preserving database data:
```bash
docker compose down
```

To reset the database completely:
```bash
docker compose down -v
```

---

## 📄 License

This project is licensed under the MIT License.


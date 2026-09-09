# Low-Level Design (LLD) Practice Platform

> **CipherSchools Engineering Hiring Assignment — September 2026**  
> A focused, modular monolith designed to help software engineers practice Low-Level Design, submit structured object-oriented solutions, and receive objective, rubric-grounded, explainable feedback across iterative attempts.

---

## 🎯 The Learner Problem

Unlike Data Structures & Algorithms (where LeetCode evaluates correctness through deterministic binary test cases), **Low-Level Design (LLD) is notoriously difficult to evaluate**.

* Two valid designs for the same problem (e.g. *Parking Lot* or *Elevator System*) can look completely different depending on scale and trade-offs.
* Learners fall into the **"passive reading trap"**—reading pre-baked UML diagrams gives an illusion of mastery, but when designing from scratch, learners have no way to verify whether their classes violate Single Responsibility, have leaky abstractions, or introduce tight coupling.
* Unconstrained LLMs (e.g., asking ChatGPT *"Is this a good design?"*) hallucinate arbitrary scores without citing concrete evidence or maintaining consistent standards.

### The Solution
This platform solves **one clear learner problem exceptionally well**:
1. Provides **5 curated, constraint-rich LLD problems** (Multi-Floor Parking Lot, Multi-Car Elevator Dispatcher, Splitwise Expense Sharing, In-Memory Cache with Pluggable Eviction, Distributed API Rate Limiter).
2. Requires **structured design articulation** (Entities & Responsibilities, Interfaces & Contracts, Design Patterns with Justifications, Trade-offs & Concurrency).
3. Bridges design to code via **Live Interactive UML Diagrams** and **Multi-Language Boilerplate Export** (Java, TypeScript, C++).
4. Evaluates solutions through a **two-stage hybrid engine**: fast deterministic checks followed by a semantic rubric evaluation citing **concrete evidence**, **design smells/concerns**, and **actionable refactorings**.
5. Tracks **attempt history and progression deltas** ($A_1 \rightarrow A_2 \rightarrow A_3$) to foster real, measurable design improvement.

---

## 📁 Repository & Deliverables Layout

```
lld-practice-platform/
├── docs/
│   ├── RESEARCH_NOTE.md            # Formal Research Note on learner problem & market gaps
│   ├── DESIGN_NOTE.md              # Formal Architecture & LLD Specification (DDD, SOLID, UML)
│   └── README_AI_USAGE.md          # Consolidated Documentation, Limitations & AI Report
├── src/
│   ├── api/
│   │   └── routes.ts               # REST API endpoints (Problems, Attempts, Submissions, History)
│   ├── data/
│   │   └── problems.json           # 5 Curated LLD problems with rubrics & starter templates
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Attempt.ts          # Finite state machine (DRAFT -> SUBMITTED -> EVALUATING -> COMPLETED)
│   │   │   ├── Feedback.ts         # Multi-dimensional rubric feedback with evidence citations
│   │   │   ├── Problem.ts          # Problem specifications & domain constraints
│   │   │   ├── Rubric.ts           # Criteria dimensions, weights, and score definitions
│   │   │   ├── StructuredDesignPayload.ts # Strongly typed structured submission model
│   │   │   └── Submission.ts       # Generic submission wrapper (Proves Change Test A)
│   │   ├── interfaces/
│   │   │   ├── IAttemptRepository.ts
│   │   │   ├── IProblemRepository.ts
│   │   │   └── ISubmissionPayload.ts # Core submission abstraction
│   │   └── value-objects/
│   │       ├── AttemptStatus.ts    # DRAFT | SUBMITTED | EVALUATING | COMPLETED | FAILED
│   │       ├── SubmissionFormat.ts # STRUCTURED_TEXT | UML_DIAGRAM | CODE
│   │       └── ValidationResult.ts
│   ├── evaluators/
│   │   ├── IEvaluator.ts           # Strategy contract (Proves Change Test B)
│   │   ├── DeterministicRuleEvaluator.ts # Fast structural & schema validator
│   │   ├── SemanticRubricEvaluator.ts    # Evidence-grounded rubric engine (Live LLM + Local fallback)
│   │   └── CompositeEvaluator.ts   # Composite Pattern coordinating evaluation pipeline
│   ├── infrastructure/
│   │   └── repositories/           # In-memory repositories with domain interfaces
│   ├── services/
│   │   └── PracticeService.ts      # Application service orchestrating attempt lifecycles
│   └── server.ts                   # Backend entry point
├── frontend/                       # Vite + React practice studio UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttemptHistoryView.tsx    # Multi-attempt comparison & score delta
│   │   │   ├── EvaluationFeedbackView.tsx # Rubric dashboard with evidence & suggestions
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProblemCatalog.tsx        # Problem browser
│   │   │   └── ProblemWorkspace.tsx      # Interactive structured design studio
│   │   ├── App.tsx
│   │   └── index.css                     # Modern dark glassmorphism styling
├── tests/
│   ├── domain/
│   │   ├── Attempt.test.ts         # Lifecycle state machine & transition rules
│   │   └── SubmissionPayload.test.ts # Change Test A (UML diagram format proof)
│   ├── evaluators/
│   │   └── CompositeEvaluator.test.ts # Change Test B (Pluggable human reviewer proof)
│   └── services/
│       └── PracticeService.test.ts # End-to-end attempt creation, submission & retry delta
├── scripts/
│   └── generate-pdfs.js            # Automated headless PDF compiler for markdown docs
├── AI_USAGE.md                     # 4 documented AI-assisted architectural decisions
└── README.md                       # Execution guide and documentation
```

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
* **Node.js**: v18.0.0 or higher (v22.x recommended)
* **npm**: v9.0.0 or higher

### 1. Install Dependencies
From the repository root:
```bash
# Install backend and dev dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Run Automated Tests
Verify all domain state machine transitions, evaluators, and extensibility tests pass:
```bash
npm test
```
*(All 12 automated unit and integration tests will execute and pass via Vitest).*

### 3. Start Development Servers
Run both backend API (`http://localhost:3001`) and frontend studio (`http://localhost:5173`) with a single command:
```bash
npm run dev
```

Alternatively, run them in separate terminals:
* Terminal 1 (Backend): `npm run dev:backend`
* Terminal 2 (Frontend): `npm run dev:frontend`

Open your browser at: **`http://localhost:5173`**

### 4. Documentation Specifications
All system architecture and design documentation is formatted in publication-grade GitHub Flavored Markdown:
* **Research Note (Learner Problem & Market Gaps)**: [`docs/RESEARCH_NOTE.md`](./docs/RESEARCH_NOTE.md)
* **Design Note (Domain Architecture & Extensibility)**: [`docs/DESIGN_NOTE.md`](./docs/DESIGN_NOTE.md)
* **Consolidated Documentation & AI Usage Report**: [`docs/README_AI_USAGE.md`](./docs/README_AI_USAGE.md)

---

## 🏛️ Architectural Highlights & LLD Principles

### 1. Finite State Machine for Attempt Lifecycle
Submissions are never processed as a blocking, synchronous HTTP call. The `Attempt` entity strictly enforces legal state transitions:
$$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{EVALUATING} \longrightarrow \text{COMPLETED} \ (\text{or } \text{FAILED})$$
* **Crash Resilience**: The submission payload is persisted immediately in the database as `SUBMITTED`. If the evaluation service times out or crashes, the learner's work is never lost and can be retried with one click.
* **Idempotency**: Repeated button clicks while evaluating are safely rejected.

### 2. The Two Change Tests (Extensibility)

#### Change Test A: New Submission Formats (e.g. UML Diagrams or Code)
* **Design Pattern**: Polymorphic Payload Abstraction (`ISubmissionPayload`).
* **Proof**: We can introduce `UmlDiagramPayload` or `CodeSubmissionPayload` implementing `ISubmissionPayload`. The `Attempt` entity, `PracticeService`, and storage layer require **zero modifications** (verified in `tests/domain/SubmissionPayload.test.ts`).

#### Change Test B: New Evaluators (e.g. Human Review or Static AST Linter)
* **Design Pattern**: Strategy Pattern (`IEvaluator`) and Composite Pattern (`CompositeEvaluator`).
* **Proof**: To add peer human review, we simply create `HumanReviewEvaluator implements IEvaluator` and register it in `new CompositeEvaluator([...])`. The practice orchestration flow does not change by a single line (verified in `tests/evaluators/CompositeEvaluator.test.ts`).

### 3. Practical Scale Roadmap
In alignment with the assignment's guidance against premature microservices:
* The current MVP runs as a clean, modular monolith.
* When scaling to 50,000 active users, the **first and only component to decouple** is the **Evaluation Worker**:
  1. The API saves the attempt and publishes an event to an AWS SQS queue or Redis Stream.
  2. Stateless evaluation workers consume from the queue and run `CompositeEvaluator`.
  3. The domain core (`Attempt`, `Problem`, `Rubric`, `Feedback`) remains identical.

---

## 🤖 Meaningful AI Usage

See [`AI_USAGE.md`](./AI_USAGE.md) for 4 detailed logs of AI-assisted decisions, including:
1. **System Topology**: Why AI-suggested microservices and Kafka were **rejected** in favor of a clean modular monolith.
2. **Evaluation Strategy**: Why a single-prompt LLM score was **rejected** in favor of a two-stage hybrid rubric engine.
3. **Payload Extensibility**: Why AI's hardcoded submission fields were refactored into generic `ISubmissionPayload` (passing Change Test A).
4. **Lifecycle State**: Why synchronous HTTP evaluation was **rejected** in favor of an asynchronous state machine (`SUBMITTED` $\rightarrow$ `EVALUATING` $\rightarrow$ `COMPLETED`).

---

## 📄 Submission Checklist for Hiring Team

* [x] **Research Note (Formal Markdown)**: Available at [docs/RESEARCH_NOTE.md](file:///f:/LLD/docs/RESEARCH_NOTE.md)
* [x] **Design Note (Formal Architecture & LLD)**: Available at [docs/DESIGN_NOTE.md](file:///f:/LLD/docs/DESIGN_NOTE.md)
* [x] **Consolidated Documentation & AI Usage**: Available at [docs/README_AI_USAGE.md](file:///f:/LLD/docs/README_AI_USAGE.md)
* [x] **Working Prototype / GitHub Repo**: Complete runnable TypeScript project at [https://github.com/sachinn-alt/lld-studio](https://github.com/sachinn-alt/lld-studio)
* [x] **Automated Tests**: 12 comprehensive unit & integration tests passing (`npm test`)
* [x] **AI Usage Report**: Available at [AI_USAGE.md](file:///f:/LLD/AI_USAGE.md) (Section 6 compliant)

# Technical Documentation & AI Usage Report
## Platform Execution Guide, Architectural Invariants, Limitations & AI Decision Log

| Metadata Field | Specification |
| :--- | :--- |
| **Document ID** | `CIPHER-ENG-2026-DOC-01` |
| **Assignment Track** | CipherSchools Engineering Hiring Assignment — System & Low-Level Design |
| **Author** | Candidate Engineering Team |
| **Repository URL** | https://github.com/sachinn-alt/lld-studio |
| **Effective Date** | September 2026 |
| **Deliverable Type** | Consolidated README & Section 6 AI Usage Report |

---

# PART I: README & SYSTEM DOCUMENTATION

## 1. Executive Summary & The Learner Problem

Unlike Data Structures & Algorithms (where automated platforms evaluate correctness through deterministic binary assertions), **Low-Level Design (LLD) practice remains profoundly difficult to evaluate**:

* **Multiple Valid Truths**: Two valid architectures for the same problem (e.g., *Parking Lot* or *Elevator Dispatcher*) look completely different depending on scale and trade-offs.
* **The "Passive Reading Trap"**: Reading static class diagrams creates a false sense of confidence. When designing from scratch, learners lack mechanisms to detect leaky abstractions, God classes, or tight coupling.
* **Unconstrained AI Hallucinations**: Prompting generic conversational LLMs (*"Is this a good design?"*) generates sycophantic praise and inconsistent scores without concrete evidence citations.

### The Platform Solution
This platform solves **one core learner problem exceptionally well**:
1. **5 Curated Enterprise Problems**: Multi-Floor Parking Lot, Multi-Car Elevator Dispatcher, Splitwise Expense Sharing, In-Memory Cache with Pluggable Eviction, and Distributed API Rate Limiter.
2. **Structured Design Articulation**: Replaces unstructured freeform text with typed domain inputs: Core Entities (SRP), Interfaces & Contracts (DIP/OCP), Design Patterns with Justifications, and Concurrency Trade-offs.
3. **Active Visual & Code Bridge**: Real-time **Live UML class diagrams** and **Polyglot Boilerplate Generation** in **Java 17+**, **TypeScript**, and **C++20**.
4. **Two-Stage Hybrid Evaluator**: Instant deterministic rule validation followed by rubric-grounded scoring citing **concrete evidence**, **identified design smells**, and **actionable remediation suggestions**.
5. **Versioned Attempt History & Progression Deltas**: Explicitly tracks improvement across iterative attempts ($A_1 \rightarrow A_2 \rightarrow A_3$).

---

## 2. Repository & Deliverables Layout

```
lld-practice-platform/
├── docs/
│   ├── RESEARCH_NOTE.md            # 2-page research note on learner problem & market gaps
│   ├── DESIGN_NOTE.md              # Domain architecture, UML diagrams, patterns, trade-offs
│   └── README_AI_USAGE.md          # Consolidated documentation & Section 6 AI report
├── src/
│   ├── api/
│   │   └── routes.ts               # REST API endpoints (Problems, Attempts, Submissions, History)
│   ├── data/
│   │   └── problems.json           # 5 Curated LLD problems with rubrics & starter templates
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Attempt.ts          # State machine (DRAFT -> SUBMITTED -> EVALUATING -> COMPLETED)
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
│   │   ├── SemanticRubricEvaluator.ts    # Evidence-grounded rubric engine
│   │   └── CompositeEvaluator.ts   # Composite Pattern coordinating evaluation pipeline
│   ├── infrastructure/
│   │   └── repositories/           # In-memory repositories with domain interfaces
│   ├── services/
│   │   └── PracticeService.ts      # Application service orchestrating attempt lifecycles
│   └── server.ts                   # Backend entry point (Port 3001)
├── frontend/                       # Vite + React practice studio UI (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttemptHistoryView.tsx    # Multi-attempt comparison & score delta
│   │   │   ├── EvaluationFeedbackView.tsx # Rubric dashboard with evidence & suggestions
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProblemCatalog.tsx        # Problem browser
│   │   │   └── ProblemWorkspace.tsx      # Studio with Live UML & Code Exporter
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
├── AI_USAGE.md                     # 4 documented AI-assisted architectural decisions
└── README.md                       # Root repository execution guide
```

---

## 3. Quick Start & Verification Instructions

### System Prerequisites
* **Node.js**: v18.0.0 or higher (v22.x recommended)
* **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
```bash
# Install backend and dev dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Run Automated Test Suite
Verify all domain state transitions, evaluators, and extensibility proofs:
```bash
npm test
```
*(All 12 automated unit and integration tests execute and pass via Vitest).*

### Step 3: Compile Production Bundles
```bash
npm run build
```
*(Executes `tsc` for the backend and Vite production build for the frontend studio).*

### Step 4: Launch Local Development Servers
```bash
npm run dev
```
* **Frontend Practice Studio**: `http://localhost:5173`
* **Backend REST API**: `http://localhost:3001`
* **Health Endpoint**: `http://localhost:3001/health`

---

## 4. Key Architectural Highlights & LLD Principles

### 4.1 Finite State Machine for Attempt Lifecycles
Submissions are never processed as a blocking, synchronous HTTP call. The `Attempt` entity strictly enforces legal state transitions:
$$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{EVALUATING} \longrightarrow \text{COMPLETED} \ (\text{or } \text{FAILED})$$
* **Crash Resilience**: The submission payload is persisted immediately as `SUBMITTED`. If the evaluation service times out or encounters an error, the learner's work is never lost and can be retried with one click.
* **Idempotency**: Repeated button clicks while in `EVALUATING` are safely rejected.

### 4.2 The Two Extensibility Change Tests

#### Change Test A: New Submission Formats (e.g. UML Diagrams or Code)
* **Design Pattern**: Polymorphic Payload Abstraction (`ISubmissionPayload`).
* **Proof**: We can introduce `UmlDiagramPayload` or `CodeSubmissionPayload` implementing `ISubmissionPayload`. The `Attempt` entity, `PracticeService`, and storage layer require **zero modifications** (verified in `tests/domain/SubmissionPayload.test.ts`).

#### Change Test B: Pluggable Evaluators (e.g. Human Review or Static AST Linter)
* **Design Pattern**: Strategy Pattern (`IEvaluator`) and Composite Pattern (`CompositeEvaluator`).
* **Proof**: To add peer human review, we create `HumanReviewEvaluator implements IEvaluator` and register it in `new CompositeEvaluator([...])`. The practice orchestration flow does not change by a single line (verified in `tests/evaluators/CompositeEvaluator.test.ts`).

### 4.3 Practical Scale Roadmap
In alignment with the assignment's guidance against premature microservices:
* The current MVP operates as a clean, modular monolith.
* When scaling to 50,000 active users, the **first and only component to decouple** is the **Evaluation Worker**:
  1. The API saves the attempt and publishes an event to an AWS SQS queue or Redis Stream.
  2. Stateless evaluation workers consume from the queue and run `CompositeEvaluator`.
  3. The domain core (`Attempt`, `Problem`, `Rubric`, `Feedback`) remains identical.

---

## 5. Scope Limitations & Engineering Trade-offs

1. **In-Memory Storage Adapters**: State is managed via `InMemoryProblemRepository` and `InMemoryAttemptRepository` implementing domain repository interfaces (`IProblemRepository`, `IAttemptRepository`). This ensures zero-setup execution for evaluators while adhering to Dependency Inversion to swap for PostgreSQL/DynamoDB with zero domain changes.
2. **Deterministic & Local Semantic Evaluation**: Runs 100% reliably on local machines using fast deterministic rule validation and structured schema matching without requiring third-party API keys.
3. **Focused Domain Scope**: We deliberately avoided multi-tenant auth, user profiles, and payment gateways to keep 100% focus on deep object-oriented modeling and the learner feedback loop.

---

# PART II: AI USAGE REPORT

**Assignment Requirement:** Section 6 (AI Usage - 3 to 5 meaningful AI-assisted decisions)  
**Author:** Candidate Engineering Team  
**Date:** September 2026  

## Overview
In developing this Low-Level Design Practice Platform, AI tools (Claude, Gemini, ChatGPT) were used as an architectural sounding board and pair programmer. In every interaction, AI suggestions were subjected to rigorous engineering evaluation against the core project objective: **solving one clear learner problem exceptionally well without unnecessary complexity.**

Below are 4 meaningful architectural decisions highlighting what the AI proposed, what was accepted or rejected, and the engineering rationale.

---

### Decision 1: System Topology — Microservices vs. Modular Monolith

* **What the AI Suggested:**  
  The AI initially suggested a distributed microservices topology consisting of 4 independent services: an `AuthService`, `ProblemService`, `SubmissionService`, and an asynchronous `EvaluationService` communicating via an Apache Kafka message broker with Redis caching.
* **Our Evaluation:**  
  The suggestion was a classic over-engineering trap. For a focused prototype emphasizing LLD domain modeling, introducing Kafka, Docker Compose orchestration, distributed transactions, and network serialization adds operational fragility without adding any value to the learner's feedback loop.
* **Decision:** **REJECTED.**
* **Engineering Rationale:**  
  We implemented a **clean, modular monolith** in TypeScript. Domain boundaries are enforced at the module and package level rather than through network boundaries. Domain events run via an in-memory event emitter. We documented a practical scale roadmap showing that the *Evaluation Worker Pool* is the only component that would be extracted if traffic scaled, keeping the MVP zero-config and lightning-fast.

---

### Decision 2: Evaluation Design — Single-Prompt Scoring vs. Hybrid Rubric Engine

* **What the AI Suggested:**  
  The AI suggested a simple, all-in-one prompt:  
  *"Analyze the candidate's design and assign an overall score from 1 to 100 with general suggestions for improvement."*
* **Our Evaluation:**  
  This approach produces vague, uncalibrated feedback. An LLM without strict constraints exhibits high variance (scoring the same design 65 on one run and 85 on another), praises trivial naming conventions, and provides generic platitudes (*"Consider using more design patterns"*). Furthermore, it wastes expensive tokens evaluating malformed or incomplete submissions.
* **Decision:** **REJECTED the single prompt; ACCEPTED a Two-Stage Hybrid Rubric Engine.**
* **Engineering Rationale:**  
  We split evaluation into two decoupled stages:
  1. **Deterministic Rule Evaluator**: Instant (<50ms) checks for schema validity, mandatory sections, entity count, and minimum description depth. Fails fast without wasting LLM resources.
  2. **Semantic Rubric Evaluator**: Strictly constrained to a fixed JSON schema with orthogonal dimensions (*Single Responsibility*, *Coupling & Abstraction*, *Requirement Coverage*, *Trade-offs*). Crucially, the model is required to cite **specific evidence** (class/method names) from the candidate's text alongside every identified concern.

---

### Decision 3: Submission Extensibility (Change Test A) — Strongly Typed Generic Payload

* **What the AI Suggested:**  
  When designing the `Submission` class, the AI provided a concrete class containing hardcoded string fields:
  ```typescript
  // AI Initial Suggestion
  class Submission {
    entitiesText: string;
    relationshipsText: string;
    patternsText: string;
  }
  ```
* **Our Evaluation:**  
  While simple, this hardcoding violates the **Open-Closed Principle (OCP)**. When evaluating the brief's **Change Test A** (*"Today the learner submits text; later the platform supports a class diagram"*), this structure would force breaking changes across the database schema, domain classes, and evaluation services.
* **Decision:** **ACCEPTED refactoring to an `ISubmissionPayload` abstraction.**
* **Engineering Rationale:**  
  We refactored `Submission` to encapsulate an `ISubmissionPayload` interface:
  ```typescript
  export interface ISubmissionPayload {
    readonly format: SubmissionFormat;
    validate(): ValidationResult;
    toEvaluationContext(): string;
  }

  export class Submission<T extends ISubmissionPayload = ISubmissionPayload> {
    constructor(
      public readonly id: SubmissionId,
      public readonly payload: T,
      public readonly submittedAt: Date
    ) {}
  }
  ```
  Now, supporting `UmlDiagramPayload` or `CodeSubmissionPayload` requires zero modifications to `Attempt` or `PracticeService`.

---

### Decision 4: Submission State Lifecycle — Synchronous Request vs. Stateful Asynchronous Transition

* **What the AI Suggested:**  
  The AI proposed a standard synchronous REST endpoint:
  ```typescript
  app.post('/api/attempts/:id/submit', async (req, res) => {
    const feedback = await evaluator.evaluate(req.body);
    res.json({ status: 'COMPLETED', feedback });
  });
  ```
* **Our Evaluation:**  
  Evaluation can take 2 to 5 seconds depending on latency. A synchronous HTTP request creates multiple failure modes:
  1. If the user's connection drops or the browser tab closes during the wait, the candidate's work is lost forever.
  2. If the evaluator times out or throttles, the entire request fails catastrophically.
  3. Clicking "Submit" twice triggers parallel duplicate evaluations.
* **Decision:** **REJECTED synchronous flow; ACCEPTED stateful asynchronous lifecycle.**
* **Engineering Rationale:**  
  We introduced an explicit state machine on the `Attempt` entity:
  $$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{EVALUATING} \longrightarrow \text{COMPLETED} \ (\text{or } \text{FAILED})$$
  When a candidate clicks submit:
  1. The submission is persisted immediately, and status transitions to `SUBMITTED`.
  2. The API responds with `202 Accepted` within 10ms.
  3. Evaluation executes asynchronously. If evaluation fails, the state becomes `FAILED` with a retry option, ensuring candidate work is never lost.

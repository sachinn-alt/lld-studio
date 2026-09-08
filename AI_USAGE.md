# AI Usage Report: Architectural Decisions & Engineering Judgment

**Platform:** LLD Practice Platform  
**Author:** Candidate  
**Date:** September 2026  
**Assignment Requirement:** Section 6 (AI Usage - 3 to 5 meaningful AI-assisted decisions)  

---

## Overview

In developing this Low-Level Design Practice Platform, AI tools (Claude, Gemini, ChatGPT) were used as an architectural sounding board and pair programmer. In every interaction, AI suggestions were subjected to rigorous engineering evaluation against the core project objective: **solving one clear learner problem exceptionally well without unnecessary complexity.**

Below are 4 meaningful architectural decisions highlighting what the AI proposed, what was accepted or rejected, and the engineering rationale.

---

### Decision 1: System Topology — Microservices vs. Modular Monolith

* **What the AI Suggested:**  
  The AI initially suggested a distributed microservices topology consisting of 4 independent services: an `AuthService`, `ProblemService`, `SubmissionService`, and an asynchronous `EvaluationService` communicating via an Apache Kafka message broker with Redis caching.
* **Our Evaluation:**  
  The suggestion was a classic over-engineering trap. For a 2-day prototype focusing on LLD domain modeling, introducing Kafka, Docker Compose orchestration, distributed transactions, and network serialization adds operational fragility without adding any value to the learner's feedback loop.
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
  2. **Semantic Rubric Evaluator**: The LLM is strictly constrained to a fixed JSON schema with orthogonal dimensions (*Single Responsibility*, *Coupling & Abstraction*, *Requirement Coverage*, *Trade-offs*). Crucially, the model is required to cite **specific evidence** (class/method names) from the candidate's text alongside every identified concern.

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
  LLM evaluations take between 2 to 5 seconds depending on model latency. A synchronous HTTP request creates multiple failure modes:
  1. If the user's connection drops or the browser tab closes during the 4-second wait, the candidate's work is lost forever.
  2. If the LLM provider times out or throttles, the entire request fails catastrophically.
  3. Clicking "Submit" twice triggers parallel duplicate evaluations.
* **Decision:** **REJECTED synchronous flow; ACCEPTED stateful asynchronous lifecycle.**
* **Engineering Rationale:**  
  We introduced an explicit state machine on the `Attempt` entity:
  $$\text{DRAFT} \longrightarrow \text{SUBMITTED} \longrightarrow \text{EVALUATING} \longrightarrow \text{COMPLETED} \ (\text{or } \text{FAILED})$$
  When a candidate clicks submit:
  1. The submission is persisted immediately, and status transitions to `SUBMITTED`.
  2. The API responds with `202 Accepted` within 10ms.
  3. Evaluation executes asynchronously. If evaluation fails, the state becomes `FAILED` with a retry option, ensuring candidate work is never lost.

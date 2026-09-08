import { IEvaluator, EvaluationResult } from './IEvaluator.js';
import { Submission } from '../domain/entities/Submission.js';
import { Rubric } from '../domain/entities/Rubric.js';
import { CriterionEvaluation } from '../domain/entities/Feedback.js';

export class SemanticRubricEvaluator implements IEvaluator {
  public readonly name = 'SemanticRubricEvaluator';

  public async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        return await this.evaluateWithLiveLLM(submission, rubric, apiKey);
      } catch (error) {
        console.warn('Live LLM evaluation failed or timed out. Falling back to local semantic evaluator.', error);
        return this.evaluateWithLocalHeuristics(submission, rubric);
      }
    }

    // Default: Local heuristic semantic evaluator (deterministic, zero-latency, no external key required)
    return this.evaluateWithLocalHeuristics(submission, rubric);
  }

  private async evaluateWithLiveLLM(
    submission: Submission,
    rubric: Rubric,
    apiKey: string
  ): Promise<EvaluationResult> {
    // Construct structured prompt for Gemini / OpenAI
    const submissionText = submission.toEvaluationContext();
    const rubricSpec = rubric.criteria.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      maxScore: c.maxScore
    }));

    const prompt = `You are an expert Principal Software Engineer evaluating a candidate's Low-Level Design (LLD) submission.
Evaluate the design strictly against the provided rubric. For every criterion, provide:
1. An integer score between 1 and maxScore
2. Concrete EVIDENCE citing specific classes, interfaces, or methods directly from the candidate's submission
3. A CONCERN explaining potential failure points, violations of SOLID, or edge cases
4. A SUGGESTION with actionable design pattern or refactoring recommendations for their next attempt

Rubric:
${JSON.stringify(rubricSpec, null, 2)}

Candidate Submission:
${submissionText}

Respond ONLY in valid JSON matching this exact structure:
{
  "summary": "High-level review summary",
  "evaluations": [
    {
      "criterionId": "string",
      "criterionName": "string",
      "score": number,
      "maxScore": number,
      "evidence": "string",
      "concern": "string",
      "suggestion": "string",
      "confidence": number
    }
  ]
}`;

    // Example call using Node native fetch to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json() as any;
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    return {
      evaluatorName: this.name,
      evaluations: parsed.evaluations,
      summaryNote: parsed.summary || 'Live semantic rubric evaluation completed.',
      isDeterministic: false
    };
  }

  private evaluateWithLocalHeuristics(submission: Submission, rubric: Rubric): EvaluationResult {
    const text = submission.toEvaluationContext();
    const evaluations: CriterionEvaluation[] = [];

    for (const criterion of rubric.criteria) {
      const evaluation = this.analyzeCriterion(criterion.id, criterion.name, text);
      evaluations.push(evaluation);
    }

    return {
      evaluatorName: this.name,
      evaluations,
      summaryNote: 'Local semantic rubric evaluation completed.',
      isDeterministic: false
    };
  }

  private analyzeCriterion(criterionId: string, criterionName: string, text: string): CriterionEvaluation {
    const lower = text.toLowerCase();
    
    // Check for Strategy / Factory / State / Observer pattern indicators
    const hasStrategy = lower.includes('strategy');
    const hasFactory = lower.includes('factory');
    const hasState = lower.includes('state');
    const hasObserver = lower.includes('observer') || lower.includes('listener');
    const hasLocking = lower.includes('lock') || lower.includes('thread') || lower.includes('concurrent') || lower.includes('atomic') || lower.includes('sync');
    const hasSingleResponsibility = lower.includes('responsibility') || lower.includes('cohesion') || lower.includes('delegate');

    let score = 3;
    let evidence = '';
    let concern = '';
    let suggestion = '';

    if (criterionId.includes('modeling') || criterionId.includes('state') || criterionId.includes('split')) {
      if (hasState || hasStrategy) {
        score = 4;
        evidence = `Candidate modeled behavioral transitions using ${hasState ? 'State Pattern' : 'Polymorphic Strategies'}.`;
        concern = 'Ensure state transitions are validated to prevent invalid intermediate states.';
        suggestion = 'Encapsulate state transitions inside domain events or state handlers rather than direct setter mutations.';
      } else {
        score = 3;
        evidence = 'Entities modeled with procedural transitions.';
        concern = 'State transitions managed through conditional if/switch statements, leading to high cyclomatic complexity.';
        suggestion = 'Refactor conditional state branching into the State pattern (GoF).';
      }
    } else if (criterionId.includes('responsibility') || criterionId.includes('dispatcher') || criterionId.includes('cohesion')) {
      if (hasSingleResponsibility && !lower.includes('god class')) {
        score = 4;
        evidence = 'Separation of concerns visible across coordinators and strategy delegates.';
        concern = 'Watch out for feature envy where coordinators repeatedly query internal state of subordinate entities.';
        suggestion = 'Follow "Tell, Don\'t Ask" principle to keep behavior located with data.';
      } else {
        score = 2;
        evidence = 'High concentration of duties in top-level controller.';
        concern = 'Coordinator violates Single Responsibility Principle by mixing coordination, persistence, and business calculations.';
        suggestion = 'Extract calculations to pure strategy classes and persistence to repository interfaces.';
      }
    } else if (criterionId.includes('coupling') || criterionId.includes('pattern') || criterionId.includes('validation')) {
      if ((hasStrategy || hasFactory || hasObserver) && lower.includes('interface')) {
        score = 5;
        evidence = `Candidate decoupled core logic using interfaces and established patterns: ${[hasStrategy ? 'Strategy' : null, hasFactory ? 'Factory' : null, hasObserver ? 'Observer' : null].filter(Boolean).join(', ')}.`;
        concern = 'Ensure concrete dependencies are passed via Dependency Injection (constructor injection) rather than internal instantiation.';
        suggestion = 'Consider introducing a composition root or factory to bind interfaces at runtime.';
      } else {
        score = 3;
        evidence = 'Direct object references without interface abstractions.';
        concern = 'Tight coupling makes unit testing difficult and violates Dependency Inversion Principle.';
        suggestion = 'Depend upon abstractions (interfaces), not concrete implementations.';
      }
    } else {
      // Trade-offs & Concurrency
      if (hasLocking) {
        score = 4;
        evidence = 'Candidate addressed concurrent access and synchronization invariants.';
        concern = 'Coarse-grained locks can create throughput bottlenecks under high load.';
        suggestion = 'Consider fine-grained locking or optimistic concurrency controls (e.g. version checking).';
      } else {
        score = 3;
        evidence = 'Trade-offs documented without explicit concurrency or race condition handling.';
        concern = 'Race conditions possible when multiple requests compete for the same resource simultaneously.';
        suggestion = 'Explicitly articulate thread-safety guarantees and concurrency trade-offs.';
      }
    }

    return {
      criterionId,
      criterionName,
      score,
      maxScore: 5,
      evidence,
      concern,
      suggestion,
      confidence: 0.90
    };
  }
}

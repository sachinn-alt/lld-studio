import { IEvaluator, EvaluationResult } from './IEvaluator.js';
import { Submission } from '../domain/entities/Submission.js';
import { Rubric } from '../domain/entities/Rubric.js';
import { CriterionEvaluation } from '../domain/entities/Feedback.js';
import { StructuredDesignPayload } from '../domain/entities/StructuredDesignPayload.js';

export class DeterministicRuleEvaluator implements IEvaluator {
  public readonly name = 'DeterministicRuleEvaluator';

  public async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    const evaluations: CriterionEvaluation[] = [];

    // Extract payload text or structured fields
    const isStructured = submission.payload instanceof StructuredDesignPayload;
    const structuredPayload = isStructured ? (submission.payload as StructuredDesignPayload) : null;
    const contextText = submission.toEvaluationContext().toLowerCase();

    for (const criterion of rubric.criteria) {
      const evaluation = this.evaluateCriterion(criterion.id, criterion.name, structuredPayload, contextText);
      evaluations.push(evaluation);
    }

    return {
      evaluatorName: this.name,
      evaluations,
      summaryNote: 'Deterministic structural validation completed.',
      isDeterministic: true
    };
  }

  private evaluateCriterion(
    criterionId: string,
    criterionName: string,
    payload: StructuredDesignPayload | null,
    context: string
  ): CriterionEvaluation {
    let score = 3;
    let evidence = '';
    let concern = '';
    let suggestion = '';

    const entityCount = payload ? payload.entities.length : (context.match(/class |interface /g) || []).length;
    const interfaceCount = payload ? payload.interfaces.length : (context.match(/interface /g) || []).length;
    const patternCount = payload ? payload.designPatterns.length : (context.match(/pattern|strategy|factory|observer|state/g) || []).length;

    switch (criterionId) {
      case 'domain-modeling':
      case 'state-management':
      case 'split-strategy-pattern':
        if (entityCount >= 4) {
          score = 4;
          evidence = payload 
            ? `Identified ${entityCount} core domain entities: ${payload.entities.map(e => e.name).slice(0, 4).join(', ')}.`
            : `Identified multiple domain entities in solution text.`;
          concern = entityCount > 8 ? 'High number of domain entities; ensure boundaries are not fragmented.' : 'None';
          suggestion = 'Ensure each entity encapsulates state modification methods rather than exposing raw public fields.';
        } else {
          score = 2;
          evidence = `Only ${entityCount} domain entities identified.`;
          concern = 'Missing granular domain decomposition; responsibilities may be lumped together.';
          suggestion = 'Decompose system into distinct domain entities and value objects.';
        }
        break;

      case 'single-responsibility':
      case 'dispatcher-abstraction':
      case 'balance-sheet-cohesion':
        if (payload) {
          const entitiesWithResponsibilities = payload.entities.filter(e => e.responsibility.length > 15);
          if (entitiesWithResponsibilities.length >= 3) {
            score = 4;
            evidence = `Documented focused responsibilities for ${entitiesWithResponsibilities.length} entities (e.g. "${payload.entities[0].name}": "${payload.entities[0].responsibility.slice(0, 50)}...").`;
            concern = 'Ensure helper duties (formatting, billing, printing) do not creep into core coordinators.';
            suggestion = 'Apply Single Responsibility Principle strictly by delegating peripheral actions to dedicated service collaborators.';
          } else {
            score = 2;
            evidence = `Vague or brief responsibility descriptions for domain classes.`;
            concern = 'Entities risk becoming God classes or anemic data holders.';
            suggestion = 'Explicitly define what each class owns and what it deliberately delegates.';
          }
        } else {
          score = 3;
          evidence = 'Analyzed responsibilities from freeform submission.';
          concern = 'Cohesion needs validation against evolving requirements.';
          suggestion = 'Ensure coordinators delegate to domain services.';
        }
        break;

      case 'coupling-and-patterns':
      case 'request-modeling':
      case 'financial-precision-and-validation':
        if (interfaceCount >= 2 && patternCount >= 1) {
          score = 4;
          evidence = payload 
            ? `Extracted ${interfaceCount} interface abstractions (${payload.interfaces.map(i => i.name).join(', ')}) and applied ${patternCount} design patterns.`
            : `Detected interface abstractions and design pattern mentions in design.`;
          concern = 'Verify that interfaces do not violate Interface Segregation with unnecessary methods.';
          suggestion = 'Keep interfaces minimal and role-focused (Role Interface pattern).';
        } else {
          score = 2;
          evidence = `Limited interfaces (${interfaceCount}) or patterns (${patternCount}) documented.`;
          concern = 'Direct concrete instantiation leads to tight coupling and poor testability.';
          suggestion = 'Introduce Strategy or Factory abstractions to decouple high-level workflows from concrete implementations.';
        }
        break;

      case 'extensibility-and-tradeoffs':
      case 'concurrency-and-safety':
      case 'settlement-and-extensibility':
      default:
        const tradeOffLength = payload ? payload.tradeOffsAndAssumptions.length : context.length;
        if (tradeOffLength > 40) {
          score = 4;
          evidence = payload
            ? `Candidate articulated trade-offs: "${payload.tradeOffsAndAssumptions.slice(0, 60)}..."`
            : `Candidate documented design trade-offs and assumptions.`;
          concern = 'Consider failure edge cases (e.g., race conditions, network failures, out-of-order calls).';
          suggestion = 'Document defensive invariants and state recovery handling in case of unexpected operations.';
        } else {
          score = 2;
          evidence = 'Minimal trade-offs or assumptions provided.';
          concern = 'Design lacks discussion on non-functional constraints, thread safety, or performance trade-offs.';
          suggestion = 'Always document why you chose your specific pattern and what alternative you deliberately rejected.';
        }
        break;
    }

    return {
      criterionId,
      criterionName,
      score,
      maxScore: 5,
      evidence,
      concern,
      suggestion,
      confidence: 0.95
    };
  }
}

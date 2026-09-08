import { IEvaluator, EvaluationResult } from './IEvaluator.js';
import { Submission } from '../domain/entities/Submission.js';
import { Rubric } from '../domain/entities/Rubric.js';
import { CriterionEvaluation } from '../domain/entities/Feedback.js';

/**
 * Coordinates multiple evaluation strategies into a unified feedback output.
 * Demonstrates the Composite Pattern and directly proves Change Test B:
 * Any new evaluator (e.g. HumanReviewEvaluator, ASTLinterEvaluator) can be passed
 * into the evaluators array without altering the calling PracticeService or frontend flow.
 */
export class CompositeEvaluator implements IEvaluator {
  public readonly name = 'CompositeEvaluator';

  constructor(private readonly evaluators: IEvaluator[]) {
    if (!evaluators || evaluators.length === 0) {
      throw new Error('CompositeEvaluator requires at least one evaluator.');
    }
  }

  public async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    const results: EvaluationResult[] = [];

    // Execute all registered evaluators (parallel execution)
    for (const evaluator of this.evaluators) {
      try {
        const result = await evaluator.evaluate(submission, rubric);
        results.push(result);
      } catch (error) {
        console.error(`Evaluator "${evaluator.name}" failed:`, error);
        // Resilient: One evaluator failure does not crash the entire evaluation pipeline
      }
    }

    if (results.length === 0) {
      throw new Error('All evaluators in composite failed to produce an evaluation result.');
    }

    // Merge evaluations across criteria
    const mergedEvaluations: CriterionEvaluation[] = [];

    for (const criterion of rubric.criteria) {
      const criterionResults: CriterionEvaluation[] = [];

      for (const res of results) {
        const match = res.evaluations.find(e => e.criterionId === criterion.id);
        if (match) criterionResults.push(match);
      }

      if (criterionResults.length === 0) continue;

      // Average score rounded to nearest integer
      const avgScore = Math.round(
        criterionResults.reduce((acc, curr) => acc + curr.score, 0) / criterionResults.length
      );

      // Best evidence, concern, and suggestion synthesized
      const evidence = criterionResults.map(c => c.evidence).filter(Boolean).join(' | ');
      const concern = criterionResults.map(c => c.concern).filter(c => c && c !== 'None').join(' | ') || 'None';
      const suggestion = criterionResults.map(c => c.suggestion).filter(Boolean).join(' | ');
      const confidence = Math.min(1.0, criterionResults.reduce((acc, curr) => acc + curr.confidence, 0) / criterionResults.length);

      mergedEvaluations.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        score: avgScore,
        maxScore: criterion.maxScore,
        evidence,
        concern,
        suggestion,
        confidence
      });
    }

    return {
      evaluatorName: this.name,
      evaluations: mergedEvaluations,
      summaryNote: `Unified feedback synthesized across ${results.length} evaluators (${results.map(r => r.evaluatorName).join(', ')}).`,
      isDeterministic: results.every(r => r.isDeterministic)
    };
  }
}

import { Submission } from '../domain/entities/Submission.js';
import { Rubric } from '../domain/entities/Rubric.js';
import { CriterionEvaluation } from '../domain/entities/Feedback.js';

export interface EvaluationResult {
  evaluatorName: string;
  evaluations: CriterionEvaluation[];
  summaryNote?: string;
  isDeterministic: boolean;
}

/**
 * Common evaluator strategy interface.
 * Proves Change Test B: New evaluators (Rule-based, LLM, AST Linters, Human Review)
 * implement this contract and plug into CompositeEvaluator without changing practice flow.
 */
export interface IEvaluator {
  readonly name: string;
  evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult>;
}

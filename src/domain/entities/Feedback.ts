export interface CriterionEvaluation {
  criterionId: string;
  criterionName: string;
  score: number; // 0 to maxScore
  maxScore: number;
  evidence: string; // Specific class/methods cited from candidate submission
  concern: string; // Failure scenario or code smell
  suggestion: string; // Concrete refactoring or design pattern recommendation
  confidence: number; // 0.0 to 1.0
}

export class Feedback {
  constructor(
    public readonly id: string,
    public readonly overallScore: number, // 0 - 100
    public readonly evaluations: CriterionEvaluation[],
    public readonly summary: string,
    public readonly evaluatedAt: Date = new Date(),
    public readonly evaluationDurationMs: number = 0
  ) {}

  public getCriterionEvaluation(criterionId: string): CriterionEvaluation | undefined {
    return this.evaluations.find(e => e.criterionId === criterionId);
  }
}

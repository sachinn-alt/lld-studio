import { IProblemRepository } from '../domain/interfaces/IProblemRepository.js';
import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository.js';
import { IEvaluator } from '../evaluators/IEvaluator.js';
import { Problem } from '../domain/entities/Problem.js';
import { Attempt } from '../domain/entities/Attempt.js';
import { Submission } from '../domain/entities/Submission.js';
import { ISubmissionPayload } from '../domain/interfaces/ISubmissionPayload.js';
import { Feedback } from '../domain/entities/Feedback.js';

export interface CreateAttemptDto {
  problemId: string;
  learnerId: string;
}

export interface SubmitSolutionDto {
  attemptId: string;
  payload: ISubmissionPayload;
}

export interface AttemptComparisonDto {
  problemId: string;
  learnerId: string;
  attempts: Array<{
    attemptNumber: number;
    status: string;
    submittedAt?: Date;
    overallScore?: number;
    evaluations?: any[];
  }>;
  scoreDelta: number;
  improvedCriteria: string[];
}

export class PracticeService {
  constructor(
    private readonly problemRepo: IProblemRepository,
    private readonly attemptRepo: IAttemptRepository,
    private readonly evaluator: IEvaluator
  ) {}

  public async getProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  public async getProblemById(id: string): Promise<Problem> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) {
      throw new Error(`Problem with id "${id}" not found.`);
    }
    return problem;
  }

  public async startAttempt(dto: CreateAttemptDto): Promise<Attempt> {
    const problem = await this.getProblemById(dto.problemId);
    const attemptNumber = await this.attemptRepo.getNextAttemptNumber(dto.problemId, dto.learnerId);
    const attemptId = `att-${dto.problemId}-${dto.learnerId}-${attemptNumber}-${Date.now().toString(36)}`;

    const attempt = new Attempt(attemptId, problem.id, dto.learnerId, attemptNumber);
    await this.attemptRepo.save(attempt);
    return attempt;
  }

  public async getAttempt(id: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(id);
    if (!attempt) {
      throw new Error(`Attempt with id "${id}" not found.`);
    }
    return attempt;
  }

  public async submitSolution(dto: SubmitSolutionDto): Promise<Attempt> {
    const attempt = await this.getAttempt(dto.attemptId);
    const problem = await this.getProblemById(attempt.problemId);

    const submissionId = `sub-${Date.now().toString(36)}`;
    const submission = new Submission(submissionId, dto.payload);

    // 1. Enforce State Machine Transition: DRAFT -> SUBMITTED
    attempt.submit(submission);
    await this.attemptRepo.save(attempt);

    // 2. Trigger Asynchronous Evaluation
    this.executeEvaluationAsync(attempt, problem);

    return attempt;
  }

  public async retryEvaluation(attemptId: string): Promise<Attempt> {
    const attempt = await this.getAttempt(attemptId);
    const problem = await this.getProblemById(attempt.problemId);

    if (!attempt.submission) {
      throw new Error('Cannot retry evaluation without an existing submission.');
    }

    this.executeEvaluationAsync(attempt, problem);
    return attempt;
  }

  private async executeEvaluationAsync(attempt: Attempt, problem: Problem): Promise<void> {
    const startTime = Date.now();
    try {
      // Transition: SUBMITTED -> EVALUATING
      attempt.startEvaluation();
      await this.attemptRepo.save(attempt);

      // Execute Composite Evaluation Strategy
      const result = await this.evaluator.evaluate(attempt.submission!, problem.rubric);

      // Calculate normalized overall score (0 - 100)
      const maxPossible = problem.rubric.getMaxScore();
      const actualTotal = result.evaluations.reduce((sum, e) => sum + e.score, 0);
      const overallScore = Math.min(100, Math.round((actualTotal / maxPossible) * 100));

      const feedback = new Feedback(
        `fb-${Date.now().toString(36)}`,
        overallScore,
        result.evaluations,
        result.summaryNote || 'Evaluation completed successfully.',
        new Date(),
        Date.now() - startTime
      );

      // Transition: EVALUATING -> COMPLETED
      attempt.completeEvaluation(feedback);
      await this.attemptRepo.save(attempt);
    } catch (err: any) {
      console.error(`Evaluation failed for attempt ${attempt.id}:`, err);
      // Transition: EVALUATING -> FAILED
      attempt.failEvaluation(err?.message || 'Unknown evaluation failure.');
      await this.attemptRepo.save(attempt);
    }
  }

  public async getAttemptHistory(problemId: string, learnerId: string): Promise<AttemptComparisonDto> {
    const attempts = await this.attemptRepo.findByProblemAndLearner(problemId, learnerId);

    const mapped = attempts.map(a => ({
      attemptNumber: a.attemptNumber,
      status: a.status,
      submittedAt: a.submission?.submittedAt,
      overallScore: a.feedback?.overallScore,
      evaluations: a.feedback?.evaluations
    }));

    let scoreDelta = 0;
    const improvedCriteria: string[] = [];

    if (attempts.length >= 2) {
      const latest = attempts[attempts.length - 1];
      const previous = attempts[attempts.length - 2];

      if (latest.feedback && previous.feedback) {
        scoreDelta = latest.feedback.overallScore - previous.feedback.overallScore;

        for (const latestEval of latest.feedback.evaluations) {
          const prevEval = previous.feedback.evaluations.find(e => e.criterionId === latestEval.criterionId);
          if (prevEval && latestEval.score > prevEval.score) {
            improvedCriteria.push(latestEval.criterionName);
          }
        }
      }
    }

    return {
      problemId,
      learnerId,
      attempts: mapped,
      scoreDelta,
      improvedCriteria
    };
  }
}

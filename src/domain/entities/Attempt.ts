import { AttemptStatus } from '../value-objects/AttemptStatus.js';
import { Submission } from './Submission.js';
import { Feedback } from './Feedback.js';

export class Attempt {
  private _status: AttemptStatus;
  private _submission?: Submission;
  private _feedback?: Feedback;
  private _failureReason?: string;
  private _updatedAt: Date;

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly learnerId: string,
    public readonly attemptNumber: number,
    initialStatus: AttemptStatus = AttemptStatus.DRAFT,
    public readonly createdAt: Date = new Date()
  ) {
    this._status = initialStatus;
    this._updatedAt = new Date();
  }

  public get status(): AttemptStatus {
    return this._status;
  }

  public get submission(): Submission | undefined {
    return this._submission;
  }

  public get feedback(): Feedback | undefined {
    return this._feedback;
  }

  public get failureReason(): string | undefined {
    return this._failureReason;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Enforces State Transition: DRAFT | FAILED -> SUBMITTED
   */
  public submit(submission: Submission): void {
    if (this._status !== AttemptStatus.DRAFT && this._status !== AttemptStatus.FAILED) {
      throw new Error(`Cannot submit attempt in status "${this._status}".`);
    }

    const validation = submission.payload.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid submission payload: ${validation.errors.join(', ')}`);
    }

    this._submission = submission;
    this._status = AttemptStatus.SUBMITTED;
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  /**
   * Enforces State Transition: SUBMITTED | FAILED -> EVALUATING
   */
  public startEvaluation(): void {
    if (this._status !== AttemptStatus.SUBMITTED && this._status !== AttemptStatus.FAILED) {
      throw new Error(`Cannot evaluate attempt in status "${this._status}". Must be SUBMITTED or FAILED.`);
    }

    if (!this._submission) {
      throw new Error('Cannot evaluate attempt without a recorded submission.');
    }

    this._status = AttemptStatus.EVALUATING;
    this._updatedAt = new Date();
  }

  /**
   * Enforces State Transition: EVALUATING -> COMPLETED
   */
  public completeEvaluation(feedback: Feedback): void {
    if (this._status !== AttemptStatus.EVALUATING) {
      throw new Error(`Cannot complete evaluation for attempt in status "${this._status}". Must be EVALUATING.`);
    }

    this._feedback = feedback;
    this._status = AttemptStatus.COMPLETED;
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  /**
   * Enforces State Transition: EVALUATING -> FAILED
   */
  public failEvaluation(reason: string): void {
    if (this._status !== AttemptStatus.EVALUATING) {
      throw new Error(`Cannot fail evaluation for attempt in status "${this._status}". Must be EVALUATING.`);
    }

    this._failureReason = reason;
    this._status = AttemptStatus.FAILED;
    this._updatedAt = new Date();
  }
}

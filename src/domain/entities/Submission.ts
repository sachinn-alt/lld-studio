import { ISubmissionPayload } from '../interfaces/ISubmissionPayload.js';
import { SubmissionFormat } from '../value-objects/SubmissionFormat.js';

export class Submission<T extends ISubmissionPayload = ISubmissionPayload> {
  constructor(
    public readonly id: string,
    public readonly payload: T,
    public readonly submittedAt: Date = new Date()
  ) {}

  public get format(): SubmissionFormat {
    return this.payload.format;
  }

  public toEvaluationContext(): string {
    return this.payload.toEvaluationContext();
  }

  public getSummary(): string {
    return this.payload.getSummary();
  }
}

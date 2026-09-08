import { SubmissionFormat } from '../value-objects/SubmissionFormat.js';
import { ValidationResult } from '../value-objects/ValidationResult.js';

/**
 * Core abstraction for any candidate submission.
 * Proves Change Test A: New submission formats (e.g. UMLDiagramPayload, CodePayload)
 * implement this interface without modifying the Attempt entity or PracticeService.
 */
export interface ISubmissionPayload {
  readonly format: SubmissionFormat;
  validate(): ValidationResult;
  toEvaluationContext(): string;
  getSummary(): string;
}

import { describe, it, expect } from 'vitest';
import { StructuredDesignPayload } from '../../src/domain/entities/StructuredDesignPayload.js';
import { Submission } from '../../src/domain/entities/Submission.js';
import { ISubmissionPayload } from '../../src/domain/interfaces/ISubmissionPayload.js';
import { SubmissionFormat } from '../../src/domain/value-objects/SubmissionFormat.js';
import { ValidationResult } from '../../src/domain/value-objects/ValidationResult.js';

describe('Submission Payload & Change Test A (Extensibility)', () => {
  it('should validate StructuredDesignPayload correctly', () => {
    const valid = new StructuredDesignPayload(
      [{ name: 'Ticket', responsibility: 'Holds ticket metadata' }],
      [{ name: 'IPayment', methods: ['pay()'] }],
      [{ name: 'Factory', justification: 'Creates tickets' }],
      'Assuming tickets are immutable once printed.'
    );
    expect(valid.validate().isValid).toBe(true);

    const invalid = new StructuredDesignPayload([], [], [], '');
    const res = invalid.validate();
    expect(res.isValid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(3);
  });

  /**
   * CHANGE TEST A VERIFICATION:
   * Proves that a brand new submission format (e.g. UMLDiagramPayload) can be
   * introduced and passed into Submission without altering Submission or Attempt classes.
   */
  it('should support a new UMLDiagramPayload without altering domain abstractions (Change Test A)', () => {
    // New class representing a class diagram submission
    class UmlDiagramPayload implements ISubmissionPayload {
      public readonly format = SubmissionFormat.UML_DIAGRAM;

      constructor(public readonly mermaidDiagramCode: string) {}

      public validate(): ValidationResult {
        if (!this.mermaidDiagramCode.startsWith('classDiagram')) {
          return ValidationResult.failure(['UML diagram must start with classDiagram']);
        }
        return ValidationResult.success();
      }

      public toEvaluationContext(): string {
        return `\`\`\`mermaid\n${this.mermaidDiagramCode}\n\`\`\``;
      }

      public getSummary(): string {
        return 'UML Class Diagram submission';
      }
    }

    const diagram = new UmlDiagramPayload('classDiagram\nclass ParkingLot {\n  +List floors\n}');
    const submission = new Submission('sub-diagram-1', diagram);

    expect(submission.format).toBe(SubmissionFormat.UML_DIAGRAM);
    expect(submission.toEvaluationContext()).toContain('classDiagram');
    expect(submission.getSummary()).toBe('UML Class Diagram submission');
  });
});

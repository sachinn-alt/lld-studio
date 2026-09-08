import { describe, it, expect } from 'vitest';
import { CompositeEvaluator } from '../../src/evaluators/CompositeEvaluator.js';
import { DeterministicRuleEvaluator } from '../../src/evaluators/DeterministicRuleEvaluator.js';
import { IEvaluator, EvaluationResult } from '../../src/evaluators/IEvaluator.js';
import { Submission } from '../../src/domain/entities/Submission.js';
import { StructuredDesignPayload } from '../../src/domain/entities/StructuredDesignPayload.js';
import { Rubric } from '../../src/domain/entities/Rubric.js';

describe('CompositeEvaluator & Change Test B (Evaluator Extensibility)', () => {
  const testRubric = new Rubric('test-rubric', [
    { id: 'domain-modeling', name: 'Domain Modeling', description: 'Entities', weight: 50, maxScore: 5 },
    { id: 'single-responsibility', name: 'SRP', description: 'Cohesion', weight: 50, maxScore: 5 }
  ]);

  const testPayload = new StructuredDesignPayload(
    [
      { name: 'ParkingLot', responsibility: 'Coordinates entry and floors' },
      { name: 'ParkingFloor', responsibility: 'Manages individual spots' },
      { name: 'ParkingSpot', responsibility: 'Holds vehicle slot status' },
      { name: 'Vehicle', responsibility: 'Vehicle metadata' }
    ],
    [{ name: 'IParkingStrategy', methods: ['findSpot()'] }],
    [{ name: 'Strategy', justification: 'Swappable search' }],
    'Thread safety handled via spot level locks.'
  );

  const submission = new Submission('sub-1', testPayload);

  it('should combine multiple evaluators into unified rubric feedback', async () => {
    const composite = new CompositeEvaluator([new DeterministicRuleEvaluator()]);
    const result = await composite.evaluate(submission, testRubric);

    expect(result.evaluations.length).toBe(2);
    expect(result.evaluations[0].score).toBeGreaterThanOrEqual(1);
    expect(result.evaluations[0].evidence).toBeTruthy();
  });

  /**
   * CHANGE TEST B VERIFICATION:
   * Proves that a brand new evaluator (e.g. PeerHumanReviewEvaluator or ASTLinter)
   * can be plugged into CompositeEvaluator without changing the practice flow.
   */
  it('should support plugging in a new HumanReviewEvaluator without changing CompositeEvaluator (Change Test B)', async () => {
    class MockHumanReviewEvaluator implements IEvaluator {
      public readonly name = 'MockHumanReviewEvaluator';

      public async evaluate(_sub: Submission, _rub: Rubric): Promise<EvaluationResult> {
        return {
          evaluatorName: this.name,
          evaluations: [
            {
              criterionId: 'domain-modeling',
              criterionName: 'Domain Modeling',
              score: 5,
              maxScore: 5,
              evidence: 'Senior Reviewer: Clear boundary between Floor and Spot.',
              concern: 'None',
              suggestion: 'Consider adding FloorId value object.',
              confidence: 1.0
            }
          ],
          isDeterministic: false
        };
      }
    }

    const composite = new CompositeEvaluator([
      new DeterministicRuleEvaluator(),
      new MockHumanReviewEvaluator() // Plugs in seamlessly!
    ]);

    const result = await composite.evaluate(submission, testRubric);
    expect(result.evaluations.length).toBe(2);
    // Verified that human review evidence was merged
    const domainEval = result.evaluations.find(e => e.criterionId === 'domain-modeling');
    expect(domainEval?.evidence).toContain('Senior Reviewer');
  });
});

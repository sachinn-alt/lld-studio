import { describe, it, expect } from 'vitest';
import { PracticeService } from '../../src/services/PracticeService.js';
import { InMemoryProblemRepository } from '../../src/infrastructure/repositories/InMemoryProblemRepository.js';
import { InMemoryAttemptRepository } from '../../src/infrastructure/repositories/InMemoryAttemptRepository.js';
import { DeterministicRuleEvaluator } from '../../src/evaluators/DeterministicRuleEvaluator.js';
import { StructuredDesignPayload } from '../../src/domain/entities/StructuredDesignPayload.js';
import { AttemptStatus } from '../../src/domain/value-objects/AttemptStatus.js';

describe('PracticeService End-to-End Orchestration', () => {
  const problemRepo = new InMemoryProblemRepository();
  const attemptRepo = new InMemoryAttemptRepository();
  const evaluator = new DeterministicRuleEvaluator();
  const service = new PracticeService(problemRepo, attemptRepo, evaluator);

  it('should load seeded practice problems', async () => {
    const problems = await service.getProblems();
    expect(problems.length).toBeGreaterThanOrEqual(3);
    expect(problems.some(p => p.id === 'prob-parking-lot')).toBe(true);
  });

  it('should manage attempt sequence and progress from Draft to Completed', async () => {
    // 1. Start Attempt 1
    const attempt1 = await service.startAttempt({
      problemId: 'prob-parking-lot',
      learnerId: 'learner-test'
    });
    expect(attempt1.attemptNumber).toBe(1);
    expect(attempt1.status).toBe(AttemptStatus.DRAFT);

    // 2. Submit solution
    const payload1 = new StructuredDesignPayload(
      [
        { name: 'ParkingLot', responsibility: 'Coordinates entry and floors' },
        { name: 'Floor', responsibility: 'Contains spots' }
      ],
      [{ name: 'IStrategy', methods: ['find()'] }],
      [],
      'Basic design assumptions without concurrency.'
    );

    const submitted = await service.submitSolution({
      attemptId: attempt1.id,
      payload: payload1
    });

    expect([AttemptStatus.SUBMITTED, AttemptStatus.EVALUATING]).toContain(submitted.status);

    // Wait a brief tick for async evaluation
    await new Promise(r => setTimeout(r, 100));

    const evaluated = await service.getAttempt(attempt1.id);
    expect(evaluated.status).toBe(AttemptStatus.COMPLETED);
    expect(evaluated.feedback).toBeDefined();
    expect(evaluated.feedback?.overallScore).toBeGreaterThan(0);

    // 3. Start Attempt 2 (Retake to improve)
    const attempt2 = await service.startAttempt({
      problemId: 'prob-parking-lot',
      learnerId: 'learner-test'
    });
    expect(attempt2.attemptNumber).toBe(2);

    // Submit improved solution addressing feedback
    const payload2 = new StructuredDesignPayload(
      [
        { name: 'ParkingLot', responsibility: 'Coordinates entry and floors' },
        { name: 'ParkingFloor', responsibility: 'Manages individual spots per floor' },
        { name: 'ParkingSpot', responsibility: 'Represents physical slot with status' },
        { name: 'ParkingTicket', responsibility: 'Immutable record of vehicle and entry timestamp' },
        { name: 'Vehicle', responsibility: 'Base vehicle classification' }
      ],
      [
        { name: 'IParkingStrategy', methods: ['findSpot(type, floors)'] },
        { name: 'IFeeCalculator', methods: ['calculateFee(ticket)'] }
      ],
      [
        { name: 'Strategy Pattern', justification: 'Swappable spot allocation strategies' },
        { name: 'Factory Pattern', justification: 'Creates vehicle and spot instances' }
      ],
      'Thread safety managed via lock striping per parking floor to maximize throughput.'
    );

    await service.submitSolution({
      attemptId: attempt2.id,
      payload: payload2
    });

    await new Promise(r => setTimeout(r, 100));

    // 4. Verify History & Progression Delta
    const history = await service.getAttemptHistory('prob-parking-lot', 'learner-test');
    expect(history.attempts.length).toBe(2);
    expect(history.attempts[1].overallScore).toBeGreaterThanOrEqual(history.attempts[0].overallScore!);
    expect(history.scoreDelta).toBeGreaterThanOrEqual(0);
  });
});

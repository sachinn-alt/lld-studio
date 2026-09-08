import { describe, it, expect } from 'vitest';
import { Attempt } from '../../src/domain/entities/Attempt.js';
import { AttemptStatus } from '../../src/domain/value-objects/AttemptStatus.js';
import { Submission } from '../../src/domain/entities/Submission.js';
import { StructuredDesignPayload } from '../../src/domain/entities/StructuredDesignPayload.js';
import { Feedback } from '../../src/domain/entities/Feedback.js';

describe('Attempt Entity & State Machine', () => {
  it('should initialize in DRAFT status', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    expect(attempt.status).toBe(AttemptStatus.DRAFT);
    expect(attempt.submission).toBeUndefined();
    expect(attempt.feedback).toBeUndefined();
  });

  it('should transition from DRAFT to SUBMITTED upon valid submission', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    const payload = new StructuredDesignPayload(
      [{ name: 'ParkingLot', responsibility: 'Manages floors and gates' }],
      [{ name: 'IParkingStrategy', methods: ['findSpot()'] }],
      [{ name: 'Strategy', justification: 'Swappable spot search' }],
      'Using centralized locks per floor for concurrency.'
    );
    const submission = new Submission('sub-1', payload);

    attempt.submit(submission);
    expect(attempt.status).toBe(AttemptStatus.SUBMITTED);
    expect(attempt.submission).toBe(submission);
  });

  it('should reject submission with invalid payload', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    // Missing entities and interfaces
    const invalidPayload = new StructuredDesignPayload([], [], [], '');
    const submission = new Submission('sub-1', invalidPayload);

    expect(() => attempt.submit(submission)).toThrow(/Invalid submission payload/);
    expect(attempt.status).toBe(AttemptStatus.DRAFT);
  });

  it('should transition through the complete lifecycle: DRAFT -> SUBMITTED -> EVALUATING -> COMPLETED', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    const payload = new StructuredDesignPayload(
      [{ name: 'Elevator', responsibility: 'Moves between floors' }],
      [{ name: 'IDispatcher', methods: ['dispatch()'] }],
      [{ name: 'State', justification: 'Car lifecycle' }],
      'Assuming in-memory event bus for floor requests.'
    );
    attempt.submit(new Submission('sub-1', payload));
    expect(attempt.status).toBe(AttemptStatus.SUBMITTED);

    attempt.startEvaluation();
    expect(attempt.status).toBe(AttemptStatus.EVALUATING);

    const feedback = new Feedback('fb-1', 88, [], 'Good design.');
    attempt.completeEvaluation(feedback);
    expect(attempt.status).toBe(AttemptStatus.COMPLETED);
    expect(attempt.feedback).toBe(feedback);
  });

  it('should transition from EVALUATING to FAILED when evaluation fails', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    const payload = new StructuredDesignPayload(
      [{ name: 'User', responsibility: 'Account data' }],
      [{ name: 'ISplit', methods: ['split()'] }],
      [],
      'Handling integer cents.'
    );
    attempt.submit(new Submission('sub-1', payload));
    attempt.startEvaluation();

    attempt.failEvaluation('LLM timeout');
    expect(attempt.status).toBe(AttemptStatus.FAILED);
    expect(attempt.failureReason).toBe('LLM timeout');
  });

  it('should disallow illegal state transitions', () => {
    const attempt = new Attempt('att-1', 'prob-1', 'user-1', 1);
    const feedback = new Feedback('fb-1', 75, [], 'Summary');

    // Cannot jump directly from DRAFT to EVALUATING or COMPLETED
    expect(() => attempt.startEvaluation()).toThrow(/Cannot evaluate attempt in status "DRAFT"/);
    expect(() => attempt.completeEvaluation(feedback)).toThrow(/Cannot complete evaluation for attempt in status "DRAFT"/);
  });
});

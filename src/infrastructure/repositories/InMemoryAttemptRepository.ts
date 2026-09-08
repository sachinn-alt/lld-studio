import { IAttemptRepository } from '../../domain/interfaces/IAttemptRepository.js';
import { Attempt } from '../../domain/entities/Attempt.js';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  public async findById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]> {
    const list: Attempt[] = [];
    for (const attempt of this.attempts.values()) {
      if (attempt.problemId === problemId && attempt.learnerId === learnerId) {
        list.push(attempt);
      }
    }
    // Sort chronologically
    return list.sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  public async getNextAttemptNumber(problemId: string, learnerId: string): Promise<number> {
    const existing = await this.findByProblemAndLearner(problemId, learnerId);
    return existing.length + 1;
  }
}

import { Attempt } from '../entities/Attempt.js';

export interface IAttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<void>;
  getNextAttemptNumber(problemId: string, learnerId: string): Promise<number>;
}

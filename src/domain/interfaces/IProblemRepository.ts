import { Problem } from '../entities/Problem.js';

export interface IProblemRepository {
  findById(id: string): Promise<Problem | null>;
  findAll(): Promise<Problem[]>;
}

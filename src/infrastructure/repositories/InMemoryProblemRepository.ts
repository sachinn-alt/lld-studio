import { IProblemRepository } from '../../domain/interfaces/IProblemRepository.js';
import { Problem } from '../../domain/entities/Problem.js';
import { Rubric } from '../../domain/entities/Rubric.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor() {
    this.loadInitialProblems();
  }

  private loadInitialProblems(): void {
    try {
      // Find problems.json
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const problemsJsonPath = path.resolve(currentDir, '../../data/problems.json');
      const rawData = fs.readFileSync(problemsJsonPath, 'utf-8');
      const parsed = JSON.parse(rawData);

      for (const item of parsed) {
        const rubric = new Rubric(item.rubric.id, item.rubric.criteria);
        const problem = new Problem({
          id: item.id,
          title: item.title,
          difficulty: item.difficulty,
          estimatedTime: item.estimatedTime,
          summary: item.summary,
          functionalRequirements: item.functionalRequirements,
          nonFunctionalRequirements: item.nonFunctionalRequirements,
          rubric,
          starterTemplate: item.starterTemplate
        });
        this.problems.set(problem.id, problem);
      }
    } catch (err) {
      console.error('Error loading problems.json:', err);
    }
  }

  public async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }
}

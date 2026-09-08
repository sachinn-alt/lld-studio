export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // e.g. 25 (%)
  maxScore: number; // e.g. 5
}

export class Rubric {
  constructor(
    public readonly id: string,
    public readonly criteria: RubricCriterion[]
  ) {
    if (!criteria || criteria.length === 0) {
      throw new Error('Rubric must contain at least one criterion.');
    }
  }

  public getMaxScore(): number {
    return this.criteria.reduce((sum, c) => sum + c.maxScore, 0);
  }

  public getCriterion(id: string): RubricCriterion | undefined {
    return this.criteria.find(c => c.id === id);
  }
}

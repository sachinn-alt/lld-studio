import { Rubric } from './Rubric.js';

export interface ProblemProps {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  summary: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  rubric: Rubric;
  starterTemplate?: any;
}

export class Problem {
  public readonly id: string;
  public readonly title: string;
  public readonly difficulty: 'Easy' | 'Medium' | 'Hard';
  public readonly estimatedTime: string;
  public readonly summary: string;
  public readonly functionalRequirements: string[];
  public readonly nonFunctionalRequirements: string[];
  public readonly rubric: Rubric;
  public readonly starterTemplate?: any;

  constructor(props: ProblemProps) {
    this.id = props.id;
    this.title = props.title;
    this.difficulty = props.difficulty;
    this.estimatedTime = props.estimatedTime;
    this.summary = props.summary;
    this.functionalRequirements = props.functionalRequirements;
    this.nonFunctionalRequirements = props.nonFunctionalRequirements;
    this.rubric = props.rubric;
    this.starterTemplate = props.starterTemplate;
  }
}

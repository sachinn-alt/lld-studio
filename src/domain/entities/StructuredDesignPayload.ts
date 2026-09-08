import { ISubmissionPayload } from '../interfaces/ISubmissionPayload.js';
import { SubmissionFormat } from '../value-objects/SubmissionFormat.js';
import { ValidationResult } from '../value-objects/ValidationResult.js';

export interface EntitySpecification {
  name: string;
  responsibility: string;
  fields?: string[];
  relationships?: string[];
}

export interface InterfaceSpecification {
  name: string;
  methods: string[];
}

export interface DesignPatternSpecification {
  name: string;
  justification: string;
}

export class StructuredDesignPayload implements ISubmissionPayload {
  public readonly format = SubmissionFormat.STRUCTURED_TEXT;

  constructor(
    public readonly entities: EntitySpecification[] = [],
    public readonly interfaces: InterfaceSpecification[] = [],
    public readonly designPatterns: DesignPatternSpecification[] = [],
    public readonly tradeOffsAndAssumptions: string = '',
    public readonly codeSnippetOrPseudocode: string = ''
  ) {}

  public validate(): ValidationResult {
    const errors: string[] = [];

    if (!this.entities || this.entities.length === 0) {
      errors.push('At least one core domain entity must be defined.');
    } else {
      for (const entity of this.entities) {
        if (!entity.name || entity.name.trim().length === 0) {
          errors.push('Entity must have a non-empty name.');
        }
        if (!entity.responsibility || entity.responsibility.trim().length < 5) {
          errors.push(`Entity "${entity.name || 'Unnamed'}" must have a meaningful responsibility description (min 5 chars).`);
        }
      }
    }

    if (!this.interfaces || this.interfaces.length === 0) {
      errors.push('At least one interface or contract must be defined to demonstrate abstraction.');
    }

    if (!this.tradeOffsAndAssumptions || this.tradeOffsAndAssumptions.trim().length < 10) {
      errors.push('You must provide design trade-offs or assumptions (min 10 characters).');
    }

    return errors.length === 0 ? ValidationResult.success() : ValidationResult.failure(errors);
  }

  public toEvaluationContext(): string {
    const sections: string[] = [];

    sections.push('### 1. Core Domain Entities');
    for (const e of this.entities) {
      let line = `- **${e.name}**: ${e.responsibility}`;
      if (e.fields && e.fields.length > 0) line += ` | Fields: [${e.fields.join(', ')}]`;
      if (e.relationships && e.relationships.length > 0) line += ` | Relations: [${e.relationships.join(', ')}]`;
      sections.push(line);
    }

    sections.push('\n### 2. Interfaces & Abstractions');
    for (const i of this.interfaces) {
      sections.push(`- **${i.name}** -> Methods: [${i.methods.join('; ')}]`);
    }

    sections.push('\n### 3. Design Patterns & Justifications');
    if (this.designPatterns.length > 0) {
      for (const p of this.designPatterns) {
        sections.push(`- **${p.name}**: ${p.justification}`);
      }
    } else {
      sections.push('None specified.');
    }

    sections.push(`\n### 4. Trade-offs & Assumptions\n${this.tradeOffsAndAssumptions}`);

    if (this.codeSnippetOrPseudocode && this.codeSnippetOrPseudocode.trim().length > 0) {
      sections.push(`\n### 5. Implementation / Pseudocode\n\`\`\`\n${this.codeSnippetOrPseudocode}\n\`\`\``);
    }

    return sections.join('\n');
  }

  public getSummary(): string {
    return `${this.entities.length} entities, ${this.interfaces.length} interfaces, ${this.designPatterns.length} patterns`;
  }
}

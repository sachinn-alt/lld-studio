export class ValidationResult {
  constructor(
    public readonly isValid: boolean,
    public readonly errors: string[] = []
  ) {}

  public static success(): ValidationResult {
    return new ValidationResult(true, []);
  }

  public static failure(errors: string[]): ValidationResult {
    return new ValidationResult(false, errors);
  }
}

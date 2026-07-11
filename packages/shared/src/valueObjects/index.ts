export type Email = string & { readonly __brand: 'Email' };
export function createEmail(value: string): Email {
  if (!value.includes('@')) {
    throw new Error('Invalid email format');
  }
  return value as Email;
}
export type Percentage = number & { readonly __brand: 'Percentage' };
export function createPercentage(value: number): Percentage {
  if (value < 0 || value > 100) {
    throw new Error('Percentage must be between 0 and 100');
  }
  return value as Percentage;
}
export type NonEmptyString = string & { readonly __brand: 'NonEmptyString' };
export function createNonEmptyString(value: string): NonEmptyString {
  if (value.length === 0) {
    throw new Error('String must not be empty');
  }
  return value as NonEmptyString;
}

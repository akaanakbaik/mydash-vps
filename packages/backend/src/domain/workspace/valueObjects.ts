export type EmailAddress = string & { readonly __brand: 'EmailAddress' };
export type IpAddress = string & { readonly __brand: 'IpAddress' };
export type HashedPassword = string & { readonly __brand: 'HashedPassword' };
export interface PasswordHash {
  readonly hash: HashedPassword;
  readonly salt: string;
  readonly version: number;
}

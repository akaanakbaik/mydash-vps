export type Result<T, E = Error> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };

export function success<T>(data: T): Result<T, never> {
  return { success: true, data, error: null };
}

export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, data: null, error };
}

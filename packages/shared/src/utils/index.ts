export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type PickNullable<T> = {
  [P in keyof T as null extends T[P] ? P : never]: T[P];
};

export type PickNonNullable<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P];
};

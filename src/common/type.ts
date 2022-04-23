export type Merge<M, N> = Omit<M, Extract<keyof M, keyof N>> & N;
export type Nested<T> = T | Nested<T>[];
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

export type Success<T> = {
  success: true;
  data: T;
  statusCode: number;
};

export type Failure<E> = {
  success: false;
  data: E;
  statusCode: number;
};

export type Result<T, E> = Success<T> | Failure<E>;

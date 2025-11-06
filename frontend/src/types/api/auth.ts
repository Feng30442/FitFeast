export type SignupRequest = {
  username: string;
  password: string;
};
export type SignupResponse = UserResponse;
export type SignupErrorResponse = {
  username: string;
  password: string;
};
export type SignupValidateErrors = Partial<Record<keyof SignupRequest, string>>;

export type SigninRequest = {
  username: string;
  password: string;
};
export type SigninResponse = UserResponse;
export type SigninErrorResponse = {
  message: string;
};

export type SignoutResponse = null;
export type SignoutErrorResponse = {
  message: string;
};

export type UserResponse = {
  username: string;
};
export type UserErrorResponse = {
  message: string;
};

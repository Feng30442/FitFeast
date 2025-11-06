import { callApi } from "@/lib/api/callApi";
import { SignupErrorResponse, SignupRequest, SignupResponse } from "@/types/api/auth";

/**
 * 新規登録API
 * @param request
 * @returns
 */
export const authSignup = async (request: SignupRequest) => {
  return callApi<SignupResponse, SignupErrorResponse>("auth/signup/", {
    method: "POST",
    body: JSON.stringify(request),
    credentials: "include",
  });
};

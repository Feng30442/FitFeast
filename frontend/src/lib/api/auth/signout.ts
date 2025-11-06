import { callApi } from "@/lib/api/callApi";
import { SignoutErrorResponse, SignoutResponse } from "@/types/api/auth";

/**
 * ログアウトAPI
 * @param request
 * @returns
 */
export const authSignout = async () => {
  return callApi<SignoutResponse, SignoutErrorResponse>("auth/signout/", {
    method: "DELETE",
  });
};

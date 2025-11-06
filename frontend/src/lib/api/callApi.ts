import { Result } from "@/types/api/base";

// http-status-codes を使わず最低限を自前定義
const StatusCodes = {
  NO_CONTENT: 204,
} as const;

/**
 * アプリケーション全体で使用する汎用APIクライアント
 * @param path APIエンドポイントのパス (例: "/auth/user/id")
 * @param options fetchに渡すオプション
 * @returns APIの実行結果 (Result型)
 */
export const callApi = async <T, E>(
  path: string,
  options: RequestInit = {},
): Promise<Result<T, E>> => {
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  try {
    // 呼び出し側の値をそのまま利用して結合
    const url = new URL(path, process.env.NEXT_PUBLIC_API_BASE_URL).toString();

    // Header を正規化（既存を尊重しつつ既定値を設定）
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const newOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers,
    };

    const response = await fetch(url, newOptions);

    if (response.status === StatusCodes.NO_CONTENT) {
      return {
        success: true,
        data: null as T,
        statusCode: response.status,
      };
    }

    // 本文の解析: JSON を優先し、失敗時はテキストにフォールバック
    const parseBody = async (res: Response): Promise<unknown> => {
      const cloned = res.clone();
      try {
        return await cloned.json();
      } catch {
        try {
          const text = await res.text();
          return text || null;
        } catch {
          return null;
        }
      }
    };

    const body = await parseBody(response);

    if (!response.ok) {
      return {
        success: false,
        data: (body ?? { message: "Request failed" }) as E,
        statusCode: response.status,
      };
    }

    return { success: true, data: body as T, statusCode: response.status };
  } catch (e) {
    console.error("API call error:", e);
    throw e;
  }
};

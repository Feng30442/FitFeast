export interface TestPostRequest {
  id: number;
  text: string;
}

export interface TestPostResponse {
  status: "success";
  id: number;
  title: string;
  content: string;
}

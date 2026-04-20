import api from "./api";
import type { QuestionCounts } from "../config/questionGeneration";

export type QuestionProvider = string;

export interface GenerateQuestionsRequest {
  fileIds: string[];
  questionCounts: QuestionCounts;
  provider: QuestionProvider;
}

export interface GenerateQuestionsResponse {
  result: string;
}

export async function generateQuestions(
  payload: GenerateQuestionsRequest
): Promise<GenerateQuestionsResponse> {
  const resp = await api.post<GenerateQuestionsResponse>(
    "/storage/files/generate-questions",
    payload
  );
  return resp.data;
}

import client from "./client";

export interface AnalysisData {
  [key: string]: unknown;
}

export const getAnalysis = async (): Promise<AnalysisData> => {
  const res = await client.get("/api/analysis");
  return res.data;
};

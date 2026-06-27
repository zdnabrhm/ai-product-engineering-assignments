import { OpenAIClient } from "@anvia/openai";
import { tavily } from "@tavily/core";
import "dotenv/config";

const openaiClient = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });

export function getModel(model: string = "gpt-5.5") {
  return openaiClient.completionModel(model);
}

export const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

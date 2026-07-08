import { OpenAIClient } from "@anvia/openai";
import { env } from "../utils/env.js";

const openaiClient = new OpenAIClient({ apiKey: env.OPENAI_API_KEY, baseUrl: env.OPENAI_BASE_URL });

export function getModel(model: string = "deepseek-v4-flash") {
  return openaiClient.completionModel(model);
}

import { OpenAIClient } from "@anvia/openai";
import { env } from "../env.js";

const openaiClient = new OpenAIClient({
  baseUrl: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
});

export const model = openaiClient.completionModel(env.OPENAI_MODEL);

import { OpenAIClient } from "@anvia/openai";
import { env } from "../env.js";

const openaiClient = new OpenAIClient({
  apiKey: env.OPENAI_API_KEY,
  baseUrl: env.OPENAI_BASE_URL,
});

export function getModel() {
  return openaiClient.completionModel(env.OPENAI_MODEL);
}

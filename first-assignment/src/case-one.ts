import { createParsedCompletion } from "@anvia/core";
import z from "zod";
import { getModel } from "./utils";

const ActionDecisionSchema = z.object({
  action: z.enum(["answer_directly", "ask_clarifying_question", "handoff"]),
  reason: z.string(),
  question: z.string().describe("Only fill this when clarification is needed"),
});

const prompt = "Why was I charged twice? Please fix it now.";

const decision = await createParsedCompletion(getModel(), {
  instructions: `
    Decide what to do before answering the customer.

    Use answer_directly when no private account information or action is needed.
    Use ask_clarifying_question when important information is missing.
    Use handoff when the request needs account access or a human to take action.

    Ask one short question only when clarification is needed.
  `,
  input: `Customer request: ${prompt}`,
  schema: ActionDecisionSchema,
});

console.log(decision.data);

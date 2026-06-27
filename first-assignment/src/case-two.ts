import z from "zod";
import { createParsedCompletion } from "@anvia/core";
import { getModel } from "./utils";

const MeetingSummarySchema = z.object({
  decisions: z.array(z.string()),
  risks: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
    }),
  ),
});

const transcript = `
  Maya: We agreed to launch the beta on July 15.
  Budi: The payment integration may not be ready by then.
  Maya: Budi, please confirm the integration status by Friday.
  Rina: I will prepare the beta announcement.
`;

const summary = await createParsedCompletion(getModel(), {
  instructions:
    "Extract decisions, risks, and action items from the meeting transcript. Do not invent information.",
  input: transcript,
  schema: MeetingSummarySchema,
});

console.log(summary.data);

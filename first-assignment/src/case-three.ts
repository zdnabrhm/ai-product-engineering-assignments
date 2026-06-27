import { createParsedCompletion } from "@anvia/core";
import z from "zod";
import { getModel, tavilyClient } from "./utils";

const companyName = "Bank Central Asia";

const searchResult = await tavilyClient.search(
  `${companyName} official website industry company profile`,
  { searchDepth: "basic" },
);

const CompanyProfileSchema = z.object({
  name: z.string(),
  profile: z.string(),
  website: z.string(),
  industry: z.string(),
});

const profile = await createParsedCompletion(getModel(), {
  instructions:
    "Create a short company profile from the search results. Extract the official website and industry. Return 'NONE' when information is unavailable.",
  input: `Company: ${companyName}\nSearch results: ${JSON.stringify(searchResult.results)}`,
  schema: CompanyProfileSchema,
});

console.log(profile.data);

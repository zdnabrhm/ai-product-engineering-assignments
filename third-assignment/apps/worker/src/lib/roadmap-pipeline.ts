import { createParsedCompletion } from "@anvia/core";
import {
  roadmapResultSchema,
  roadmapScopeSchema,
  roadmapSourcesSchema,
  type RoadmapResult,
  type RoadmapSource,
} from "@third-assignment/db";
import { tavily } from "@tavily/core";
import { env } from "../env.js";
import { model } from "./anvia.js";

type RoadmapInput = {
  category: "LEARNING" | "CAREER" | "EVENT" | "PROJECT";
  goal: string;
  currentSituation: string;
  targetDate: Date;
  constraints: string;
};

type PipelineResult =
  | { status: "rejected"; reason: string }
  | {
      status: "completed";
      result: RoadmapResult;
      sources: RoadmapSource[];
    };

const tavilyClient = tavily({ apiKey: env.TAVILY_API_KEY });

const SCOPE_INSTRUCTIONS = `
  Decide whether this goal belongs to one supported category: learning, career,
  event planning, or a small non-high-stakes project. Reject goals asking for
  medical treatment, legal strategy, financial or investment advice, dangerous
  activity, or wrongdoing.

  When supported, return exactly 3 distinct web search queries that will find
  practical and credible information for building the roadmap. When rejected,
  explain why and return no queries. Do not answer the goal itself.
`;

const GENERATE_INSTRUCTIONS = `
  Create a research-grounded, actionable roadmap for the supplied goal. Return
  3 to 5 milestones in chronological order with sequential IDs (M1, M2, ...).
  Every milestone must cite at least one supplied source ID and include ISO
  calendar start and end dates plus 2 to 5 concrete tasks with measurable
  success criteria. Dates must start no earlier than today and end no later than
  the target date. Use only facts supported by the supplied source snippets. Do
  not invent URLs, source IDs, credentials, guarantees, or personal facts.
`;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function uniqueQueries(queries: string[]): string[] {
  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
}

async function research(queries: string[]): Promise<RoadmapSource[]> {
  const responses = await Promise.all(
    queries.map((query) =>
      tavilyClient.search(query, {
        searchDepth: "basic",
        maxResults: 3,
        includeAnswer: false,
        includeRawContent: false,
      }),
    ),
  );

  const byUrl = new Map<string, Omit<RoadmapSource, "id">>();
  for (const response of responses) {
    for (const result of response.results) {
      const url = result.url.trim();
      const content = result.content.trim();
      if (!url || !content || byUrl.has(url)) continue;
      byUrl.set(url, {
        title: result.title.trim() || url,
        url,
        content,
      });
      if (byUrl.size === 9) break;
    }
    if (byUrl.size === 9) break;
  }

  const sources = [...byUrl.values()].map((source, index) => ({
    id: `S${index + 1}`,
    ...source,
  }));

  return roadmapSourcesSchema.parse(sources);
}

function assertValidMilestones(result: RoadmapResult, sources: RoadmapSource[]): void {
  const knownIds = new Set(sources.map((source) => source.id));
  for (const [index, milestone] of result.milestones.entries()) {
    if (milestone.id !== `M${index + 1}`) {
      throw new Error(`Milestone ${index + 1} must use ID M${index + 1}.`);
    }
    if (milestone.sourceIds.some((sourceId) => !knownIds.has(sourceId))) {
      throw new Error(`Milestone ${milestone.id} cites an unknown source.`);
    }
  }
}

function assertValidDates(result: RoadmapResult, targetDate: Date, today: Date): void {
  const earliest = toIsoDate(today);
  const latest = toIsoDate(targetDate);
  let previousEnd = earliest;

  for (const milestone of result.milestones) {
    if (milestone.startDate < earliest || milestone.startDate < previousEnd) {
      throw new Error(`Milestone ${milestone.id} starts out of sequence.`);
    }
    if (milestone.endDate < milestone.startDate || milestone.endDate > latest) {
      throw new Error(`Milestone ${milestone.id} has an invalid date range.`);
    }
    previousEnd = milestone.endDate;
  }
}

export async function runRoadmapPipeline(input: RoadmapInput): Promise<PipelineResult> {
  const today = new Date();
  const commonContext = {
    category: input.category,
    goal: input.goal,
    currentSituation: input.currentSituation,
    targetDate: toIsoDate(input.targetDate),
    constraints: input.constraints,
    today: toIsoDate(today),
  };

  const scope = await createParsedCompletion(model, {
    instructions: SCOPE_INSTRUCTIONS,
    input: JSON.stringify(commonContext),
    schema: roadmapScopeSchema,
  });

  if (!scope.data.supported) {
    return {
      status: "rejected",
      reason: scope.data.reason.trim() || "This goal is outside the supported scope.",
    };
  }

  const queries = uniqueQueries(scope.data.queries);
  if (queries.length !== 3) {
    throw new Error("The research planner did not return exactly three unique queries.");
  }

  const sources = await research(queries);
  if (sources.length === 0) {
    throw new Error("Research returned no usable sources.");
  }

  const resultResponse = await createParsedCompletion(model, {
    instructions: GENERATE_INSTRUCTIONS,
    input: JSON.stringify({ ...commonContext, sources }),
    schema: roadmapResultSchema,
  });
  const result = roadmapResultSchema.parse(resultResponse.data);
  assertValidMilestones(result, sources);
  assertValidDates(result, input.targetDate, today);

  return { status: "completed", result, sources };
}

import { createParsedCompletion } from "@anvia/core";
import {
  roadmapPlanSchema,
  roadmapResultSchema,
  roadmapScopeSchema,
  roadmapSourcesSchema,
  type RoadmapPlan,
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
      plan: RoadmapPlan;
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

const PLAN_INSTRUCTIONS = `
  Create a research-grounded milestone skeleton for the supplied goal.
  Return 3 to 5 milestones in chronological order. Give each milestone a stable
  ID (M1, M2, ...). Every milestone must cite at least one supplied source ID.
  Use only facts supported by the supplied source snippets. Do not invent URLs,
  source IDs, credentials, guarantees, or personal facts.
`;

const EXECUTE_INSTRUCTIONS = `
  Expand the supplied milestone plan into an actionable roadmap. Preserve every
  milestone ID, title, objective, order, and sourceIds exactly. Add ISO calendar
  start and end dates plus 2 to 5 concrete tasks with measurable success
  criteria. Dates must be chronological, start no earlier than today, and end
  no later than the target date. Do not add or remove milestones and do not
  introduce claims unsupported by the supplied research.
`;

function dateOnly(date: Date): string {
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

function assertKnownSourceIds(plan: RoadmapPlan, sources: RoadmapSource[]): void {
  const knownIds = new Set(sources.map((source) => source.id));
  for (const milestone of plan.milestones) {
    if (milestone.sourceIds.some((sourceId) => !knownIds.has(sourceId))) {
      throw new Error(`Milestone ${milestone.id} cites an unknown source.`);
    }
  }
}

function assertExecutionMatchesPlan(plan: RoadmapPlan, result: RoadmapResult): void {
  if (result.milestones.length !== plan.milestones.length) {
    throw new Error("Executed roadmap changed the milestone count.");
  }

  for (const [index, planned] of plan.milestones.entries()) {
    const executed = result.milestones[index];
    if (
      !executed ||
      executed.id !== planned.id ||
      executed.title !== planned.title ||
      executed.objective !== planned.objective ||
      executed.sourceIds.join("|") !== planned.sourceIds.join("|")
    ) {
      throw new Error(`Executed milestone ${index + 1} does not match the plan.`);
    }
  }
}

function assertValidDates(result: RoadmapResult, targetDate: Date, today: Date): void {
  const earliest = dateOnly(today);
  const latest = dateOnly(targetDate);
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
    targetDate: dateOnly(input.targetDate),
    constraints: input.constraints,
    today: dateOnly(today),
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

  const planResponse = await createParsedCompletion(model, {
    instructions: PLAN_INSTRUCTIONS,
    input: JSON.stringify({ ...commonContext, sources }),
    schema: roadmapPlanSchema,
  });
  const plan = roadmapPlanSchema.parse(planResponse.data);
  assertKnownSourceIds(plan, sources);

  const resultResponse = await createParsedCompletion(model, {
    instructions: EXECUTE_INSTRUCTIONS,
    input: JSON.stringify({ ...commonContext, plan, sources }),
    schema: roadmapResultSchema,
  });
  const result = roadmapResultSchema.parse(resultResponse.data);
  assertExecutionMatchesPlan(plan, result);
  assertValidDates(result, input.targetDate, today);

  return { status: "completed", plan, result, sources };
}

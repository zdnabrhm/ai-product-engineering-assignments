import type { TaskJobData } from "@third-assignment/queue";

export async function handleExampleTask(data: TaskJobData): Promise<void> {
  console.log("Processing resource:", data.resourceId);

  // Implementation here
}

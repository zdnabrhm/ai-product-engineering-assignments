import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import pdfmake from "pdfmake";
import type { Content, TableCell } from "pdfmake";
import { exercises } from "../../data/exercises.js";
import type { CreateWorkoutPlanInput, WorkoutPlan } from "./schema.js";

const exerciseNames = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
type DocumentDefinition = Parameters<typeof pdfmake.createPdf>[0];

pdfmake.addFonts({
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique",
  },
});
pdfmake.setUrlAccessPolicy(() => false);
const standardFonts = new Set([
  "Helvetica",
  "Helvetica-Bold",
  "Helvetica-Oblique",
  "Helvetica-BoldOblique",
]);
pdfmake.setLocalAccessPolicy((path) => standardFonts.has(path));

function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function profileTable(input: CreateWorkoutPlanInput): Content {
  return {
    layout: "lightHorizontalLines",
    table: {
      widths: ["auto", "*"],
      body: [
        ["Goal", formatLabel(input.goal)],
        ["Experience", formatLabel(input.experienceLevel)],
        ["Training days", `${input.daysPerWeek} days per week`],
        ["Session duration", `${input.sessionDurationMinutes} minutes`],
        ["Equipment", input.availableEquipment.join(", ")],
        ["Limitations", input.limitations ?? "None provided"],
        ["Preferences", input.preferences ?? "None provided"],
      ],
    },
    margin: [0, 0, 0, 16],
  };
}

function weeklyOverview(plan: WorkoutPlan): Content {
  const rows: TableCell[][] = [
    [
      { text: "Day", style: "tableHeader" },
      { text: "Type", style: "tableHeader" },
      { text: "Focus", style: "tableHeader" },
    ],
    ...plan.days.map((day) => [
      `Day ${day.dayNumber}`,
      day.type === "TRAINING" ? "Training" : "Rest",
      day.focus ?? "Recovery",
    ]),
  ];

  return {
    layout: "lightHorizontalLines",
    table: {
      headerRows: 1,
      widths: ["auto", "auto", "*"],
      body: rows,
    },
    margin: [0, 0, 0, 16],
  };
}

function workoutDays(plan: WorkoutPlan): Content[] {
  return plan.days.flatMap((day): Content[] => {
    const heading: Content = {
      text: `Day ${day.dayNumber} — ${day.focus ?? "Rest & Recovery"}`,
      style: "sectionHeading",
      pageBreak: day.dayNumber > 1 ? "before" : undefined,
    };

    if (day.type === "REST") {
      return [heading, { text: day.dayNotes, margin: [0, 0, 0, 12] }];
    }

    const rows: TableCell[][] = [
      [
        { text: "Exercise", style: "tableHeader" },
        { text: "Sets", style: "tableHeader" },
        { text: "Prescription", style: "tableHeader" },
        { text: "Rest", style: "tableHeader" },
      ],
      ...day.exercises.map((exercise) => [
        {
          stack: [
            exerciseNames.get(exercise.exerciseId) ?? exercise.exerciseId,
            ...(exercise.notes ? [{ text: exercise.notes, style: "tableNote" } as Content] : []),
          ],
        },
        exercise.sets.toString(),
        exercise.prescription,
        `${exercise.restSeconds}s`,
      ]),
    ];

    return [
      heading,
      { text: day.dayNotes, margin: [0, 0, 0, 10] },
      {
        layout: "lightHorizontalLines",
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto"],
          body: rows,
          dontBreakRows: true,
        },
        margin: [0, 0, 0, 12],
      },
    ];
  });
}

export async function writeWorkoutPlanPdf(params: {
  input: CreateWorkoutPlanInput;
  plan: WorkoutPlan;
  filePath: string;
}): Promise<void> {
  const { input, plan, filePath } = params;

  const document: DocumentDefinition = {
    pageSize: "A4",
    pageMargins: [48, 56, 48, 56],
    defaultStyle: {
      font: "Helvetica",
      fontSize: 10,
      lineHeight: 1.25,
      color: "#1f2937",
    },
    info: {
      title: plan.title,
      author: "AI Workout Plan",
      subject: "Personalized one-week workout plan",
    },
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: "center",
      color: "#6b7280",
      fontSize: 8,
      margin: [0, 16, 0, 0],
    }),
    styles: {
      title: {
        fontSize: 24,
        bold: true,
        color: "#111827",
        margin: [0, 0, 0, 8],
      },
      subtitle: {
        fontSize: 11,
        color: "#4b5563",
        margin: [0, 0, 0, 20],
      },
      sectionHeading: {
        fontSize: 15,
        bold: true,
        color: "#111827",
        margin: [0, 14, 0, 8],
      },
      tableHeader: {
        bold: true,
        color: "#111827",
        fillColor: "#e5e7eb",
      },
      tableNote: {
        fontSize: 8,
        italics: true,
        color: "#6b7280",
      },
      disclaimer: {
        fontSize: 8,
        color: "#6b7280",
        margin: [0, 16, 0, 0],
      },
    },
    content: [
      { text: plan.title, style: "title" },
      {
        text: "Personalized one-week workout plan",
        style: "subtitle",
      },
      { text: "Your Profile", style: "sectionHeading" },
      profileTable(input),
      { text: "Training Strategy", style: "sectionHeading" },
      { text: plan.strategySummary, margin: [0, 0, 0, 16] },
      { text: "Weekly Overview", style: "sectionHeading" },
      weeklyOverview(plan),
      { text: "Daily Plan", style: "sectionHeading" },
      ...workoutDays(plan),
      { text: "Recovery Notes", style: "sectionHeading", pageBreak: "before" },
      { ul: plan.recoveryNotes },
      { text: "General Notes", style: "sectionHeading" },
      { ul: plan.generalNotes },
      {
        text:
          "Disclaimer: This plan is for general educational purposes and is not medical advice. " +
          "Stop exercising and consult a qualified professional if you experience pain or have a medical concern.",
        style: "disclaimer",
      },
    ],
  };

  await mkdir(dirname(filePath), { recursive: true });
  await pdfmake.createPdf(document).write(filePath);
}

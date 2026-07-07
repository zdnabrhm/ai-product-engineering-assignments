import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import pdfmake from "pdfmake";
import type { Content } from "pdfmake";
import { exercises } from "../../data/exercises.js";
import type { CreateWorkoutPlanInput, WorkoutPlan } from "./schema.js";

const exerciseNames = new Map(exercises.map((exercise) => [exercise.id, exercise.name]));
type DocumentDefinition = Parameters<typeof pdfmake.createPdf>[0];

const ACCENT = "#800020";
const ACCENT_LIGHT = "#fce9ec";
const TEXT_DARK = "#111827";
const TEXT_MEDIUM = "#4b5563";
const TEXT_LIGHT = "#6b7280";
const BORDER = "#e5e7eb";
const WHITE = "#ffffff";

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

function listItems(items: string[]): Content[] {
  return items.map((text) => ({ text, margin: [0, 2, 0, 2] }));
}

function headerBar(): Content {
  return {
    canvas: [
      {
        type: "rect",
        x: 0,
        y: 0,
        w: 515,
        h: 4,
        color: ACCENT,
      },
    ],
    margin: [0, 0, 0, 24],
  };
}

function sectionDivider(): Content {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: 515,
        y2: 0,
        lineWidth: 1,
        lineColor: BORDER,
      },
    ],
    margin: [0, 4, 0, 12],
  };
}

function profileTable(input: CreateWorkoutPlanInput): Content {
  const labels = [
    { label: "Goal", value: formatLabel(input.goal) },
    { label: "Experience", value: formatLabel(input.experienceLevel) },
    { label: "Training days", value: `${input.daysPerWeek} days per week` },
    { label: "Session duration", value: `${input.sessionDurationMinutes} minutes` },
    { label: "Equipment", value: input.availableEquipment.join(", ") },
    { label: "Limitations", value: input.limitations ?? "None provided" },
    { label: "Preferences", value: input.preferences ?? "None provided" },
  ];

  return {
    layout: "noBorders",
    table: {
      widths: ["auto", "*"],
      body: labels.map((row) => [
        { text: row.label, color: TEXT_MEDIUM, fontSize: 9.5, noWrap: true },
        { text: row.value, fontSize: 9.5 },
      ]),
    },
    margin: [0, 0, 0, 16],
  };
}

function weeklyOverview(plan: WorkoutPlan): Content {
  const header: Content[] = [
    { text: "Day", color: WHITE, bold: true, fillColor: ACCENT, alignment: "center" as const },
    { text: "Type", color: WHITE, bold: true, fillColor: ACCENT, alignment: "center" as const },
    { text: "Focus", color: WHITE, bold: true, fillColor: ACCENT },
  ];
  const rows: Content[][] = [
    header,
    ...plan.days.map((day) => [
      { text: `Day ${day.dayNumber}`, alignment: "center" as const },
      { text: day.type === "TRAINING" ? "Training" : "Rest", alignment: "center" as const },
      day.focus ?? "Recovery",
    ]),
  ];

  return {
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
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
      stack: [
        {
          canvas: [
            {
              type: "rect",
              x: 0,
              y: 0,
              w: 515,
              h: 28,
              color: ACCENT_LIGHT,
            },
          ],
          margin: [0, 0, 0, -28],
        },
        {
          text: `Day ${day.dayNumber} — ${day.focus ?? "Rest & Recovery"}`,
          margin: [12, 6, 0, 6],
          fontSize: 13,
          bold: true,
          color: ACCENT,
        },
      ],
      pageBreak: day.dayNumber > 1 ? "before" : undefined,
      margin: [0, 0, 0, 8],
    };

    if (day.type === "REST") {
      return [heading, { text: day.dayNotes, margin: [0, 0, 0, 12], color: TEXT_MEDIUM }];
    }

    const rows: Content[][] = [
      [
        { text: "Exercise", color: WHITE, bold: true, fillColor: ACCENT },
        { text: "Sets", color: WHITE, bold: true, fillColor: ACCENT, alignment: "center" as const },
        {
          text: "Prescription",
          color: WHITE,
          bold: true,
          fillColor: ACCENT,
          alignment: "center" as const,
        },
        { text: "Rest", color: WHITE, bold: true, fillColor: ACCENT, alignment: "center" as const },
      ],
      ...day.exercises.map((exercise) => [
        {
          stack: [
            {
              text: exerciseNames.get(exercise.exerciseId) ?? exercise.exerciseId,
              bold: true,
              color: TEXT_DARK,
            },
            ...(exercise.notes
              ? [{ text: exercise.notes, color: TEXT_LIGHT, fontSize: 8, italics: true }]
              : []),
          ],
        },
        { text: exercise.sets.toString(), alignment: "center" as const },
        { text: exercise.prescription, alignment: "center" as const },
        { text: `${exercise.restSeconds}s`, alignment: "center" as const },
      ]),
    ];

    return [
      heading,
      { text: day.dayNotes, margin: [0, 0, 0, 10], color: TEXT_MEDIUM },
      {
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
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
    pageMargins: [48, 40, 48, 56],
    defaultStyle: {
      font: "Helvetica",
      fontSize: 10,
      lineHeight: 1.35,
      color: TEXT_DARK,
    },
    info: {
      title: plan.title,
      author: "AI Workout Plan",
      subject: "Personalized one-week workout plan",
    },
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: "center",
      color: TEXT_LIGHT,
      fontSize: 8,
      margin: [0, 16, 0, 0],
    }),
    styles: {
      title: {
        fontSize: 26,
        bold: true,
        color: ACCENT,
        margin: [0, 0, 0, 4],
      },
      subtitle: {
        fontSize: 11,
        color: TEXT_MEDIUM,
        margin: [0, 0, 0, 20],
      },
      sectionHeading: {
        fontSize: 14,
        bold: true,
        color: ACCENT,
        margin: [0, 20, 0, 8],
      },
      tableNote: {
        fontSize: 8,
        italics: true,
        color: TEXT_LIGHT,
      },
      disclaimer: {
        fontSize: 8,
        color: TEXT_LIGHT,
        margin: [0, 16, 0, 0],
      },
    },
    content: [
      headerBar(),
      { text: plan.title, style: "title" },
      {
        text: "Personalized one-week workout plan",
        style: "subtitle",
      },
      { text: "Your Profile", style: "sectionHeading" },
      sectionDivider(),
      profileTable(input),
      { text: "Training Strategy", style: "sectionHeading" },
      sectionDivider(),
      { text: plan.strategySummary, margin: [0, 0, 0, 16], color: TEXT_MEDIUM, lineHeight: 1.5 },
      { text: "Weekly Overview", style: "sectionHeading" },
      sectionDivider(),
      weeklyOverview(plan),
      { text: "Daily Plan", style: "sectionHeading" },
      sectionDivider(),
      ...workoutDays(plan),
      { text: "Recovery Notes", style: "sectionHeading", pageBreak: "before" },
      sectionDivider(),
      { ul: listItems(plan.recoveryNotes) },
      { text: "General Notes", style: "sectionHeading" },
      sectionDivider(),
      { ul: listItems(plan.generalNotes) },
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

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { IconArrowRight, IconCalendar, IconInfoCircle, IconMap2 } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@third-assignment/ui/components/alert";
import { Button } from "@third-assignment/ui/components/button";
import { Calendar } from "@third-assignment/ui/components/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@third-assignment/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@third-assignment/ui/components/field";
import { Popover, PopoverContent, PopoverTrigger } from "@third-assignment/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@third-assignment/ui/components/select";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { Textarea } from "@third-assignment/ui/components/textarea";
import { AppHeader } from "@/components/app-header";
import { useState } from "react";
import { z } from "zod";
import { createRoadmapMutationOptions } from "../query";

const DAY_MS = 86_400_000;

function dateFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function serializeDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CATEGORY_OPTIONS = [
  { label: "Learning", value: "LEARNING" },
  { label: "Career", value: "CAREER" },
  { label: "Event", value: "EVENT" },
  { label: "Small project", value: "PROJECT" },
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const MIN_TARGET_DATE = dateFromNow(7);
const DEFAULT_TARGET_DATE = dateFromNow(30);
const MAX_TARGET_DATE = dateFromNow(365);

const createRoadmapSchema = z.object({
  category: z.enum(["LEARNING", "CAREER", "EVENT", "PROJECT"]),
  goal: z.string().trim().min(10, "Describe the goal in at least 10 characters.").max(500),
  currentSituation: z.string().trim().min(10, "Add a little more context.").max(2_000),
  targetDate: z.iso.date(),
  constraints: z.string().trim().min(1, "Add resources or constraints.").max(2_000),
});

export function CreateRoadmapPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const createRoadmap = useMutation(createRoadmapMutationOptions(queryClient));
  const form = useForm({
    defaultValues: {
      category: "LEARNING" as z.infer<typeof createRoadmapSchema>["category"],
      goal: "",
      currentSituation: "",
      targetDate: DEFAULT_TARGET_DATE,
      constraints: "",
    },
    validators: { onSubmit: createRoadmapSchema },
    onSubmit: async ({ value }) => {
      const roadmap = await createRoadmap.mutateAsync({
        ...value,
        goal: value.goal.trim(),
        currentSituation: value.currentSituation.trim(),
        constraints: value.constraints.trim(),
      });
      await navigate({
        to: "/roadmaps/$roadmapId",
        params: { roadmapId: roadmap.id },
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <div className="min-h-dvh bg-muted/25">
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 pt-10 pb-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:pt-16 lg:pb-24">
        <section className="lg:pt-8">
          <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
            <IconMap2 className="size-5" />
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em]">
            Build a Grounded Roadmap
          </h1>
          <p className="mt-4 max-w-md leading-7 text-muted-foreground">
            We research the goal, plan the milestones, and turn them into dated, actionable steps.
          </p>
          <Alert className="mt-8 max-w-md bg-background">
            <IconInfoCircle />
            <AlertDescription>
              Supports learning, career, event, and small-project goals. Do not submit sensitive,
              medical, legal, or financial information.
            </AlertDescription>
          </Alert>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>New roadmap</CardTitle>
            <CardDescription>
              Give the planner enough context to avoid generic advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <form.Field name="category">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <Select
                        items={CATEGORY_OPTIONS}
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          if (value) field.handleChange(value);
                        }}
                      >
                        <SelectTrigger id={field.name} className="w-full" onBlur={field.handleBlur}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {CATEGORY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </form.Field>

                <form.Field name="goal">
                  {(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Goal</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={500}
                          rows={3}
                          placeholder="Learn conversational Japanese for an upcoming trip."
                          aria-invalid={invalid}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="currentSituation">
                  {(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Current situation</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={2_000}
                          rows={4}
                          placeholder="I am a complete beginner and can study after work."
                          aria-invalid={invalid}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="targetDate">
                  {(field) => {
                    const selectedDate = parseDate(field.state.value);
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Target date</FieldLabel>
                        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                          <PopoverTrigger
                            id={field.name}
                            render={
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start font-normal"
                              />
                            }
                            onBlur={field.handleBlur}
                          >
                            <IconCalendar data-icon="inline-start" />
                            {DATE_FORMATTER.format(selectedDate)}
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              defaultMonth={selectedDate}
                              startMonth={parseDate(MIN_TARGET_DATE)}
                              endMonth={parseDate(MAX_TARGET_DATE)}
                              disabled={{
                                before: parseDate(MIN_TARGET_DATE),
                                after: parseDate(MAX_TARGET_DATE),
                              }}
                              onSelect={(date) => {
                                if (!date) return;
                                field.handleChange(serializeDate(date));
                                setDatePickerOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FieldDescription>
                          Choose a date between one week and one year away.
                        </FieldDescription>
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="constraints">
                  {(field) => {
                    const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={invalid}>
                        <FieldLabel htmlFor={field.name}>Resources and constraints</FieldLabel>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={2_000}
                          rows={4}
                          placeholder="Five hours per week, mostly free resources, weekdays only."
                          aria-invalid={invalid}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {invalid ? <FieldError errors={field.state.meta.errors} /> : null}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>

              {createRoadmap.isError ? (
                <Alert variant="destructive" className="mt-6">
                  <AlertDescription>
                    Could not start roadmap generation. Try again.
                  </AlertDescription>
                </Alert>
              ) : null}

              <form.Subscribe
                selector={(state) => ({
                  canSubmit: state.canSubmit,
                  isSubmitting: state.isSubmitting,
                })}
              >
                {({ canSubmit, isSubmitting }) => (
                  <Button
                    type="submit"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                    {isSubmitting ? "Starting research…" : "Build roadmap"}
                    {!isSubmitting ? <IconArrowRight data-icon="inline-end" /> : null}
                  </Button>
                )}
              </form.Subscribe>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

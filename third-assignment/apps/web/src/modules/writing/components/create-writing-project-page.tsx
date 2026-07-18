import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconListCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@third-assignment/ui/components/badge";
import { Alert, AlertDescription } from "@third-assignment/ui/components/alert";
import { Button } from "@third-assignment/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@third-assignment/ui/components/field";
import { Input } from "@third-assignment/ui/components/input";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { Textarea } from "@third-assignment/ui/components/textarea";
import { cn } from "@third-assignment/ui/lib/utils";
import { z } from "zod";
import { getErrorMessage } from "../error-message";
import { createWritingProjectMutationOptions } from "../query";
import { WritingAppHeader } from "./writing-app-header";

const createWritingProjectSchema = z.object({
  title: z.string().trim().min(1, "Enter an article title.").max(120),
  rawMaterial: z
    .string()
    .trim()
    .min(20, "Source material must contain at least 20 characters.")
    .max(20_000),
  prerequisites: z.string().trim().min(1, "Add at least one prerequisite.").max(2_000),
});

export function CreateWritingProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createProject = useMutation(createWritingProjectMutationOptions(queryClient));
  const form = useForm({
    defaultValues: {
      title: "",
      rawMaterial: "",
      prerequisites: "",
    },
    validators: {
      onSubmit: createWritingProjectSchema,
    },
    onSubmit: async ({ value }) => {
      const project = await createProject.mutateAsync({
        title: value.title.trim(),
        rawMaterial: value.rawMaterial.trim(),
        prerequisites: value.prerequisites.trim(),
      });
      await navigate({
        to: "/writing/$projectId",
        params: { projectId: project.id },
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <div className="min-h-dvh bg-background">
      <WritingAppHeader layout="setup" />

      <main className="grid min-h-[calc(100dvh-3.5rem)] lg:grid-cols-[minmax(18rem,0.72fr)_minmax(32rem,1.28fr)]">
        <section className="relative overflow-hidden bg-neutral-950 px-6 py-12 text-white sm:px-10 lg:px-12 lg:py-16">
          <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/5 blur-3xl" />
          <div className="relative mx-auto flex h-full max-w-lg flex-col">
            <Badge className="mb-8 bg-white/10 text-white">Guided setup</Badge>
            <h1 className="text-4xl leading-tight font-semibold tracking-[-0.035em] sm:text-5xl">
              Give every draft a strong starting point.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/60">
              Three inputs are enough to establish scope before the first beat is written.
            </p>

            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const steps = [
                  { label: "Article title", complete: values.title.trim().length > 0 },
                  { label: "Source material", complete: values.rawMaterial.trim().length >= 20 },
                  {
                    label: "Reader prerequisites",
                    complete: values.prerequisites.trim().length > 0,
                  },
                ];
                const completeCount = steps.filter((step) => step.complete).length;

                return (
                  <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <div className="mb-5 flex items-center justify-between text-xs">
                      <span className="font-medium tracking-[0.16em] text-white/50 uppercase">
                        Setup progress
                      </span>
                      <span className="text-white/70 tabular-nums">{completeCount} / 3</span>
                    </div>
                    <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-300"
                        style={{ width: `${(completeCount / steps.length) * 100}%` }}
                      />
                    </div>
                    <ul className="flex flex-col gap-4">
                      {steps.map((step, index) => (
                        <li key={step.label} className="flex items-center gap-3 text-sm">
                          <span
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full border text-xs",
                              step.complete
                                ? "border-white bg-white text-neutral-950"
                                : "border-white/20 text-white/40",
                            )}
                          >
                            {step.complete ? <IconCheck className="size-3.5" /> : index + 1}
                          </span>
                          <span className={step.complete ? "text-white" : "text-white/50"}>
                            {step.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }}
            </form.Subscribe>

            <p className="mt-auto hidden pt-12 text-xs leading-5 text-white/35 lg:block">
              Beat Writer only uses the material you provide to shape the article.
            </p>
          </div>
        </section>

        <section className="bg-muted/35 px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl flex-col gap-5 rounded-2xl border bg-background p-5 shadow-sm sm:p-8"
          >
            <div className="mb-8">
              <p className="text-sm font-medium text-muted-foreground">New writing project</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Set the brief</h2>
            </div>

            <FieldGroup className="gap-5">
              <section className="rounded-xl border p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconFileText className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">What are you writing?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      A working title is enough—you can refine it later.
                    </p>
                  </div>
                </div>
                <form.Field name="title">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-baseline justify-between gap-4">
                          <FieldLabel htmlFor={field.name}>Article title</FieldLabel>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {field.state.value.length} / 120
                          </span>
                        </div>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={120}
                          placeholder="The architecture of deliberate writing"
                          aria-invalid={isInvalid}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconSparkles className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">What should it draw from?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      More specific source material creates more grounded directions.
                    </p>
                  </div>
                </div>
                <form.Field name="rawMaterial">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-baseline justify-between gap-4">
                          <FieldLabel htmlFor={field.name}>Source material</FieldLabel>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {field.state.value.length.toLocaleString()} / 20,000
                          </span>
                        </div>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={20_000}
                          rows={12}
                          placeholder="Paste the facts, notes, interview excerpts, or references the article may use."
                          aria-invalid={isInvalid}
                          className="min-h-72 resize-y leading-6"
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldDescription>
                          Add the facts, notes, and references the article may use.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </section>

              <section className="rounded-xl border p-4 sm:p-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconListCheck className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">What does the reader know?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This keeps the opening useful without over-explaining.
                    </p>
                  </div>
                </div>
                <form.Field name="prerequisites">
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-baseline justify-between gap-4">
                          <FieldLabel htmlFor={field.name}>Reader prerequisites</FieldLabel>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {field.state.value.length.toLocaleString()} / 2,000
                          </span>
                        </div>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          maxLength={2_000}
                          rows={5}
                          placeholder="What can the reader already be expected to understand?"
                          aria-invalid={isInvalid}
                          className="min-h-32 resize-y leading-6"
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                        <FieldDescription>
                          Add concepts the reader can be assumed to already understand.
                        </FieldDescription>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </section>
            </FieldGroup>

            {createProject.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {getErrorMessage(createProject.error, "Could not start the writing project.")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end pt-3">
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
                    className="min-w-36"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting && <Spinner data-icon="inline-start" />}
                    {isSubmitting ? "Starting project…" : "Start writing"}
                    {!isSubmitting && <IconArrowRight data-icon="inline-end" />}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

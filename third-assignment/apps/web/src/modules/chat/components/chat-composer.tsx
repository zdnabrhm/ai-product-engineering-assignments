import { IconArrowUp } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "@third-assignment/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@third-assignment/ui/components/input-group";
import { Spinner } from "@third-assignment/ui/components/spinner";
import { z } from "zod";

const chatFormSchema = z.object({
  prompt: z.string().trim().min(1),
});

export function ChatComposer({
  isStreaming,
  onSend,
}: {
  isStreaming: boolean;
  onSend: (prompt: string) => Promise<void>;
}) {
  const form = useForm({
    defaultValues: {
      prompt: "",
    },
    validators: {
      onSubmit: chatFormSchema,
    },
    onSubmit: async ({ value }) => {
      const prompt = value.prompt.trim();
      await onSend(prompt);
      form.reset();
    },
  });

  return (
    <form
      className="mx-auto w-full max-w-3xl shrink-0 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="prompt">
          {(field) => (
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => {
                const isDisabled = isSubmitting || isStreaming;
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-disabled={isDisabled} data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Message
                    </FieldLabel>

                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        placeholder="Ask something..."
                        rows={2}
                        disabled={isDisabled}
                        aria-invalid={isInvalid}
                        className="max-h-32 min-h-16 resize-none p-3"
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" || event.shiftKey) return;

                          event.preventDefault();

                          if (!field.state.value.trim() || isDisabled) {
                            return;
                          }

                          void form.handleSubmit();
                        }}
                      />

                      <InputGroupAddon align="block-end" className="justify-end pt-1">
                        <InputGroupButton
                          type="submit"
                          variant="default"
                          size="icon-sm"
                          disabled={!canSubmit || !field.state.value.trim() || isDisabled}
                        >
                          {isDisabled ? <Spinner /> : <IconArrowUp />}

                          <span className="sr-only">Send message</span>
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            </form.Subscribe>
          )}
        </form.Field>
      </FieldGroup>
    </form>
  );
}

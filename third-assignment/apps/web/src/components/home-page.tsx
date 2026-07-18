import { IconArrowRight, IconMap2, IconMessageCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@third-assignment/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@third-assignment/ui/components/card";
import { AppHeader } from "./app-header";

const PRODUCTS = [
  {
    title: "Research-backed roadmaps",
    description: "Turn a goal and its constraints into an actionable, cited plan.",
    to: "/roadmaps/new" as const,
    label: "Build a roadmap",
    icon: IconMap2,
  },
  {
    title: "Streaming chat",
    description: "Ask a question and watch the answer arrive in real time.",
    to: "/chat" as const,
    label: "Open chat",
    icon: IconMessageCircle,
  },
];

export function HomePage() {
  return (
    <div className="min-h-dvh bg-muted/25">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Choose Your AI Workflow
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Build a grounded roadmap with background processing, or jump into a lightweight
            streaming conversation.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((product) => {
            const Icon = product.icon;
            return (
              <Card
                key={product.to}
                className="group justify-between gap-3 p-2 transition-shadow hover:shadow-md"
              >
                <CardHeader className="p-6 pb-3">
                  <span className="mb-6 flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-3">
                  <Link to={product.to} className={buttonVariants()}>
                    {product.label}
                    <IconArrowRight data-icon="inline-end" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

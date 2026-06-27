# AI Product Engineering First Assignment

## Cases

1. A customer asks: "Why was I charged twice? Please fix it now." What should the AI decide before answering?
2. You receive a long meeting transcript and need decisions, risks, and action items.
3. A user gives a company name and asks for a short company profile with website and industry.

## Setup

```bash
pnpm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

`TAVILY_API_KEY` is only required for case 3.

## Run

```bash
pnpm case:one
pnpm case:two
pnpm case:three
```

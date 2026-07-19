# What If

A kid-safe "what if" question game. Kids type or speak a what-if question and get back a fun,
factually-grounded answer plus a matching image.

## How it works

`POST /api/ask` runs a 4-stage pipeline:

1. **Input moderation** - a fast local keyword pre-filter, then an LLM-based safety classifier.
   Unsafe questions never reach the main model; the kid sees a friendly warning instead.
2. **Answer generation** - the LLM answers with a system prompt that requires the response to be
   fun *and* grounded in real facts, hedging when something is genuinely uncertain.
3. **Output moderation** - the generated answer is re-checked with the same safety classifier
   before it's ever shown, as a belt-and-suspenders guard.
4. **Image sourcing** - a real photo is searched first on Wikimedia Commons, then Openverse; if
   neither has a good match, an AI-generated illustration is used (or a bundled placeholder if no
   image provider is configured).

## Getting started

```bash
cp .env.example .env.local   # fill in a provider + model + matching API key at minimum
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

The LLM **provider** and **model** are both environment-driven, not hardcoded - swap between
Anthropic and Gemini (or change model/tier) with no code changes. See `.env.example`:

- `WHATIF_PROVIDER` - `anthropic` (default) or `gemini`
- `WHATIF_MODEL` - the model name for that provider (e.g. `claude-sonnet-5` or `gemini-2.0-flash`)
- `WHATIF_MODERATION_PROVIDER` / `WHATIF_MODERATION_MODEL` - optional, for a different (typically
  cheaper/faster) provider or model on the safety classifier; falls back to the answer
  provider/model when unset
- `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` - only the key matching your chosen provider(s) is needed
- `OPENVERSE_API_KEY` (optional)
- `WHATIF_IMAGE_PROVIDER`, `WHATIF_IMAGE_MODEL`, `WHATIF_IMAGE_API_KEY` (optional - falls back to
  a bundled placeholder illustration when unset)

Adding another LLM provider later means implementing the small `LlmClient` interface in
`src/lib/llm/` (see `anthropic.ts` and `gemini.ts`) and wiring it into `src/lib/llm/index.ts`.

## Rate limiting

`/api/ask` enforces a cost-based cap per IP: `WHATIF_RATE_LIMIT_CENTS_PER_HOUR` (default 5 cents)
of *actual* estimated spend per IP per clock hour, tracked from the real token usage each LLM call
reports (priced via `src/lib/pricing.ts`) plus a flat `WHATIF_IMAGE_COST_CENTS` estimate for
AI-generated images (free image sources don't count). Once an IP's hour-bucket total reaches the
cap, further requests get a friendly "try again later" response (HTTP 429) instead of hitting any
paid API.

This needs a small always-on store that survives across Vercel's stateless function invocations,
so it uses [Upstash Redis](https://upstash.com) (free tier) via `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN`. If those are unset, rate limiting is simply disabled (no blocking) -
it's opt-in, not a hard requirement to run the app locally.

## Deliberately deferred for this fast v1

RAG/web-search fact-grounding, a second automated fact-check pass, ML relevance scoring for image
search, and automated tests.

import { NextResponse } from "next/server";
import { moderateInput, moderateOutput } from "@/lib/moderation";
import { generateAnswer } from "@/lib/answer";
import { pickImage } from "@/lib/images/pickImage";
import { env } from "@/lib/env";
import { getClientIp, getSpentCents, recordSpentCents } from "@/lib/rateLimit";
import type { AskResponse } from "@/lib/types";

const FRIENDLY_WARNING =
  "Hmm, let's try a different question! Please ask something fun and friendly. 🌟";

const RATE_LIMIT_MESSAGE =
  "Whoa, that's a lot of questions! Let's take a little break and try again in a bit. ⏳";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  let totalCostCents = 0;

  const spentSoFar = await getSpentCents(ip);
  if (spentSoFar >= env.rateLimitCentsPerHour) {
    return respond({ status: "error", message: RATE_LIMIT_MESSAGE }, 429);
  }

  let question: string;
  try {
    const body = await req.json();
    question = typeof body?.question === "string" ? body.question.trim() : "";
  } catch {
    return respond({ status: "error", message: "Couldn't read that question, try again!" }, 400);
  }

  if (question.length < 3 || question.length > 300) {
    return respond({ status: "error", message: "Ask a real question!" }, 400);
  }

  const inputModeration = await moderateInput(question);
  totalCostCents += inputModeration.costCents;
  if (!inputModeration.result.safe) {
    await recordSpentCents(ip, totalCostCents);
    return respond({ status: "unsafe", message: FRIENDLY_WARNING });
  }

  let answer: string;
  try {
    const answerResult = await generateAnswer(question);
    answer = answerResult.answer;
    totalCostCents += answerResult.costCents;
  } catch (error) {
    console.error("generateAnswer failed:", error);
    await recordSpentCents(ip, totalCostCents);
    return respond({ status: "error", message: "Oops, try again in a moment!" }, 502);
  }

  const outputModeration = await moderateOutput(answer);
  totalCostCents += outputModeration.costCents;
  if (!outputModeration.result.safe) {
    await recordSpentCents(ip, totalCostCents);
    return respond({ status: "unsafe", message: FRIENDLY_WARNING });
  }

  const { image, costCents: imageCostCents } = await pickImage(question, answer);
  totalCostCents += imageCostCents;

  await recordSpentCents(ip, totalCostCents);

  return respond({ status: "ok", question, answer, image });
}

function respond(body: AskResponse, status = 200) {
  return NextResponse.json(body, { status });
}

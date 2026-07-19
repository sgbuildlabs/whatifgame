import { NextResponse } from "next/server";
import { moderateInput, moderateOutput } from "@/lib/moderation";
import { generateAnswer } from "@/lib/answer";
import { pickImage } from "@/lib/images/pickImage";
import type { AskResponse } from "@/lib/types";

const FRIENDLY_WARNING =
  "Hmm, let's try a different question! Please ask something fun and friendly. 🌟";

export async function POST(req: Request) {
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
  if (!inputModeration.safe) {
    return respond({ status: "unsafe", message: FRIENDLY_WARNING });
  }

  let answer: string;
  try {
    answer = await generateAnswer(question);
  } catch {
    return respond({ status: "error", message: "Oops, try again in a moment!" }, 502);
  }

  const outputModeration = await moderateOutput(answer);
  if (!outputModeration.safe) {
    return respond({ status: "unsafe", message: FRIENDLY_WARNING });
  }

  const image = await pickImage(question, answer);

  return respond({ status: "ok", question, answer, image });
}

function respond(body: AskResponse, status = 200) {
  return NextResponse.json(body, { status });
}

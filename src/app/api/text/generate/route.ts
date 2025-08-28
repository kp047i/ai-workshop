import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/openai";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { checkSafety } from "@/lib/safety";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "プロンプトが必要です" },
        { status: 400 }
      );
    }

    if (prompt.length > 2000) {
      return NextResponse.json(
        { error: "プロンプトは2000文字以内で入力してください" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = getRateLimitKey(ip, "text");

    if (!rateLimit(rateLimitKey, 5, 60000)) {
      return NextResponse.json(
        { error: "レート制限に達しました。1分後に再試行してください。" },
        { status: 429 }
      );
    }

    const safetyCheck = checkSafety(prompt);
    if (!safetyCheck.safe) {
      return NextResponse.json({ error: safetyCheck.message }, { status: 422 });
    }

    const stream = await generateText(prompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Text generation error:", error);

    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as {
        status: number;
        error?: { code?: string; message?: string };
      };

      if (apiError.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI APIのクォータを超過しました。請求設定を確認してください。",
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

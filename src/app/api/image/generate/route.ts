import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/openai";
import { rateLimit, getRateLimitKey } from "@/lib/rateLimit";
import { checkSafety } from "@/lib/safety";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = 512 } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "プロンプトが必要です" },
        { status: 400 }
      );
    }

    if (prompt.length > 300) {
      return NextResponse.json(
        { error: "プロンプトは300文字以内で入力してください" },
        { status: 400 }
      );
    }

    if (size !== 512 && size !== 768) {
      return NextResponse.json(
        { error: "無効な画像サイズです" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitKey = getRateLimitKey(ip, "image");

    if (!rateLimit(rateLimitKey, 3, 60000)) {
      return NextResponse.json(
        { error: "レート制限に達しました。1分後に再試行してください。" },
        { status: 429 }
      );
    }

    const safetyCheck = checkSafety(prompt);
    if (!safetyCheck.safe) {
      return NextResponse.json({ error: safetyCheck.message }, { status: 422 });
    }

    const imageBuffer = await generateImage(prompt, size);

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error: unknown) {
    console.error("Image generation error:", error);

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

    if (error instanceof Error && error.message?.includes("safety")) {
      return NextResponse.json(
        {
          error:
            "画像生成の安全ガイドラインに違反している可能性があります。別の内容で試してください。",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

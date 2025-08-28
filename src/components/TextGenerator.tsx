"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Copy, RotateCcw, ArrowLeft, Square } from "lucide-react";
import { toast } from "sonner";

const presets = [
  {
    id: "life",
    label: "生活系",
    prompt: "冷蔵庫に卵とキャベツがあります 30分以内で作れる夕飯を1品 提案理由と手順を3行で"
  },
  {
    id: "work",
    label: "仕事系",
    prompt: "先日仕事を教えてくれた先輩へ 丁寧で簡潔なお礼メール本文を作成してください 件名も1案"
  },
  {
    id: "fun",
    label: "遊び系",
    prompt: "地元○○市の魅力を伝える短いキャッチコピーを5案 ターゲットは20〜30代 12文字以内"
  }
];

export function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handlePresetSelect = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    const controller = new AbortController();
    setAbortController(controller);
    setIsGenerating(true);
    setOutput("");

    try {
      const response = await fetch("/api/text/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "生成に失敗しました");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ストリーミングに対応していません");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulated += chunk;
        setOutput(accumulated);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.success("生成を停止しました");
      } else {
        const message = error instanceof Error ? error.message : "エラーが発生しました";
        toast.error(message);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("コピーしました");
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleBackToPrompt = () => {
    setOutput("");
  };

  const characterCount = prompt.length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">プリセット</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    className="min-h-[44px] text-left"
                    onClick={() => handlePresetSelect(preset.prompt)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">プロンプト入力</h3>
                <span className="text-sm text-muted-foreground">
                  {characterCount}/2000
                </span>
              </div>
              <Textarea
                placeholder="生成したい文章の指示を入力してください..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] text-base"
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="min-h-[44px] flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-md transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    生成中...
                  </>
                ) : (
                  "✨ 生成"
                )}
              </Button>
              {isGenerating && (
                <Button
                  onClick={handleStop}
                  variant="outline"
                  className="min-h-[44px] border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Square className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(output || isGenerating) && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">生成結果</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleBackToPrompt}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    disabled={isGenerating}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg min-h-[120px] border border-blue-100">
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {output || (isGenerating ? "生成中..." : "")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
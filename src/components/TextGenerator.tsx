"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Copy, RotateCcw, ArrowLeft, Square, History, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface PromptOption {
  id: string;
  title: string;
  template: string;
  hint?: string;
}

interface PromptCategory {
  id: string;
  label: string;
  options: PromptOption[];
}

interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: number;
  categoryId?: string;
  categoryLabel?: string;
}

const promptCategories: PromptCategory[] = [
  {
    id: "life",
    label: "生活系",
    options: [
      {
        id: "cooking",
        title: "食材を使った料理レシピ",
        template:
          "冷蔵庫にある【卵・キャベツ】を使った夕飯レシピを考えてください",
        hint: "食材を変えると別のレシピが提案される（例: 卵→豆腐）",
      },
      {
        id: "health",
        title: "健康的な生活習慣",
        template: "【運動不足】を解消する簡単な方法を3つ教えてください",
        hint: "課題を変えて相談できる（例: 運動不足→睡眠不足、ストレス）",
      },
      {
        id: "household",
        title: "家事の効率化",
        template: "【掃除】を効率的に行うコツを教えてください",
        hint: "家事を変更可能（例: 掃除→洗濯、料理の下準備）",
      },
    ],
  },
  {
    id: "work",
    label: "仕事系",
    options: [
      {
        id: "email",
        title: "ビジネスメール作成",
        template:
          "【上司】に送る先日の会議でのアイデア提案に感謝するメールを作成してください",
        hint: "相手を変えると文章の雰囲気も変わる（例: 上司→友人、取引先）",
      },
      {
        id: "meeting",
        title: "会議の議題整理",
        template: "【新サービス企画】の議題と進行順序を整理してください",
        hint: "議題を変えるとアウトプットが変わる（例: 新サービス企画→プロジェクト進捗）",
      },
      {
        id: "presentation",
        title: "プレゼン資料作成",
        template:
          "【新商品の提案】に関する5分間のプレゼンの構成を考えてください",
        hint: "テーマを変更可能（例: 新商品の提案→業務改善案、予算計画）",
      },
    ],
  },
  {
    id: "fun",
    label: "遊び系",
    options: [
      {
        id: "catchcopy",
        title: "キャッチコピー作成",
        template: "新しいカフェのキャッチコピーを【3つ】考えてください",
        hint: "店の種類や数を変えて遊べる（例: カフェ→ゲームセンター、3つ→5つ）",
      },
      {
        id: "story",
        title: "ショートストーリー",
        template: "迷子の【犬】が家に帰るまでの短い物語を作成してください",
        hint: "主人公を変えると物語が変化（例: 犬→ロボット、猫）",
      },
      {
        id: "quiz",
        title: "クイズ作成",
        template: "【日本の歴史】に関する3択クイズを5問作ってください",
        hint: "ジャンルを変更可能（例: 日本の歴史→映画、スポーツ、科学）",
      },
    ],
  },
];

export function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // localStorage から履歴を読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem("promptHistory");
      if (saved) {
        setPromptHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("履歴の読み込みに失敗しました:", error);
    }
  }, []);

  // 履歴が変更されたときにlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem("promptHistory", JSON.stringify(promptHistory));
    } catch (error) {
      console.error("履歴の保存に失敗しました:", error);
    }
  }, [promptHistory]);

  // 履歴に追加する関数
  const addToHistory = (promptText: string) => {
    if (!promptText.trim()) return;
    
    const selectedCategoryData = promptCategories.find(
      (cat) => cat.id === selectedCategory
    );
    
    const historyItem: PromptHistoryItem = {
      id: Date.now().toString(),
      prompt: promptText.trim(),
      timestamp: Date.now(),
      categoryId: selectedCategory || undefined,
      categoryLabel: selectedCategoryData?.label,
    };

    setPromptHistory((prev) => {
      // 重複チェック：同じプロンプトがあれば削除
      const filtered = prev.filter((item) => item.prompt !== promptText.trim());
      // 新しいアイテムを先頭に追加し、最大50件まで保持
      return [historyItem, ...filtered].slice(0, 50);
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = promptCategories.find((cat) => cat.id === categoryId);
    if (category && category.options.length > 0) {
      const firstOption = category.options[0];
      setPrompt(firstOption.template);
      setSelectedPromptId(firstOption.id);
    } else {
      setSelectedPromptId("");
    }
  };

  const handlePromptOptionSelect = (
    promptTemplate: string,
    promptId: string
  ) => {
    setPrompt(promptTemplate);
    setSelectedPromptId(promptId);
  };

  const selectedCategoryData = promptCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // 履歴に追加
    addToHistory(prompt);

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
        const message =
          error instanceof Error ? error.message : "エラーが発生しました";
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
              <h3 className="font-medium mb-3">カテゴリ選択</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {promptCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    className={`min-h-[44px] text-center font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-300 ring-offset-1"
                        : "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              {selectedCategoryData && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    プロンプトを選択
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedCategoryData.options.map((option) => (
                      <div
                        key={option.id}
                        className={`border rounded-lg p-4 space-y-2 transition-all duration-200 cursor-pointer ${
                          selectedPromptId === option.id
                            ? "border-blue-400 bg-blue-50/80 shadow-sm"
                            : "hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
                        }`}
                        onClick={() =>
                          handlePromptOptionSelect(option.template, option.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              selectedPromptId === option.id
                                ? "border-blue-600 bg-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedPromptId === option.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50" />
                            )}
                          </div>
                          <h5 className={`font-medium text-base ${
                            selectedPromptId === option.id
                              ? "text-blue-700"
                              : "text-gray-800"
                          }`}>
                            {option.title}
                          </h5>
                        </div>
                        {option.hint && (
                          <p className="text-xs text-muted-foreground pl-7 leading-relaxed">
                            💡 {option.hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                className={`min-h-[44px] transition-all duration-200 ${
                  showHistory
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <History className="w-4 h-4" />
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

            {showHistory && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    プロンプト履歴
                  </h4>
                  {promptHistory.length > 0 && (
                    <Button
                      onClick={() => {
                        setPromptHistory([]);
                        toast.success("履歴をクリアしました");
                      }}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      クリア
                    </Button>
                  )}
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {promptHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      履歴はまだありません
                    </p>
                  ) : (
                    promptHistory.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 hover:bg-blue-50/30 hover:border-blue-200 cursor-pointer transition-all duration-200"
                        onClick={() => setPrompt(item.prompt)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {item.prompt}
                          </p>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromptHistory(prev => 
                                prev.filter(h => h.id !== item.id)
                              );
                              toast.success("履歴を削除しました");
                            }}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-gray-400 hover:text-red-600 shrink-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{item.categoryLabel || "カテゴリなし"}</span>
                          <span>{new Date(item.timestamp).toLocaleString("ja-JP", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

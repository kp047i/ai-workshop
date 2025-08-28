"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<512 | 768>(512);
  const [imageUrl, setImageUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setImageUrl("");

    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, size }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "画像生成に失敗しました");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "エラーが発生しました";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const now = new Date();
    const fileName = `ai-image-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const characterCount = prompt.length;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">プロンプト入力</h3>
                <span className="text-sm text-muted-foreground">
                  {characterCount}/300
                </span>
              </div>
              <Input
                placeholder="生成したい画像の説明を入力してください..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-base min-h-[44px]"
                maxLength={300}
              />
            </div>

            <div>
              <h3 className="font-medium mb-3">画像サイズ</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={size === 512 ? "default" : "outline"}
                  className={`min-h-[44px] font-medium transition-all duration-200 ${
                    size === 512
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : "border-2 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => setSize(512)}
                >
                  📱 512×512
                </Button>
                <Button
                  variant={size === 768 ? "default" : "outline"}
                  className={`min-h-[44px] font-medium transition-all duration-200 ${
                    size === 768
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                      : "border-2 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                  onClick={() => setSize(768)}
                >
                  🖥️ 768×768
                </Button>
                <Button
                  variant="outline"
                  className="min-h-[44px] border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                  disabled
                >
                  ■ 正方形のみ
                </Button>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full min-h-[44px] bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium shadow-md transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  生成中...
                </>
              ) : (
                "🎨 画像生成"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(imageUrl || isGenerating) && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">生成結果</h3>
                {imageUrl && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ダウンロード
                  </Button>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 flex items-center justify-center min-h-[300px] border border-purple-100">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-2" />
                    <p>画像を生成中...</p>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="生成された画像"
                    className="max-w-full h-auto rounded-lg"
                  />
                ) : null}
              </div>

              {imageUrl && (
                <p className="text-sm text-muted-foreground text-center">
                  生成物は体験用です。商用利用時はOpenAIの利用規約をご確認ください。
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
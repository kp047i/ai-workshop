"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextGenerator } from "@/components/TextGenerator";
import { ImageGenerator } from "@/components/ImageGenerator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI体験ワークショップ
              </CardTitle>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-muted-foreground text-lg">
              文章生成と画像生成を体験してみましょう
            </p>
          </CardHeader>
        <CardContent className="space-y-3 text-base">
            <Alert className="border-blue-200 bg-blue-50/50">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    個人情報や機密情報は入力しないでください
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    生成物は体験目的です。商用利用や公開時は各サービスの規約をご確認ください
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    うまくいかない時は、より詳しく指示してもう一度お試しください
                  </p>
                </div>
              </AlertDescription>
            </Alert>
        </CardContent>
        </Card>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-16 p-1 bg-white/80 backdrop-blur-sm shadow-md border-0">
            <TabsTrigger 
              value="text" 
              className="text-lg min-h-[48px] font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              📝 文章生成
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="text-lg min-h-[48px] font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              🎨 画像生成
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="text">
          <TextGenerator />
        </TabsContent>
        
        <TabsContent value="image">
          <ImageGenerator />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

# AI Workshop

40分ワークショップ専用の超軽量 Next.js アプリです。参加者がスマホから文章生成と画像生成を最短手数で体験できます。

## 機能

- **文章生成**: OpenAI GPT-3.5-turboを使用したストリーミング文章生成
- **画像生成**: OpenAI DALL-E-3を使用した画像生成
- **プリセット**: 生活系・仕事系・遊び系の3種類のプリセットプロンプト
- **レート制限**: IP単位での使用制限（文章生成: 1分5回、画像生成: 1分3回）
- **安全ガード**: NGワードチェック機能
- **モバイル最適化**: タップ領域44px以上、大きめフォント

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、OpenAI API キーを設定してください：

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## デプロイ

### Vercel へのデプロイ

1. Vercel にプロジェクトをインポート
2. Environment Variables に `OPENAI_API_KEY` を設定
3. デプロイ実行

```bash
# Vercel CLI を使用する場合
vercel --prod
```

## API エンドポイント

### 文章生成
- **POST** `/api/text/generate`
- **パラメータ**: `{ prompt: string, presetId?: 'life' | 'work' | 'fun' }`
- **レスポンス**: ストリーミングテキスト

### 画像生成
- **POST** `/api/image/generate`
- **パラメータ**: `{ prompt: string, size: 512 | 768 }`
- **レスポンス**: PNG画像バイナリ

## 技術仕様

- **フレームワーク**: Next.js v15 (App Router)
- **実行環境**: Vercel Edge Runtime
- **UI**: shadcn/ui + Tailwind CSS
- **アイコン**: lucide-react
- **言語**: TypeScript

## 注意事項

### 体験用生成物について
- 生成される文章・画像は体験目的です
- 商用利用や公開時はOpenAIの利用規約をご確認ください
- 個人情報や機密情報の入力は禁止です

### レート制限
- 文章生成: 1分間に5回まで
- 画像生成: 1分間に3回まで
- IP単位での制限（簡易実装）

### 入力制限
- 文章プロンプト: 最大2000文字
- 画像プロンプト: 最大300文字

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── text/generate/route.ts    # 文章生成API
│   │   └── image/generate/route.ts   # 画像生成API
│   ├── layout.tsx                    # ルートレイアウト
│   ├── page.tsx                      # メインページ
│   └── globals.css                   # グローバルスタイル
├── components/
│   ├── ui/                          # shadcn/ui コンポーネント
│   ├── TextGenerator.tsx            # 文章生成コンポーネント
│   └── ImageGenerator.tsx           # 画像生成コンポーネント
└── lib/
    ├── openai.ts                    # OpenAI クライアント
    ├── rateLimit.ts                 # レート制限
    ├── safety.ts                    # NGワードチェック
    └── utils.ts                     # ユーティリティ関数
```

## 開発

### テスト実行

```bash
npm test
```

### ビルド

```bash
npm run build
```

### リント

```bash
npm run lint
```

## ライセンス

MIT License

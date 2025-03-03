# アプリケーションアーキテクチャ

本ドキュメントでは「究極のTodoアプリ」のアーキテクチャについて説明します。

## ディレクトリ構造

```
ultimate-todo-app/
├── app/                     # Next.js 13 アプリディレクトリ
│   ├── api/                 # APIエンドポイント
│   │   ├── todos/          # Todoリソース関連API
│   │   └── tags/           # タグリソース関連API
│   ├── components/         # UIコンポーネント
│   │   ├── ui/             # 基本UI要素
│   │   ├── todo-container.tsx # メインコンテナーコンポーネント
│   │   ├── todo-item.tsx   # 単一Todoアイテム
│   │   └── todo-form.tsx   # Todo作成・編集フォーム
│   ├── lib/                # ユーティリティ
│   │   ├── db.ts           # Prismaクライアント
│   │   ├── types.ts        # 型定義
│   │   └── utils.ts        # ユーティリティ関数
│   ├── globals.css         # グローバルCSS
│   ├── layout.tsx          # アプリレイアウト
│   └── page.tsx            # トップページ
├── prisma/                 # Prismaの設定・マイグレーション
│   └── schema.prisma       # データモデル定義
├── public/                 # 静的ファイル
├── package.json            # 依存関係
├── tsconfig.json           # TypeScript設定
└── next.config.js          # Next.js設定
```

## データモデル

### Todo

```prisma
model Todo {
  id          String   @id @default(uuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  priority    Priority @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tags        Tag[]
}
```

### Tag

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  color     String   @default("blue")
  createdAt DateTime @default(now())
  todos     Todo[]
}
```

### Priority (Enum)

```prisma
enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## コンポーネント構成

### TodoContainer

アプリケーションのメインコンテナーコンポーネント。以下の責務を持ちます：

- Todoリストの取得・表示
- 新規作成・編集ダイアログの管理
- 検索・フィルタリング
- APIとの通信

### TodoItem

単一のTodoを表示するためのコンポーネント。以下の機能を提供します：

- タスク情報表示（タイトル、説明、優先度、期限、タグなど）
- 完了・未完了状態の切り替え
- 編集・削除アクション

### TodoForm

Todoの新規作成と編集に使用されるフォームコンポーネント。以下の機能を提供します：

- バリデーション
- タグのカンマ区切り入力
- 優先度の選択
- 期限日の設定

## API設計

RESTful APIとしてタスク管理のエンドポイントを提供します。

### Todos API

- `GET /api/todos` - すべてのTodoを取得
- `POST /api/todos` - 新しいTodoを作成
- `GET /api/todos/{id}` - 特定のTodoを取得
- `PATCH /api/todos/{id}` - 特定のTodoを更新
- `DELETE /api/todos/{id}` - 特定のTodoを削除

### Tags API

- `GET /api/tags` - すべてのタグを取得
- `POST /api/tags` - 新しいタグを作成

## 状態管理

このアプリケーションでは、React Hooksを使用してローカルの状態管理を行います：

- `useState` - コンポーネントローカルの状態
- `useEffect` - 副作用の管理（APIリクエストなど）
- `useToast` - 通知の表示

## スタイリング

- Tailwind CSSを使用したユーティリティファーストなスタイリング
- shadcn/uiコンポーネントによる一貫したデザイン
- ダークモード対応（next-themesライブラリを使用）

## エラーハンドリング

- API層でのエラーレスポンス
- トースト通知によるユーザーへのフィードバック
- フォームバリデーション（クライアント側）

## パフォーマンス最適化

- クライアントサイドでの検索・フィルタリング
- 完了したタスクの視覚的区別
- レスポンシブデザインによるモバイル対応

## セキュリティ

- 入力値のバリデーション（zodを使用）
- クロスサイトスクリプティング（XSS）防止

## 今後の拡張性

このアーキテクチャは以下の機能追加に対応可能です：

1. ユーザー認証と複数ユーザー対応
2. プロジェクト/リスト機能（タスクをグループ化）
3. リマインダー通知
4. 繰り返しタスク
5. ドラッグアンドドロップによる並べ替え
6. CSV/JSONインポート・エクスポート
7. タスクの進捗状況追跡

## デプロイ

Next.jsアプリケーションとして、以下のプラットフォームにデプロイ可能です：

- Vercel（最も簡単）
- Netlify
- AWS Amplify
- カスタムサーバー（Node.js）

## まとめ

このアーキテクチャは、モダンなフロントエンド技術とサーバーレスバックエンドを組み合わせた、スケーラブルで拡張性の高いTodoアプリケーションを実現します。TypeScriptとPrismaによる型安全性を確保し、開発効率とコードの品質を高めています。

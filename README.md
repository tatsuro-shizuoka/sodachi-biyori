# 育ち日和 (Sodachi Biyori) - 園児動画共有プラットフォーム

幼稚園・保育園向けの動画共有プラットフォームです。保護者が園児の成長記録動画を安全に閲覧できます。

## 🌟 主な機能

### 保護者向け
- **動画ギャラリー**: クラス別・カテゴリ別の動画閲覧
- **お気に入り**: 好きな動画をブックマーク
- **園別ログイン**: `/[school-slug]/login` で園専用のログインページ
- **通知設定**: 新着動画の通知ON/OFF

### 管理者向け
- **園管理**: 複数園の一元管理
- **クラス管理**: クラスの作成・編集・削除
- **動画管理**: アップロード・公開設定・カテゴリ分け
- **保護者管理**: 登録保護者の閲覧
- **スポンサー管理**: バナー広告の管理・分析
- **分析ダッシュボード**: 視聴回数・お気に入り数・CTR

## 🛠 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React, TailwindCSS
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite + Prisma ORM
- **認証**: JWT (jose), bcryptjs
- **アイコン**: Lucide React

## 📁 プロジェクト構造

```
kindergarten_platform/
├── app/
│   ├── [schoolSlug]/          # 園別ページ (動的ルート)
│   │   ├── gallery/           # 動画ギャラリー
│   │   ├── login/             # 園別ログイン
│   │   └── watch/[id]/        # 動画再生
│   ├── admin/                 # 管理者ページ
│   │   ├── dashboard/         # ダッシュボード
│   │   ├── schools/[id]/      # 園詳細 & 分析
│   │   ├── classes/           # クラス管理
│   │   ├── videos/            # 動画管理
│   │   └── sponsors/          # スポンサー管理
│   ├── api/                   # APIエンドポイント
│   │   ├── admin/             # 管理者API
│   │   ├── auth/              # 認証API
│   │   ├── analytics/         # 分析API
│   │   └── sponsors/          # スポンサーAPI
│   ├── components/            # 共有コンポーネント
│   │   ├── ui/                # UIプリミティブ (Button, Input)
│   │   ├── admin/             # 管理者用コンポーネント
│   │   └── *.tsx              # 共有コンポーネント
│   └── signup/                # 新規登録
├── lib/
│   ├── auth.ts                # 認証ユーティリティ
│   └── prisma.ts              # Prismaクライアント
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   ├── seed.ts                # シードデータ
│   └── migrations/            # マイグレーション
└── public/                    # 静的ファイル
```

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npx prisma migrate dev

# 開発サーバーの起動
npm run dev
```

## 🔐 デモアカウント

### 管理者
- **ユーザー名**: admin
- **パスワード**: admin123

### 保護者
- **メール**: yamada@example.com
- **パスワード**: parent123

### クラスパスワード
- さくら組: `class123`
- ひまわり組: `class456`

## 📊 分析機能

### 動画分析
- 視聴回数 (VideoView)
- お気に入り数 (Favorite)

### スポンサー分析
- 表示回数 (SponsorImpression)
- クリック数 (SponsorClick)
- CTR (クリック率)

## 🔧 環境変数

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
```

## 📝 主要なAPIエンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| POST | /api/auth/admin/login | 管理者ログイン |
| POST | /api/auth/guardian/login | 保護者ログイン |
| POST | /api/auth/parent/login | クラスパスワードログイン |
| GET | /api/admin/schools | 園一覧 |
| GET | /api/admin/schools/[id]/analytics | 園分析データ |
| POST | /api/sponsors/[id]/track | スポンサートラッキング |
| GET | /api/gallery | 動画ギャラリー |

## 🎨 デザインシステム

- **カラー**: Indigo/Slate ベースのモダンなデザイン
- **アニメーション**: Tailwind CSS の animate-in
- **レスポンシブ**: モバイルファースト設計

## ⚠️ 注意事項

開発サーバー起動後にPrismaスキーマを変更した場合は、サーバーを再起動してください：

```bash
# Ctrl+C で停止後
npm run dev
```

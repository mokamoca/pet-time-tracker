# PetLeaf (旧: ぺっとじかん)

> 「今日、散歩したっけ？」をなくす。多頭飼いでもサクッと記録・ふりかえり。  
> 誰向け: 犬/猫オーナー（特に多頭・共働き家庭）  
> 課題: いつ誰が散歩/ごはん/ケアしたか曖昧になりがち  
> 解決: ワンタップ記録 + 自動集計で、家族間の共有もスムーズに

---

## デモ
- Live Demo: (https://pet-time-tracker.vercel.app/)
- 試用アカウント: `demo@example.com / password`

## 主な価値・ユースケース
- 散歩/あそびをタイマーで計測 → 即保存（2タップ）
- おやつ/ケアはワンタップ追加で「誰が何回あげたか」を可視化
- 最近の記録を自動保存しながら編集・削除（誤タップをすぐ修正）
- ダッシュボードで 1週間/1か月/1年/全期間 を切り替え、ペットとの生活を見える化
- ペットの名前変更・削除も簡単。多頭対応。PWA でホーム画面から起動

## 技術スタック & 簡易アーキテクチャ
- 運用中: Vercel でフロント配信（Vite ビルド） + Supabase（Auth + DB/RLS）を直に叩く BaaS 構成
- 付録: `backend/` の FastAPI 実装はローカル検証・将来のカスタム API 用サンプルとして同梱（本番では未使用）
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Chart.js, PWA
- Backend: FastAPI, SQLModel/SQLite, JWT（python-jose）, passlib, Pillow
- Infra: Supabase (Auth + Database)

## クイックスタート（3コマンド）
```bash
cd frontend
npm install
npm run dev
```
※ Supabase 環境変数が必要です。下記「設定」を参照。

## 設定（env）とシード
- フロント `frontend/.env.local`（Vite は `VITE_` 接頭辞必須）
  ```
  VITE_SUPABASE_URL=https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=anon_public_key
  ```
- バックエンド `backend/.env`（`.env.example` からコピー）
  ```
  SECRET_KEY=任意の長い文字列
  DATABASE_URL=sqlite:///pet_tracker.db
  FRONTEND_ORIGIN=http://localhost:5173
  ```
- シード: なし（Supabase は空テーブルから開始）。必要なら SQL で挿入。

## Supabase 初期設定（RLS 込み）
1. Auth: Email/Password を有効化。Site URL にデプロイ先ドメインを設定。  
2. API から `Project URL` と `anon key` を控える（フロントで使用）。  
3. SQL エディタでテーブル/ポリシーを作成:
```sql
create table if not exists pets (
  id bigserial primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);
create table if not exists activities (
  id bigserial primary key,
  user_id uuid references auth.users not null,
  pet_id bigint references pets(id) on delete cascade,
  type text not null,
  amount numeric not null,
  unit text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  note text,
  source text default 'quick',
  created_at timestamptz default now()
);
alter table pets enable row level security;
alter table activities enable row level security;
create policy "pets_read"   on pets for select using (auth.uid() = user_id);
create policy "pets_insert" on pets for insert with check (auth.uid() = user_id);
create policy "pets_update" on pets for update using (auth.uid() = user_id);
create policy "pets_delete" on pets for delete using (auth.uid() = user_id);
create policy "acts_read"   on activities for select using (auth.uid() = user_id);
create policy "acts_insert" on activities for insert with check (auth.uid() = user_id);
create policy "acts_update" on activities for update using (auth.uid() = user_id);
create policy "acts_delete" on activities for delete using (auth.uid() = user_id);
create index if not exists idx_activities_user_started on activities (user_id, started_at);
```

## API / 画面の使用例
- 画面: Home（記録）、Activities（編集）、Dashboard（期間切替）、PetSetup、Auth。  
- API 例（FastAPI を使う場合の参考）:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"pass"}'
```

## セキュリティ注意
- 脆弱性報告: Issue もしくはメールでお願いします。
- 依存更新: npm/pip のアップデートを月次で、必要に応じて緊急パッチ。`npm audit` / `pip-audit` を定期実行。

## ロードマップ & ステータス
- 完了: 記録/編集/削除、期間切替ダッシュボード、PWA、RLS
- 着手中: 多頭の切替、画像登録、緩い交流機能
- Backlog: 共有リンク作成、家族招待、グラフの比較表示

## ライセンス・商用利用ポリシー
- LICENSE が未設定の場合は All rights reserved とみなします。必要に応じて OSS ライセンスを追加してください。
- 商用利用を希望される場合は事前にご相談ください。

## 作者の役割・技術的ハイライト（ポートフォリオ向け）
- codexによるバイブコーディングで勉強をしながら作成しています
- 技術的ポイント:
  - Supabase RLS でクライアントのみでも安全に CRUD
  - React + Zustand で軽量状態管理、PWA 対応
  - モバイル優先の UI（ハンバーガーメニュー、ワンタップ記録、期間切替）
  - ダッシュボードの期間切替（週/月/年/全）と集計最適化
- 改善例: モバイル最適化で主要画面の初回描画を軽量化（CSS/レイアウト調整）。

## 問い合わせ・利用開始の CTA
- Issue / Discussions でフィードバック歓迎
- 直接連絡: plaintext16@gmail.com

---

## ディレクトリ構成（抜粋）
```
frontend/         # React + Vite フロント
  src/
    pages/        # Home, Dashboard, Activities, PetSetup, Auth
    components/   # QuickActions など
    store/        # Zustand ストア
    pwa/          # Service Worker 登録
backend/          # FastAPI サーバ
  app/
  tests/
```

## デプロイ（例: Vercel + Supabase）※現行運用
1. GitHub に push（main ブランチ）
2. Vercel 新規プロジェクト → Framework: Vite, Root: `frontend`, Build: `npm run build`, Output: `dist`
3. 環境変数に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` を設定
4. デプロイ後のドメインを Supabase Auth の Site URL に反映
5. Service Worker: `frontend/public/sw.js` が配信される（`src/pwa/sw-register.ts` で登録）

## 使い方の流れ
1. サインアップ / ログイン（メール + パスワード）
2. ペット登録（名前変更・削除も可）
3. Home で散歩/あそび（タイマー）、おやつ/ケア（タップ）を記録
4. Activities で数値や時間を調整・削除（自動保存）
5. Dashboard で期間を切り替えて推移をチェック

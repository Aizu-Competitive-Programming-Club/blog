# Keystatic 運用手順（PR必須 + Preview必須）

このリポジトリは **Keystatic（`/keystatic`）で編集し、GitHub PR のレビュー/承認後に `main` へマージして publish** する運用を想定しています。

## 用語

- **Save**: Keystatic 上での保存。GitHub mode の場合、対象ブランチに commit/push されます（= publish ではない）。
- **Preview**: Cloudflare Pages がブランチ/PR をビルドして発行するプレビューURL（本番に近い環境）。
- **Publish**: `main` にマージされ、Production デプロイが更新されること。

## 権限設計（「チームで承認できる？」/「編集できる人を限定できる？」）

結論: **できます。Keystatic は独自のユーザー管理を持たず、GitHub 認証 + GitHub リポジトリ権限で制御**します。

- Keystatic（GitHub mode）は GitHub ログイン後、リポジトリへ **ブランチ作成 / commit push** を行います。
- そのため **編集できるのは GitHub 上で当該リポジトリに write 権限があるユーザー（またはそれ相当）** が基本です。
- **承認（Approve）** は GitHub の PR レビュー機能で行います。
- **publish を防ぐ（勝手に main に入れない）** のは GitHub の **branch protection**（レビュー必須・ステータスチェック必須・直push禁止）で担保します。

おすすめの役割分担（GitHub Team を作ると管理しやすい）:

- **Writers（記事執筆者）**: write（ブランチ作成/更新は可能、`main` は保護で直push不可）
- **Reviewers（レビュワー）**: write + PR review
- **Maintainers（管理者）**: merge 権限（必要なら CODEOWNERS や required reviewers を設定）

> 補足: Cloudflare Pages の Preview URL 自体は通常「公開URL」なので、必要なら Cloudflare Access 等で閲覧制限を追加検討してください。

## 前提（Cloudflare Pages / Keystatic のセットアップ）

README の Keystatic セクションにある以下が設定済みであること:

- Cloudflare Pages Secrets（Preview/Production 両方）
  - `KEYSTATIC_GITHUB_CLIENT_ID`
  - `KEYSTATIC_GITHUB_CLIENT_SECRET`
  - `KEYSTATIC_SECRET`（32+ chars）
  - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- Cloudflare Pages の KV binding
  - `SESSION`（adapter がセッションに使用）

## 1記事の基本フロー（推奨）

### 1) ブランチを作る（1記事 = 1ブランチ）

- `/keystatic` にアクセスして GitHub ログイン
- `main` から新規ブランチを作成（例: `keystatic/<slug>`）
  - ブランチ名は後から分かりやすいものに（slug や目的を含める）

### 2) 記事を作る / 編集する

- Keystatic の Posts から New（Create）
- 本文を編集し、適宜 Save
  - GitHub mode: Save ごとにブランチへ commit が増えます

### 3) 早めに PR を作る（ドラフト推奨）

- GitHub で PR を作成: `keystatic/<slug>` → `main`
- まだ執筆中なら Draft PR にして OK
- PR 説明に「何を確認してほしいか」を書く

### 4) Preview で見た目を確認（publish 前確認）

**Cloudflare Pages Preview を使うのが推奨**です。

- ブランチに commit/push が発生すると、Cloudflare Pages がそのブランチ/PR をビルドします
- 確認方法（どちらか）
  - GitHub PR 画面の Checks / Deployments に出る Preview URL を開く
  - Cloudflare Pages ダッシュボード → 該当プロジェクト → Deployments で、対象ブランチの Preview を開く

> 注意: Cloudflare Pages の Preview を更新したい場合、**ローカル変更だけでは更新されません**。Git 連携のため、基本は commit/push がトリガーです。

### 5) レビュー依頼 → Approve

- 執筆者が「完成」コメント + レビュワーへ依頼
- レビュワーが Preview を確認して Approve

### 6) マージ（= Publish）

- PR の required checks が green であることを確認
- Approve が揃ったら PR を merge
- `main` 更新により Cloudflare Pages Production が更新されます（publish）

## ローカルでの確認（Preview が遅い/すぐ見たい場合）

- 開発サーバ: `npm run dev`（Keystatic UI も含めて確認可能）
- 本番寄せ: `npm run build && npm run preview`

ローカル確認は速いですが、Cloudflare Pages（本番相当）の挙動差が出ることがあるため、最終確認は Preview 推奨です。

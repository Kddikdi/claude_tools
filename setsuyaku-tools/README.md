# お便利ツール（ジャンルを問わない無料ツール集サイト）

ふるさと納税の上限額シミュレーターや手取り計算シミュレーターなど、入力するだけですぐ結果がわかる無料ツールを集めたサイトです。お金まわりのツールから始めていますが、ジャンルを限定しない「便利ツールの寄せ集めサイト」として、今後いろいろなジャンルのツールを追加していく想定です。共通のヘッダー・フッター・ナビゲーションを持ち、各ツールは `/tools/<ツール名>/` のサブディレクトリに配置されています。

## ディレクトリ構成

```
setsuyaku-tools/
├── src/
│   ├── partials/        共通ヘッダー・フッター（HTML断片）
│   ├── styles/
│   │   └── common.css   全ページ共通のCSS（デザイントークン・フォーム・カード等）
│   ├── pages/           トップページ・プライバシーポリシー等の固定ページ
│   │   ├── index.html   → /index.html（トップページ）
│   │   ├── privacy.html → /privacy/
│   │   └── contact.html → /contact/
│   └── tools/           各ツールのページ
│       ├── furusato-simulator.html → /tools/furusato-simulator/
│       └── tedori-simulator.html   → /tools/tedori-simulator/
├── public/               そのまま dist/ 直下にコピーされる静的ファイル（robots.txt, _headers）
├── templates/
│   └── tool-template.html  新しいツールを追加する時のひな形
├── scripts/build.js      ビルドスクリプト（依存パッケージなし）
├── package.json
└── dist/                 ビルド出力先（Gitには含めない。Cloudflare Pagesがビルドして生成）
```

## 仕組み

`src/pages/*.html` と `src/tools/*.html` は、それぞれ以下の書式で書かれた「本文だけ」のファイルです。

```html
<!--HEAD-->
<title>ページタイトル</title>
<meta name="description" content="...">
<!--BODY-->
<section>...ページの中身...</section>
```

`npm run build` を実行すると、`scripts/build.js` が `<!--HEAD-->` 部分と `<!--BODY-->` 部分を取り出し、共通のヘッダー・フッター（`src/partials/`）と共通CSS（`src/styles/common.css`）を組み込んだ完全なHTMLを `dist/` に書き出します。これにより：

- ヘッダー・フッター・ナビゲーションの重複がなくなる（変更は1箇所で済む）
- 各ツールの見た目は `common.css` のデザイントークン（色・フォント・フォーム・カードなど）で統一される
- 出力は素のHTML/CSSのみなので、Cloudflare Pagesでのビルドが高速・シンプル

## ローカルでの確認方法

```bash
npm run build   # dist/ に静的HTMLを生成
npm run dev     # ビルド後、http://localhost:3000 などでプレビュー（内部でnpxのserveを使用）
```

`file://` で直接HTMLファイルを開いても表示は崩れませんが、リンクの動作確認は `npm run dev` でのプレビューを推奨します。

## 新しいツールを追加する手順（テンプレート化）

1. `templates/tool-template.html` を `src/tools/<新しいツール名>.html` としてコピーする
   （ファイル名がそのまま `/tools/<新しいツール名>/` というURLになります）
2. `<!--HEAD-->` と `<!--BODY-->` の中身を新しいツールの内容に書き換える
3. `src/pages/index.html` の `.tool-grid` に `<a class="tool-card">` を1つ追加してツール一覧に載せる
4. `npm run build` でビルドして確認する

日数計算・診断ツールなど、今後追加するツールも同じ手順・同じデザインシステムで追加できます。

## Cloudflare Pages へのデプロイ

このリポジトリはモノレポ構成（複数プロジェクトが1つのリポジトリに同居）なので、Cloudflare Pages のプロジェクト設定で **Root directory** をこのフォルダに指定してください。

Cloudflare Pages ダッシュボードでの設定例:

| 項目 | 値 |
|---|---|
| Framework preset | None |
| Root directory | `setsuyaku-tools` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Gitと連携すると、`main`（または指定したブランチ）にpushするたびに自動でビルド・デプロイされます。

Wrangler CLIを使う場合は以下でも手動デプロイできます。

```bash
npm run build
npx wrangler pages deploy dist --project-name=setsuyaku-tools
```

## 公開前に必ずやること（AdSense申請前も含む）

- [ ] `src/pages/privacy.html`・`contact.html` 内の `<!-- -->` コメント箇所（連絡先メールアドレス、制定日など）を実際の情報に差し替える
- [ ] 各ページの `<link rel="canonical">` と OGPの `og:title`/`og:description` にある `https://example.com` を実際に公開するドメインに差し替える
- [ ] 各ツールページ内の `href="#"` のアフィリエイトリンクを、ASP（A8.net・もしもアフィリエイト・楽天アフィリエイト等）で取得した実際のリンクに差し替える
- [ ] `<!-- Google AdSense：審査通過後、発行されたコードをここに貼る -->` の箇所に、AdSense審査通過後の広告コードを追加する
- [ ] `public/robots.txt` の `Sitemap:` のURLを実際のドメインに差し替える（サイトマップは未生成のため、必要なら別途用意する）

## デザイン仕様（共通）

- フォント: 見出し = Shippori Mincho B1（serif）, 本文 = Zen Kaku Gothic New（sans-serif）
- カラートークン（`src/styles/common.css` の `:root` で管理、ライト/ダーク両対応）
  - `--ai:#1E3350`（藍色、アクセント/見出し）
  - `--sumi:#23262C`（本文色）
  - `--paper:#F7F8F6`（背景）
  - `--panel:#FFFFFF`（カード背景）
  - `--line:#D5DAD6`（罫線）
  - `--muted:#5E656E`（補助テキスト）
  - `--shu:#C23B22`（朱色、ワンポイントのアクセント）
- 各ツールページの構成: フォーム入力 → 結果表示（アニメーション付き）→ 内訳詳細(details) → 広告枠 → 関連リンク(PR表記) → 解説記事 → FAQ → 広告枠 → ページ固有の免責事項
- 税制データは2026年（令和8年）分の最新税制改正に対応済み（基礎控除104万円、都道府県別協会けんぽ料率など）

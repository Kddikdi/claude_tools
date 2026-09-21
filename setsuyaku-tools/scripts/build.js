#!/usr/bin/env node
/**
 * 依存ライブラリなしの最小ビルドスクリプト。
 * src/pages, src/tools 以下の各ファイルを、共通ヘッダー/フッターと
 * common.css を組み込んだ完全な静的HTMLとして dist/ に出力する。
 *
 * ソースファイルの書式:
 *   <!--HEAD-->
 *   <title>...</title>
 *   <meta name="description" content="...">
 *   ...（そのページ固有の<head>要素。titleとdescriptionは必須）
 *   <!--BODY-->
 *   <section>...</section>（<main class="wrap">の中身になるページ本文）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const header = fs.readFileSync(path.join(SRC, 'partials', 'header.html'), 'utf8');
const footer = fs.readFileSync(path.join(SRC, 'partials', 'footer.html'), 'utf8');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function splitSource(raw, file) {
  const marker = '<!--BODY-->';
  const idx = raw.indexOf(marker);
  if (idx === -1) {
    throw new Error(`${file}: <!--BODY--> マーカーが見つかりません`);
  }
  const head = raw.slice(0, idx).replace('<!--HEAD-->', '').trim();
  const body = raw.slice(idx + marker.length).trim();
  return { head, body };
}

function renderPage({ head, body }) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/common.css">
${head}
</head>
<body>
${header}
<main class="wrap">
${body}
</main>
${footer}
</body>
</html>
`;
}

function buildOne(srcFile, outFile) {
  const raw = fs.readFileSync(srcFile, 'utf8');
  const parts = splitSource(raw, path.relative(ROOT, srcFile));
  const html = renderPage(parts);
  mkdirp(path.dirname(outFile));
  fs.writeFileSync(outFile, html, 'utf8');
  console.log('build:', path.relative(ROOT, outFile));
}

function buildDir(dir, mapOut) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.html')) continue;
    const srcFile = path.join(dir, name);
    const slug = name.replace(/\.html$/, '');
    buildOne(srcFile, mapOut(slug));
  }
}

rmrf(DIST);
mkdirp(DIST);

// pages/index.html -> /index.html, pages/privacy.html -> /privacy/index.html ...
buildDir(path.join(SRC, 'pages'), (slug) =>
  slug === 'index'
    ? path.join(DIST, 'index.html')
    : path.join(DIST, slug, 'index.html')
);

// tools/furusato-simulator.html -> /tools/furusato-simulator/index.html
buildDir(path.join(SRC, 'tools'), (slug) =>
  path.join(DIST, 'tools', slug, 'index.html')
);

// 静的アセットをコピー
mkdirp(path.join(DIST, 'assets', 'css'));
fs.copyFileSync(
  path.join(SRC, 'styles', 'common.css'),
  path.join(DIST, 'assets', 'css', 'common.css')
);

// Cloudflare Pages 用のフォールバック設定（存在すればコピー）
for (const staticFile of ['_headers', '_redirects', 'robots.txt', 'favicon.svg']) {
  const p = path.join(ROOT, 'public', staticFile);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST, staticFile));
}

console.log('\nビルド完了: dist/ に出力しました');

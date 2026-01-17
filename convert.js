#!/usr/bin/env node

import { program } from 'commander';
import { marked } from 'marked';
import hljs from 'highlight.js';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

// Register TypeScript and TSX languages explicitly
import typescript from 'highlight.js/lib/languages/typescript';
import tsx from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('tsx', tsx);
hljs.registerLanguage('jsx', typescript);

// Configure marked with highlight.js
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
  const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';
  const highlighted = hljs.highlight(code, { language: validLang, ignoreIllegals: true }).value;
  return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
};

marked.setOptions({
  renderer: renderer,
  breaks: true,
  gfm: true
});

const HTML_TEMPLATE = (title, content) => `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f6f8fa;
      --text-primary: #1a1a1a;
      --text-secondary: #4a5568;
      --border-color: #e2e8f0;
      --accent-color: #0066cc;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: var(--text-primary);
      background: var(--bg-primary);
    }

    .container {
      max-width: 850px;
      margin: 0 auto;
      padding: 40px 50px;
    }

    h1, h2, h3, h4, h5, h6 {
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      line-height: 1.3;
      page-break-after: avoid;
    }

    h1 {
      font-size: 28pt;
      color: #1a202c;
      border-bottom: 3px solid var(--accent-color);
      padding-bottom: 0.5em;
      margin-top: 0;
    }

    h2 {
      font-size: 20pt;
      color: #2d3748;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 0.3em;
    }

    h3 {
      font-size: 16pt;
      color: #4a5568;
    }

    h4 {
      font-size: 13pt;
      color: #718096;
    }

    p {
      margin-bottom: 1em;
      text-align: justify;
    }

    a {
      color: var(--accent-color);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    blockquote {
      border-left: 4px solid var(--accent-color);
      padding: 1em 1.5em;
      margin: 1.5em 0;
      background: var(--bg-secondary);
      border-radius: 0 8px 8px 0;
    }

    blockquote p {
      margin: 0;
    }

    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }

    li {
      margin-bottom: 0.5em;
    }

    /* Code blocks with syntax highlighting */
    pre {
      background: #1e1e1e;
      border-radius: 10px;
      padding: 1.4em;
      margin: 1.8em 0;
      overflow-x: auto;
      page-break-inside: avoid;
      border: 2px solid #3c3c3c;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 10pt;
      line-height: 1.7;
      font-weight: 500;
      color: #d4d4d4;
    }

    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      display: block;
    }

    /* Inline code */
    :not(pre) > code {
      background: #f1f5f9;
      padding: 0.25em 0.5em;
      border-radius: 5px;
      font-size: 0.9em;
      color: #c026d3;
      border: 1px solid #cbd5e1;
      font-weight: 600;
    }

    /* Syntax highlighting - IDE-like vibrant colors (VS Code Dark+ inspired) */
    .hljs {
      background: #1e1e1e;
      color: #d4d4d4;
    }

    .hljs-comment,
    .hljs-quote {
      color: #6a9955;
      font-style: italic;
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-literal {
      color: #569cd6;
      font-weight: 600;
    }

    .hljs-string,
    .hljs-title,
    .hljs-name {
      color: #ce9178;
    }

    .hljs-number,
    .hljs-symbol {
      color: #b5cea8;
    }

    .hljs-type,
    .hljs-class {
      color: #4ec9b0;
    }

    .hljs-function,
    .hljs-title.function_ {
      color: #dcdcaa;
    }

    .hljs-attr,
    .hljs-variable,
    .hljs-template-variable {
      color: #9cdcfe;
    }

    .hljs-built_in,
    .hljs-bullet {
      color: #4fc1ff;
    }

    .hljs-params {
      color: #d4d4d4;
    }

    .hljs-property {
      color: #9cdcfe;
    }

    .hljs-regexp,
    .hljs-link {
      color: #d16969;
    }

    .hljs-meta,
    .hljs-subst {
      color: #808080;
    }

    .hljs-tag {
      color: #569cd6;
    }

    .hljs-attribute {
      color: #9cdcfe;
    }

    .hljs-addition {
      color: #4ade80;
      background: #1a3d1a;
    }

    .hljs-deletion {
      color: #f87171;
      background: #3d1a1a;
    }

    .hljs-operator {
      color: #d4d4d4;
    }

    .hljs-punctuation {
      color: #d4d4d4;
    }

    .hljs-selector-id,
    .hljs-selector-class,
    .hljs-selector-attr,
    .hljs-selector-pseudo {
      color: #d7ba7d;
    }

    .hljs-doctag {
      color: #6a9955;
      font-weight: bold;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75em 1em;
      text-align: left;
    }

    th {
      background: var(--bg-secondary);
      font-weight: 600;
    }

    /* Horizontal rule */
    hr {
      border: none;
      border-top: 2px solid var(--border-color);
      margin: 2em 0;
    }

    /* Strong emphasis */
    strong {
      font-weight: 600;
      color: #1a202c;
    }

    /* Page break utilities */
    .page-break {
      page-break-before: always;
    }

    .no-break {
      page-break-inside: avoid;
    }

    /* Print-specific styles */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      h1 { page-break-after: avoid; }
      h2, h3, h4 { page-break-after: avoid; }
      pre, blockquote, table, figure { page-break-inside: avoid; }

      a {
        color: var(--accent-color);
        text-decoration: underline;
      }
    }

    /* TOC styling */
    .toc {
      background: var(--bg-secondary);
      padding: 1.5em 2em;
      border-radius: 8px;
      margin: 2em 0;
      border-left: 4px solid var(--accent-color);
    }

    .toc h2 {
      margin-top: 0;
      border: none;
      font-size: 16pt;
    }

    .toc ul {
      list-style: none;
      padding-left: 0;
    }

    .toc li {
      margin-bottom: 0.5em;
    }

    .toc a {
      color: var(--text-secondary);
    }

    /* Difficulty badges */
    .badge {
      display: inline-block;
      padding: 0.2em 0.6em;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 500;
      margin-right: 0.5em;
    }

    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-yellow { background: #fef3c7; color: #92400e; }
    .badge-red { background: #fee2e2; color: #991b1b; }

    /* Emoji support */
    .emoji {
      font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;

async function convertMarkdownToPdf(inputFile) {
  console.log(`\n📄 Converting: ${inputFile}`);

  // Read markdown file
  const markdown = await fs.readFile(inputFile, 'utf-8');

  // Convert markdown to HTML
  const htmlContent = marked.parse(markdown);

  // Create full HTML document
  const title = path.basename(inputFile, '.md');
  const fullHtml = HTML_TEMPLATE(title, htmlContent);

  // Write temporary HTML file
  const tempHtmlPath = path.join(path.dirname(inputFile), `${title}.html`);
  await fs.writeFile(tempHtmlPath, fullHtml, 'utf-8');
  console.log(`📝 HTML created: ${tempHtmlPath}`);

  // Launch Puppeteer
  console.log(`🚀 Launching browser...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Load HTML
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const outputPath = path.join(path.dirname(inputFile), `${title}.pdf`);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    console.log(`✅ PDF saved: ${outputPath}`);

    // Clean up temp HTML
    await fs.unlink(tempHtmlPath);
    console.log(`🧹 Cleaned up temp file`);

  } finally {
    await browser.close();
  }
}

// CLI setup
program
  .argument('[inputFile]', 'Input markdown file', 'react-native-interview-prep-2026-ru.md')
  .description('Convert Markdown to PDF with syntax highlighting')
  .action(async (inputFile) => {
    try {
      const fullPath = path.resolve(inputFile);
      await fs.access(fullPath);
      await convertMarkdownToPdf(fullPath);
      console.log('\n✨ Conversion complete!\n');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`❌ Error: File not found: ${inputFile}`);
      } else {
        console.error(`❌ Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

program.parse();

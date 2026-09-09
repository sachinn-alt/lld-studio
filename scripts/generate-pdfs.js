import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.resolve(projectRoot, 'docs');

function findBrowserBinary() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function markdownToSimpleHtml(mdContent, title) {
  // Simple markdown to HTML renderer for publication-grade formatting
  let html = mdContent
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/gim, '')
    .replace(/\n\n/gim, '<p></p>')
    .replace(/---/gim, '<hr/>');

  // Convert markdown tables
  html = html.replace(/\|(.+)\|/gim, (match) => {
    const cells = match.split('|').filter(c => c.trim().length > 0);
    if (cells.some(c => c.includes('---'))) return '';
    const isHeader = false;
    const tag = 'td';
    return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    @page {
      margin: 18mm 16mm 18mm 16mm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #1a202c;
      padding: 0;
      margin: 0;
    }
    h1 {
      font-size: 20pt;
      color: #0f172a;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 14pt;
      color: #1e293b;
      margin-top: 20px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 12pt;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p, li {
      color: #334155;
      margin: 5px 0;
    }
    code {
      background: #f1f5f9;
      color: #b91c1c;
      padding: 2px 5px;
      border-radius: 4px;
      font-size: 9.5pt;
      font-family: "SFMono-Regular", Consolas, Menlo, monospace;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    blockquote {
      border-left: 4px solid #2563eb;
      background: #eff6ff;
      margin: 12px 0;
      padding: 8px 14px;
      color: #1e3a8a;
      font-style: italic;
    }
    hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

function generatePdfForFile(mdFilename, pdfFilename, title) {
  const mdPath = path.resolve(docsDir, mdFilename);
  const pdfPath = path.resolve(docsDir, pdfFilename);
  const tempHtmlPath = path.resolve(docsDir, `temp_${mdFilename}.html`);

  if (!fs.existsSync(mdPath)) {
    console.error(`Markdown file not found: ${mdPath}`);
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf-8');
  const htmlContent = markdownToSimpleHtml(mdContent, title);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const browserBin = findBrowserBinary();
  if (!browserBin) {
    console.warn('Neither Edge nor Chrome was found to generate PDF directly. HTML generated at:', tempHtmlPath);
    return;
  }

  try {
    const cmd = `"${browserBin}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`[SUCCESS] Generated: ${pdfPath}`);
  } catch (err) {
    console.error(`Error generating PDF for ${mdFilename}:`, err);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

console.log('Generating publication-grade PDF deliverables...');
generatePdfForFile('RESEARCH_NOTE.md', 'RESEARCH_NOTE.pdf', 'Research Note: LLD Practice Platform');
generatePdfForFile('DESIGN_NOTE.md', 'DESIGN_NOTE.pdf', 'Design Note: LLD Practice Platform Architecture');
generatePdfForFile('README_AI_USAGE.md', 'README_AI_USAGE.pdf', 'README & AI Usage Report: LLD Practice Platform');
console.log('Done!');

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'ui', 'build');
const html = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf-8');

function resolveFile(href) {
  const clean = href.startsWith('.') ? href.slice(1) : href;
  const full = path.join(buildDir, clean);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf-8') : null;
}

function toDataUrl(content, type) {
  return `data:${type};base64,${Buffer.from(content).toString('base64')}`;
}

// Recursively resolve ALL imports in a JS file
function deepResolve(content, baseDir, visited = new Set()) {
  // Resolve static imports: import { x } from "./path"
  let result = content.replace(/from\s+"(\.[^"]+)"/g, (match, impPath) => {
    const resolved = path.normalize(path.join(baseDir, impPath));
    if (visited.has(resolved)) return match;
    visited.add(resolved);
    const fileContent = resolveFile('./' + resolved);
    if (!fileContent) return match;
    const subDir = path.dirname(resolved);
    const inner = deepResolve(fileContent, subDir, visited);
    return `from "${toDataUrl(inner, 'application/javascript')}"`;
  });

  // Resolve dynamic imports: import("./path")
  result = result.replace(/import\("(\.[^"]+)"\)/g, (match, impPath) => {
    const resolved = path.normalize(path.join(baseDir, impPath));
    if (visited.has(resolved)) return match;
    visited.add(resolved);
    const fileContent = resolveFile('./' + resolved);
    if (!fileContent) return match;
    const subDir = path.dirname(resolved);
    const inner = deepResolve(fileContent, subDir, visited);
    return `import("${toDataUrl(inner, 'application/javascript')}")`;
  });

  return result;
}

// 1. Inline CSS
let result = html.replace(/<link\s+href="([^"]+\.css)"\s+rel="stylesheet">/g, (_, href) => {
  const css = resolveFile(href);
  return css ? `<style>${css}</style>` : '';
});

// 2. Remove modulepreload links
result = result.replace(/<link\s+href="[^"]+"\s+rel="modulepreload">\s*\n?/g, '');

// 3. Resolve all JS imports recursively
result = result.replace(/<script>([\s\S]*?)<\/script>/, (_, script) => {
  // The script references chunks via import("./path/to/chunk.js")
  // Each chunk may import other chunks. We resolve all of them recursively.
  const resolved = script.replace(/import\("(\.[^"]+)"\)/g, (match, impPath) => {
    const resolvedPath = path.normalize(impPath.startsWith('.') ? impPath.slice(1) : impPath);
    const fileContent = resolveFile('./' + resolvedPath);
    if (!fileContent) return match;
    const subDir = path.dirname(resolvedPath);
    const inner = deepResolve(fileContent, subDir, new Set([resolvedPath]));
    return `import("${toDataUrl(inner, 'application/javascript')}")`;
  });
  return `<script type="module">\n${resolved}\n</script>`;
});

const outPath = path.join(buildDir, 'app.html');
fs.writeFileSync(outPath, result);
console.log(`Built app.html (${Math.round(result.length / 1024)} KB)`);

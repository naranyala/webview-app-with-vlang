const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');
const { singleFileHtmlPlugin } = require('./plugins/single-file-html');
const { esbuild: stylexPlugin } = require('@stylexjs/unplugin');

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');

function cleanStaleSourcemaps() {
  if (watch) return;
  const assetsDir = path.resolve(__dirname, 'public', 'assets');
  let entries = [];
  try {
    entries = fs.readdirSync(assetsDir);
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.endsWith('.map')) {
      try {
        fs.rmSync(path.join(assetsDir, entry), { force: true });
      } catch {
        // Keep the build running; stale maps are ignored by git.
      }
    }
  }
}

async function build() {
  cleanStaleSourcemaps();
  const context = await esbuild.context({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    outfile: 'public/assets/app.js',
    sourcemap: watch,
    jsx: 'automatic',
    jsxImportSource: 'preact',
    metafile: true,
    plugins: [
      stylexPlugin({
        useCSSLayers: true,
        importSources: ['@stylexjs/stylex'],
        unstable_moduleResolution: { type: 'commonJS' }
      }),
      singleFileHtmlPlugin()
    ],
    loader: {
      '.css': 'css'
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        watch ? 'development' : 'production'
      )
    },
    minify: !watch,
    logLevel: 'info'
  });

  if (watch) {
    await context.watch();
    console.log('Watching for changes...');
  } else if (!serve) {
    await context.rebuild();
    await context.dispose();
  } else {
    await context.rebuild();
  }

  if (serve) {
    const server = await context.serve({
      servedir: 'public',
      port: 3000
    });

    console.log(`Serving http://${server.hosts[0]}:${server.port}`);
  }
}

build().catch(() => process.exit(1));

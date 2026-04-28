import { defineConfig } from 'vite';
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import fs from 'fs';
import path from 'path';
import * as terser from 'terser';
import * as sass from 'sass';
import sharp from 'sharp';

const dataJson = JSON.parse(fs.readFileSync('./json/data.json', 'utf-8'));

// --- 物理書き出し用関数 ---

const generateMinifiedJs = async (filePath) => {
  try {
    const minFilePath = filePath.replace(/\.js$/, '.min.js');
    const code = fs.readFileSync(filePath, 'utf-8');
    const minified = await terser.minify(code);
    if (minified.code) {
      fs.writeFileSync(minFilePath, minified.code);
      console.log(`\n📦 JS Minified: ${path.basename(minFilePath)}`);
    }
  } catch (err) { console.error('JS Minify Error:', err); }
};

const compileScss = (filePath) => {
  try {
    const result = sass.compile(filePath, { style: 'expanded' });
    const destDir = path.resolve(__dirname, 'assets/css');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    
    const destPath = path.join(destDir, 'style.css');
    fs.writeFileSync(destPath, result.css);
    console.log(`\n🎨 CSS Compiled: style.css`);
    return destPath; // 更新されたパスを返す
  } catch (err) { console.error('SCSS Compile Error:', err); }
};

const processSingleImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return;
  const webpPath = filePath.replace(ext, '.webp');
  try {
    if (fs.existsSync(webpPath)) {
      const srcStats = fs.statSync(filePath);
      const webpStats = fs.statSync(webpPath);
      if (srcStats.mtime <= webpStats.mtime) return; 
    }
    await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
    console.log(`\n📸 WebP Updated: ${path.basename(webpPath)}`);
  } catch (err) { console.error(`\n❌ WebP Error:`, err); }
};

const scanAndProcessImages = async (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await scanAndProcessImages(fullPath);
    } else {
      await processSingleImage(fullPath);
    }
  }
};

export default defineConfig({
  server: {
    open: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
      ignored: [
        '**/assets/js/*.min.js',
        // ★ '**/assets/css/*.css' をここから削除しました（監視させるため）
        '**/assets/img/*.webp'
      ]
    }
  },
  plugins: [
    ViteEjsPlugin(() => ({
      data: {
        header: { index: { imgSrc: './assets/img', slug: 'home' } },
        ...dataJson.data 
      },
      footer: { jsSrc: './assets/js' },
    })),
    ViteImageOptimizer({
      apply: 'build',
      include: ['**/*.png', '**/*.jpg', '**/*.jpeg'],
    }),
    {
      name: 'absolute-asset-sync-efficient',
      configureServer(server) {
        server.httpServer.once('listening', async () => {
          console.log('\n--- 🚀 Asset Syncing... ---');
          await scanAndProcessImages(path.resolve(__dirname, 'assets/img'));
          const jsDir = path.resolve(__dirname, 'assets/js');
          if (fs.existsSync(jsDir)) {
            fs.readdirSync(jsDir).forEach(f => {
              if (f.endsWith('.js') && !f.endsWith('.min.js')) generateMinifiedJs(path.join(jsDir, f));
            });
          }
          const mainScss = path.resolve(__dirname, 'assets/scss/style.scss');
          if (fs.existsSync(mainScss)) compileScss(mainScss);
          console.log('\n--- ✅ Asset check completed! ---');
        });
      },
      async handleHotUpdate({ file, server }) {
        // JSの処理
        if (file.includes('/assets/js/') && file.endsWith('.js') && !file.endsWith('.min.js')) {
          await generateMinifiedJs(file);
        }
        
        // SCSSの処理
        if (file.includes('/assets/scss/')) {
          const mainScss = path.resolve(__dirname, 'assets/scss/style.scss');
          compileScss(mainScss);
          
          // ★ 生成されたCSSファイルをViteに「更新されたよ！」と通知する
          // これにより、ブラウザがリロードされずにCSSだけがシュッと変わります
          const cssFile = path.resolve(__dirname, 'assets/css/style.css');
          server.ws.send({
            type: 'custom',
            event: 'file-update',
            data: { path: cssFile }
          });
          // 通常のHMRもトリガー
          server.ws.send({ type: 'full-reload' });
        }

        // 画像の処理
        if (/\.(png|jpe?g)$/i.test(file)) {
          await processSingleImage(file);
        }
      },
      async buildStart() {
        await scanAndProcessImages(path.resolve(__dirname, 'assets/img'));
      }
    }
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler', loadPaths: [path.resolve(__dirname, 'assets/scss')] }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      input: { main: path.resolve(__dirname, 'index.html') },
      output: {
        entryFileNames: 'assets/js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'assets/css/style.[ext]';
          return 'assets/img/[name].[ext]';
        }
      }
    }
  }
});
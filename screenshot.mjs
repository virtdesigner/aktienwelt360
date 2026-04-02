import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Zielverzeichnis
const screenshotDir = path.join(__dirname, 'screenshots');

// Verzeichnis erstellen, falls es nicht existiert
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  console.log(`✓ Verzeichnis erstellt: ${screenshotDir}`);
}

// Nächste verfügbare Nummer finden (optional mit Label-Filter)
function getNextScreenshotNumber(label = null) {
  const files = fs.readdirSync(screenshotDir);

  let pattern;
  if (label) {
    pattern = new RegExp(`^screenshot-(\\d+)-${label}\\.png$`);
  } else {
    pattern = /^screenshot-(\d+)(?:-[^.]+)?\.png$/;
  }

  const numbers = files
    .filter(file => file.match(pattern))
    .map(file => {
      const match = file.match(/screenshot-(\d+)/);
      return parseInt(match[1], 10);
    });

  return numbers.length === 0 ? 1 : Math.max(...numbers) + 1;
}

// Hauptfunktion
async function takeScreenshot(url, label = null, selector = null, evalScript = null, viewport = null) {
  if (!url) {
    console.error('❌ Fehler: URL erforderlich');
    console.error('Verwendung: node screenshot.mjs <URL> [label] [selector] [js-eval]');
    console.error('Beispiele:');
    console.error('  node screenshot.mjs http://localhost:3000');
    console.error('  node screenshot.mjs http://localhost:3000 hero');
    console.error('  node screenshot.mjs http://localhost:3000 galerie "#galerie"');
    console.error('  node screenshot.mjs http://localhost:3000 footer "footer"');
    console.error('  node screenshot.mjs http://localhost:3000 nav-scrolled "nav" "document.getElementById(\'main-nav\').classList.add(\'scrolled\')"');
    process.exit(1);
  }

  // URL validieren
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  try {
    console.log(`📸 Starten Sie Puppeteer...`);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    if (viewport) {
      const [w, h] = viewport.split('x').map(Number);
      await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
      console.log(`📱 Viewport gesetzt: ${w}×${h}`);
    }

    console.log(`🌐 Navigiere zu: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Optionales JS vor dem Screenshot ausführen
    if (evalScript) {
      console.log(`⚙️  Führe JS aus: ${evalScript}`);
      await page.evaluate(evalScript);
    }

    // 2 Sekunden warten: Lazy-Loading, CSS-Animationen und Reveal-Effekte abschließen lassen
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Screenshot-Nummer und Pfad
    const screenshotNumber = getNextScreenshotNumber(label);
    const filename = label
      ? `screenshot-${screenshotNumber}-${label}.png`
      : `screenshot-${screenshotNumber}.png`;
    const screenshotPath = path.join(screenshotDir, filename);

    console.log(`📷 Erstelle Screenshot...`);

    if (selector) {
      // Sektion-Screenshot: Element per CSS-Selektor finden und ausschneiden
      const element = await page.$(selector);
      if (!element) {
        console.error(`❌ Kein Element gefunden für Selektor: "${selector}"`);
        await browser.close();
        process.exit(1);
      }
      const box = await element.boundingBox();
      await page.screenshot({
        path: screenshotPath,
        clip: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        },
      });
      console.log(`✓ Sektion "${selector}" gespeichert: ${screenshotPath}`);
    } else {
      // Standard: gesamte Seite
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`✓ Screenshot gespeichert: ${screenshotPath}`);
    }

    await browser.close();
  } catch (error) {
    console.error('❌ Fehler beim Screenshot:', error.message);
    process.exit(1);
  }
}

// Script ausführen
const url        = process.argv[2];
const label      = process.argv[3] || null;
const selector   = process.argv[4] || null;
const evalScript = process.argv[5] || null;
const viewport   = process.argv[6] || null;
takeScreenshot(url, label, selector, evalScript, viewport);

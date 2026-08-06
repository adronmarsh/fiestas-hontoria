/**
 * Genera el PDF A4 del cartel desde public/cartel/index.html
 * Uso: npx tsx scripts/export-cartel-pdf.ts
 */
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { chromium } from "playwright";

const ROOT = path.join(__dirname, "..");
const HTML = path.join(ROOT, "public", "cartel", "index.html");
const PDF = path.join(ROOT, "public", "cartel", "cartel-fiestas-hontoria-2026.pdf");

async function main() {
  if (!fs.existsSync(HTML)) {
    throw new Error(`No existe ${HTML}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
  // Espera fuentes de Google
  await page.waitForTimeout(800);
  await page.pdf({
    path: PDF,
    format: "A4",
    printBackground: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log("PDF OK", PDF, fs.statSync(PDF).size, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

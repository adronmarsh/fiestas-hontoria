import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "cartel");
const URL = "https://fiestas-hontoria.vercel.app";

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const qrPath = path.join(OUT_DIR, "qr-web.png");
  await QRCode.toFile(qrPath, URL, {
    type: "png",
    width: 900,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
  console.log("QR OK", qrPath, fs.statSync(qrPath).size, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

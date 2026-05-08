import sharp from "sharp";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logoPath = join(root, "public", "logo.webp");
const outDir = join(root, "public", "splash");

mkdirSync(outDir, { recursive: true });

const screens = [
  { width: 750, height: 1334, logoWidth: 200 },
  { width: 1170, height: 2532, logoWidth: 240 },
  { width: 1290, height: 2796, logoWidth: 260 },
  { width: 1536, height: 2048, logoWidth: 300 },
];

for (const { width, height, logoWidth } of screens) {
  const logoResized = await sharp(logoPath)
    .resize(logoWidth, null, { fit: "inside" })
    .toBuffer();

  const logometa = await sharp(logoResized).metadata();
  const logoH = logometa.height;

  const left = Math.round((width - logoWidth) / 2);
  const top = Math.round((height - logoH) / 2);

  const outFile = join(outDir, `splash-${width}x${height}.png`);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: logoResized, left, top }])
    .png()
    .toFile(outFile);

  console.log(`Generated ${outFile}`);
}

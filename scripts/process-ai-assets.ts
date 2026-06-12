import fs from "fs";
import path from "path";
import sharp from "sharp";

const BRAIN_DIR = `C:\\Users\\ta225\\.gemini\\antigravity-ide\\brain\\4e21839b-57fa-4b3d-8d1a-8134f34b7165`;
const WDD_ROOT = `C:\\Users\\ta225\\OneDrive\\Desktop\\redesidn-web`;
const OUTPUT_DIR = path.join(WDD_ROOT, "assets-to-upload");

interface AssetMap {
  prefix: string;
  targetDir: string;
  targetName: string;
  width?: number;
  height?: number;
}

const ASSET_MAPS: AssetMap[] = [
  { prefix: "hero_one_", targetDir: "02-homepage", targetName: "hero-1.png", width: 1792, height: 1024 },
  { prefix: "hero_two_", targetDir: "02-homepage", targetName: "hero-2.png", width: 1792, height: 1024 },
  { prefix: "hero_three_", targetDir: "02-homepage", targetName: "hero-3.png", width: 1792, height: 1024 },
  { prefix: "aria_avatar_", targetDir: "01-branding", targetName: "aria-avatar.png", width: 256, height: 256 },
];

async function run() {
  console.log("Reading brain directory for generated images...");
  const files = fs.readdirSync(BRAIN_DIR);

  for (const mapping of ASSET_MAPS) {
    // Find the file matching mapping.prefix
    const matchingFile = files.find(f => f.startsWith(mapping.prefix) && f.endsWith(".png"));
    if (!matchingFile) {
      console.warn(`Could not find file with prefix ${mapping.prefix} in ${BRAIN_DIR}`);
      continue;
    }

    const sourcePath = path.join(BRAIN_DIR, matchingFile);
    const targetPath = path.join(OUTPUT_DIR, mapping.targetDir, mapping.targetName);

    console.log(`Processing: ${matchingFile} -> ${mapping.targetName}`);

    try {
      let pipeline = sharp(sourcePath);

      // Optimize as PNG or JPEG depending on transparency/needs
      if (mapping.targetName.endsWith(".png")) {
        const resizeWidth = mapping.targetName.startsWith("hero") ? 1600 : (mapping.width || 256);
        const resizeHeight = mapping.targetName.startsWith("hero") ? 914 : (mapping.height || 256);
        
        await pipeline
          .resize(resizeWidth, resizeHeight, { fit: "cover" })
          .png({ quality: 75, compressionLevel: 9, palette: true })
          .toFile(targetPath);
      } else {
        if (mapping.width && mapping.height) {
          pipeline = pipeline.resize(mapping.width, mapping.height, { fit: "cover" });
        }
        await pipeline
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(targetPath);
      }

      const stats = fs.statSync(targetPath);
      console.log(`Saved: ${targetPath} (${(stats.size / 1024).toFixed(2)} KB)`);
    } catch (err: any) {
      console.error(`Failed to process ${matchingFile}: ${err.message}`);
    }
  }
}

run();

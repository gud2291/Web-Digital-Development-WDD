import fs from "fs";
import path from "path";
import axios from "axios";
import sharp from "sharp";

const ROOT_DIR = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "assets-to-upload");

const SUBDIRS = [
  "01-branding",
  "02-homepage",
  "03-about",
  "04-services",
  "05-projects",
  "06-blog",
  "07-testimonials",
  "08-registrations",
  "09-videos",
];

const LOGOS = [
  { url: "https://webdigitaldevelopment.in/img/clients-logo-01.jpg", name: "clients-logo-01.jpg" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-02.jpg", name: "clients-logo-02.jpg" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-03.png", name: "clients-logo-03.png" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-04.png", name: "clients-logo-04.png" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-05.png", name: "clients-logo-05.png" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-06.png", name: "clients-logo-06.png" },
  { url: "https://webdigitaldevelopment.in/img/clients-logo-07.png", name: "clients-logo-07.png" },
];

const TESTIMONIALS = [
  { url: "https://webdigitaldevelopment.in/img/client-1.avif", name: "yasmin-carol.jpg" },
  { url: "https://webdigitaldevelopment.in/img/client-2.jpg", name: "ranjit-singh.jpg" },
  { url: "https://webdigitaldevelopment.in/img/client-3.jpg", name: "sneha.jpg" },
  { url: "https://webdigitaldevelopment.in/img/client2.avif", name: "taranjeet.jpg" },
];

async function createDirs() {
  console.log("Creating assets-to-upload directories...");
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const dir of SUBDIRS) {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created: ${dirPath}`);
    }
  }
}

async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  console.log(`Downloading: ${url} -> ${outputPath}`);
  try {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    fs.writeFileSync(outputPath, Buffer.from(response.data));
    return true;
  } catch (error: any) {
    console.error(`Failed to download ${url}: ${error.message}`);
    return false;
  }
}

async function processLogos() {
  console.log("\n--- Sourcing Client Logos ---");
  const targetDir = path.join(OUTPUT_DIR, "02-homepage");

  for (const logo of LOGOS) {
    const tempPath = path.join(targetDir, `temp-${logo.name}`);
    const success = await downloadFile(logo.url, tempPath);
    if (success) {
      const finalName = logo.name.replace(/\.(jpg|png)$/i, ".png");
      const finalPath = path.join(targetDir, finalName);
      try {
        // Optimize logos to be transparent PNGs, clean sizing
        await sharp(tempPath)
          .trim() // Trim transparent borders if any
          .resize({ width: 200, height: 80, fit: "inside" })
          .png({ quality: 90, compressionLevel: 9 })
          .toFile(finalPath);
        
        console.log(`Optimized logo saved to ${finalPath}`);
        fs.unlinkSync(tempPath);
      } catch (err: any) {
        console.error(`Error optimizing logo ${logo.name}: ${err.message}`);
        fs.renameSync(tempPath, finalPath); // Fallback to original
      }
    }
  }
}

async function processTestimonials() {
  console.log("\n--- Sourcing Testimonial Photos ---");
  const targetDir = path.join(OUTPUT_DIR, "07-testimonials");

  for (const item of TESTIMONIALS) {
    const tempPath = path.join(targetDir, `temp-${item.name}`);
    const success = await downloadFile(item.url, tempPath);
    if (success) {
      const finalPath = path.join(targetDir, item.name);
      try {
        // Resize to 200x200, output optimized JPEG
        await sharp(tempPath)
          .resize(200, 200, { fit: "cover", position: "center" })
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(finalPath);
        
        console.log(`Optimized testimonial photo saved to ${finalPath}`);
        fs.unlinkSync(tempPath);
      } catch (err: any) {
        console.error(`Error optimizing testimonial ${item.name}: ${err.message}`);
        fs.renameSync(tempPath, finalPath); // Fallback
      }
    }
  }
}

async function createPendingFile() {
  const pendingPath = path.join(OUTPUT_DIR, "PENDING-FROM-OWNER.txt");
  const pendingContent = `WDD Website — Pending Assets from Owner

The following assets must be provided by the business owner and uploaded directly to Cloudinary:

1. Gudia Yadav's Headshot (Founder)
   - Target field: Team Manager -> Gudia Yadav -> photo
   - Spec: 600x600 px square, clean professional headshot with soft natural lighting and neutral background.
   - Recommended Cloudinary folder: wdd/team

2. Real WDD Office & Team Photos
   - Target field: About Page -> Gallery / Office Photos
   - Spec: High resolution real workspace photos (no stock models or fake office mockups).
   - Recommended Cloudinary folder: wdd/about

3. Real Client Banners / Signage
   - Target field: Homepage / Projects Page
   - Spec: Real photographs of business signage, vehicles, or storefronts if applicable.
   - Recommended Cloudinary folder: wdd/projects
`;

  fs.writeFileSync(pendingPath, pendingContent);
  console.log(`\nCreated PENDING-FROM-OWNER.txt at: ${pendingPath}`);
}

async function run() {
  try {
    await createDirs();
    await processLogos();
    await processTestimonials();
    await createPendingFile();
    console.log("\nSourcing of standard external assets complete!");
  } catch (err: any) {
    console.error(`Run failed: ${err.message}`);
  }
}

run();

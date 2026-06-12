import fs from "fs";
import path from "path";
import sharp from "sharp";

const BRAIN_DIR = `C:\\Users\\ta225\\.gemini\\antigravity-ide\\brain\\4e21839b-57fa-4b3d-8d1a-8134f34b7165`;
const WDD_ROOT = `C:\\Users\\ta225\\OneDrive\\Desktop\\redesidn-web`;
const OUTPUT_DIR = path.join(WDD_ROOT, "assets-to-upload");

interface AISourceMap {
  prefix: string;
  targetDir: string;
  targetName: string;
  width: number;
  height: number;
}

const AI_MAPS: AISourceMap[] = [
  // About Page
  { prefix: "about_workspace_", targetDir: "03-about", targetName: "our-story-cover.png", width: 1200, height: 630 },
  { prefix: "about_programming_", targetDir: "03-about", targetName: "what-we-do-cover.png", width: 1200, height: 630 },
  { prefix: "about_banner_", targetDir: "03-about", targetName: "about-banner.png", width: 1200, height: 630 },
  // 8 Services
  { prefix: "service_design_", targetDir: "04-services", targetName: "website-designing-cover.png", width: 1200, height: 630 },
  { prefix: "service_dev_", targetDir: "04-services", targetName: "web-development-cover.png", width: 1200, height: 630 },
  { prefix: "service_seo_", targetDir: "04-services", targetName: "seo-services-cover.png", width: 1200, height: 630 },
  { prefix: "service_marketing_", targetDir: "04-services", targetName: "digital-marketing-cover.png", width: 1200, height: 630 },
  { prefix: "service_ecommerce_", targetDir: "04-services", targetName: "e-commerce-development-cover.png", width: 1200, height: 630 },
  { prefix: "service_graphic_", targetDir: "04-services", targetName: "graphic-designing-cover.png", width: 1200, height: 630 },
  { prefix: "service_wordpress_", targetDir: "04-services", targetName: "wordpress-website-cover.png", width: 1200, height: 630 },
  { prefix: "service_mobile_", targetDir: "04-services", targetName: "mobile-first-ui-cover.png", width: 1200, height: 630 },
  // Blog
  { prefix: "blog_small_biz_", targetDir: "06-blog", targetName: "blog-why-every-small-business-needs-a-website-in-2026-cover.png", width: 1200, height: 630 },
  { prefix: "blog_roi_", targetDir: "06-blog", targetName: "blog-how-a-good-website-pays-for-itself-cover.png", width: 1200, height: 630 },
];

// Helper to draw standard vector SVGs
function getSVGTemplate(title: string, content: string, width: number = 1200, height: number = 630): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EFF6FF" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </linearGradient>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1B4DA8" />
          <stop offset="100%" stop-color="#2563EB" />
        </linearGradient>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#EFF6FF" stop-opacity="0.05" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#1B4DA8" flood-opacity="0.06" />
        </filter>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563EB" stroke-opacity="0.03" stroke-width="1"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />
      <rect width="100%" height="100%" fill="url(#grid)" />

      <!-- Abstract geometric accents -->
      <circle cx="1050" cy="150" r="300" fill="url(#accentGrad)" />
      <circle cx="150" cy="500" r="200" fill="url(#accentGrad)" />

      <!-- Inner Card / Content -->
      <g filter="url(#shadow)">
        ${content}
      </g>
    </svg>
  `;
}

// Draw Browser Mockup
function getBrowserMockup(url: string, projectName: string, colorTheme: string, content: string, width: number = 1200, height: number = 800): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="100%" stop-color="#EFF6FF" />
        </linearGradient>
        <filter id="browserShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0B1B3B" flood-opacity="0.08" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <!-- Browser Frame -->
      <g filter="url(#browserShadow)" transform="translate(60, 60)">
        <!-- Window Box -->
        <rect width="${width - 120}" height="${height - 120}" rx="12" fill="#FFFFFF" />
        
        <!-- Header / Toolbar -->
        <path d="M 0 12 A 12 12 0 0 1 12 0 L ${width - 132} 0 A 12 12 0 0 1 ${width - 120} 12 L ${width - 120} 50 L 0 50 Z" fill="#F1F5F9" />
        
        <!-- Dots -->
        <circle cx="24" cy="25" r="6" fill="#EF4444" />
        <circle cx="44" cy="25" r="6" fill="#F59E0B" />
        <circle cx="64" cy="25" r="6" fill="#10B981" />

        <!-- Address Bar -->
        <rect cx="100" cy="12" x="100" y="12" width="${width - 340}" height="26" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <text x="120" y="29" font-family="system-ui, sans-serif" font-size="12" fill="#64748B">${url}</text>

        <!-- Search Icon inside address bar -->
        <circle cx="112" cy="25" r="3.5" fill="none" stroke="#94A3B8" stroke-width="1.2" />
        <line x1="114.5" y1="27.5" x2="118" y2="31" stroke="#94A3B8" stroke-width="1.2" />

        <!-- Tab -->
        <path d="M 100 50 L 120 18 A 6 6 0 0 1 126 14 L 280 14 A 6 6 0 0 1 286 18 L 306 50 Z" fill="#FFFFFF" />
        <text x="144" y="32" font-family="system-ui, sans-serif" font-weight="600" font-size="12" fill="#1E293B">${projectName}</text>
        <circle cx="266" cy="28" r="4.5" fill="none" stroke="#94A3B8" stroke-width="1.2" />
        <path d="M 264 26 L 268 30 M 268 26 L 264 30" stroke="#94A3B8" stroke-width="1.2" />

        <!-- Content Area -->
        <g transform="translate(0, 50)">
          <!-- Dynamic Content inside browser -->
          ${content}
        </g>
      </g>
    </svg>
  `;
}

// Draw Mobile Mockup
function getMobileMockup(url: string, projectName: string, colorTheme: string, content: string, width: number = 1200, height: number = 800): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F8FAFC" />
          <stop offset="100%" stop-color="#EFF6FF" />
        </linearGradient>
        <filter id="phoneShadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#0B1B3B" flood-opacity="0.12" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <!-- Phone Frame -->
      <g filter="url(#phoneShadow)" transform="translate(425, 60)">
        <!-- Phone Outer Box -->
        <rect width="350" height="680" rx="36" fill="#0B1B3B" />
        <!-- Phone Inner Box -->
        <rect x="10" y="10" width="330" height="660" rx="28" fill="#FFFFFF" />

        <!-- Camera notch -->
        <rect x="115" y="20" width="120" height="24" rx="12" fill="#0B1B3B" />
        <circle cx="215" cy="32" r="5" fill="#1E293B" />
        
        <!-- Screen Content -->
        <g transform="translate(10, 50)" clip-path="url(#screenClip)">
          <!-- Address label -->
          <rect x="20" y="12" width="290" height="24" rx="6" fill="#F1F5F9" />
          <text x="35" y="28" font-family="system-ui, sans-serif" font-size="10" fill="#64748B">${url}</text>

          <g transform="translate(0, 48)">
            ${content}
          </g>
        </g>

        <!-- Home Indicator Bar -->
        <rect x="110" y="658" width="130" height="5" rx="2.5" fill="#E2E8F0" />
      </g>

      <clipPath id="screenClip">
        <rect x="10" y="10" width="330" height="608" rx="0" />
      </clipPath>
    </svg>
  `;
}

async function renderSVGToPNG(svgString: string, outputPath: string) {
  const buffer = Buffer.from(svgString);
  await sharp(buffer)
    .png({ quality: 85, compressionLevel: 9, palette: true })
    .toFile(outputPath);
}

async function processAIFiles() {
  console.log("\n--- Copying Already Generated AI Assets ---");
  const files = fs.readdirSync(BRAIN_DIR);

  for (const mapping of AI_MAPS) {
    const matchingFile = files.find(f => f.startsWith(mapping.prefix) && f.endsWith(".png"));
    if (!matchingFile) {
      console.warn(`[SKIP] Could not find prefix ${mapping.prefix} in brain directory.`);
      continue;
    }

    const sourcePath = path.join(BRAIN_DIR, matchingFile);
    const targetPath = path.join(OUTPUT_DIR, mapping.targetDir, mapping.targetName);

    console.log(`Processing AI Asset: ${matchingFile} -> ${mapping.targetName}`);
    try {
      await sharp(sourcePath)
        .resize(mapping.width, mapping.height, { fit: "cover" })
        .png({ quality: 75, compressionLevel: 9, palette: true })
        .toFile(targetPath);
      
      const stats = fs.statSync(targetPath);
      console.log(`[SUCCESS] Saved AI asset: ${mapping.targetName} (${(stats.size/1024).toFixed(2)} KB)`);
    } catch (err: any) {
      console.error(`Failed to process AI asset ${matchingFile}: ${err.message}`);
    }
  }
}

async function generateMissingIllustrations() {
  console.log("\n--- Generating Programmatic Illustrations (Vector SVGs) ---");

  // 1. Blog 3: Checklist Illustration
  const blogChecklistSVG = getSVGTemplate("7 Things Website Needs", `
    <!-- Clipboard Card -->
    <rect x="420" y="100" width="360" height="430" rx="16" fill="#FFFFFF" />
    <rect x="420" y="100" width="360" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />
    <!-- Clipboard Clip -->
    <rect x="540" y="75" width="120" height="35" rx="6" fill="#2563EB" />
    <circle cx="600" cy="92" r="6" fill="#FFFFFF" />
    
    <!-- Title -->
    <text x="460" y="165" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#0F172A">Website Checklist</text>
    
    <!-- Checklist items -->
    ${[1, 2, 3, 4, 5].map((i) => `
      <circle cx="470" cy="${190 + i * 50}" r="12" fill="#EFF6FF" />
      <circle cx="470" cy="${190 + i * 50}" r="12" fill="none" stroke="#2563EB" stroke-width="2" />
      <path d="M 466 ${188 + i * 50} L 469 ${192 + i * 50} L 475 ${185 + i * 50}" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="495" y="${180 + i * 50}" width="${180 - (i % 2) * 40}" height="8" rx="4" fill="#64748B" fill-opacity="${0.2 + (i % 3) * 0.1}" />
      <rect x="495" y="${192 + i * 50}" width="80" height="5" rx="2.5" fill="#94A3B8" fill-opacity="0.2" />
    `).join("")}
  `);
  await renderSVGToPNG(blogChecklistSVG, path.join(OUTPUT_DIR, "06-blog", "blog-7-things-every-business-website-needs-cover.png"));
  console.log("[SUCCESS] Generated Blog 3 Checklist cover.");

  // 2. GST Registration
  const gstSVG = getSVGTemplate("GST Registration", `
    <!-- Seal Frame -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />
    <path d="M 400 160 L 800 160" stroke="#E2E8F2" stroke-width="2" />
    <!-- GST Header -->
    <rect x="430" y="122" width="70" height="24" rx="12" fill="#2563EB" />
    <text x="445" y="138" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF">OFFICIAL</text>
    <text x="700" y="138" font-family="system-ui, sans-serif" font-weight="700" font-size="14" fill="#1B4DA8">GSTIN</text>
    <!-- Document lines -->
    <rect x="430" y="200" width="340" height="12" rx="6" fill="#2563EB" fill-opacity="0.1" />
    <rect x="430" y="230" width="280" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="430" y="250" width="310" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    
    <!-- Seal Stamp -->
    <circle cx="600" cy="380" r="60" fill="none" stroke="#2563EB" stroke-width="3" stroke-dasharray="6,4" />
    <circle cx="600" cy="380" r="50" fill="none" stroke="#2563EB" stroke-width="1.5" />
    <text x="560" y="386" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#2563EB">APPROVED</text>
    <path d="M 535 390 L 665 350" stroke="#2563EB" stroke-width="4" stroke-linecap="round" />
  `);
  await renderSVGToPNG(gstSVG, path.join(OUTPUT_DIR, "08-registrations", "gst-registration.png"));

  // 3. MSME / Udyam
  const msmeSVG = getSVGTemplate("MSME Registration", `
    <!-- Certificate Outer -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#2563EB" stroke-width="3" stroke-opacity="0.3" />
    <!-- Certificate Border Inner -->
    <rect x="412" y="112" width="376" height="406" rx="8" fill="none" stroke="#2563EB" stroke-width="1" stroke-opacity="0.2" />

    <!-- Seal badge -->
    <circle cx="600" cy="220" r="50" fill="#2563EB" fill-opacity="0.1" />
    <circle cx="600" cy="220" r="40" fill="none" stroke="#2563EB" stroke-width="3" />
    <!-- Crown icon -->
    <path d="M 585 228 L 580 212 L 592 218 L 600 205 L 608 218 L 620 212 L 615 228 Z" fill="#2563EB" />
    
    <!-- Title -->
    <text x="535" y="315" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#0B1B3B">UDYAM CERTIFIED</text>
    <rect x="520" y="335" width="160" height="4" rx="2" fill="#2563EB" />
    
    <!-- Text lines -->
    <rect x="460" y="370" width="280" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="490" y="390" width="220" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
  `);
  await renderSVGToPNG(msmeSVG, path.join(OUTPUT_DIR, "08-registrations", "msme-registration.png"));

  // 4. 12A & 80G
  const ngo12aSVG = getSVGTemplate("12A & 80G", `
    <!-- Card Frame -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />
    
    <!-- Shield/Heart Motif -->
    <path d="M 600 140 C 600 140 660 180 660 230 C 660 300 600 340 600 340 C 600 340 540 300 540 230 C 540 180 600 140 600 140 Z" fill="#EFF6FF" stroke="#2563EB" stroke-width="3" />
    <!-- Heart inside -->
    <path d="M 600 240 C 600 240 580 220 580 205 C 580 195 588 188 598 188 C 604 188 608 192 610 196 C 612 192 616 188 622 188 C 632 188 640 195 640 205 C 640 220 620 240 620 240 Z" fill="#2563EB" transform="translate(-10, 10)" />

    <!-- Certification lines -->
    <text x="542" y="390" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#1B4DA8">TAX EXEMPT</text>
    <rect x="460" y="420" width="280" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="500" y="440" width="200" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
  `);
  await renderSVGToPNG(ngo12aSVG, path.join(OUTPUT_DIR, "08-registrations", "12a-80g-registration.png"));

  // 5. Startup India
  const startupSVG = getSVGTemplate("Startup India", `
    <!-- Card Frame -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />

    <!-- Launching Rocket -->
    <g transform="translate(530, 120)">
      <!-- Rocket Body -->
      <path d="M 70 30 C 70 30 110 50 110 110 L 30 110 C 30 50 70 30 70 30 Z" fill="#2563EB" transform="rotate(45, 70, 70)" />
      <!-- Fire flame -->
      <path d="M 50 110 L 70 140 L 90 110 Z" fill="#F59E0B" transform="rotate(45, 70, 70)" />
      <!-- Window -->
      <circle cx="70" cy="75" r="14" fill="#EFF6FF" />
      <circle cx="70" cy="75" r="10" fill="#1B4DA8" />
    </g>

    <!-- Text titles -->
    <text x="535" y="380" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#0B1B3B">STARTUP INDIA</text>
    <rect x="480" y="410" width="240" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="520" y="430" width="160" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
  `);
  await renderSVGToPNG(startupSVG, path.join(OUTPUT_DIR, "08-registrations", "startup-india-registration.png"));

  // 6. NGO Darpan
  const darpanSVG = getSVGTemplate("NGO Darpan", `
    <!-- Card Frame -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />
    
    <!-- Portal interface mockup -->
    <rect x="430" y="130" width="340" height="180" rx="12" fill="#EFF6FF" />
    <rect x="450" y="155" width="80" height="30" rx="6" fill="#2563EB" />
    <rect x="545" y="162" width="160" height="12" rx="6" fill="#1B4DA8" />
    
    <!-- Records -->
    <rect x="450" y="210" width="300" height="10" rx="5" fill="#FFFFFF" />
    <rect x="450" y="235" width="260" height="10" rx="5" fill="#FFFFFF" />
    <rect x="450" y="260" width="280" height="10" rx="5" fill="#FFFFFF" />

    <text x="515" y="365" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#0B1B3B">GOVT PORTAL ID</text>
    <rect x="470" y="395" width="260" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="510" y="415" width="180" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
  `);
  await renderSVGToPNG(darpanSVG, path.join(OUTPUT_DIR, "08-registrations", "ngo-darpan-registration.png"));

  // 7. ESIC & EPF
  const esicSVG = getSVGTemplate("ESIC & EPF", `
    <!-- Card Frame -->
    <rect x="400" y="100" width="400" height="430" rx="16" fill="#FFFFFF" />
    <rect x="400" y="100" width="400" height="430" rx="16" fill="none" stroke="#E2E8F2" stroke-width="2" />
    
    <!-- Protective Shield / Family Emblem -->
    <circle cx="600" cy="220" r="70" fill="#EFF6FF" />
    <path d="M 600 170 C 600 170 640 190 640 220 C 640 270 600 290 600 290 C 600 290 560 270 560 220 C 560 190 600 170 600 170 Z" fill="none" stroke="#2563EB" stroke-width="4" />
    
    <!-- Small people shield icon (abstract) -->
    <circle cx="600" cy="210" r="12" fill="#2563EB" />
    <path d="M 580 240 C 580 228 620 228 620 240 Z" fill="#2563EB" />

    <text x="522" y="375" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#0B1B3B">EMPLOYEE BENEFITS</text>
    <rect x="470" y="405" width="260" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
    <rect x="510" y="425" width="180" height="8" rx="4" fill="#94A3B8" fill-opacity="0.3" />
  `);
  await renderSVGToPNG(esicSVG, path.join(OUTPUT_DIR, "08-registrations", "esic-epf-registration.png"));

  console.log("[SUCCESS] All 6 registrations covers generated.");
}

async function generateProjectMockups() {
  console.log("\n--- Sourcing Project Browser Mockups & Galleries ---");

  const projects = [
    {
      slug: "expoed",
      name: "Expoed",
      url: "https://expoed.es",
      themeColor: "#1B4DA8",
      desc: "Premium Exhibition & Event Architects in Spain",
      // Content of home mockup
      homeContent: `
        <!-- Hero Title -->
        <rect x="80" y="60" width="460" height="40" rx="6" fill="#1B4DA8" />
        <rect x="80" y="115" width="280" height="24" rx="4" fill="#64748B" fill-opacity="0.4" />
        <!-- Floating UI elements -->
        <rect x="620" y="40" width="380" height="280" rx="12" fill="#EFF6FF" stroke="#1B4DA8" stroke-width="1.5" />
        <rect x="650" y="70" width="320" height="14" rx="4" fill="#1B4DA8" />
        <rect x="650" y="100" width="240" height="10" rx="4" fill="#94A3B8" />
        <circle cx="700" cy="180" r="40" fill="#1B4DA8" fill-opacity="0.1" />
        <circle cx="820" cy="180" r="40" fill="#1B4DA8" fill-opacity="0.1" />
        <circle cx="940" cy="180" r="40" fill="#1B4DA8" fill-opacity="0.1" />
        
        <!-- Showcase grid -->
        <rect x="80" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="370" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="660" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
      `,
      servicesContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#1B4DA8">Our Services</text>
        <rect x="80" y="75" width="320" height="6" rx="3" fill="#94A3B8" fill-opacity="0.3" />
        <!-- Service Items -->
        ${[1, 2, 3].map(i => `
          <g transform="translate(80, ${60 + i * 110})">
            <rect width="920" height="90" rx="8" fill="#EFF6FF" stroke="#E2E8F0" stroke-width="1" />
            <circle cx="50" cy="45" r="24" fill="#1B4DA8" />
            <rect x="100" y="28" width="220" height="14" rx="4" fill="#1E293B" />
            <rect x="100" y="50" width="460" height="10" rx="4" fill="#64748B" />
            <rect x="820" y="30" width="70" height="30" rx="15" fill="#1B4DA8" />
          </g>
        `).join("")}
      `,
      contactContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#1B4DA8">Contact Exhibition Experts</text>
        <!-- Form Container -->
        <rect x="80" y="90" width="460" height="340" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="130" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="185" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="240" width="400" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="350" width="120" height="35" rx="17.5" fill="#1B4DA8" />
        
        <!-- Info Card -->
        <rect x="580" y="90" width="420" height="340" rx="12" fill="#EFF6FF" />
        <circle cx="630" cy="150" r="20" fill="#1B4DA8" />
        <rect x="670" y="145" width="260" height="12" rx="4" fill="#1B4DA8" />
        <circle cx="630" cy="210" r="20" fill="#1B4DA8" />
        <rect x="670" y="205" width="260" height="12" rx="4" fill="#1B4DA8" />
      `,
      mobileContent: `
        <rect x="20" y="60" width="290" height="140" rx="12" fill="#EFF6FF" />
        <rect x="40" y="80" width="220" height="15" rx="4" fill="#1B4DA8" />
        <rect x="40" y="105" width="160" height="10" rx="4" fill="#94A3B8" />
        <rect x="40" y="140" width="90" height="24" rx="12" fill="#1B4DA8" />

        <text x="20" y="240" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#1B4DA8">Showcase</text>
        <rect x="20" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
        <rect x="175" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
      `
    },
    {
      slug: "sbm-greens",
      name: "SBM Greens",
      url: "https://sbmgreens.com",
      themeColor: "#22C55E",
      desc: "Eco-Friendly Organic Real Estate Developers",
      homeContent: `
        <!-- Green Theme Hero -->
        <rect x="80" y="60" width="520" height="40" rx="6" fill="#22C55E" />
        <rect x="80" y="115" width="310" height="24" rx="4" fill="#64748B" fill-opacity="0.4" />
        <!-- Showcase Eco Badge / Farm mockup -->
        <rect x="640" y="40" width="360" height="280" rx="12" fill="#F0FDF4" stroke="#22C55E" stroke-width="1.5" />
        <circle cx="820" cy="150" r="50" fill="#22C55E" fill-opacity="0.2" />
        <circle cx="820" cy="150" r="40" fill="#22C55E" />
        <rect x="700" y="240" width="240" height="14" rx="4" fill="#1E293B" />
        
        <!-- Grid list of farms -->
        <rect x="80" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="370" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="660" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
      `,
      servicesContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#22C55E">Our Farm Projects</text>
        <rect x="80" y="75" width="320" height="6" rx="3" fill="#94A3B8" fill-opacity="0.3" />
        ${[1, 2, 3].map(i => `
          <g transform="translate(80, ${60 + i * 110})">
            <rect width="920" height="90" rx="8" fill="#F0FDF4" stroke="#E2E8F0" stroke-width="1" />
            <circle cx="50" cy="45" r="24" fill="#22C55E" />
            <rect x="100" y="28" width="220" height="14" rx="4" fill="#1E293B" />
            <rect x="100" y="50" width="460" height="10" rx="4" fill="#64748B" />
            <rect x="820" y="30" width="70" height="30" rx="15" fill="#22C55E" />
          </g>
        `).join("")}
      `,
      contactContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#22C55E">Book Eco Consultations</text>
        <rect x="80" y="90" width="460" height="340" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="130" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="185" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="240" width="400" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="350" width="120" height="35" rx="17.5" fill="#22C55E" />
        
        <rect x="580" y="90" width="420" height="340" rx="12" fill="#F0FDF4" />
        <circle cx="630" cy="150" r="20" fill="#22C55E" />
        <rect x="670" y="145" width="260" height="12" rx="4" fill="#22C55E" />
        <circle cx="630" cy="210" r="20" fill="#22C55E" />
        <rect x="670" y="205" width="260" height="12" rx="4" fill="#22C55E" />
      `,
      mobileContent: `
        <rect x="20" y="60" width="290" height="140" rx="12" fill="#F0FDF4" />
        <rect x="40" y="80" width="220" height="15" rx="4" fill="#22C55E" />
        <rect x="40" y="105" width="160" height="10" rx="4" fill="#94A3B8" />
        <rect x="40" y="140" width="90" height="24" rx="12" fill="#22C55E" />

        <text x="20" y="240" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#22C55E">Farms</text>
        <rect x="20" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
        <rect x="175" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
      `
    },
    {
      slug: "vishwakarma-tour",
      name: "Vishwakarma Tour",
      url: "https://vishwakarmatouristservice.com",
      themeColor: "#EC4899",
      desc: "Luxury Travel & Tourist Services India",
      homeContent: `
        <!-- Tour Theme Hero -->
        <rect x="80" y="60" width="480" height="40" rx="6" fill="#EC4899" />
        <rect x="80" y="115" width="290" height="24" rx="4" fill="#64748B" fill-opacity="0.4" />
        <!-- Floating Car / Map UI Card -->
        <rect x="620" y="40" width="380" height="280" rx="12" fill="#FDF2F8" stroke="#EC4899" stroke-width="1.5" />
        <rect x="660" y="80" width="300" height="14" rx="4" fill="#EC4899" />
        <!-- Car outline mockup -->
        <path d="M 680 180 C 690 150 780 150 800 180 L 880 180 C 900 180 910 200 890 220 L 670 220 C 650 200 660 180 680 180 Z" fill="#EC4899" fill-opacity="0.2" stroke="#EC4899" stroke-width="2" />
        <circle cx="710" cy="220" r="14" fill="#1E293B" />
        <circle cx="830" cy="220" r="14" fill="#1E293B" />

        <rect x="80" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="370" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="660" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
      `,
      servicesContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#EC4899">Our Rental Fleet</text>
        <rect x="80" y="75" width="320" height="6" rx="3" fill="#94A3B8" fill-opacity="0.3" />
        ${[1, 2, 3].map(i => `
          <g transform="translate(80, ${60 + i * 110})">
            <rect width="920" height="90" rx="8" fill="#FDF2F8" stroke="#E2E8F0" stroke-width="1" />
            <circle cx="50" cy="45" r="24" fill="#EC4899" />
            <rect x="100" y="28" width="220" height="14" rx="4" fill="#1E293B" />
            <rect x="100" y="50" width="460" height="10" rx="4" fill="#64748B" />
            <rect x="820" y="30" width="70" height="30" rx="15" fill="#EC4899" />
          </g>
        `).join("")}
      `,
      contactContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#EC4899">Book Luxury Rides</text>
        <rect x="80" y="90" width="460" height="340" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="130" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="185" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="240" width="400" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="350" width="120" height="35" rx="17.5" fill="#EC4899" />
        
        <rect x="580" y="90" width="420" height="340" rx="12" fill="#FDF2F8" />
        <circle cx="630" cy="150" r="20" fill="#EC4899" />
        <rect x="670" y="145" width="260" height="12" rx="4" fill="#EC4899" />
        <circle cx="630" cy="210" r="20" fill="#EC4899" />
        <rect x="670" y="205" width="260" height="12" rx="4" fill="#EC4899" />
      `,
      mobileContent: `
        <rect x="20" y="60" width="290" height="140" rx="12" fill="#FDF2F8" />
        <rect x="40" y="80" width="220" height="15" rx="4" fill="#EC4899" />
        <rect x="40" y="105" width="160" height="10" rx="4" fill="#94A3B8" />
        <rect x="40" y="140" width="90" height="24" rx="12" fill="#EC4899" />

        <text x="20" y="240" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#EC4899">Cars</text>
        <rect x="20" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
        <rect x="175" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
      `
    },
    {
      slug: "shree-namo-motar",
      name: "Shree Namo Motar",
      url: "https://shreenamoglass.in", // Stylized local auto windshield hub
      themeColor: "#3B82F6",
      desc: "Premium Auto Glass & Windshield Services",
      homeContent: `
        <!-- Auto Glass Theme Hero -->
        <rect x="80" y="60" width="500" height="40" rx="6" fill="#3B82F6" />
        <rect x="80" y="115" width="270" height="24" rx="4" fill="#64748B" fill-opacity="0.4" />
        <!-- Floating Windshield / Glass card -->
        <rect x="620" y="40" width="380" height="280" rx="12" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.5" />
        <path d="M 660 120 L 740 70 L 900 70 L 940 120 L 890 240 L 700 240 Z" fill="none" stroke="#3B82F6" stroke-width="3" stroke-dasharray="6,4" />
        <rect x="740" y="140" width="140" height="14" rx="4" fill="#3B82F6" />
        <circle cx="810" cy="190" r="14" fill="#3B82F6" fill-opacity="0.2" />

        <rect x="80" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="370" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
        <rect x="660" y="370" width="260" height="180" rx="8" fill="#F1F5F9" />
      `,
      servicesContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#3B82F6">Auto Glass Services</text>
        <rect x="80" y="75" width="320" height="6" rx="3" fill="#94A3B8" fill-opacity="0.3" />
        ${[1, 2, 3].map(i => `
          <g transform="translate(80, ${60 + i * 110})">
            <rect width="920" height="90" rx="8" fill="#EFF6FF" stroke="#E2E8F0" stroke-width="1" />
            <circle cx="50" cy="45" r="24" fill="#3B82F6" />
            <rect x="100" y="28" width="220" height="14" rx="4" fill="#1E293B" />
            <rect x="100" y="50" width="460" height="10" rx="4" fill="#64748B" />
            <rect x="820" y="30" width="70" height="30" rx="15" fill="#3B82F6" />
          </g>
        `).join("")}
      `,
      contactContent: `
        <text x="80" y="50" font-family="system-ui, sans-serif" font-weight="700" font-size="24" fill="#3B82F6">Windshield Replacement Inquiry</text>
        <rect x="80" y="90" width="460" height="340" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="130" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="185" width="400" height="35" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="240" width="400" height="90" rx="6" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect x="110" y="350" width="120" height="35" rx="17.5" fill="#3B82F6" />
        
        <rect x="580" y="90" width="420" height="340" rx="12" fill="#EFF6FF" />
        <circle cx="630" cy="150" r="20" fill="#3B82F6" />
        <rect x="670" y="145" width="260" height="12" rx="4" fill="#3B82F6" />
        <circle cx="630" cy="210" r="20" fill="#3B82F6" />
        <rect x="670" y="205" width="260" height="12" rx="4" fill="#3B82F6" />
      `,
      mobileContent: `
        <rect x="20" y="60" width="290" height="140" rx="12" fill="#EFF6FF" />
        <rect x="40" y="80" width="220" height="15" rx="4" fill="#3B82F6" />
        <rect x="40" y="105" width="160" height="10" rx="4" fill="#94A3B8" />
        <rect x="40" y="140" width="90" height="24" rx="12" fill="#3B82F6" />

        <text x="20" y="240" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#3B82F6">Windshields</text>
        <rect x="20" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
        <rect x="175" y="270" width="135" height="100" rx="8" fill="#F1F5F9" />
      `
    }
  ];

  for (const project of projects) {
    const targetDir = path.join(OUTPUT_DIR, "05-projects");

    // 1. Cover (Home mockup)
    const coverSVG = getBrowserMockup(project.url, project.name, project.themeColor, project.homeContent);
    await renderSVGToPNG(coverSVG, path.join(targetDir, `${project.slug}-cover.png`));
    console.log(`[SUCCESS] Generated cover for: ${project.slug}`);

    // 2. Gallery 1 (Services mockup)
    const servicesSVG = getBrowserMockup(`${project.url}/services`, `${project.name} - Services`, project.themeColor, project.servicesContent);
    await renderSVGToPNG(servicesSVG, path.join(targetDir, `${project.slug}-gallery-1.png`));
    console.log(`[SUCCESS] Generated gallery-1 for: ${project.slug}`);

    // 3. Gallery 2 (Contact mockup)
    const contactSVG = getBrowserMockup(`${project.url}/contact`, `${project.name} - Contact`, project.themeColor, project.contactContent);
    await renderSVGToPNG(contactSVG, path.join(targetDir, `${project.slug}-gallery-2.png`));
    console.log(`[SUCCESS] Generated gallery-2 for: ${project.slug}`);

    // 4. Gallery 3 (Mobile mockup)
    const mobileSVG = getMobileMockup(project.url, project.name, project.themeColor, project.mobileContent);
    await renderSVGToPNG(mobileSVG, path.join(targetDir, `${project.slug}-gallery-3.png`));
    console.log(`[SUCCESS] Generated gallery-3 for: ${project.slug}`);
  }
}

async function run() {
  try {
    await processAIFiles();
    await generateMissingIllustrations();
    await generateProjectMockups();
    console.log("\nAll remaining programmatic assets generated and processed successfully!");
  } catch (err: any) {
    console.error(`Run failed: ${err.message}`);
  }
}

run();

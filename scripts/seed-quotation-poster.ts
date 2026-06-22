import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import mongoose, { Schema } from "mongoose";

// Load Environment variables
function loadEnvLocal() {
  const candidates = [".env.local", ".env"];
  for (const name of candidates) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    const raw = readFileSync(path, "utf8");
    for (const rawLine of raw.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}
loadEnvLocal();

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("✗ MONGODB_URI is not set (check .env.local)");
  process.exit(1);
}

// ─── Schemas ───

const PaymentTermSchema = new Schema(
  {
    percent: { type: String, default: "" },
    label: { type: String, default: "" },
    sub: { type: String, default: "" },
  },
  { _id: false }
);

const FeatureBadgeSchema = new Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false }
);

const QuotationSettingsSchema = new Schema(
  {
    validity: { type: String, default: "1 Month" },
    deliveryTime: { type: String, default: "15 – 25 working days" },
    paymentTerms: { type: [PaymentTermSchema], default: [] },
    hostingCost: { type: String, default: "" },
    hostingNote: { type: String, default: "" },
    domainNote: { type: String, default: "" },
    featureBadges: { type: [FeatureBadgeSchema], default: [] },
    greetingTemplate: { type: String, default: "" },
    footerNote: { type: String, default: "" },
  },
  { timestamps: true, collection: "quotationsettings" }
);

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    quotationTitle: { type: String, default: "" },
    quotationCostRange: { type: String, default: "" },
    quotationScope: { type: [String], default: [] },
    quotationDeliveryTime: { type: String, default: "" },
    quotationHostingCost: { type: String, default: "" },
    quotationEnabled: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "services" }
);

const QuotationSettings = mongoose.models.QuotationSettings || mongoose.model("QuotationSettings", QuotationSettingsSchema);
const Service = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

async function main() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected.");

  // 1. Seed global QuotationSettings
  console.log("Seeding global QuotationSettings...");
  const settingsData = {
    validity: "1 Month",
    deliveryTime: "15 – 25 working days",
    hostingCost: "₹5,000 / YEAR",
    hostingNote: "Hosting charges: ₹5,000/year (if hosted on our server).",
    domainNote: "Domain registration included.\n\nAlternatively, you may purchase hosting separately and provide access details.",
    greetingTemplate: "Dear {clientName},\n\nThank you for considering Web Digital Development for your online presence. We are pleased to submit our proposal for your complete website development requirement.",
    footerNote: "Thank you for your time and consideration. We look forward to working with you!",
    paymentTerms: [
      { percent: "20%", label: "Advance", sub: "upon project confirmation" },
      { percent: "30%", label: "After Design Approval", sub: "and before development" },
      { percent: "50%", label: "Before Final Deployment", sub: "and website goes live" },
    ],
    featureBadges: [
      { title: "MODERN & RESPONSIVE", subtitle: "" },
      { title: "BASIC SEO SETUP", subtitle: "" },
      { title: "SECURE & RELIABLE", subtitle: "" },
      { title: "SUPPORT & ASSISTANCE", subtitle: "" },
    ],
  };

  await QuotationSettings.findOneAndUpdate({}, { $set: settingsData }, { upsert: true, new: true });
  console.log("✓ Global QuotationSettings updated successfully.");

  // 2. Update Service "website-development" to match the poster details
  console.log("Updating service 'website-development' for quotation...");
  const serviceUpdate = {
    quotationTitle: "Complete Website Development",
    quotationCostRange: "₹35,000 – ₹45,000",
    quotationEnabled: true,
    quotationDeliveryTime: "15 – 25 working days",
    quotationHostingCost: "₹5,000 / YEAR",
    quotationScope: [
      "Complete website design and development",
      "Clean, professional white-theme layout",
      "Product listing with photos, description, and pricing",
      "User profile / account section",
      "Add to Cart functionality",
      "Order placement system",
      "Basic rules, policies, and information pages",
      "Social media integration (WhatsApp, Instagram, Facebook, LinkedIn, etc.)",
      "Upload and management of approximately 1,000 – 2,000 products/photos with information",
      "Mobile-friendly responsive design",
      "Basic SEO setup",
      "Contact and inquiry forms"
    ]
  };

  const updatedService = await Service.findOneAndUpdate(
    { slug: "website-development" },
    { $set: serviceUpdate },
    { new: true }
  );

  if (updatedService) {
    console.log(`✓ Updated Service: ${updatedService.title} (${updatedService.slug})`);
  } else {
    console.log("✗ Could not find service with slug 'website-development'. Please make sure the service is seeded first.");
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Error running seed script:", err);
  process.exit(1);
});

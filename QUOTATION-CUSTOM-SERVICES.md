# QUOTATION-CUSTOM-SERVICES.md — Add "Dynamic Website" + let admin add/type quotation services

**Site:** webdigitaldevelopment.com (Next.js 14 admin + @react-pdf/renderer + MongoDB)
**Depends on:** QUOTATION-PRICE-FIELD.md (the `developmentCost` amount input) — already applied.

**What the client wants**
1. The Quotation service dropdown is missing options like **"Dynamic Website"**.
2. Going forward, the admin should be able to **type a service name and quote it on the fly** (one-off, no setup).
3. There should be a proper **option to add services to that list** (reusable next time).

**Design (two small, additive pieces — real-service path stays 100% unchanged):**
- **A) Reusable "Quotation services" list** stored in the existing QuotationSettings singleton, managed on the existing **Quotation settings** page (same repeatable-field pattern as Payment terms / Feature badges). Admin adds "Dynamic Website" here once and it appears in the Generate dropdown forever.
- **B) "➕ Other — type a service" option** in the Generate form for a true one-off: type a name (+ optional scope), reuse the already-added Total development cost input.

Both A and B feed the **same PDF via one "custom" code path**: the form sends `serviceSlug = "__custom__"` plus a typed title / scope / cost; the API builds the PDF from those + the global settings (payment terms, hosting, delivery, badges, greeting). Existing real services are untouched.

---

## 0. OPERATIONAL RULES
1. **Start directly. Ask NO questions.**
2. **Do NOT explain/narrate.** One short summary at the very end only.
3. **Do NOT run build/type-check/lint/tests — the owner tests himself.**

## 0b. GROUND RULES (nothing may break)
- **Additive/surgical.** New optional field on QuotationSettings + a new settings editor + a "custom" option in the Generate form + one API branch. Do NOT change the PDF layout, real-service quoting, other pages, or `.env`.
- **Same admin theme** (reuse `admin-form-section`, `field`, `field__label`, `input`, `textarea`, `SortableList`, `Btn`, `admin-icon-btn`), fully **mobile responsive** like the existing sections.
- Everything **optional with safe fallbacks**: leaving custom fields blank keeps today's behavior; an empty custom scope just hides the scope card (it already renders conditionally).

---

## 1. Data model — `src/server/models/QuotationSettings.ts`
Add a sub-schema and field (default `[]`, so existing docs are unaffected):

```ts
const CustomServiceSchema = new Schema(
  {
    title: { type: String, default: "" },
    costRange: { type: String, default: "" },
    deliveryTime: { type: String, default: "" },
    scope: { type: [String], default: [] },
  },
  { _id: false }
);
```
Add inside `QuotationSettingsSchema`:
```ts
customServices: { type: [CustomServiceSchema], default: [] },
```

## 2. Validation — `src/server/validation/quotation.ts`
Add the custom-service shape and include it in the settings schema; extend the generate schema with the one-off custom fields:

```ts
const customServiceSchema = z.object({
  title: z.string().max(120).default(""),
  costRange: z.string().max(60).default(""),
  deliveryTime: z.string().max(120).default(""),
  scope: z.array(z.string().max(200)).default([]),
});
```
In `updateQuotationSettingsSchema` add:
```ts
customServices: z.array(customServiceSchema).default([]),
```
In `generateQuotationSchema` add (keep `serviceSlug` as-is — `"__custom__"` satisfies `min(1)`):
```ts
customServiceTitle: z.string().max(120).optional().or(z.literal("")),
customScope: z.array(z.string().max(200)).default([]),
```
(`developmentCost` already exists from the previous step.)

## 3. Quotation settings page — make the list editable
### 3a. Settings form: `src/app/admin/(protected)/quotation/QuotationSettingsForm.tsx`
- Extend the client `schema` and `QuotationSettingsInitial` with `customServices` (use a **textarea string** for scope in the UI, convert to array on submit):
  ```ts
  customServices: z.array(z.object({
    title: z.string().default(""),
    costRange: z.string().default(""),
    deliveryTime: z.string().default(""),
    scopeText: z.string().default(""),   // one item per line in the UI
  })).default([]),
  ```
- In `defaultValues`, map initial: `scopeText: (c.scope ?? []).join("\n")`.
- Add `const servicesArr = useFieldArray({ control, name: "customServices" });`
- Add a new `admin-form-section` titled **"Quotation services"** (place it right after "Validity & delivery"), with a short helper line ("Reusable services shown in the Generate Quotation dropdown, e.g. Dynamic Website. Cost/scope here are defaults you can still override per quotation."). Use the same `SortableList` + Add-button pattern as Payment terms:
  ```tsx
  render={(_f, idx) => (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" placeholder="Service name (e.g. Dynamic Website)" {...register(`customServices.${idx}.title` as const)} />
        <button type="button" className="admin-icon-btn admin-icon-btn--danger" aria-label="Remove service" onClick={() => servicesArr.remove(idx)}>
          <Icon name="x" size={12} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" placeholder="Default cost (e.g. ₹40,000)" {...register(`customServices.${idx}.costRange` as const)} />
        <input className="input" placeholder="Delivery (optional)" {...register(`customServices.${idx}.deliveryTime` as const)} />
      </div>
      <textarea className="textarea" style={{ minHeight: 64 }} placeholder="Scope of work — one item per line (optional)" {...register(`customServices.${idx}.scopeText` as const)} />
    </div>
  )}
  ```
  Add button: `onClick={() => servicesArr.append({ title: "", costRange: "", deliveryTime: "", scopeText: "" })}`.
- In `onSubmit`, before the PUT, convert `scopeText` → `scope` array:
  ```ts
  const payload = {
    ...values,
    customServices: (values.customServices ?? []).map((c) => ({
      title: c.title.trim(),
      costRange: c.costRange.trim(),
      deliveryTime: c.deliveryTime.trim(),
      scope: c.scopeText.split("\n").map((l) => l.trim()).filter(Boolean),
    })).filter((c) => c.title),
  };
  await adminApi.put("/api/admin/quotation", payload);
  ```

### 3b. Settings page loader (`src/app/admin/(protected)/quotation/page.tsx` or wherever `initial` is built)
Pass `customServices` into the form's `initial` (map scope array through as-is; the form joins it to text). Do NOT drop existing fields.

## 4. Generate page — feed the reusable list to the form
`src/app/admin/(protected)/quotation/generate/page.tsx`:
- Load settings and pass the custom services:
  ```ts
  import { getQuotationSettings } from "@/server/services/quotationSettings.service";
  const settings = await getQuotationSettings().catch(() => null);
  const customServices = (settings?.customServices ?? []).map((c) => ({
    title: c.title as string,
    costRange: (c.costRange as string) || "",
    scope: (c.scope as string[]) || [],
  }));
  ```
- Pass `customServices={customServices}` to `<GenerateQuotationForm />`.

## 5. Generate form — custom option + inputs
`src/app/admin/(protected)/quotation/generate/GenerateQuotationForm.tsx`:
- Add prop `customServices: { title: string; costRange: string; scope: string[] }[]` (default `[]`).
- New state: `customTitle`, `customScopeText` (textarea string). Keep the existing `serviceSlug`, `developmentCost`.
- The `<select>` options become: real `services` (value = slug) **+** each custom service (value = `list:<index>`, label = its title) **+** a final option `<option value="__custom__">➕ Other — type a service…</option>`.
- Derive `isCustom = serviceSlug === "__custom__" || serviceSlug.startsWith("list:")` → but normalize: on change, if value starts with `list:`, set `serviceSlug="__custom__"` and prefill `customTitle`, `customScopeText` (join scope with "\n") and `developmentCost` from that item; if value is `__custom__`, set `serviceSlug="__custom__"` and clear the three; otherwise set `serviceSlug=value` (real service) and hide custom inputs.
- Show, only in custom mode, inside the Service section:
  ```tsx
  <div className="field" style={{ marginTop: 14 }}>
    <label className="field__label">Service name *</label>
    <input className="input" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Dynamic Website Development" />
  </div>
  <div className="field" style={{ marginTop: 14 }}>
    <label className="field__label">Scope of work (optional)</label>
    <textarea className="textarea" style={{ minHeight: 80 }} value={customScopeText} onChange={(e) => setCustomScopeText(e.target.value)} placeholder="One item per line" />
  </div>
  ```
  (The existing "Total development cost" input stays and is used as the amount.)
- Validation before submit: if `isCustom` and `!customTitle.trim()` → `toast.error("Service name is required")` and return.
- In the POST body add:
  ```ts
  customServiceTitle: serviceSlug === "__custom__" ? customTitle.trim() : "",
  customScope: serviceSlug === "__custom__"
    ? customScopeText.split("\n").map((l) => l.trim()).filter(Boolean)
    : [],
  ```
  (Keep sending `serviceSlug` and `developmentCost` as today.)

## 6. API route — one custom branch
`src/app/api/admin/quotation/route.ts`, in `POST`:
- After parsing, branch on custom vs real service:
  ```ts
  const isCustom = data.serviceSlug === "__custom__";

  let headerSubtitle: string;
  let serviceLabel: string;
  let scopeArr: string[];
  let effectiveCost: string;
  let deliveryTime: string;
  let hostingCost: string;
  let recordServiceSlug: string;

  const settings = await getCachedQuotationSettings();

  if (isCustom) {
    const title = (data.customServiceTitle || "").trim();
    if (!title) return badRequest("Service name is required for a custom service");
    headerSubtitle = title;
    serviceLabel = title;
    scopeArr = (data.customScope || []).filter(Boolean);
    effectiveCost = (data.developmentCost || "").trim();
    deliveryTime = settings?.deliveryTime || "";
    hostingCost = settings?.hostingCost || "";
    recordServiceSlug = "custom";
  } else {
    const service = await getServiceBySlug(data.serviceSlug, true);
    if (!service || !service.quotationEnabled) {
      return badRequest("Selected service is not available for quotation");
    }
    headerSubtitle = service.quotationTitle || service.title;
    serviceLabel = String(service.quotationTitle || service.title);
    scopeArr = (service.quotationScope as string[]) || [];
    effectiveCost = (data.developmentCost || "").trim() || service.quotationCostRange || "";
    deliveryTime = service.quotationDeliveryTime || settings?.deliveryTime || "";
    hostingCost = service.quotationHostingCost || settings?.hostingCost || "";
    recordServiceSlug = String(service.slug || data.serviceSlug);
  }
  ```
- Use these variables in `QuotationDocument({ ... })`:
  - `headerSubtitle`, `costRange: effectiveCost`, `scope: scopeArr`, `hostingCost`, `deliveryTime`
  - keep `validity`, `greeting`, `paymentTerms`, `hostingNote`, `domainNote`, `featureBadges`, `footerNote`, `phone`, `website` from settings exactly as before.
- In `createQuotationRecord`, use `serviceSlug: recordServiceSlug`, `serviceTitle: serviceLabel`, `costRange: effectiveCost`.
- Everything else (email/WhatsApp/Cloudinary/headers) unchanged.

> Note: this replaces the earlier single `service` fetch with the branch above. Make sure the old `const service = await getServiceBySlug(...)` block and its direct uses are removed/merged so there's no duplicate declaration.

---

## Acceptance criteria
- Quotation settings page has a **"Quotation services"** section where the admin can add/remove reusable services (title, default cost, delivery, scope). Adding **"Dynamic Website"** there makes it appear in the Generate dropdown.
- The Generate dropdown lists real services + the reusable custom services + **"➕ Other — type a service…"**. Choosing Other reveals a Service name (required) + optional Scope, and uses the Total development cost amount.
- Generating (Download / Email / WhatsApp) produces the same premium PDF with the typed/selected service title, scope, and cost. Records are saved.
- Real (existing) service quoting is unchanged. Same theme, fully mobile responsive, nothing breaks.

Make all changes directly now.

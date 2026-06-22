import "server-only";
import * as React from "react";
import { Document, Page, View, Text, Image, Svg, Path, StyleSheet, Font } from "@react-pdf/renderer";
import { ROBOTO_REGULAR_DATA_URI, ROBOTO_BOLD_DATA_URI } from "./fontData";
import { WD_LOGO_PNG_DATA_URI } from "./logoData";

/**
 * Premium quotation PDF — rebuilt to mirror the reference poster: A4 portrait,
 * white background, green theme. Header band (logo + angular QUOTATION block),
 * 4-column info row with circular icons, a two-column body (scope card | cost +
 * payment terms + domain & hosting), a feature-badges strip, a dark footer with
 * a delivery box, and a green thank-you bar. Rendered server-side with
 * @react-pdf/renderer (no headless browser) so it runs in Vercel serverless.
 */

let _fontsRegistered = false;
function ensureFonts() {
  if (_fontsRegistered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: ROBOTO_REGULAR_DATA_URI, fontWeight: "normal" },
      { src: ROBOTO_BOLD_DATA_URI, fontWeight: "bold" },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  _fontsRegistered = true;
}

const C = {
  green900: "#1E3A8A", // Blue 900
  green800: "#1E40AF", // Blue 800
  green700: "#1D4ED8", // Blue 700
  green600: "#2563EB", // Blue 600
  green500: "#3B82F6", // Blue 500
  green100: "#DBEAFE", // Blue 100
  green50: "#EFF6FF",  // Blue 50
  border: "#BFDBFE",   // Blue 200 (light border)
  ink: "#0F172A",
  muted: "#475569",
  subtle: "#64748B",
  line: "#E5E7EB",
  panel: "#F8FAFC",
  dark: "#0F172A",     // Deep dark blue/ink
  darkSoft: "#1E293B", // Soft dark blue
  white: "#FFFFFF",
};

// ---- Icons (lucide-style 24x24 paths; some have multiple sub-paths) --------
const ICONS: Record<string, string[]> = {
  file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h6"],
  calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
  user: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"],
  clipboard: ["M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2", "M9 3h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M9 12h6", "M9 16h6"],
  card: ["M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "M2 10h20"],
  globe: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M2 12h20", "M12 2a15 15 0 0 1 0 20", "M12 2a15 15 0 0 0 0 20"],
  phone: ["M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"],
  monitor: ["M3 4h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z", "M8 20h8", "M12 16v4"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  headset: ["M4 18v-6a8 8 0 1 1 16 0v6", "M4 15h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z", "M20 15h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1z"],
  server: ["M4 4h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z", "M4 13h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z", "M7 7.5h.5", "M7 16.5h.5"],
  link: ["M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"],
  check: ["M20 6 L9 17 L4 12"],
};

function Glyph({ name, size = 14, color = C.green600, stroke = 2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  const paths = ICONS[name] ?? ICONS.check;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths.map((d, i) => (
        <Path key={i} d={d} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

function CircleIcon({
  name,
  d = 30,
  ring = C.green600,
  glyph = C.green700,
  bg = C.white,
  stroke = 1.6,
}: {
  name: string;
  d?: number;
  ring?: string;
  glyph?: string;
  bg?: string;
  stroke?: number;
}) {
  return (
    <View style={{ width: d, height: d, borderRadius: d / 2, borderWidth: 1.4, borderColor: ring, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Glyph name={name} size={d * 0.5} color={glyph} stroke={stroke} />
    </View>
  );
}

const PAD = 26;

const s = StyleSheet.create({
  page: { fontFamily: "Roboto", fontSize: 10, color: C.ink, backgroundColor: C.white, flexDirection: "column" },

  // Header
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: PAD, paddingTop: 22, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { height: 52, width: 52, objectFit: "contain" },
  brandName: { fontSize: 15, fontWeight: "bold", color: C.ink, letterSpacing: 0.3 },
  brandTag: { fontSize: 6.5, fontWeight: "bold", color: C.green700, letterSpacing: 1.2, marginTop: 3 },
  headerRight: { width: 210, height: 58, position: "relative" },
  headerRightInner: { position: "absolute", top: 0, left: 22, right: 0, bottom: 0, justifyContent: "center" },
  qword: { color: C.white, fontSize: 21, fontWeight: "bold", letterSpacing: 2 },
  qsub: { color: C.green100, fontSize: 7.5, fontWeight: "bold", letterSpacing: 1, marginTop: 2 },

  content: { paddingHorizontal: PAD },

  // Info row
  infoRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.border, borderRadius: 10, backgroundColor: C.green50, paddingVertical: 10, paddingHorizontal: 6 },
  infoCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 },
  infoLabel: { color: C.subtle, fontSize: 6.5, fontWeight: "bold", letterSpacing: 0.6, textTransform: "uppercase" },
  infoValue: { color: C.ink, fontSize: 9.5, fontWeight: "bold", marginTop: 2 },
  infoDivider: { width: 1, height: 30, backgroundColor: C.border },

  // Body
  body: { flexDirection: "row", gap: 14, marginTop: 16 },
  colLeft: { flexBasis: 0, flexGrow: 1.15 },
  colRight: { flexBasis: 0, flexGrow: 1 },

  greetHi: { fontSize: 10.5, fontWeight: "bold", color: C.ink },
  greetBody: { fontSize: 9.5, color: C.muted, lineHeight: 1.5, marginTop: 5 },

  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  cardHeaderText: { color: C.white, fontSize: 10, fontWeight: "bold", letterSpacing: 0.5 },

  scopeCard: { marginTop: 16, borderWidth: 1, borderColor: C.border, borderRadius: 10 },
  scopeBody: { padding: 12 },
  scopeItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  scopeText: { flex: 1, fontSize: 9, color: C.ink, lineHeight: 1.4 },

  // Cost box
  costBox: { position: "relative", borderWidth: 1.4, borderColor: C.green600, borderRadius: 12, padding: 14, paddingTop: 22, overflow: "hidden" },
  ribbon: { position: "absolute", top: 0, right: 0, backgroundColor: C.white, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: C.green600, paddingHorizontal: 9, paddingVertical: 4, borderBottomLeftRadius: 10 },
  ribbonText: { color: C.green600, fontSize: 6, fontWeight: "bold", letterSpacing: 0.5 },
  costLabel: { color: C.green800, fontSize: 8, fontWeight: "bold", letterSpacing: 0.8, textTransform: "uppercase" },
  costValue: { color: C.green700, fontSize: 22, fontWeight: "bold", marginTop: 4 },
  costDivider: { height: 1, backgroundColor: C.line, marginVertical: 10 },
  costHostLabel: { color: C.subtle, fontSize: 7.5, fontWeight: "bold", letterSpacing: 0.6, textTransform: "uppercase" },
  costHostValue: { color: C.ink, fontSize: 12, fontWeight: "bold", marginTop: 2 },

  // Payment terms
  payCard: { marginTop: 14, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  payBody: { padding: 10, backgroundColor: C.white },
  payRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  payPct: { width: 42, height: 36, borderRadius: 8, backgroundColor: C.green600, alignItems: "center", justifyContent: "center" },
  payPctText: { color: C.white, fontSize: 12, fontWeight: "bold" },
  payLabel: { fontSize: 9.5, fontWeight: "bold", color: C.ink },
  paySub: { fontSize: 8, color: C.subtle, marginTop: 1, lineHeight: 1.3 },

  // Domain & hosting (dark)
  hostCard: { marginTop: 14, borderRadius: 10, overflow: "hidden" },
  hostBody: { backgroundColor: C.darkSoft, padding: 11 },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  hostText: { flex: 1, color: "#E0F2FE", fontSize: 8.5, lineHeight: 1.35 },

  // Badges strip
  badgeStrip: { flexDirection: "row", alignItems: "center", marginTop: 16, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 4 },
  badgeItem: { flex: 1, alignItems: "center", paddingHorizontal: 6, gap: 6 },
  badgeTitle: { color: C.ink, fontSize: 8.5, fontWeight: "bold", textAlign: "center" },
  badgeSub: { color: C.subtle, fontSize: 7, textAlign: "center", marginTop: 1, lineHeight: 1.25 },
  badgeDivider: { width: 1, height: 40, backgroundColor: C.line },

  // Footer (dark)
  footer: { flexDirection: "row", alignItems: "stretch", justifyContent: "space-between", backgroundColor: C.dark, paddingHorizontal: PAD, paddingVertical: 14, marginTop: 16 },
  footContact: { flexDirection: "column", gap: 9, justifyContent: "center" },
  footRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  footIconBox: { width: 26, height: 26, borderRadius: 7, backgroundColor: C.green600, alignItems: "center", justifyContent: "center" },
  footText: { color: C.white, fontSize: 9.5, fontWeight: "bold" },
  deliveryBox: { backgroundColor: C.green700, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, maxWidth: 250 },
  deliveryLabel: { color: C.green100, fontSize: 7, fontWeight: "bold", letterSpacing: 0.8, textTransform: "uppercase" },
  deliveryValue: { color: C.white, fontSize: 12.5, fontWeight: "bold", marginTop: 2 },
  deliveryNote: { color: C.green100, fontSize: 6.5, marginTop: 2 },

  // Thank-you bar
  thankBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.green600, paddingHorizontal: PAD, paddingVertical: 9 },
  thankLeft: { color: C.white, fontSize: 9 },
  thankRight: { color: C.white, fontSize: 9, fontWeight: "bold" },
});

export interface QuotationDocData {
  quotationNo: string;
  date: string;
  clientName: string;
  validity: string;
  headerSubtitle: string;
  greeting: string;
  costRange: string;
  scope: string[];
  paymentTerms: { percent: string; label: string; sub: string }[];
  hostingCost: string;
  hostingNote: string;
  domainNote: string;
  featureBadges: { title: string; subtitle: string }[];
  deliveryTime: string;
  footerNote: string;
  phone: string;
  website: string;
}

function badgeIconFor(title: string): string {
  const t = title.toLowerCase();
  if (/responsive|modern|mobile|design/.test(t)) return "monitor";
  if (/seo|search|rank|google/.test(t)) return "search";
  if (/secure|reliable|safe|ssl|backup/.test(t)) return "shield";
  if (/support|assist|help|service/.test(t)) return "headset";
  return "check";
}

export function QuotationDocument(data: QuotationDocData) {
  ensureFonts();

  const domainRows: { icon: string; text: string }[] = [];
  if (data.domainNote) domainRows.push({ icon: "globe", text: data.domainNote });
  if (data.hostingCost) domainRows.push({ icon: "server", text: `Hosting available at ${data.hostingCost}.` });
  if (data.hostingNote) domainRows.push({ icon: "link", text: data.hostingNote });

  return (
    <Document title={`Quotation ${data.quotationNo}`} author="Web Digital Development">
      <Page size="A4" style={s.page}>
        {/* ---- Header ---- */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={WD_LOGO_PNG_DATA_URI} style={s.logo} />
            <View>
              <Text style={s.brandName}>WEB DIGITAL DEVELOPMENT</Text>
              <Text style={s.brandTag}>BUILDING WEBSITES. BUILDING BUSINESSES.</Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Svg width={210} height={58} viewBox="0 0 210 58" style={{ position: "absolute", top: 0, left: 0 }}>
              <Path d="M18 0 H210 V58 H0 Z" fill={C.green700} />
              <Path d="M18 0 H30 V58 H0 Z" fill={C.green600} />
            </Svg>
            <View style={s.headerRightInner}>
              <Text style={s.qword}>QUOTATION</Text>
              {!!data.headerSubtitle && <Text style={s.qsub}>{data.headerSubtitle.toUpperCase()}</Text>}
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* ---- Info row ---- */}
          <View style={s.infoRow}>
            <View style={s.infoCell}>
              <CircleIcon name="file" />
              <View>
                <Text style={s.infoLabel}>Quotation No.</Text>
                <Text style={s.infoValue}>{data.quotationNo}</Text>
              </View>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoCell}>
              <CircleIcon name="calendar" />
              <View>
                <Text style={s.infoLabel}>Date</Text>
                <Text style={s.infoValue}>{data.date}</Text>
              </View>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoCell}>
              <CircleIcon name="user" />
              <View>
                <Text style={s.infoLabel}>Client Name</Text>
                <Text style={s.infoValue}>{data.clientName}</Text>
              </View>
            </View>
            <View style={s.infoDivider} />
            <View style={s.infoCell}>
              <CircleIcon name="clock" />
              <View>
                <Text style={s.infoLabel}>Validity</Text>
                <Text style={s.infoValue}>{data.validity || "—"}</Text>
              </View>
            </View>
          </View>

          {/* ---- Two-column body ---- */}
          <View style={s.body}>
            {/* LEFT */}
            <View style={s.colLeft}>
              {!!data.greeting && (
                <View>
                  <Text style={s.greetHi}>Dear {data.clientName},</Text>
                  <Text style={s.greetBody}>{stripDearPrefix(data.greeting, data.clientName)}</Text>
                </View>
              )}

              {data.scope.length > 0 && (
                <View style={s.scopeCard}>
                  <View style={[s.cardHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border }]}>
                    <Glyph name="clipboard" size={13} color={C.green700} />
                    <Text style={[s.cardHeaderText, { color: C.green700 }]}>INCLUDED IN SCOPE OF WORK</Text>
                  </View>
                  <View style={s.scopeBody}>
                    {data.scope.map((item, i) => (
                      <View key={i} style={s.scopeItem}>
                        <View style={{ marginRight: 8, marginTop: 0.5 }}>
                          <CircleIcon name="check" d={16} ring={C.green500} glyph={C.green600} bg={C.green50} stroke={2.5} />
                        </View>
                        <Text style={s.scopeText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* RIGHT */}
            <View style={s.colRight}>
              {/* Cost box */}
              <View style={s.costBox}>
                <View style={s.ribbon}>
                  <Text style={s.ribbonText}>ONE-TIME DEVELOPMENT CHARGE</Text>
                </View>
                <Text style={s.costLabel}>Total Development Cost</Text>
                <Text style={s.costValue}>{data.costRange || "On Request"}</Text>
                {!!data.hostingCost && (
                  <>
                    <View style={s.costDivider} />
                    <Text style={s.costHostLabel}>Hosting (Optional)</Text>
                    <Text style={s.costHostValue}>{data.hostingCost}</Text>
                  </>
                )}
              </View>

              {/* Payment terms */}
              {data.paymentTerms.length > 0 && (
                <View style={s.payCard}>
                  <View style={[s.cardHeader, { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border }]}>
                    <Glyph name="card" size={13} color={C.green800} />
                    <Text style={[s.cardHeaderText, { color: C.green800 }]}>PAYMENT TERMS</Text>
                  </View>
                  <View style={s.payBody}>
                    {data.paymentTerms.map((t, i) => (
                      <View key={i} style={[s.payRow, i === data.paymentTerms.length - 1 ? { marginBottom: 0 } : {}]}>
                        <View style={s.payPct}>
                          <Text style={s.payPctText}>{t.percent || "—"}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          {!!t.label && <Text style={s.payLabel}>{t.label}</Text>}
                          {!!t.sub && <Text style={s.paySub}>{t.sub}</Text>}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Domain & hosting */}
              {domainRows.length > 0 && (
                <View style={s.hostCard}>
                  <View style={[s.cardHeader, { backgroundColor: C.dark }]}>
                    <Glyph name="globe" size={13} color={C.green500} />
                    <Text style={s.cardHeaderText}>DOMAIN &amp; HOSTING</Text>
                  </View>
                  <View style={s.hostBody}>
                    {domainRows.map((r, i) => (
                      <View key={i} style={[s.hostRow, i === domainRows.length - 1 ? { marginBottom: 0 } : {}]}>
                        <CircleIcon name={r.icon} d={20} ring={C.green500} glyph={C.green500} bg="transparent" stroke={2} />
                        <Text style={s.hostText}>{r.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* ---- Feature badges strip ---- */}
          {data.featureBadges.length > 0 && (
            <View style={s.badgeStrip}>
              {data.featureBadges.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={s.badgeDivider} />}
                  <View style={s.badgeItem}>
                    <CircleIcon name={badgeIconFor(b.title)} d={28} ring={C.green600} glyph={C.green700} bg={C.green50} />
                    <View>
                      {!!b.title && <Text style={s.badgeTitle}>{b.title}</Text>}
                      {!!b.subtitle && <Text style={s.badgeSub}>{b.subtitle}</Text>}
                    </View>
                  </View>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* push footer to the bottom */}
        <View style={{ flexGrow: 1 }} />

        {/* ---- Dark footer ---- */}
        <View style={s.footer}>
          <View style={s.footContact}>
            <View style={s.footRow}>
              <View style={s.footIconBox}>
                <Glyph name="phone" size={13} color={C.white} />
              </View>
              <Text style={s.footText}>{data.phone}</Text>
            </View>
            <View style={s.footRow}>
              <View style={s.footIconBox}>
                <Glyph name="globe" size={13} color={C.white} />
              </View>
              <Text style={s.footText}>{data.website}</Text>
            </View>
          </View>
          {!!data.deliveryTime && (
            <View style={s.deliveryBox}>
              <Glyph name="calendar" size={22} color={C.white} stroke={1.8} />
              <View>
                <Text style={s.deliveryLabel}>Estimated Delivery Time</Text>
                <Text style={s.deliveryValue}>{data.deliveryTime}</Text>
                <Text style={s.deliveryNote}>(depending on content availability)</Text>
              </View>
            </View>
          )}
        </View>

        {/* ---- Thank-you bar ---- */}
        <View style={s.thankBar}>
          <Text style={s.thankLeft}>Thank you for your time and consideration.</Text>
          <Text style={s.thankRight}>We look forward to working with you!</Text>
        </View>
      </Page>
    </Document>
  );
}

/** The greeting template usually starts "Dear {name}," — we render that line
 *  ourselves (bold), so drop a leading "Dear …," from the paragraph body. */
function stripDearPrefix(greeting: string, clientName: string): string {
  let g = greeting.trim();
  const dear = `Dear ${clientName},`;
  if (g.toLowerCase().startsWith(dear.toLowerCase())) g = g.slice(dear.length).trim();
  else g = g.replace(/^dear\b[^,]*,\s*/i, "").trim();
  return g;
}

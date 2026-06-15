"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { AnalyticsIds } from "@/components/public/CookieBanner";

/**
 * PERFORMANCE — Task 3. These are all non-critical, fixed-position overlay
 * widgets (chat bubble, floating call/WhatsApp actions, mobile bottom bar,
 * sticky CTA, cookie banner, activity ticker, blog reading-progress bar). None
 * of them is above-the-fold content, and each already renders nothing until a
 * client-side condition is met, so SSR-ing them buys nothing but ships+runs
 * their JS on the critical path.
 *
 * We load them client-side only (`ssr: false`) and do not mount them until the
 * browser is idle OR the visitor first interacts (pointer/key/touch/scroll),
 * whichever comes first. Result: lighter initial JS / main-thread work and a
 * faster first interaction, with every widget still appearing and behaving
 * identically — the only difference is a ~split-second-later mount. All of them
 * are `position: fixed`, so deferring their mount introduces no layout shift.
 *
 * CookieBanner is included but the idle path guarantees it mounts shortly after
 * load even with zero interaction, so it still captures consent and gates the
 * analytics scripts exactly as before (it is never "behind a click").
 */
const ReadingProgressBar = dynamic(
  () => import("@/components/public/ReadingProgressBar").then((m) => m.ReadingProgressBar),
  { ssr: false }
);
const FloatingActions = dynamic(
  () => import("@/components/FloatingActions").then((m) => m.FloatingActions),
  { ssr: false }
);
const MobileBottomBar = dynamic(
  () => import("@/components/MobileBottomBar").then((m) => m.MobileBottomBar),
  { ssr: false }
);
const ChatWidget = dynamic(
  () => import("@/components/public/Chatbot/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false }
);
const StickyQuoteCTA = dynamic(
  () => import("@/components/public/StickyQuoteCTA").then((m) => m.StickyQuoteCTA),
  { ssr: false }
);
const CookieBanner = dynamic(
  () => import("@/components/public/CookieBanner").then((m) => m.CookieBanner),
  { ssr: false }
);
const ActivityTicker = dynamic(
  () => import("@/components/public/ActivityTicker").then((m) => m.ActivityTicker),
  { ssr: false }
);

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

const INTERACTION_EVENTS: (keyof WindowEventMap)[] = [
  "pointerdown",
  "keydown",
  "touchstart",
  "scroll",
];

export function DeferredPublicWidgets({ analyticsIds }: { analyticsIds?: AnalyticsIds }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const w = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const trigger = () => setReady(true);

    // Idle path: fires soon after load even without any interaction, so the
    // cookie banner still mounts in time to gate analytics.
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(trigger, { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(trigger, 1500);
    }

    // Interaction path: mount immediately if the visitor engages first.
    const onInteract = () => trigger();
    INTERACTION_EVENTS.forEach((e) =>
      window.addEventListener(e, onInteract, { passive: true, once: true })
    );

    return () => {
      if (idleId !== undefined && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, onInteract));
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <ReadingProgressBar />
      <FloatingActions />
      <MobileBottomBar />
      <ChatWidget />
      <StickyQuoteCTA />
      <CookieBanner analyticsIds={analyticsIds} />
      <ActivityTicker />
    </>
  );
}

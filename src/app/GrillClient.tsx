"use client";

import { useEffect, useRef, useState } from "react";

/* =========================================================================
   CONFIG — ret her, eller brug URL-parametre:
     ?next=2026-08-15T17:30   -> sæt næste grill (browser-lokal tid)
     ?live=1                  -> tving status "DE GRILLER NU" (grøn)
     ?idle=1                  -> tving status "Ikke lige nu" (rød)
   ========================================================================= */
const CONFIG = {
  nextGrill: "2026-07-20T17:30", // næste grill, browser-lokal tid
  grillWindowHours: 3, // hvor længe status forbliver "live"
  forceStatus: null as null | "live" | "idle",
};

const CONSENT_KEY = "griller-consent-v1";
const VID_KEY = "griller-vid";
type Consent = "granted" | "denied";

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function ensureVid(): string | null {
  try {
    let v = localStorage.getItem(VID_KEY);
    if (!v) {
      const raw = (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}${Math.random()}`
      )
        .replace(/[^a-f0-9]/gi, "")
        .slice(0, 16);
      v = "v_" + raw;
      localStorage.setItem(VID_KEY, v);
    }
    return v;
  } catch {
    return null;
  }
}

/** POST small JSON to a same-origin route; the route relays server-to-server. */
function post(url: string, data: unknown, beacon = false): void {
  const body = JSON.stringify(data);
  if (beacon) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        return;
      }
    } catch {
      /* fall through to fetch */
    }
  }
  try {
    void fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore — tracking must never break the page */
  }
}

/** Consent-gated analytics ping. No consent -> no id, no request. */
function track(
  type: string,
  extra: Record<string, unknown> = {},
  beacon = false,
): void {
  if (readConsent() !== "granted") return;
  const vid = ensureVid();
  if (!vid) return;
  post("/api/track", { type, vid, path: location.pathname, ...extra }, beacon);
}

const DA_MONTHS = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Attach all interactive behaviour to the server-rendered markup.
 * Returns a cleanup that clears timers/listeners.
 */
function initPage(): () => void {
  const teardown: Array<() => void> = [];
  const $ = (id: string) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- resolve config against URL overrides -----------------------------
  const nextStr = params.get("next") || CONFIG.nextGrill;
  let force = CONFIG.forceStatus;
  if (params.get("live") === "1") force = "live";
  else if (params.get("idle") === "1") force = "idle";

  const start = new Date(nextStr);
  const validDate = !isNaN(start.getTime());
  const end = validDate
    ? new Date(start.getTime() + CONFIG.grillWindowHours * 3600e3)
    : null;

  function fmtDate(d: Date) {
    if (isNaN(d.getTime())) return "dato følger snart";
    return `${d.getDate()}. ${DA_MONTHS[d.getMonth()]} · kl. ${pad(d.getHours())}.${pad(d.getMinutes())}`;
  }

  // ---- state machine ----------------------------------------------------
  function computeState(now: Date): "live" | "scheduled" | "past" {
    if (force === "live") return "live";
    if (force === "idle") return "scheduled";
    if (!validDate) return "scheduled";
    if (now < start) return "scheduled";
    if (end && now >= start && now <= end) return "live";
    return "past";
  }

  const heroText = document.querySelector(".hero-text");
  const statusText = $("statusText");
  const statusSub = $("statusSub");
  const cdLabel = $("cdLabel");
  const cdDigits = $("cdDigits");

  const COPY: Record<string, { text: string; sub: string }> = {
    live: { text: "JA — DE GRILLER NU!", sub: "Havnen i Gudhjem · kl. 17.30" },
    scheduled: {
      text: "Ikke lige nu.",
      sub: "Men solen er på vej — og pølserne står på planen.",
    },
    past: {
      text: "Vi har grillet.",
      sub: "Grillen køler af — vi vender tilbage. Hold øje med himlen.",
    },
  };

  function applyStateClass(state: string) {
    if (!heroText) return;
    heroText.classList.remove("is-live", "is-idle", "is-past");
    if (state === "live") heroText.classList.add("is-live");
    else if (state === "past") heroText.classList.add("is-past");
    else heroText.classList.add("is-idle");
  }

  function renderStatus(state: string) {
    const c = COPY[state] || COPY.scheduled;
    if (statusText) statusText.textContent = c.text;
    if (statusSub) statusSub.textContent = c.sub;
    applyStateClass(state);
  }

  function renderCountdown(state: string, now: Date) {
    if (!cdLabel || !cdDigits) return;
    if (state === "live") {
      cdLabel.textContent = "";
      cdDigits.textContent = "GRILLEN ER TÆNDT ☀";
      return;
    }
    if (state === "past" || !validDate) {
      cdLabel.textContent = "Næste grill";
      cdDigits.textContent = "følger snart ☀";
      return;
    }
    const diff = Math.max(0, start.getTime() - now.getTime());
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hrs = Math.floor((s % 86400) / 3600);
    const min = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    cdLabel.textContent = "Næste grill om";
    const dPart = days > 0 ? `${pad(days)}D ` : "";
    cdDigits.textContent = `${dPart}${pad(hrs)}T ${pad(min)}M ${pad(sec)}S`;
  }

  let lastState: string | null = null;
  function tick() {
    const now = new Date();
    const state = computeState(now);
    if (state !== lastState) {
      renderStatus(state);
      lastState = state;
    }
    renderCountdown(state, now);
  }
  tick();
  const intervalId = window.setInterval(tick, 1000);
  teardown.push(() => clearInterval(intervalId));

  // ---- photo timestamp (static "last observation" stamp) ----------------
  {
    const d = new Date();
    const wd = ["søn", "man", "tir", "ons", "tor", "fre", "lør"][d.getDay()];
    const stamp = `${wd} ${pad(d.getDate())}.${pad(d.getMonth() + 1)} · ${pad(d.getHours())}.${pad(d.getMinutes())} · Gudhjem havn`;
    const photoTs = $("photoTs");
    if (photoTs) photoTs.textContent = stamp;
  }

  // ---- scroll-scrubbed living polaroid ---------------------------------
  {
    const runway = $("polaroidRunway");
    const sticky = $("polaroidSticky");
    const video = $("polaroidVideo") as HTMLVideoElement | null;
    const progress = $("polaroidProgress");
    const cue = $("polaroidCue");

    if (runway && sticky && video && progress && cue) {
      let seeking = false;
      let active = false;
      let raf = 0;
      let completionTracked = false;

      const render = (p: number) => {
        const bounded = Math.min(1, Math.max(0, p));
        progress.style.width = `${Math.round(bounded * 100)}%`;
        cue.textContent = bounded >= .96 ? "ØJEBLIKKET LEVER · GUDHJEM" : "SCROLL · VÆK ØJEBLIKKET";
        if (bounded >= .96 && !completionTracked) {
          completionTracked = true;
          track("event", { name: "living_polaroid_complete" });
        }
        return bounded;
      };

      const frame = () => {
        if (!active) return;
        const rect = runway.getBoundingClientRect();
        const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;
        const distance = Math.max(1, runway.offsetHeight - sticky.offsetHeight - stickyTop);
        const p = render((stickyTop - rect.top) / distance);
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        if (duration > 0) {
          const target = p * Math.max(0, duration - .06);
          if (!seeking && Math.abs(video.currentTime - target) > .025) {
            seeking = true;
            video.currentTime = target;
          }
        }
        raf = requestAnimationFrame(frame);
      };
      const onSeeked = () => { seeking = false; };
      const onVideoReady = () => { video.dataset.ready = "true"; };
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("loadeddata", onVideoReady);
      if (video.readyState >= 2) onVideoReady();

      if (reduceMotion) {
        video.removeAttribute("data-ready");
        cue.textContent = "ORIGINALFOTO · GUDHJEM HAVN";
        progress.style.width = "100%";
      } else {
        const observer = new IntersectionObserver(([entry]) => {
          active = entry.isIntersecting;
          cancelAnimationFrame(raf);
          if (active) frame();
        }, { rootMargin: "20% 0px" });
        observer.observe(runway);
        teardown.push(() => observer.disconnect());
      }

      teardown.push(() => {
        active = false;
        cancelAnimationFrame(raf);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("loadeddata", onVideoReady);
      });
    }
  }

  // ---- cinematic grill telemetry separator ----------------------------
  {
    const runway = $("telemetryRunway");
    const stage = $("telemetryStage");
    const video = $("telemetryVideo") as HTMLVideoElement | null;
    const phase = $("telemetryPhase");
    const line = $("telemetryLine");
    const percent = $("telemetryPercent");
    const progress = $("telemetryProgress");
    const cue = $("telemetryCue");

    if (runway && stage && video && phase && line && percent && progress && cue) {
      const phases = [
        { at: 0, label: "KOLD START", line: "Scroll langsomt. Vi måler den eneste burn rate, der tæller." },
        { at: .28, label: "VARMER OP", line: "Kullene svarer. Pølsen er nu i pipeline." },
        { at: .58, label: "STEGESKORPE", line: "Temperaturen stiger. Traction kan duftes." },
        { at: .88, label: "SERVERINGSKLAR", line: "Produktet er varmt. Ingen app nødvendig." },
      ];
      let seeking = false;
      let active = false;
      let raf = 0;
      let completionTracked = false;

      const render = (p: number) => {
        const bounded = Math.min(1, Math.max(0, p));
        const current = [...phases].reverse().find((item) => bounded >= item.at) ?? phases[0];
        phase.textContent = current.label;
        line.textContent = current.line;
        percent.textContent = `${String(Math.round(bounded * 100)).padStart(3, "0")}%`;
        progress.style.width = `${Math.round(bounded * 100)}%`;
        cue.style.opacity = bounded > .08 ? "0" : "1";
        if (bounded >= .96 && !completionTracked) {
          completionTracked = true;
          track("event", { name: "grill_telemetry_complete" });
        }
        return bounded;
      };

      const frame = () => {
        if (!active) return;
        const rect = runway.getBoundingClientRect();
        const distance = Math.max(1, runway.offsetHeight - window.innerHeight);
        const p = render(-rect.top / distance);
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        if (duration > 0) {
          const target = p * Math.max(0, duration - .06);
          if (!seeking && Math.abs(video.currentTime - target) > .025) {
            seeking = true;
            video.currentTime = target;
          }
        }
        raf = requestAnimationFrame(frame);
      };
      const onSeeked = () => { seeking = false; };
      const onVideoReady = () => { video.dataset.ready = "true"; };
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("loadeddata", onVideoReady);
      if (video.readyState >= 2) onVideoReady();

      if (reduceMotion) {
        render(1);
        video.removeAttribute("data-ready");
        cue.style.display = "none";
      } else {
        const observer = new IntersectionObserver(([entry]) => {
          active = entry.isIntersecting;
          cancelAnimationFrame(raf);
          if (active) frame();
        }, { rootMargin: "15% 0px" });
        observer.observe(runway);
        teardown.push(() => observer.disconnect());
      }

      teardown.push(() => {
        active = false;
        cancelAnimationFrame(raf);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("loadeddata", onVideoReady);
      });
    }
  }

  // ---- facts date -------------------------------------------------------
  {
    const factsDate = $("factsDate");
    if (factsDate)
      factsDate.textContent = validDate
        ? `Næste bekræftede dato: ${fmtDate(start)}.`
        : "Næste dato bekræftes snart.";
  }

  // ---- calendar .ics (built from resolved next date, self-contained) ----
  {
    const btn = $("calBtn");
    const note = $("calNote");
    if (btn && validDate && end) {
      const icsStamp = (d: Date) =>
        d.getFullYear() +
        pad(d.getMonth() + 1) +
        pad(d.getDate()) +
        "T" +
        pad(d.getHours()) +
        pad(d.getMinutes()) +
        "00";
      const uid = "grill-" + start.getTime() + "@griller.dk";
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//griller.dk//grill//DA",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "UID:" + uid,
        "DTSTAMP:" + icsStamp(new Date()),
        "DTSTART:" + icsStamp(start),
        "DTEND:" + icsStamp(end),
        "SUMMARY:Martin & Jesper griller i Gudhjem",
        "LOCATION:Havnen i Gudhjem",
        "DESCRIPTION:Fra kl. 17.30 · Klippen Hotel\\, Skt. Jørgens Gaard. Uofficiel fanside griller.dk.",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      btn.setAttribute(
        "href",
        "data:text/calendar;charset=utf-8," + encodeURIComponent(ics),
      );
      const onCal = () => {
        note?.classList.add("show");
        setTimeout(() => note?.classList.remove("show"), 4000);
        track("event", { name: "calendar_add" });
      };
      btn.addEventListener("click", onCal);
      teardown.push(() => btn.removeEventListener("click", onCal));
    } else if (btn) {
      btn.setAttribute("aria-disabled", "true");
    }
  }

  // ---- grill-o-meter needle rise ----------------------------------------
  {
    const TARGET = 92; // procent
    const angle = -90 + (TARGET / 100) * 180; // -90deg (0%) .. +90deg (100%)
    const needle = $("needle");
    const read = $("gaugeRead");
    if (needle && read) {
      needle.style.setProperty("--needle-angle", angle.toFixed(1) + "deg");
      if (reduceMotion) {
        needle.style.transition = "none";
        needle.classList.add("animate");
        read.textContent = TARGET + " %";
      } else {
        read.textContent = "0 %";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => needle.classList.add("animate")),
        );
        const t0 = performance.now();
        const dur = 1500;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          read.textContent = Math.round(eased * TARGET) + " %";
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }
  }

  // ---- subscribe: really save the email, then SLAM the joke stamp -------
  {
    const form = $("subForm") as HTMLFormElement | null;
    const stamp = $("stamp");
    const honest = $("subHonest");
    const emailInput = $("subEmail") as HTMLInputElement | null;
    if (form && stamp) {
      let stampTimer: number | undefined;
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const email = (emailInput?.value || "").trim();
        const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (looksValid) {
          post("/api/subscribe", { email }); // user-initiated: stored regardless of analytics consent
          track("event", { name: "subscribe" }); // analytics: consent-gated
        }
        honest?.classList.add("show");
        stamp.classList.remove("show");
        void stamp.offsetWidth; // reflow so the animation retriggers
        stamp.classList.add("show");
        if (stampTimer) clearTimeout(stampTimer);
        stampTimer = window.setTimeout(() => stamp.classList.remove("show"), 2600);
      };
      form.addEventListener("submit", onSubmit);
      teardown.push(() => form.removeEventListener("submit", onSubmit));
    }
  }

  return () => teardown.forEach((fn) => fn());
}

export default function GrillClient() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const pageviewSent = useRef(false);

  function sendPageview() {
    if (pageviewSent.current) return;
    if (readConsent() !== "granted") return;
    pageviewSent.current = true;
    track("pageview", { referrer: document.referrer || undefined });
  }

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, "granted");
    } catch {
      /* ignore */
    }
    setConsent("granted");
    ensureVid();
    sendPageview();
  }

  function decline() {
    try {
      localStorage.setItem(CONSENT_KEY, "denied");
    } catch {
      /* ignore */
    }
    setConsent("denied");
  }

  useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
    const cleanup = initPage();
    sendPageview(); // fires only if consent was already granted on a prior visit

    // page dwell time (one sample on first hide) — consent-gated inside track()
    const startedAt = Date.now();
    let dwellSent = false;
    const flush = () => {
      if (dwellSent || document.visibilityState !== "hidden") return;
      dwellSent = true;
      track(
        "page_time",
        { props: { duration_sec: Math.round((Date.now() - startedAt) / 1000) } },
        true,
      );
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);

    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only show the opt-in once, and never during SSR/first paint (avoids flash
  // for visitors who already chose).
  if (!mounted || consent !== null) return null;

  return (
    <div className="consent" role="dialog" aria-label="Samtykke til besøgstælling">
      <p>
        🍪 Må vi tælle med? Vi bruger ét anonymt besøgstal til at se, om nogen
        faktisk kigger forbi — ingen annoncer, intet videresalg.
      </p>
      <div className="btns">
        <button className="ok" type="button" onClick={accept}>
          Ja tak
        </button>
        <button className="no" type="button" onClick={decline}>
          Nej tak
        </button>
      </div>
    </div>
  );
}

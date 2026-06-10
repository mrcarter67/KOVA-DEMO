"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/* ─── static data ─────────────────────────────────────────────────── */

const INDUSTRIES = [
  "Real Estate", "Healthcare", "Manufacturing",
  "Retail", "Home Services", "Other",
];

const DASHBOARD_AGENTS = [
  { name: "Maven", role: "Analyzing leads",  color: "#3B9EFF" },
  { name: "Iris",  role: "Writing content",  color: "#00C8A0" },
  { name: "Dash",  role: "Running outreach", color: "#A78BFA" },
  { name: "Poppy", role: "Scheduling posts", color: "#F59E0B" },
];

/* ─── particle burst on success ──────────────────────────────────── */

function spawnParticles(container: HTMLElement) {
  const palette = ["#3B82F6", "#60A5FA", "#818CF8", "#C084FC", "#38BDF8", "#34D399"];
  for (let i = 0; i < 26; i++) {
    const dot = document.createElement("div");
    const sz  = 5 + Math.random() * 8;
    Object.assign(dot.style, {
      position: "absolute", width: sz + "px", height: sz + "px",
      borderRadius: "50%",
      background: palette[Math.floor(Math.random() * palette.length)],
      left: 15 + Math.random() * 70 + "%", bottom: "20%",
      pointerEvents: "none",
      animation: `kv-rise ${1 + Math.random() * 0.8}s cubic-bezier(0.25,1,0.5,1) ${Math.random() * 0.55}s forwards`,
    });
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 2400);
  }
}

/* ─── all CSS ─────────────────────────────────────────────────────── */

const STYLES = `
  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%25" height="100%25" filter="url(%23noiseFilter)"/></svg>');
  }
  .bg-grid-theme {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }
  .text-card-silver-matte {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    transform: translateZ(0);
    filter: drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }
  .premium-depth-card {
    background: linear-gradient(145deg, #162C6D 0%, #0A101D 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.9), 0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.04); position: relative;
  }
  .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(255,255,255,0.06) 0%, transparent 40%);
    mix-blend-mode: screen;
  }
  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8),
      inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 1px rgba(0,0,0,0.5);
  }
  .widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3),
      inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }
  /* r=40 in 100×100 viewBox → circumference ≈ 251 */
  .progress-ring {
    transform: rotate(-90deg); transform-origin: center;
    stroke-dasharray: 251; stroke-dashoffset: 251; stroke-linecap: round;
  }
  .kv-inner-grid {
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; gap: clamp(16px, 3vw, 48px);
    width: 100%; height: 100%; max-width: 1280px;
    margin: 0 auto; padding: 0 clamp(16px, 4vw, 56px);
    position: relative; z-index: 10;
  }
  .kv-mockup-frame {
    background: #050914; border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 0 24px rgba(0,0,0,0.9), 0 30px 70px rgba(0,0,0,0.8);
    overflow: hidden; position: relative;
    width: clamp(180px, 22vw, 272px); aspect-ratio: 9/16;
  }
  .kv-input {
    width: 100%; background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
    color: #F1F5F9; font-size: 15px; font-family: inherit; padding: 13px 16px;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; -webkit-appearance: none;
  }
  .kv-input::placeholder { color: rgba(148,163,184,0.45); }
  .kv-input:focus {
    outline: none; border-color: rgba(59,130,246,0.6);
    background: rgba(59,130,246,0.06); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
  }
  .kv-input option { background: #0D1829; color: #F1F5F9; }
  .kv-btn {
    width: 100%; background: linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%);
    color: #fff; border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
    padding: 15px 24px; cursor: pointer; font-family: inherit;
    box-shadow: 0 0 0 1px rgba(59,130,246,0.4), 0 4px 16px rgba(59,130,246,0.4),
      0 16px 32px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.4);
    transition: all 0.25s cubic-bezier(0.25,1,0.5,1);
  }
  .kv-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 1px rgba(59,130,246,0.6), 0 8px 24px rgba(59,130,246,0.5),
      0 24px 48px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.4);
  }
  .kv-btn:not(:disabled):active { transform: translateY(1px); }
  .kv-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .kv-error {
    background: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.3);
    border-radius: 10px; color: #FCA5A5; font-size: 13px; padding: 10px 14px;
  }
  .kv-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; padding: 5px 12px;
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.4);
    font-size: 11px; font-weight: 600; letter-spacing: 0.04em; color: rgba(255,255,255,0.7);
  }
  .kv-form-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    padding: clamp(20px, 3vw, 32px); width: 100%; max-width: 420px; text-align: left;
  }
  .kv-blob {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(90px); opacity: 0.11; z-index: 1;
  }
  @keyframes kv-rise {
    0%   { transform: translateY(0) scale(1);     opacity: 1; }
    100% { transform: translateY(-160px) scale(0); opacity: 0; }
  }
  @keyframes kv-ring-draw  { from { stroke-dashoffset: 251; } to { stroke-dashoffset: 0; } }
  @keyframes kv-check-draw { from { stroke-dashoffset: 60;  } to { stroke-dashoffset: 0; } }
  .kv-ring-path {
    stroke-dasharray: 251; stroke-dashoffset: 251;
    animation: kv-ring-draw 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  .kv-check-path {
    stroke-dasharray: 60; stroke-dashoffset: 60;
    animation: kv-check-draw 0.5s 0.75s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes kv-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.85); } }
  @keyframes kv-spin  { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .kv-m-mockup-inner {
      transform: rotateY(15deg) rotateZ(-2deg);
      animation: kv-m-float 3s ease-in-out 1.3s infinite;
    }
    @keyframes kv-m-float {
      0%, 100% { transform: rotateY(15deg) rotateZ(-2deg) translateY(0);    }
      50%       { transform: rotateY(15deg) rotateZ(-2deg) translateY(-9px); }
    }
  }
  @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    .kv-m-mockup-inner { animation: none; transform: rotateY(15deg) rotateZ(-2deg); }
  }

  /* Desktop initial states — no !important so GSAP can override with inline styles */
  @media (min-width: 769px) {
    .kv-cta-layer { opacity: 0; visibility: hidden; }
    .main-card    { opacity: 0; }
    .text-track   { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .kv-ring-path, .kv-check-path { animation: none !important; stroke-dashoffset: 0 !important; }
    .kv-btn { transition: none !important; }
  }
`;

/* ─── types ────────────────────────────────────────────────────────── */

type Fields    = { name: string; email: string; company: string; industry: string };
type QuickToFn = (value: number) => void;

/* ─── component ───────────────────────────────────────────────────── */

export default function BetaPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef  = useRef<HTMLDivElement>(null);
  const mockupRef    = useRef<HTMLDivElement>(null);
  const particleRef  = useRef<HTMLDivElement>(null);
  const rafRef             = useRef<number>(0);
  const rotateXTo          = useRef<QuickToFn | null>(null);
  const rotateYTo          = useRef<QuickToFn | null>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const [pageReady, setPageReady] = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [fields,   setFields]   = useState<Fields>({ name: "", email: "", company: "", industry: "" });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [position, setPosition] = useState(0);
  const [error,    setError]    = useState("");

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const t = setTimeout(() => setPageReady(true), 320);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const prev = document.body.style.background;
    document.body.style.background = "#050914";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.background = prev;
      document.documentElement.style.overflowX = "";
    };
  }, [isMobile]);

  useEffect(() => {
    if (!pageReady || isMobile) return;

    rotateYTo.current = gsap.quickTo(mockupRef.current, "rotationY", { duration: 0.45, ease: "power2.out" });
    rotateXTo.current = gsap.quickTo(mockupRef.current, "rotationX", { duration: 0.45, ease: "power2.out" });

    const resetTilt = () => { rotateXTo.current?.(0); rotateYTo.current?.(0); };

    const onMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        const inside = e.clientX >= rect.left && e.clientX <= rect.right
                    && e.clientY >= rect.top  && e.clientY <= rect.bottom;
        if (!inside) { resetTilt(); return; }
        mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        rotateYTo.current?.(nx * 8);
        rotateXTo.current?.(-ny * 8);
      });
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", resetTilt);
    window.addEventListener("blur", resetTilt);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", resetTilt);
      window.removeEventListener("blur", resetTilt);
      cancelAnimationFrame(rafRef.current);
      rotateXTo.current = rotateYTo.current = null;
    };
  }, [pageReady, isMobile]);

  useEffect(() => {
    if (!pageReady || !isMobile) return;
    const ctx = gsap.context(() => {
      gsap.set(".kv-m-entrance", { autoAlpha: 0, y: 35 });
      gsap.to(".kv-m-entrance", {
        autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.85, ease: "expo.out", delay: 0.2,
      });
    }, mobileContainerRef);
    return () => ctx.revert();
  }, [pageReady, isMobile]);

  // Cinematic scroll-pinned timeline
  useEffect(() => {
    if (!pageReady || isMobile) return;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days",  { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card",  { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".kv-cta-layer", { autoAlpha: 0, scale: 0.88, filter: "blur(30px)" });

      // Hero entrance (starts after loading overlay has cleared)
      gsap.timeline({ delay: 0.2 })
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days",  { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      // Scroll-pinned timeline — 5 200 px drives all acts
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=5200",
          pin: true, scrub: 0.7, anticipatePin: 1,
        },
      })
        .to([".kv-hero-layer", ".bg-grid-theme"], { scale: 1.08, filter: "blur(8px)", opacity: 0.2, ease: "power2.inOut", duration: 1.6 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.2 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.8 }, "-=0.6")
        .fromTo(".phone-widget",
          { y: 40, autoAlpha: 0, scale: 0.95 },
          { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, ease: "back.out(1.2)", duration: 1.2 }, "-=1.2")
        .to(".progress-ring", { strokeDashoffset: 40, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val",   { innerHTML: 247, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge",
          { y: 80, autoAlpha: 0, scale: 0.7, rotationZ: -10 },
          { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.1, stagger: 0.15 }, "-=1.6")
        .fromTo(".card-left-text",  { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out",  duration: 1.1 }, "-=1.1")
        .fromTo(".card-right-text", { x: 50,  autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.1 }, "<")
        .to({}, { duration: 1.1 })
        .set(".kv-hero-layer",  { autoAlpha: 0 })
        .set(".kv-cta-layer",   { autoAlpha: 1 })
        .to({}, { duration: 0.7 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"],
          { scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05 })
        .to(".main-card",     { width: "85vw", height: "85vh", borderRadius: "40px", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".kv-cta-layer",  { scale: 1, filter: "none", ease: "expo.inOut", duration: 1.6 }, "pullback")
        .to(".main-card",     { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, [pageReady, isMobile]);

  /* ── form handlers ──────────────────────────────────────────────── */

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError("");
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.company || !fields.industry) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong — please try again.");
        return;
      }
      setPosition(data.position);
      setSuccess(true);
      if (particleRef.current) spawnParticles(particleRef.current);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }, [fields]);

  /* ── shared: form JSX ───────────────────────────────────────────── */

  const formSection = (
    <>
      <h2 style={{
        fontSize: "clamp(28px, 4.5vw, 64px)", fontWeight: 800,
        letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: success ? 8 : 10,
        background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.38) 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        filter: "drop-shadow(0px 8px 16px rgba(255,255,255,0.1))",
      }}>
        {success ? `You're in${fields.name ? `, ${fields.name.split(" ")[0]}` : ""}.` : "Join the KOVA beta."}
      </h2>

      {!success && (
        <p style={{ fontSize: "clamp(13px, 1.2vw, 16px)", color: "rgba(148,163,184,0.72)", marginBottom: 24, maxWidth: 380, lineHeight: 1.65 }}>
          Limited early-access spots.
        </p>
      )}

      {!success ? (
        <div className="kv-form-card">
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {([
                { id: "kv-name",    name: "name",    type: "text",  label: "Full Name",  placeholder: "Carlos Guzmán",   auto: "name" },
                { id: "kv-email",   name: "email",   type: "email", label: "Work Email", placeholder: "you@company.com", auto: "email" },
                { id: "kv-company", name: "company", type: "text",  label: "Company",    placeholder: "Acme Corp",       auto: "organization" },
              ] as const).map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)", marginBottom: 6, letterSpacing: "0.04em" }}>
                    {f.label} <span style={{ color: "#F87171" }}>*</span>
                  </label>
                  <input
                    id={f.id} name={f.name} type={f.type} className="kv-input"
                    placeholder={f.placeholder}
                    value={fields[f.name as keyof Fields]}
                    onChange={handleChange} autoComplete={f.auto} required aria-required="true"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="kv-industry" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.8)", marginBottom: 6, letterSpacing: "0.04em" }}>
                  Industry <span style={{ color: "#F87171" }}>*</span>
                </label>
                <select id="kv-industry" name="industry" className="kv-input" value={fields.industry} onChange={handleChange} required style={{ cursor: "pointer" }}>
                  <option value="" disabled>Select your industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              {error && <div className="kv-error" role="alert" aria-live="polite">{error}</div>}

              <button type="submit" className="kv-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: "kv-spin 0.7s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Joining…
                  </span>
                ) : "Get Early Access →"}
              </button>
            </div>
          </form>
          <p style={{ fontSize: 11, color: "rgba(100,116,139,0.6)", textAlign: "center", marginTop: 14 }}>
            We respect your privacy. No spam, ever.
          </p>
        </div>
      ) : (
        /* success card */
        <div style={{
          position: "relative", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(52,211,153,0.22)", borderRadius: 20,
          padding: "clamp(20px,3vw,36px)", width: "100%", maxWidth: 420,
          textAlign: "center", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", overflow: "hidden",
        }}>
          <div ref={particleRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden />
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
              <circle cx="36" cy="36" r="34" stroke="rgba(52,211,153,0.15)" strokeWidth="2" fill="rgba(52,211,153,0.05)" />
              <circle className="kv-ring-path" cx="36" cy="36" r="30" stroke="#34D399" strokeWidth="2.5" fill="none" />
              <polyline className="kv-check-path" points="22,36 32,46 50,26" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: "rgba(148,163,184,0.8)", lineHeight: 1.6, marginBottom: 20 }}>
            Welcome to the KOVA beta. We&apos;ll reach you at{" "}
            <span style={{ color: "#60A5FA" }}>{fields.email}</span> before launch.
          </p>
          <div style={{ display: "inline-block", background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 12, padding: "10px 24px", marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "rgba(148,163,184,0.55)", textTransform: "uppercase", margin: "0 0 2px" }}>Your position</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#60A5FA", letterSpacing: "-0.03em", margin: 0 }}>#{position}</p>
          </div>
        </div>
      )}
    </>
  );

  /* ── loading overlay — covers everything on first paint / reload ── */

  const loadingOverlay = (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#050914",
        display: "flex", alignItems: "center", justifyContent: "center",
        // Fade out once pageReady — content underneath is already in position
        opacity: pageReady ? 0 : 1,
        visibility: pageReady ? "hidden" : "visible",
        transition: "opacity 0.45s ease, visibility 0.45s ease",
        pointerEvents: "none",
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", color: "rgba(241,245,249,0.45)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        KOVA
      </span>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════
     MOBILE LAYOUT — two full-screen sections, normal scroll, no GSAP
  ══════════════════════════════════════════════════════════════════ */

  if (isMobile) {
    return (
      <div ref={mobileContainerRef} style={{ background: "#050914", overflowX: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        {loadingOverlay}

        {/* Section 1 — hero */}
        <section style={{
          minHeight: "100svh", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "56px 24px 44px",
        }}>
          <div className="kv-blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #3B9EFF, transparent 70%)", top: "-20%", left: "-15%" }} aria-hidden />
          <div className="kv-blob" style={{ width: 300, height: 300, background: "radial-gradient(circle, #A78BFA, transparent 70%)", bottom: "-10%", right: "-10%" }} aria-hidden />
          <div className="film-grain" aria-hidden />

          <div className="kv-m-entrance kv-badge" style={{ marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399", display: "inline-block", animation: "kv-pulse 2s ease-in-out infinite" }} />
            Early Access · June 2026
          </div>

          <h1 className="kv-m-entrance" style={{ fontSize: "clamp(30px, 8vw, 46px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 2 }}>
            The AI team your
          </h1>
          <h1 className="kv-m-entrance" style={{
            fontSize: "clamp(30px, 8vw, 46px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 22,
            background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.38) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            business deserves.
          </h1>

          {/* dashboard mockup — tilted + floating */}
          <div className="kv-m-entrance" style={{ position: "relative", perspective: "700px", marginBottom: 22 }}>
            <div
              className="kv-m-mockup-inner"
              style={{
                width: "clamp(118px, 34vw, 152px)",
                aspectRatio: "9 / 16",
                margin: "0 auto",
                borderRadius: 18,
                background: "#050914",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04), inset 0 0 20px rgba(0,0,0,0.9)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 45%)", pointerEvents: "none", zIndex: 10 }} aria-hidden />
              <div style={{ position: "relative", width: "100%", height: "100%", padding: "10px 8px 12px", display: "flex", flexDirection: "column", color: "white", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 5, color: "rgba(148,163,184,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 1 }}>Dashboard</div>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "-0.03em" }}>KOVA</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: "#60A5FA" }}>CG</div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                  <div style={{ position: "relative", width: 64, height: 64 }}>
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" aria-hidden>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="9" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="9"
                        style={{ transform: "rotate(-90deg)", transformOrigin: "50px 50px", strokeDasharray: 251, strokeDashoffset: 40, strokeLinecap: "round" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "-0.04em" }}>247</span>
                      <span style={{ fontSize: 4, color: "rgba(96,165,250,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 1 }}>Leads</span>
                    </div>
                  </div>
                </div>
                {DASHBOARD_AGENTS.map(agent => (
                  <div key={agent.name} className="widget-depth" style={{ borderRadius: 7, padding: "4px 6px", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)`, border: `1px solid ${agent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, fontWeight: 800, color: agent.color }}>
                      {agent.name[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2 }}>{agent.name}</div>
                      <div style={{ fontSize: 5, color: "rgba(148,163,184,0.45)" }}>{agent.role}</div>
                    </div>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 4px #34D399", flexShrink: 0 }} />
                  </div>
                ))}
                <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: 4 }}>
                  <div style={{ width: 48, height: 2, background: "rgba(255,255,255,0.18)", borderRadius: 2 }} />
                </div>
              </div>
            </div>
          </div>

          <p className="kv-m-entrance" style={{ fontSize: 13, color: "rgba(148,163,184,0.6)", marginBottom: 28, lineHeight: 1.6, maxWidth: 280 }}>
            8 AI agents running your CRM — leads scored, content written, outreach sent.
          </p>

          <p className="kv-m-entrance" style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
            Scroll to join
          </p>
        </section>

        {/* Section 2 — form */}
        <section style={{
          minHeight: "100svh", position: "relative",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "48px 24px 56px", textAlign: "center",
        }}>
          <div className="kv-blob" style={{ width: 350, height: 350, background: "radial-gradient(circle, #1D4ED8, transparent 70%)", top: "10%", right: "-20%" }} aria-hidden />
          {formSection}
        </section>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     DESKTOP LAYOUT — cinematic GSAP scroll timeline
  ══════════════════════════════════════════════════════════════════ */

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100vw", height: "100vh",
        overflow: "hidden", background: "#050914",
        fontFamily: "system-ui, -apple-system, sans-serif", perspective: "1500px",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {loadingOverlay}

      {/* ambient environment */}
      <div className="film-grain" aria-hidden />
      <div className="bg-grid-theme" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.5 }} aria-hidden />
      <div className="kv-blob" style={{ width: 520, height: 520, background: "radial-gradient(circle, #3B9EFF, transparent 70%)", top: "-14%", left: "-10%" }} aria-hidden />
      <div className="kv-blob" style={{ width: 400, height: 400, background: "radial-gradient(circle, #A78BFA, transparent 70%)", bottom: "0", right: "-6%" }} aria-hidden />

      {/* Layer 1 — hero tagline */}
      <div
        className="kv-hero-layer"
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 16px", willChange: "transform",
        }}
      >
        <div className="kv-badge" style={{ marginBottom: 24 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399", display: "inline-block", animation: "kv-pulse 2s ease-in-out infinite" }} />
          Early Access · June 2026
        </div>

        <h1
          className="text-track"
          style={{ fontSize: "clamp(38px, 6.5vw, 92px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", lineHeight: 1.06, marginBottom: 6, textShadow: "0 10px 30px rgba(241,245,249,0.2)" }}
        >
          The AI team your
        </h1>
        <h1
          className="text-days"
          style={{
            fontSize: "clamp(38px, 6.5vw, 92px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06,
            background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.38) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0px 10px 20px rgba(255,255,255,0.15))",
          }}
        >
          business deserves.
        </h1>

        <p style={{ marginTop: 20, fontSize: "clamp(13px, 1.3vw, 17px)", color: "rgba(148,163,184,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
          Scroll to see what&apos;s inside
        </p>
      </div>

      {/* Layer 2 — signup form (hidden until scroll reveals it) */}
      <div
        className="kv-cta-layer"
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", pointerEvents: "auto",
          willChange: "transform", textAlign: "center",
        }}
      >
        {formSection}
      </div>

      {/* Layer 3 — cinematic card (driven entirely by GSAP) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card"
          style={{ width: "92vw", height: "92vh", borderRadius: 32, overflow: "hidden", pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
        >
          <div className="card-sheen" aria-hidden />

          <div className="kv-inner-grid">
            {/* LEFT */}
            <div className="card-left-text" style={{ minWidth: 0 }}>
              <div className="kv-badge" style={{ marginBottom: 18 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399", display: "inline-block", animation: "kv-pulse 2s ease-in-out infinite" }} />
                8 agents · always on
              </div>
              <h3 style={{ color: "white", fontSize: "clamp(18px, 2.2vw, 36px)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: 12 }}>
                Automate everything.
              </h3>
              <p style={{ color: "rgba(96,165,250,0.72)", fontSize: "clamp(12px, 1.1vw, 16px)", lineHeight: 1.65 }}>
                KOVA connects 8 AI specialists to your CRM — Maven scores
                leads, Iris writes content, Dash runs outreach, all without
                you lifting a finger.
              </p>
            </div>

            {/* CENTER — dashboard mockup */}
            <div className="mockup-scroll-wrapper" style={{ position: "relative", perspective: "1000px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div ref={mockupRef} className="kv-mockup-frame" style={{ willChange: "transform", transformStyle: "preserve-3d" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 45%)", pointerEvents: "none", zIndex: 10 }} aria-hidden />
                <div style={{ position: "relative", width: "100%", height: "100%", padding: "14px 12px 18px", display: "flex", flexDirection: "column", color: "white", overflow: "hidden" }}>
                  <div className="phone-widget" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 8, color: "rgba(148,163,184,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 1 }}>Dashboard</div>
                      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.03em" }}>KOVA</div>
                    </div>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#60A5FA" }}>CG</div>
                  </div>
                  <div className="phone-widget" style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <div style={{ position: "relative", width: 100, height: 100 }}>
                      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" aria-hidden>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="9" />
                        <circle className="progress-ring" cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="9" style={{ transformOrigin: "50px 50px" }} />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span className="counter-val" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em" }}>0</span>
                        <span style={{ fontSize: 6, color: "rgba(96,165,250,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 1 }}>Leads Scored</span>
                      </div>
                    </div>
                  </div>
                  {DASHBOARD_AGENTS.map(agent => (
                    <div key={agent.name} className="phone-widget widget-depth" style={{ borderRadius: 9, padding: "7px 9px", marginBottom: 5, display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${agent.color}30, ${agent.color}10)`, border: `1px solid ${agent.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: agent.color }}>
                        {agent.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2 }}>{agent.name}</div>
                        <div style={{ fontSize: 7, color: "rgba(148,163,184,0.45)" }}>{agent.role}</div>
                      </div>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 5px #34D399", flexShrink: 0 }} />
                    </div>
                  ))}
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: 6 }}>
                    <div style={{ width: 70, height: 3, background: "rgba(255,255,255,0.18)", borderRadius: 3 }} />
                  </div>
                </div>
              </div>

              {/* floating badge left */}
              <div className="floating-badge floating-ui-badge" style={{ position: "absolute", top: "8%", left: "-72px", display: "flex", alignItems: "center", gap: 10, borderRadius: 14, padding: "10px 14px", zIndex: 30 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div>
                  <p style={{ color: "white", fontSize: 11, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>8 AI Agents</p>
                  <p style={{ color: "rgba(96,165,250,0.6)", fontSize: 9, margin: 0 }}>Always active</p>
                </div>
              </div>

              {/* floating badge right */}
              <div className="floating-badge floating-ui-badge" style={{ position: "absolute", bottom: "12%", right: "-72px", display: "flex", alignItems: "center", gap: 10, borderRadius: 14, padding: "10px 14px", zIndex: 30 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, rgba(52,211,153,0.25), rgba(52,211,153,0.05))", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                </div>
                <div>
                  <p style={{ color: "white", fontSize: 11, fontWeight: 700, lineHeight: 1.2, margin: 0 }}>Pipeline · Live</p>
                  <p style={{ color: "rgba(52,211,153,0.65)", fontSize: 9, margin: 0 }}>9 stages active</p>
                </div>
              </div>
            </div>

            {/* RIGHT — KOVA wordmark */}
            <div className="card-right-text" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
              <h2 className="text-card-silver-matte" style={{ fontSize: "clamp(52px, 7.5vw, 118px)", fontWeight: 900, letterSpacing: "-0.04em", textTransform: "uppercase", lineHeight: 1 }}>
                KOVA
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

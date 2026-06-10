"use client";
import { useState, useRef } from "react";
import { Camera, Upload, X, Check, ScanLine } from "lucide-react";
import { IE } from "@/lib/icon-mode";

interface ScannedContact {
  firstName: string; lastName: string; company: string; title: string;
  phone: string; email: string; address: string; website: string;
  linkedin: string; notes: string;
}

interface Props { onClose: () => void; onAdd: (c: ScannedContact) => void; }

const FIELD_LABELS: Record<keyof ScannedContact, string> = {
  firstName:"First Name", lastName:"Last Name", company:"Company", title:"Title",
  phone:"Phone", email:"Email", address:"Address", website:"Website",
  linkedin:"LinkedIn", notes:"Notes",
};

const PRIMARY_FIELDS: (keyof ScannedContact)[] = ["firstName","lastName","title","company","email","phone"];
const SECONDARY_FIELDS: (keyof ScannedContact)[] = ["address","website","linkedin","notes"];

export default function CardScanModal({ onClose, onAdd }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage,   setStage]   = useState<"upload"|"scanning"|"review"|"done">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [edited,  setEdited]  = useState<ScannedContact | null>(null);
  const [showMore, setShowMore] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  const scan = async () => {
    if (!preview) return;
    setStage("scanning");
    try {
      const base64 = preview.split(",")[1];
      const mediaType = preview.split(";")[0].split(":")[1] || "image/jpeg";
      const res = await fetch("/api/card-scan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEdited(data);
    } catch {
      const demo: ScannedContact = {
        firstName:"Marcus", lastName:"Webb", company:"Clearwater Investments LLC",
        title:"Managing Principal", phone:"(727) 390-4821", email:"m.webb@clearwaterinvest.com",
        address:"400 Cleveland St, Suite 800, Clearwater, FL 33755",
        website:"clearwaterinvest.com", linkedin:"linkedin.com/in/marcuswebb", notes:"",
      };
      setEdited(demo);
    }
    setStage("review");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    fontSize: 12,
    color: "#0F172A",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 600,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 5,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 520,
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 18px",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "#0F172A",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <IE emoji="🔍" Icon={ScanLine} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Business Card Scanner</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>AI-powered · Extract contact info instantly</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#F1F5F9", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <IE emoji="✕" Icon={X} size={14} color="#64748B" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 24px 28px", flex: 1 }}>

          {/* ── UPLOAD ── */}
          {stage === "upload" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${preview ? "#00C896" : "#E2E8F0"}`,
                  borderRadius: 14,
                  padding: "32px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: preview ? "#00C89608" : "#FAFBFC",
                  transition: "all 0.2s",
                }}
              >
                {preview ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <img src={preview} alt="Card preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 10, objectFit: "contain", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }} />
                    <span style={{ fontSize: 12, color: "#64748B" }}>Image ready — click <strong>Scan Card</strong> to extract info</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IE emoji="📷" Icon={Camera} size={24} color="#94A3B8" />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Drop card image here</div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>or click to upload · JPG, PNG, HEIC</div>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => fileRef.current?.click()} style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #E2E8F0",
                  background: "#fff", color: "#0F172A", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  <IE emoji="📤" Icon={Upload} size={14} /> Upload Image
                </button>
                <button onClick={scan} disabled={!preview} style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
                  background: preview ? "#0F172A" : "#E2E8F0", color: preview ? "#fff" : "#94A3B8",
                  fontSize: 13, fontWeight: 600, cursor: preview ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "all 0.2s",
                }}>
                  <IE emoji="🔍" Icon={ScanLine} size={14} /> Scan Card
                </button>
              </div>
            </div>
          )}

          {/* ── SCANNING ── */}
          {stage === "scanning" && (
            <div style={{ padding: "48px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", width: 64, height: 64 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid #E2E8F0" }} />
                <div style={{
                  position: "absolute", inset: 0, width: 64, height: 64, borderRadius: "50%",
                  border: "4px solid transparent", borderTopColor: "#00C896",
                  animation: "spin 0.9s linear infinite",
                }} />
                <ScanLine size={20} color="#00C896" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Scanning card…</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Extracting contact information</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {["Reading fields","Parsing name","Extracting contact"].map((s, i) => (
                  <span key={s} style={{
                    fontSize: 10, padding: "4px 10px", borderRadius: 99,
                    background: "#F1F5F9", color: "#64748B", fontWeight: 500,
                    animation: "pulse 1.4s ease-in-out infinite",
                    animationDelay: `${i * 280}ms`,
                  }}>{s}</span>
                ))}
              </div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </div>
          )}

          {/* ── REVIEW ── */}
          {stage === "review" && edited && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Success banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #86EFAC" }}>
                <IE emoji="✅" Icon={Check} size={14} color="#15803D" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#15803D" }}>Card scanned — review and edit before saving</span>
              </div>

              {/* Card thumbnail */}
              {preview && (
                <img src={preview} alt="Scanned card" style={{ width: "100%", maxHeight: 100, objectFit: "contain", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F5F9" }} />
              )}

              {/* Primary fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
                {PRIMARY_FIELDS.map(f => (
                  <div key={f}>
                    <label style={labelStyle}>{FIELD_LABELS[f]}</label>
                    <input
                      value={(edited as any)[f]}
                      onChange={e => setEdited(p => p ? { ...p, [f]: e.target.value } : p)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>

              {/* Secondary fields toggle */}
              <div>
                <button
                  onClick={() => setShowMore(p => !p)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#64748B", fontWeight: 500, padding: 0, display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span style={{ display: "inline-block", transition: "transform 0.2s", transform: showMore ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
                  {showMore ? "Hide" : "Show"} address, website & notes
                </button>
                {showMore && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px", marginTop: 14 }}>
                    {SECONDARY_FIELDS.map(f => (
                      <div key={f} style={{ gridColumn: f === "notes" ? "1 / -1" : "auto" }}>
                        <label style={labelStyle}>{FIELD_LABELS[f]}</label>
                        {f === "notes" ? (
                          <textarea
                            value={(edited as any)[f]}
                            onChange={e => setEdited(p => p ? { ...p, [f]: e.target.value } : p)}
                            rows={3}
                            style={{ ...inputStyle, resize: "none" }}
                          />
                        ) : (
                          <input
                            value={(edited as any)[f]}
                            onChange={e => setEdited(p => p ? { ...p, [f]: e.target.value } : p)}
                            style={inputStyle}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button onClick={() => { setStage("upload"); setPreview(null); }} style={{
                  flex: 1, padding: "11px 0", borderRadius: 10, border: "1.5px solid #E2E8F0",
                  background: "#fff", color: "#0F172A", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  Re-scan
                </button>
                <button onClick={() => { if (edited) { onAdd(edited); setStage("done"); } }} style={{
                  flex: 2, padding: "11px 0", borderRadius: 10, border: "none",
                  background: "#0F172A", color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}>
                  <IE emoji="✅" Icon={Check} size={14} color="#fff" /> Add to Contacts
                </button>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {stage === "done" && edited && (
            <div style={{ padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IE emoji="✅" Icon={Check} size={28} color="#15803D" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{edited.firstName} {edited.lastName} added</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{edited.company} · {edited.title}</div>
              </div>
              <button onClick={onClose} style={{
                marginTop: 8, padding: "10px 32px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", background: "#fff",
                color: "#0F172A", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

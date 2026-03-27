import { useState, useRef, useEffect, useCallback } from "react";
import jsQR from "jsqr";
import { fetchSet, fetchThemeName } from "../services/rebrickable";
import { addSet } from "../services/setService";
import { StatusBadge } from "../components/StatusBadge";

const STATUS_OPTIONS = [
  { id: "built",    label: "Gebaut",      icon: "✓" },
  { id: "boxed",    label: "OVP",         icon: "📦" },
  { id: "wishlist", label: "Wunschliste", icon: "♥" },
];

function extractSetNumberFromLegoUrl(raw) {
  // https://LEGO.COM/GO/38/0075316/6382344/...
  const goMatch = raw.match(/\/GO\/38\/(\d+)/i);
  if (goMatch) return parseInt(goMatch[1], 10).toString();
  // https://www.lego.com/.../product/.../60478
  const productMatch = raw.match(/\/product\/[^/?#]*\/(\d{4,6})/i);
  if (productMatch) return productMatch[1];
  return null;
}

function QrScannerModal({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        const scan = () => {
          if (cancelled) return;
          if (video.readyState >= video.HAVE_ENOUGH_DATA) {
            setReady(true);
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (code) {
              const raw = code.data;
              const setNum = extractSetNumberFromLegoUrl(raw);
              stopStream();
              onDetect(setNum, raw);
              return;
            }
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      })
      .catch((err) => {
        if (!cancelled) setError("Kamera-Zugriff verweigert.\nBitte in den Einstellungen erlauben.");
        console.error(err);
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [onDetect, stopStream]);

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "#000",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "env(safe-area-inset-top, 20px) 20px 16px",
        paddingTop: "max(env(safe-area-inset-top, 20px), 20px)",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
        zIndex: 10,
      }}>
        <div style={{ color: "#FFF", fontWeight: 700, fontSize: 17 }}>QR-Code scannen</div>
        <button onClick={handleClose} style={{
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="15" y2="15"/>
            <line x1="15" y1="1" x2="1" y2="15"/>
          </svg>
        </button>
      </div>

      {/* Camera */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Viewfinder overlay */}
        {!error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Dark corners */}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
            {/* Cutout */}
            <div style={{
              position: "relative", zIndex: 1,
              width: 240, height: 240,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
              borderRadius: 20,
            }}>
              {/* Corner brackets */}
              {[
                { top: 0, left: 0,   borderTop: "3px solid #FFF",   borderLeft:  "3px solid #FFF",  borderRadius: "12px 0 0 0" },
                { top: 0, right: 0,  borderTop: "3px solid #FFF",   borderRight: "3px solid #FFF",  borderRadius: "0 12px 0 0" },
                { bottom: 0, left: 0,  borderBottom: "3px solid #FFF", borderLeft:  "3px solid #FFF",  borderRadius: "0 0 0 12px" },
                { bottom: 0, right: 0, borderBottom: "3px solid #FFF", borderRight: "3px solid #FFF",  borderRadius: "0 0 12px 0" },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 28, height: 28, ...s }} />
              ))}
              {/* Scan line */}
              {ready && (
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg, transparent, #1D6AE5, transparent)",
                  animation: "scanline 1.8s ease-in-out infinite",
                }} />
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 32, textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <div style={{ color: "#FFF", fontWeight: 600, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-line" }}>{error}</div>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{
        padding: "16px 20px",
        paddingBottom: "max(env(safe-area-inset-bottom, 20px), 20px)",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
        textAlign: "center",
      }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
          Halte die Kamera auf den QR-Code in der LEGO® Anleitung
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}

export function AddScreen({ onSuccess }) {
  const [input, setInput]         = useState("");
  const [preview, setPreview]     = useState(null);
  const [status, setStatus]       = useState("built");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const [done, setDone]           = useState(false);
  const [scanning, setScanning]   = useState(false);

  const triggerSearch = async (setNumber) => {
    if (!setNumber?.trim()) return;
    setInput(setNumber);
    setSearching(true);
    setError(null);
    setPreview(null);
    setDone(false);
    try {
      const data = await fetchSet(setNumber.trim());
      const themeName = await fetchThemeName(data.theme_id).catch(() => null);
      setPreview({ ...data, themeName });
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    triggerSearch(input);
  };

  const handleQrDetect = (setNum, rawUrl) => {
    setScanning(false);
    if (setNum) {
      triggerSearch(setNum);
    } else {
      setError(`QR-Code erkannt, aber keine Set-Nummer gefunden.\nURL: ${rawUrl}`);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setSaving(true);
    setError(null);
    try {
      await addSet({
        setNumber: preview.set_num,
        name: preview.name,
        image: preview.set_img_url,
        parts: preview.num_parts,
        theme: preview.theme_id,
        themeName: preview.themeName ?? null,
        status,
      });
      setDone(true);
      setInput("");
      setPreview(null);
      setStatus("built");
      onSuccess?.();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <>
      {scanning && (
        <QrScannerModal
          onDetect={handleQrDetect}
          onClose={() => setScanning(false)}
        />
      )}

      <div style={{ padding: "0 20px" }}>
        <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 18 }}>
          Set hinzufügen
        </div>

        {done && (
          <div style={{ background: "#D1FAE5", color: "#059669", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
            ✓ Set wurde zur Sammlung hinzugefügt!
          </div>
        )}

        <div style={{ background: "#FFF", borderRadius: 20, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <form onSubmit={handleSearch}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Set-Nummer eingeben (z.B. 42115)"
              inputMode="numeric"
              style={{
                width: "100%", padding: "14px 16px",
                borderRadius: 14, border: "1.5px solid #E5E5EA",
                fontSize: 15, color: "#1C1C1E", outline: "none",
                background: "#FAFAFA", boxSizing: "border-box",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#1D6AE5"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#E5E5EA"; }}
            />

            {/* QR Button */}
            <button
              type="button"
              onClick={() => setScanning(true)}
              style={{
                width: "100%", marginTop: 12, padding: 14,
                borderRadius: 14,
                background: "#F1F0EB", border: "none",
                fontWeight: 600, fontSize: 15, color: "#1C1C1E",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                WebkitTapHighlightColor: "transparent",
                transition: "background 0.15s",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
                <line x1="14" y1="14" x2="14" y2="14"/>
                <rect x="14" y="14" width="3" height="3" rx="0.5"/>
                <rect x="18" y="14" width="3" height="3" rx="0.5"/>
                <rect x="14" y="18" width="3" height="3" rx="0.5"/>
                <rect x="18" y="18" width="3" height="3" rx="0.5"/>
              </svg>
              QR-Code aus Anleitung scannen
            </button>

            <button type="submit" disabled={searching} style={{
              width: "100%", marginTop: 10, padding: 15,
              borderRadius: 14,
              background: searching ? "#93B4F0" : "linear-gradient(135deg, #1D6AE5, #1855C0)",
              border: "none", color: "#FFF",
              fontWeight: 700, fontSize: 15, cursor: searching ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(29,106,229,0.35)",
            }}>
              {searching ? "Suche läuft…" : "Suchen"}
            </button>
          </form>

          {error && (
            <p style={{ color: "#E11D48", fontSize: 13, marginTop: 12, fontWeight: 500, whiteSpace: "pre-line" }}>{error}</p>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ background: "#FFF", borderRadius: 20, padding: 20, marginTop: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            {preview.set_img_url && (
              <img
                src={preview.set_img_url}
                alt={preview.name}
                style={{ width: "100%", height: 200, objectFit: "contain", borderRadius: 14, background: "#F4F3EE", padding: 8, marginBottom: 14 }}
              />
            )}
            <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 500, marginBottom: 4 }}>
              #{preview.set_num}
            </div>
            <div style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif", fontWeight: 800, fontSize: 20, color: "#1C1C1E", marginBottom: 4 }}>
              {preview.name}
            </div>
            <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 18 }}>
              {preview.num_parts?.toLocaleString("de-DE")} Teile
              {preview.themeName && <span style={{ marginLeft: 8, color: "#AEAEB2" }}>· {preview.themeName}</span>}
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Status wählen:</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStatus(opt.id)}
                  style={{
                    flex: 1,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "10px 4px",
                    border: status === opt.id ? "2px solid #1D6AE5" : "2px solid #E5E5EA",
                    borderRadius: 14,
                    background: status === opt.id ? "#EEF4FF" : "#FAFAFA",
                    cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    color: status === opt.id ? "#1D6AE5" : "#636366",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <StatusBadge status={status} />
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  padding: "13px 24px", borderRadius: 14,
                  background: saving ? "#93B4F0" : "linear-gradient(135deg, #1D6AE5, #1855C0)",
                  border: "none", color: "#FFF",
                  fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(29,106,229,0.3)",
                }}
              >
                {saving ? "Speichern…" : "Hinzufügen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

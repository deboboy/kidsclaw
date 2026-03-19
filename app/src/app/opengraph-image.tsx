import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KidsClaw - Educational Games for Kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#e60012",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "white",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: 800,
              color: "#e60012",
            }}
          >
            KC
          </div>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            KidsClaw
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "white",
            opacity: 0.95,
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
          }}
        >
          Educational games kids actually love
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontSize: "20px",
            color: "white",
            opacity: 0.75,
            marginTop: "16px",
            textAlign: "center",
          }}
        >
          AI-powered science, math & space exploration for ages 9-11
        </div>

        {/* Game icons row */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
            fontSize: "40px",
          }}
        >
          <span>🚀</span>
          <span>🔬</span>
          <span>🛸</span>
          <span>🌌</span>
          <span>🔭</span>
          <span>📏</span>
          <span>✨</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

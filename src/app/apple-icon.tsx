import { ImageResponse } from "next/og";

// Apple touch icon (home screen / bookmark icon on iOS), same brand mark as
// icon.tsx at the larger size Apple devices expect.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c3a3a",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2.5 4 5.5v6c0 5 3.5 8.3 8 10 4.5-1.7 8-5 8-10v-6l-8-3z"
            fill="#faf9f6"
          />
          <path
            d="m9 12.2 2.1 2.1 4.2-4.6"
            stroke="#1c3a3a"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}

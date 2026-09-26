import { ImageResponse } from "next/og";

// Next.js App Router convention: this file is automatically compiled into
// the app's favicon (/icon) at build time and wired into <head> metadata --
// no manual <link rel="icon"> needed, and no static binary asset to keep in
// sync. Replaces the default Next.js/Vercel favicon entirely.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        {/* A simple shield mark, matching the ShieldCheck icon used in the
            site header, rendered in the brand color for a clean, legible
            glyph at 16x16 and 32x32. */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

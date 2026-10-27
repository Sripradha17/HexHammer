// Small line icons, drawn by hand on a 24×24 grid. One <path> each, stroked with the current text
// color, so an icon always matches the text next to it. They are decoration: the label beside
// them carries the meaning, so every icon is aria-hidden.

// Navigation icons.
const NAV_PATHS = {
  mission: "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10z M12 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z",
  map: "M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z M12 8l3.5 2v4L12 16l-3.5-2v-4z",
  workshop: "M14 4l6 6-3 3-6-6z M11 7L3.5 14.5a2.1 2.1 0 0 0 3 3L14 10",
  interview: "M4 5h16v11H9l-5 4z M8 9h8 M8 12h5",
  reviews: "M20 12a8 8 0 1 1-2.4-5.7 M20 4v4h-4",
  portfolio: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  glossary: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h11",
  radar: "M12 12L19 5 M12 3a9 9 0 1 0 9 9 M12 7a5 5 0 1 0 5 5",
  analytics: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  levels: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5",
  settings: "M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  sun: "M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  lock: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  flame: "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 1.5 2 2 2 0-2.5 0-4.5 1-7z",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  back: "M19 12H5 M11 6l-6 6 6 6",
  play: "M7 4l13 8-13 8z",
  check: "M4 12.5l5 5L20 6.5",
  close: "M6 6l12 12 M18 6L6 18",
  spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
  volume: "M4 9h4l5-4v14l-5-4H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a7.5 7.5 0 0 1 0 11",
  mute: "M4 9h4l5-4v14l-5-4H4z M16 9l5 6 M21 9l-5 6",
  code: "M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 4l-4 16",
  terminal: "M3 4h18v16H3z M7 9l3 3-3 3 M12 15h5",
  test: "M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3",
  trophy: "M7 4h10v5a5 5 0 0 1-10 0z M7 6H4a3 3 0 0 0 3 4 M17 6h3a3 3 0 0 1-3 4 M12 14v4 M8 21h8",
  search: "M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13z M20 20l-4.6-4.6",
} as const;

// One glyph per map region (keyed by region id), so each region is recognisable at a glance.
export const REGION_GLYPHS: Record<string, string> = {
  cs: "M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4",
  web: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M3 12h18 M12 3c3.5 3 3.5 15 0 18 M12 3c-3.5 3-3.5 15 0 18",
  fe: "M3 5h18v14H3z M3 9h18 M6 7h.01 M9 7h.01",
  ds: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M16.5 13a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z",
  be: "M4 4h16v6H4z M4 14h16v6H4z M8 7h.01 M8 17h.01",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  dist: "M10 3h4v4h-4z M4 17h4v4H4z M16 17h4v4h-4z M12 7v4 M12 11l-6 6 M12 11l6 6",
  arch: "M3 21h18 M5 21V11 M9.7 21V11 M14.3 21V11 M19 21V11 M2 11l10-7 10 7z",
  test: "M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3 M7.5 15h9",
  ops: "M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6-1.2A4.5 4.5 0 0 1 17 18z",
  sec: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4",
  obs: "M3 12h4l3-7 4 14 3-7h4",
  ml: "M4 20L20 4 M6 9h.01 M9 15h.01 M14 8h.01 M17 15h.01 M11 11h.01",
  ai: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z M19 3v4 M17 5h4",
  pt: "M8 11a3 3 0 1 0 0-6a3 3 0 1 0 0 6z M2 20c0-3 2.7-5 6-5s6 2 6 5 M16 5a3 3 0 0 1 0 6 M18 15c2 .6 4 2.2 4 5",
  adv: "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6z",
};

export type IconName = keyof typeof NAV_PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return <Glyph d={NAV_PATHS[name]} size={size} className={className} />;
}

// Any path on the 24×24 grid (used for the region glyphs).
export function Glyph({ d, size = 20, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

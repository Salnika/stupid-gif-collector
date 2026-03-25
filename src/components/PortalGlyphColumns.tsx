import type { CSSProperties } from "react";

const GLYPH_SETS = [
  ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᛟ", "ᛞ", "ᛉ"],
  ["Δ", "Σ", "Ω", "Ψ", "Λ", "Θ", "Ξ", "Φ"],
  ["✦", "✧", "✶", "⌬", "⍟", "✹", "◇", "⟁"],
  ["AETH", "RUNE", "VOID", "SIG", "ARC", "HEX", "NEX", "ORB"],
  ["☉", "◈", "◇", "⟐", "⟡", "✴", "✷", "✵"],
];

type ColumnStyle = CSSProperties & {
  "--glyph-phase": string;
  "--glyph-direction": string;
  "--glyph-rate": string;
};

const COLUMN_COUNT = 18;

const pickGlyph = (set: string[], seed: number): string => set[seed % set.length];

const buildGlyphLine = (columnIndex: number, lineIndex: number): string => {
  const setA = GLYPH_SETS[(columnIndex + lineIndex) % GLYPH_SETS.length];
  const setB = GLYPH_SETS[(columnIndex * 3 + lineIndex + 1) % GLYPH_SETS.length];
  const base = lineIndex * 5 + columnIndex * 7;

  return [
    pickGlyph(setA, base),
    pickGlyph(setB, base + 2),
    pickGlyph(setA, base + 3),
    pickGlyph(setB, base + 5),
    pickGlyph(setA, base + 6),
  ].join(" ");
};

export function PortalGlyphColumns() {
  const columns = Array.from({ length: COLUMN_COUNT }, (_, index) => index);

  return (
    <div className="portal-glyphs" aria-hidden="true">
      {columns.map((index) => {
        const style: ColumnStyle = {
          left: `${-1 + (index / (COLUMN_COUNT - 1)) * 102}%`,
          "--glyph-phase": `${(index * 6.8) % 50}`,
          "--glyph-direction": index % 2 === 0 ? "-1" : "1",
          "--glyph-rate": `${0.76 + (index % 5) * 0.12}`,
        };

        return (
          <div className="portal-glyphs__column" style={style} key={index}>
            <div className="portal-glyphs__track">
              {Array.from({ length: 18 }).map((_, lineIndex) => (
                <span className="portal-glyphs__line" key={`c${index}-a-${lineIndex}`}>
                  {buildGlyphLine(index, lineIndex)}
                </span>
              ))}
              {Array.from({ length: 18 }).map((_, lineIndex) => (
                <span className="portal-glyphs__line" key={`c${index}-b-${lineIndex}`}>
                  {buildGlyphLine(index + 11, lineIndex + 19)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

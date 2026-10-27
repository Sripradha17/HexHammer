// Hexagon maths for the World Map. "Pointy-top" hexagons (a point at the top), laid out in rows,
// with every odd row pushed right by half a hexagon so they fit together like a honeycomb.
//
//   size   = distance from the centre to a corner
//   width  = √3 × size   (flat side to flat side)
//   height = 2 × size    (point to point); rows overlap by a quarter, so rows are 1.5 × size apart

const ROOT3 = Math.sqrt(3);

export function hexCenter(col: number, row: number, size: number) {
  const x = size * ROOT3 * (col + 0.5 * (row & 1)) + (size * ROOT3) / 2;
  const y = size * 1.5 * row + size;
  return { x, y };
}

// The six corners as an SVG "points" string.
export function hexPoints(cx: number, cy: number, size: number) {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90); // start at the top point
    points.push(`${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

// The pixel size of a grid of cols × rows hexagons (for the SVG viewBox).
export function gridSize(cols: number, rows: number, size: number) {
  return { width: size * ROOT3 * (cols + 0.5), height: size * (1.5 * rows + 0.5) };
}

/** A full 8-direction pixel outline (not just a single offset shadow, which only
 * darkens one edge and lets the opposite edge wash out against a busy scene) plus a
 * hard offset drop-shadow for depth, matching spec §2's "thick dark outline and a
 * hard drop shadow." Reused anywhere pixel-font text sits directly over the scene. */
export function pixelOutline(color: string, thickness = 2, dropOffset = 5): string {
  const o = thickness;
  const dirs = [
    [-o, -o],
    [o, -o],
    [-o, o],
    [o, o],
    [-o, 0],
    [o, 0],
    [0, -o],
    [0, o],
  ];
  const outline = dirs.map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(', ');
  return `${outline}, ${dropOffset}px ${dropOffset}px 0 ${color}`;
}

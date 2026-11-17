export type P2 = [number, number]

const mix = (ws: number[], ps: P2[]): P2 => [
  ws.reduce((s, w, i) => s + w * ps[i][0], 0),
  ws.reduce((s, w, i) => s + w * ps[i][1], 0),
]

/** Chaikin corner cutting: every edge gives a 1/4 point and a 3/4 point. */
export function chaikin(p: P2[]): P2[] {
  const out: P2[] = []
  for (let i = 0; i < p.length - 1; i++) {
    out.push(mix([3 / 4, 1 / 4], [p[i], p[i + 1]]))
    out.push(mix([1 / 4, 3 / 4], [p[i], p[i + 1]]))
  }
  return out
}

/** Cubic B-spline subdivision: edge points (1/2, 1/2), vertex points (1/8, 3/4, 1/8). */
export function cubic(p: P2[]): P2[] {
  const out: P2[] = []
  for (let i = 0; i < p.length - 1; i++) {
    if (i > 0)
      out.push(mix([1 / 8, 3 / 4, 1 / 8], [p[i - 1], p[i], p[i + 1]]))
    out.push(mix([1 / 2, 1 / 2], [p[i], p[i + 1]]))
  }
  return out
}

/** 4-point interpolating scheme: old points stay, new point uses (-1, 9, 9, -1) / 16. */
export function fourPoint(p: P2[]): P2[] {
  const n = p.length
  const at = (i: number) => p[Math.max(0, Math.min(n - 1, i))]
  const out: P2[] = []
  for (let i = 0; i < n - 1; i++) {
    out.push(p[i])
    out.push(mix([-1 / 16, 9 / 16, 9 / 16, -1 / 16], [at(i - 1), at(i), at(i + 1), at(i + 2)]))
  }
  out.push(p[n - 1])
  return out
}

export const curveSchemes = { chaikin, cubic, fourPoint }
export type CurveScheme = keyof typeof curveSchemes

export function subdivideCurve(p: P2[], scheme: CurveScheme, level: number): P2[] {
  let cur = p
  for (let i = 0; i < level; i++) {
    if (cur.length < 2)
      break
    cur = curveSchemes[scheme](cur)
  }
  return cur
}

export type V3 = [number, number, number]
export interface Mesh { v: V3[], f: number[][] }

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export function avg(ps: V3[]): V3 {
  let s: V3 = [0, 0, 0]
  for (const p of ps) s = add(s, p)
  return mul(s, 1 / ps.length)
}
/** weighted sum */
function comb(ws: number[], ps: V3[]): V3 {
  let s: V3 = [0, 0, 0]
  ws.forEach((w, i) => { s = add(s, mul(ps[i], w)) })
  return s
}

export const edgeKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`)

export interface EdgeInfo { a: number, b: number, faces: number[], opp: number[], index: number }

export function buildEdges(m: Mesh) {
  const map = new Map<string, EdgeInfo>()
  m.f.forEach((f, fi) => {
    const n = f.length
    for (let i = 0; i < n; i++) {
      const a = f[i]
      const b = f[(i + 1) % n]
      const k = edgeKey(a, b)
      let e = map.get(k)
      if (!e) {
        e = { a, b, faces: [], opp: [], index: map.size }
        map.set(k, e)
      }
      e.faces.push(fi)
      if (n === 3)
        e.opp.push(f[(i + 2) % n])
    }
  })
  return map
}

export function triangulate(m: Mesh): Mesh {
  const f: number[][] = []
  for (const face of m.f) {
    for (let i = 1; i < face.length - 1; i++)
      f.push([face[0], face[i], face[i + 1]])
  }
  return { v: m.v, f }
}

/** Center the mesh and scale it so the farthest vertex is at distance 1. */
export function normalize(m: Mesh): Mesh {
  const lo: V3 = [Infinity, Infinity, Infinity]
  const hi: V3 = [-Infinity, -Infinity, -Infinity]
  for (const p of m.v) {
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], p[i])
      hi[i] = Math.max(hi[i], p[i])
    }
  }
  const c = mul(add(lo, hi), 0.5)
  const r = Math.max(...m.v.map(p => len(sub(p, c)))) || 1
  return { v: m.v.map(p => mul(sub(p, c), 1 / r)), f: m.f }
}

// ---------------------------------------------------------------- shapes

const CUBE_FACES: [V3, V3[]][] = [
  [[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]],
  [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
  [[0, 1, 0], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]]],
  [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
  [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]],
  [[0, 0, -1], [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]]],
]

/** Quad mesh for the surface of a set of unit cubes. */
export function voxels(cells: V3[]): Mesh {
  const has = new Set(cells.map(c => c.join(',')))
  const idx = new Map<string, number>()
  const v: V3[] = []
  const f: number[][] = []
  for (const c of cells) {
    for (const [dir, quad] of CUBE_FACES) {
      if (has.has(add(c, dir).join(',')))
        continue
      f.push(quad.map((q) => {
        const p = add(c, q)
        const k = p.join(',')
        if (!idx.has(k)) {
          idx.set(k, v.length)
          v.push(p)
        }
        return idx.get(k)!
      }))
    }
  }
  return { v, f }
}

function orientOutward(m: Mesh): Mesh {
  return {
    v: m.v,
    f: m.f.map((f) => {
      const n = cross(sub(m.v[f[1]], m.v[f[0]]), sub(m.v[f[2]], m.v[f[0]]))
      return dot(n, avg(f.map(i => m.v[i]))) < 0 ? [...f].reverse() : f
    }),
  }
}

const PHI = (1 + Math.sqrt(5)) / 2

export const shapes: Record<string, () => Mesh> = {
  cube: () => voxels([[0, 0, 0]]),
  tshape: () => voxels([[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]]),
  ring: () => voxels([[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0], [2, 1, 0], [0, 2, 0], [1, 2, 0], [2, 2, 0]]),
  // a blocky hand: wrist, palm, three fingers and a thumb
  hand: () => voxels([
    [1, -1, 0], [2, -1, 0], [3, -1, 0],
    [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0],
    [0, 1, 0], [1, 1, 0], [2, 1, 0], [3, 1, 0], [4, 1, 0],
    [0, 2, 0], [0, 3, 0], [2, 2, 0], [2, 3, 0], [4, 2, 0], [4, 3, 0],
    [5, 0, 0], [6, 0, 0],
  ]),
  tetrahedron: () => orientOutward({
    v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]],
    f: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]],
  }),
  octahedron: () => orientOutward({
    v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]],
    f: [[0, 2, 4], [2, 1, 4], [1, 3, 4], [3, 0, 4], [2, 0, 5], [1, 2, 5], [3, 1, 5], [0, 3, 5]],
  }),
  icosahedron: () => orientOutward({
    v: [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
    ],
    f: [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ],
  }),
}

export const shapeLabels: Record<string, string> = {
  cube: 'Cube',
  tshape: 'T-shape',
  ring: 'Ring',
  hand: 'Hand',
  tetrahedron: 'Tetrahedron',
  octahedron: 'Octahedron',
  icosahedron: 'Icosahedron',
}

/** Latitude / longitude sphere, to show the problem at the poles. */
export function uvSphere(rows = 12, cols = 20): Mesh {
  const v: V3[] = [[0, 1, 0]]
  for (let r = 1; r < rows; r++) {
    const t = (Math.PI * r) / rows
    for (let c = 0; c < cols; c++) {
      const p = (2 * Math.PI * c) / cols
      v.push([Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)])
    }
  }
  v.push([0, -1, 0])
  const at = (r: number, c: number) => 1 + (r - 1) * cols + (c % cols)
  const f: number[][] = []
  for (let c = 0; c < cols; c++) {
    f.push([0, at(1, c + 1), at(1, c)])
    for (let r = 1; r < rows - 1; r++)
      f.push([at(r, c), at(r, c + 1), at(r + 1, c + 1), at(r + 1, c)])
    f.push([v.length - 1, at(rows - 1, c), at(rows - 1, c + 1)])
  }
  return { v, f }
}

// ---------------------------------------------------------------- triangle schemes

/** 1-to-4 split of a triangle mesh. `verts` are the (possibly moved) old vertices. */
function triSplit(m: Mesh, edges: Map<string, EdgeInfo>, verts: V3[], edgePoint: (e: EdgeInfo) => V3): Mesh {
  const nV = m.v.length
  const v = [...verts]
  for (const e of edges.values())
    v[nV + e.index] = edgePoint(e)
  const f: number[][] = []
  for (const [a, b, c] of m.f) {
    const ab = nV + edges.get(edgeKey(a, b))!.index
    const bc = nV + edges.get(edgeKey(b, c))!.index
    const ca = nV + edges.get(edgeKey(c, a))!.index
    f.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
  }
  return { v, f }
}

const midpoint = (m: Mesh) => (e: EdgeInfo) => mul(add(m.v[e.a], m.v[e.b]), 0.5)

/** Split only: no vertex moves at all. */
export function midpointSplit(m: Mesh): Mesh {
  return triSplit(m, buildEdges(m), m.v, midpoint(m))
}

/** Split, then push every vertex onto the unit sphere. */
export function sphereSplit(m: Mesh): Mesh {
  const s = midpointSplit(m)
  return { v: s.v.map(p => mul(p, 1 / len(p))), f: s.f }
}

function neighbours(m: Mesh, edges: Map<string, EdgeInfo>) {
  const nb: number[][] = m.v.map(() => [])
  const boundary: number[][] = m.v.map(() => [])
  for (const e of edges.values()) {
    nb[e.a].push(e.b)
    nb[e.b].push(e.a)
    if (e.faces.length === 1) {
      boundary[e.a].push(e.b)
      boundary[e.b].push(e.a)
    }
  }
  return { nb, boundary }
}

/** Loop subdivision (approximating, triangle meshes). */
export function loop(m: Mesh): Mesh {
  const edges = buildEdges(m)
  const { nb, boundary } = neighbours(m, edges)
  const verts = m.v.map((p, i) => {
    if (boundary[i].length === 2)
      return comb([3 / 4, 1 / 8, 1 / 8], [p, m.v[boundary[i][0]], m.v[boundary[i][1]]])
    const n = nb[i].length
    const beta = n === 3 ? 3 / 16 : 3 / (8 * n)
    return add(mul(p, 1 - n * beta), mul(avg(nb[i].map(j => m.v[j])), n * beta))
  })
  return triSplit(m, edges, verts, (e) => {
    if (e.opp.length !== 2)
      return midpoint(m)(e)
    return comb([3 / 8, 3 / 8, 1 / 8, 1 / 8], [m.v[e.a], m.v[e.b], m.v[e.opp[0]], m.v[e.opp[1]]])
  })
}

/** Modified Butterfly subdivision (interpolating, triangle meshes). */
export function butterfly(m: Mesh): Mesh {
  const edges = buildEdges(m)
  const { nb, boundary } = neighbours(m, edges)
  // next[v][x] = y when (v, x, y) is a triangle: lets us walk the ring around v
  const next: Map<number, number>[] = m.v.map(() => new Map())
  for (const [a, b, c] of m.f) {
    next[a].set(b, c)
    next[b].set(c, a)
    next[c].set(a, b)
  }
  const ring = (v: number, start: number) => {
    const out = [start]
    let cur = next[v].get(start)
    while (cur !== undefined && cur !== start && out.length < 64) {
      out.push(cur)
      cur = next[v].get(cur)
    }
    return cur === start ? out : null
  }
  const extraordinary = (v: number, other: number): V3 | null => {
    const r = ring(v, other)
    if (!r)
      return null
    const K = r.length
    let w: number[]
    if (K === 3)
      w = [5 / 12, -1 / 12, -1 / 12]
    else if (K === 4)
      w = [3 / 8, 0, -1 / 8, 0]
    else
      w = r.map((_, j) => (1 / 4 + Math.cos((2 * Math.PI * j) / K) + 0.5 * Math.cos((4 * Math.PI * j) / K)) / K)
    return add(mul(m.v[v], 3 / 4), comb(w, r.map(i => m.v[i])))
  }
  const regular = (e: EdgeInfo): V3 | null => {
    if (e.opp.length !== 2)
      return null
    const cs: V3[] = []
    for (const b of e.opp) {
      for (const [x, skip] of [[e.a, e.b], [e.b, e.a]]) {
        const side = edges.get(edgeKey(x, b))!
        const c = side.opp.find(o => o !== skip)
        if (side.opp.length !== 2 || c === undefined)
          return null
        cs.push(m.v[c])
      }
    }
    return add(
      add(mul(add(m.v[e.a], m.v[e.b]), 1 / 2), mul(add(m.v[e.opp[0]], m.v[e.opp[1]]), 1 / 8)),
      mul(avg(cs), -4 / 16),
    )
  }
  return triSplit(m, edges, m.v, (e) => {
    const onBoundary = boundary[e.a].length > 0 || boundary[e.b].length > 0
    if (onBoundary)
      return regular(e) ?? midpoint(m)(e)
    const ra = nb[e.a].length === 6
    const rb = nb[e.b].length === 6
    if (ra && rb)
      return regular(e) ?? midpoint(m)(e)
    const pa = ra ? null : extraordinary(e.a, e.b)
    const pb = rb ? null : extraordinary(e.b, e.a)
    if (pa && pb)
      return mul(add(pa, pb), 0.5)
    return pa ?? pb ?? midpoint(m)(e)
  })
}

// ---------------------------------------------------------------- quad schemes

export interface CatmullClarkResult {
  mesh: Mesh
  facePoints: V3[]
  edgePoints: V3[]
  vertexPoints: V3[]
}

/** Catmull-Clark subdivision (approximating, any polygon mesh, output is all quads). */
export function catmullClarkDetail(m: Mesh): CatmullClarkResult {
  const edges = buildEdges(m)
  const nV = m.v.length
  const nF = m.f.length
  const facePoints = m.f.map(f => avg(f.map(i => m.v[i])))
  const edgePoints: V3[] = []
  const vEdges: EdgeInfo[][] = m.v.map(() => [])
  const vFaces: number[][] = m.v.map(() => [])
  m.f.forEach((f, fi) => f.forEach(i => vFaces[i].push(fi)))
  for (const e of edges.values()) {
    vEdges[e.a].push(e)
    vEdges[e.b].push(e)
    edgePoints[e.index] = e.faces.length === 2
      ? avg([m.v[e.a], m.v[e.b], facePoints[e.faces[0]], facePoints[e.faces[1]]])
      : avg([m.v[e.a], m.v[e.b]])
  }
  const vertexPoints = m.v.map((p, i) => {
    const be = vEdges[i].filter(e => e.faces.length === 1)
    if (be.length === 2) {
      const others = be.map(e => m.v[e.a === i ? e.b : e.a])
      return comb([3 / 4, 1 / 8, 1 / 8], [p, others[0], others[1]])
    }
    const n = vEdges[i].length
    const F = avg(vFaces[i].map(fi => facePoints[fi]))
    const R = avg(vEdges[i].map(e => avg([m.v[e.a], m.v[e.b]])))
    return mul(add(add(F, mul(R, 2)), mul(p, n - 3)), 1 / n)
  })
  const f: number[][] = []
  m.f.forEach((face, fi) => {
    const n = face.length
    for (let i = 0; i < n; i++) {
      const prev = face[(i + n - 1) % n]
      const cur = face[i]
      const nxt = face[(i + 1) % n]
      f.push([
        cur,
        nV + nF + edges.get(edgeKey(cur, nxt))!.index,
        nV + fi,
        nV + nF + edges.get(edgeKey(prev, cur))!.index,
      ])
    }
  })
  return { mesh: { v: [...vertexPoints, ...facePoints, ...edgePoints], f }, facePoints, edgePoints, vertexPoints }
}

export const catmullClark = (m: Mesh) => catmullClarkDetail(m).mesh

/** Doo-Sabin subdivision (dual scheme: every vertex is split, corners get cut). Closed meshes only. */
export function dooSabin(m: Mesh): Mesh {
  const offset: number[] = []
  let total = 0
  for (const f of m.f) {
    offset.push(total)
    total += f.length
  }
  const id = (fi: number, i: number) => offset[fi] + ((i + m.f[fi].length) % m.f[fi].length)
  const v: V3[] = []
  const dir = new Map<string, [number, number]>()
  m.f.forEach((f, fi) => {
    const n = f.length
    const c = avg(f.map(i => m.v[i]))
    for (let i = 0; i < n; i++) {
      const p = m.v[f[i]]
      const e1 = avg([p, m.v[f[(i + 1) % n]]])
      const e0 = avg([p, m.v[f[(i + n - 1) % n]]])
      v[id(fi, i)] = avg([p, c, e0, e1])
      dir.set(`${f[i]}>${f[(i + 1) % n]}`, [fi, i])
    }
  })
  const f: number[][] = []
  // F-faces: a smaller copy of every old face
  m.f.forEach((face, fi) => f.push(face.map((_, i) => id(fi, i))))
  // E-faces: one quad per old edge
  for (const [key, [fi, i]] of dir) {
    const [a, b] = key.split('>').map(Number)
    if (a > b)
      continue
    const twin = dir.get(`${b}>${a}`)
    if (!twin)
      continue
    const [gi, j] = twin
    f.push([id(fi, i + 1), id(fi, i), id(gi, j + 1), id(gi, j)])
  }
  // V-faces: one polygon per old vertex
  const start: ([number, number] | undefined)[] = m.v.map(() => undefined)
  m.f.forEach((face, fi) => face.forEach((vi, i) => { start[vi] ??= [fi, i] }))
  m.v.forEach((_, vi) => {
    const s = start[vi]
    if (!s)
      return
    const out: number[] = []
    let [fi, i] = s
    for (let guard = 0; guard < 64; guard++) {
      out.push(id(fi, i))
      const face = m.f[fi]
      const w = face[(i + 1) % face.length]
      const twin = dir.get(`${w}>${vi}`)
      if (!twin)
        return
      fi = twin[0]
      i = (twin[1] + 1) % m.f[fi].length
      if (fi === s[0] && i === s[1]) {
        if (out.length >= 3)
          f.push(out.reverse())
        return
      }
    }
  })
  return { v, f }
}

// ---------------------------------------------------------------- fractal terrain

function hash(x: number, z: number, seed: number) {
  const s = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453
  return s - Math.floor(s)
}

/** Midpoint displacement: split, then push each new vertex up or down by a random amount. */
export function terrain(level: number, roughness: number, seed: number, start = 0.45): Mesh {
  let m: Mesh = { v: [[-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1]], f: [[0, 2, 1], [0, 3, 2]] }
  let scale = start
  for (let l = 0; l < level; l++) {
    const cur = m
    const s = scale
    m = triSplit(cur, buildEdges(cur), cur.v, (e) => {
      const p = mul(add(cur.v[e.a], cur.v[e.b]), 0.5)
      return [p[0], p[1] + (hash(p[0], p[2], seed) * 2 - 1) * s, p[2]]
    })
    scale *= roughness
  }
  return m
}

// ---------------------------------------------------------------- registry

export type MeshScheme = 'catmull-clark' | 'doo-sabin' | 'loop' | 'butterfly' | 'sphere' | 'split'

export const meshSchemes: Record<MeshScheme, { label: string, tri: boolean, step: (m: Mesh) => Mesh }> = {
  'catmull-clark': { label: 'Catmull-Clark', tri: false, step: catmullClark },
  'doo-sabin': { label: 'Doo-Sabin', tri: false, step: dooSabin },
  'loop': { label: 'Loop', tri: true, step: loop },
  'butterfly': { label: 'Modified Butterfly', tri: true, step: butterfly },
  'sphere': { label: 'Split + push to sphere', tri: true, step: sphereSplit },
  'split': { label: 'Split only', tri: true, step: midpointSplit },
}

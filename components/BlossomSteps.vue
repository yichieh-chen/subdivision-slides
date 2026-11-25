<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed } from 'vue'

/**
 * Where the subdivision weights come from: knot insertion written with blossom labels.
 * Every point is named by its blossom label, e.g. P(2,4). A new point is found by
 * changing ONE number of a label, sliding along the segment between two points whose
 * labels share all the other numbers.
 *
 * degree 1: 0 labels by index · 1 relabel on (0,2,4,…) · 2 insert odd labels
 * degree 2: 0 labels · 1 P(1,2) · 2 P(2,3) · 3 all new points = Chaikin
 * degree 3: 0 labels · 1 edge point P(4,5,6) · 2 helpers P(2,3,4), P(3,4,6) · 3 vertex point P(3,4,5) · 4 all new points
 */
const props = withDefaults(defineProps<{ degree?: 1 | 2 | 3, step?: number }>(), { degree: 2, step: 0 })

const W = 720
const H = 270
const BASE: P2[] = [[40, 220], [190, 45], [360, 220], [530, 45], [680, 220]]

const label = (k: number[]) => `P(${k.join(',')})`
const key = (k: number[]) => k.join(',')

/** base labels: degree d, knots spaced by 2 → P(2i, 2i+2, …) */
const baseKnots = computed(() => BASE.map((_, i) => Array.from({ length: props.degree }, (_, j) => 2 * (i + j))))

/**
 * Slide along the segment between two points whose labels differ in one number.
 * If A has x where B has y, the point with c in that slot is at t = (c - x) / (y - x).
 */
/** multiset difference: the numbers of a that are not in b */
function diff(a: number[], b: number[]) {
  const r = [...a]
  for (const v of b) {
    const j = r.indexOf(v)
    if (j >= 0)
      r.splice(j, 1)
  }
  return r
}

function blossom(ka: number[], pa: P2, kb: number[], pb: P2, kc: number[]) {
  const x = diff(ka, kb)[0]
  const y = diff(kb, ka)[0]
  const c = diff(kc, ka)[0] ?? x
  const t = (c - x) / (y - x)
  return { p: [pa[0] + t * (pb[0] - pa[0]), pa[1] + t * (pb[1] - pa[1])] as P2, x, y, c, t }
}

interface Pt { k: number[], p: P2 }
interface Op { a: Pt, b: Pt, out: Pt, x: number, y: number, c: number, t: number, tone: 'red' | 'blue' | 'gray', quiet?: boolean, flip?: boolean }

const base = computed<Pt[]>(() => baseKnots.value.map((k, i) => ({ k, p: BASE[i] })))
const find = (pts: Pt[], k: number[]) => pts.find(q => key(q.k) === key(k))!

function op(a: Pt, b: Pt, k: number[], tone: Op['tone']): Op {
  const r = blossom(a.k, a.p, b.k, b.p, k)
  return { a, b, out: { k, p: r.p }, x: r.x, y: r.y, c: r.c, t: r.t, tone }
}

/** all new points of one round, in order along the curve */
const round = computed<Pt[]>(() => {
  const B = base.value
  if (props.degree === 1)
    return B.slice(0, -1).flatMap((q, i) => [q, op(q, B[i + 1], [q.k[0] + 1], 'red').out]).concat([B[B.length - 1]])
  if (props.degree === 2)
    return B.slice(0, -1).flatMap((q, i) => {
      const m = q.k[1]
      return [op(q, B[i + 1], [m - 1, m], 'red').out, op(q, B[i + 1], [m, m + 1], 'red').out]
    })
  // degree 3: edge points P(m-1, m, m+1) between neighbours, vertex points between edge points
  const out: Pt[] = []
  for (let i = 0; i < B.length - 1; i++) {
    const m = B[i].k[1] + 1
    const e = op(B[i], B[i + 1], [m - 1, m, m + 1], 'red').out
    if (i > 0) {
      // vertex point P(m-2, m-1, m) from the previous edge point and the helper P(m-2, m-1, m+1)
      const h = op(B[i], B[i + 1], [m - 2, m - 1, m + 1], 'gray').out
      out.push(op(out[out.length - 1], h, [m - 2, m - 1, m], 'blue').out)
    }
    out.push(e)
  }
  return out
})

/** the operations to draw on the current click */
const ops = computed<Op[]>(() => {
  const B = base.value
  const s = props.step
  if (props.degree === 1)
    return s >= 2 ? B.slice(0, -1).map((q, i) => op(q, B[i + 1], [q.k[0] + 1], 'red')) : []
  if (props.degree === 2) {
    if (s === 1)
      return [op(B[0], B[1], [1, 2], 'red')]
    if (s === 2)
      return [op(B[0], B[1], [1, 2], 'red'), op(B[0], B[1], [2, 3], 'red')]
    return []
  }
  const A = find(B, [0, 2, 4])
  const Bm = find(B, [2, 4, 6])
  const C = find(B, [4, 6, 8])
  const edge = op(Bm, C, [4, 5, 6], 'red')
  const left = op(A, Bm, [2, 3, 4], 'red')
  const helper = op(Bm, C, [3, 4, 6], 'gray')
  const vertex = op(left.out, helper.out, [3, 4, 5], 'blue')
  if (s === 1)
    return [edge]
  if (s === 2)
    return [left, helper]
  if (s === 3)
    // the vertex point sits right under P(2,4,6): put its label below the segment
    return [{ ...left, tone: 'gray', quiet: true }, { ...helper, quiet: true }, { ...vertex, flip: true }]
  return []
})

const showAll = computed(() => (props.degree === 1 && props.step >= 2) || (props.degree === 2 && props.step >= 3) || (props.degree === 3 && props.step >= 4))

/** degree 1, click 0: plain index labels P(0), P(1), … */
const baseLabel = (q: Pt, i: number) => (props.degree === 1 && props.step === 0 ? label([i]) : label(q.k))

const path = (p: P2[]) => p.map(q => q.join(',')).join(' ')
/** unit normal of a segment that points up (screen y < 0) */
function up(a: P2, b: P2): P2 {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const l = Math.hypot(dx, dy) || 1
  let n: P2 = [dy / l, -dx / l]
  if (n[1] > 0)
    n = [-n[0], -n[1]]
  return n
}
const off = (p: P2, n: P2, d: number): P2 => [p[0] + n[0] * d, p[1] + n[1] * d]
/** a little way from p towards q, so that numbers at a shared end point do not overlap */
const inward = (p: P2, q: P2): P2 => [p[0] + 0.12 * (q[0] - p[0]), p[1] + 0.12 * (q[1] - p[1])]
const frac = (t: number) => {
  const known: Record<string, string> = { '0.25': '¼', '0.75': '¾', '0.5': '½', '0.1667': '⅙', '0.8333': '⅚' }
  return known[t.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')] ?? t.toFixed(2)
}

const caption = computed(() => {
  const s = props.step
  if (props.degree === 1)
    return [
      'Order 1：knot vector T = (0, 1, 2, …)，每個 control point 用一個 knot 命名',
      '只有相對值重要：改寫成 T = (0, 2, 4, …)，形狀完全不變',
      '插入 1, 3, 5, …：新點就在中點，得到密度兩倍的同一條折線',
    ][Math.min(s, 2)]
  if (props.degree === 2)
    return [
      'Order 2：每個點用兩個相鄰的 knot 命名，T = (0, 2, 4, …)',
      'P(1,2)：和 P(0,2)、P(2,4) 共用「2」，另一個數 0 → 4 之間取 1 → ¾ P(0,2) + ¼ P(2,4)',
      'P(2,3)：同一條邊，取 3 → ¼ P(0,2) + ¾ P(2,4)',
      '每條邊都這樣做，就是 Chaikin 的 ¾、¼ 規則',
    ][Math.min(s, 3)]
  return [
    'Order 3：每個點用三個相鄰的 knot 命名，T = (0, 2, 4, …)',
    'Edge point P(4,5,6)：共用 4、6，另一個數 2 → 8 取 5 → ½、½',
    '先算兩個中間點：P(2,3,4) = ½、½；P(3,4,6)：2 → 8 取 3 → ⅚、⅙',
    'Vertex point P(3,4,5) = ¼ P(2,3,4) + ¾ P(3,4,6) = ⅛ P(0,2,4) + ¾ P(2,4,6) + ⅛ P(4,6,8)',
    '每個位置都這樣做，就是 cubic B-spline 的 ½、½ 和 ⅛、¾、⅛',
  ][Math.min(s, 4)]
})

const TONE = { red: '#dc2626', blue: '#2563eb', gray: '#64748b' }
const HALO = { red: '#fca5a5', blue: '#93c5fd', gray: '#cbd5e1' }
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <!-- control polygon -->
      <polyline
        :points="path(BASE)" fill="none" stroke="#0f172a" stroke-width="2"
        :opacity="showAll && degree > 1 ? 0.25 : 1" :stroke-dasharray="showAll && degree > 1 ? '5 4' : ''"
      />

      <!-- the segments used on this click, with the number that changes along them -->
      <g v-for="(o, i) in ops" :key="`o${i}`" class="appear">
        <line :x1="o.a.p[0]" :y1="o.a.p[1]" :x2="o.b.p[0]" :y2="o.b.p[1]" :stroke="HALO[o.tone]" stroke-width="8" stroke-linecap="round" opacity="0.6" />
        <template v-if="degree > 1 && !o.quiet">
          <text v-bind="{ x: off(inward(o.a.p, o.b.p), up(o.a.p, o.b.p), -16)[0], y: off(inward(o.a.p, o.b.p), up(o.a.p, o.b.p), -16)[1] }" class="num" :fill="TONE[o.tone]" text-anchor="middle">{{ o.x }}</text>
          <text v-bind="{ x: off(inward(o.b.p, o.a.p), up(o.a.p, o.b.p), -16)[0], y: off(inward(o.b.p, o.a.p), up(o.a.p, o.b.p), -16)[1] }" class="num" :fill="TONE[o.tone]" text-anchor="middle">{{ o.y }}</text>
          <text v-bind="{ x: off(o.out.p, up(o.a.p, o.b.p), o.flip ? 18 : -22)[0], y: off(o.out.p, up(o.a.p, o.b.p), o.flip ? 18 : -22)[1] + 4 }" class="num" :fill="TONE[o.tone]" text-anchor="middle">{{ o.c }}</text>
        </template>
      </g>

      <!-- old control points -->
      <g v-for="(q, i) in base" :key="`b${i}`" :opacity="showAll && degree > 1 ? 0.4 : 1">
        <circle :cx="q.p[0]" :cy="q.p[1]" r="6" fill="#fff" stroke="#0f172a" stroke-width="2" />
        <text :x="q.p[0]" :y="q.p[1] + (q.p[1] > H / 2 ? 26 : -14)" class="name" fill="#0f172a" text-anchor="middle">{{ baseLabel(q, i) }}</text>
      </g>

      <!-- new points of this click, with their label -->
      <g v-for="(o, i) in ops" :key="`n${i}`" class="appear">
        <circle :cx="o.out.p[0]" :cy="o.out.p[1]" r="6" :fill="TONE[o.tone]" />
        <text
          v-bind="{ x: off(o.out.p, up(o.a.p, o.b.p), o.flip ? -30 : 22)[0], y: off(o.out.p, up(o.a.p, o.b.p), o.flip ? -30 : 22)[1] }"
          class="name" :fill="TONE[o.tone]" text-anchor="middle"
        >{{ label(o.out.k) }}</text>
        <text
          v-if="degree > 1 && !o.quiet"
          v-bind="{ x: off(o.out.p, up(o.a.p, o.b.p), o.flip ? -48 : 40)[0], y: off(o.out.p, up(o.a.p, o.b.p), o.flip ? -48 : 40)[1] }"
          class="w" :fill="TONE[o.tone]" text-anchor="middle"
        >{{ frac(1 - o.t) }} : {{ frac(o.t) }}</text>
      </g>

      <!-- whole round -->
      <g v-if="showAll" class="appear">
        <polyline :points="path(round.map(q => q.p))" fill="none" stroke="#dc2626" stroke-width="2.2" />
        <circle v-for="(q, i) in round" :key="`r${i}`" :cx="q.p[0]" :cy="q.p[1]" r="4.5" fill="#dc2626" />
      </g>
    </svg>
    <div class="demo-title">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
.name {
  font-size: 14px;
}
.num {
  font-size: 13px;
  font-weight: 700;
}
.w {
  font-size: 13px;
  font-weight: 600;
}
.name,
.num,
.w {
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 4px;
  stroke-linejoin: round;
}
svg {
  overflow: visible;
}
.appear {
  animation: appear 0.45s ease both;
}
@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

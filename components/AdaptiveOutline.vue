<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed } from 'vue'

/**
 * Adaptive tessellation inside one model: the outline of a head with an ear.
 *   step 0  the same spacing everywhere
 *   step 1  adaptive: many points where the outline bends (the ear), few where it is nearly straight
 * Both versions stay within the same distance of the smooth outline.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 520
const H = 290
const TOL = 0.8
const DEPTH = 6
const CONTROL: P2[] = [
  [120, 40], [235, 22], [335, 45], [352, 108],
  [356, 120], [408, 100], [420, 150], [388, 186], [352, 168],
  [348, 215], [318, 262], [230, 274], [128, 258], [100, 150],
]

/** cubic B-spline subdivision of a closed polygon */
function refine(p: P2[]): P2[] {
  const n = p.length
  const out: P2[] = []
  for (let i = 0; i < n; i++) {
    const [a, b, c] = [p[(i + n - 1) % n], p[i], p[(i + 1) % n]]
    out.push([a[0] / 8 + b[0] * 0.75 + c[0] / 8, a[1] / 8 + b[1] * 0.75 + c[1] / 8])
    out.push([(b[0] + c[0]) / 2, (b[1] + c[1]) / 2])
  }
  return out
}

let limit = CONTROL
for (let i = 0; i < DEPTH; i++)
  limit = refine(limit)
const SPAN = 2 ** DEPTH
const N = limit.length
const at = (i: number) => limit[i % N]

function deviation(i: number, j: number) {
  const [a, b] = [at(i), at(j)]
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  const l = Math.hypot(dx, dy) || 1
  let worst = 0
  for (let k = i + 1; k < j; k++) {
    const p = at(k)
    worst = Math.max(worst, Math.abs((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / l)
  }
  return worst
}

/** split [i, j] until the chord is within TOL of the outline; returns the start indices and the deepest level used */
function split(i: number, j: number, depth: number, out: number[]): number {
  if (j - i > 1 && deviation(i, j) > TOL) {
    const m = (i + j) >> 1
    return Math.max(split(i, m, depth + 1, out), split(m, j, depth + 1, out))
  }
  out.push(i)
  return depth
}

const adaptiveIdx: number[] = []
for (let s = 0; s < N; s += SPAN)
  split(s, s + SPAN, 0, adaptiveIdx)
/** the same spacing everywhere: as fine as the adaptive version is at its finest, measured along the outline */
const chord = (i: number, j: number) => Math.hypot(at(j)[0] - at(i)[0], at(j)[1] - at(i)[1])
const sorted = [...adaptiveIdx].sort((x, y) => x - y)
const finest = Math.min(...sorted.map((i, k) => chord(i, k + 1 < sorted.length ? sorted[k + 1] : N)))
const uniformIdx: number[] = [0]
let run = 0
for (let i = 1; i < N; i++) {
  run += chord(i - 1, i)
  if (run >= finest) {
    uniformIdx.push(i)
    run = 0
  }
}

const idx = computed(() => (props.step >= 1 ? adaptiveIdx : uniformIdx))
const pts = computed(() => idx.value.map(i => limit[i]))
const path = (p: P2[]) => p.map(q => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <polygon :points="path(limit)" fill="#fde7d3" stroke="none" />
      <polygon :points="path(pts)" fill="none" stroke="#2563eb" stroke-width="1.6" />
      <circle v-for="(p, i) in pts" :key="i" :cx="p[0]" :cy="p[1]" r="2.8" fill="#2563eb" />
      <circle cx="185" cy="120" r="7" fill="#0f172a" />
      <circle cx="275" cy="120" r="7" fill="#0f172a" />
      <path d="M 195 195 Q 230 220 268 195" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
      <g v-if="step >= 1">
        <text x="432" y="120" class="lbl" fill="#dc2626">耳朵很彎</text>
        <text x="432" y="144" class="lbl" fill="#dc2626">點很密</text>
        <text x="8" y="150" class="lbl" fill="#15803d">臉頰</text>
        <text x="8" y="174" class="lbl" fill="#15803d">很平</text>
        <text x="8" y="198" class="lbl" fill="#15803d">點很少</text>
      </g>
    </svg>
    <div class="demo-title">
      {{ step >= 1 ? 'Adaptive：彎的地方多切，平的地方少切' : '每個地方都切一樣細' }}　共 <b>{{ pts.length }}</b> 個點
    </div>
  </div>
</template>

<style scoped>
.lbl {
  font-size: 17px;
  font-weight: 600;
}
</style>

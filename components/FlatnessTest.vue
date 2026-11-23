<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed, ref, watch } from 'vue'

/**
 * Flatness test, seen from the side: the current mesh is a polyline, the limit surface a curve.
 * The largest gap between the two is measured in screen pixels (so it shrinks with distance).
 * While the gap is above the threshold the patch is subdivided again; once it is below, it stops.
 * After Bunnell, "Adaptive Tessellation of Subdivision Surfaces with Displacement Mapping", GPU Gems 2.
 */
const W = 400
const H = 230
const MAXL = 6
const FAR = 6

const SHAPES: Record<string, { label: string, pts: P2[] }> = {
  curved: { label: '彎的', pts: [[-1.6, 0], [-1.1, 0.95], [0, 1.3], [1.1, 0.95], [1.6, 0]] },
  mild: { label: '有點彎', pts: [[-1.6, 0.35], [-0.8, 0.62], [0, 0.7], [0.8, 0.62], [1.6, 0.35]] },
  flat: { label: '平的', pts: [[-1.6, 0.5], [-0.8, 0.5], [0, 0.5], [0.8, 0.5], [1.6, 0.5]] },
}

/** cubic B-spline subdivision of an open polyline whose end points stay where they are */
function refine(p: P2[]): P2[] {
  const n = p.length
  const at = (i: number) => p[Math.max(0, Math.min(n - 1, i))]
  const out: P2[] = []
  for (let i = 0; i < n; i++) {
    const [a, b, c] = [at(i - 1), p[i], at(i + 1)]
    out.push(i === 0 || i === n - 1 ? b : [a[0] / 8 + b[0] * 0.75 + c[0] / 8, a[1] / 8 + b[1] * 0.75 + c[1] / 8])
    if (i < n - 1)
      out.push([(b[0] + c[0]) / 2, (b[1] + c[1]) / 2])
  }
  return out
}

function toSegment(p: P2, a: P2, b: P2): P2 {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  const l = dx * dx + dy * dy
  const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0
  return [a[0] + t * dx, a[1] + t * dy]
}

interface Level { pts: P2[], err: number, from: P2, to: P2 }

function build(pts: P2[]) {
  const polys: P2[][] = [pts]
  for (let i = 0; i < MAXL + 3; i++)
    polys.push(refine(polys[i]))
  const limit = polys[MAXL + 3]
  const levels: Level[] = []
  for (let k = 0; k <= MAXL; k++) {
    let best: Level = { pts: polys[k], err: 0, from: polys[k][0], to: polys[k][0] }
    for (const v of polys[k]) {
      let d = Infinity
      let q: P2 = v
      for (let j = 0; j < limit.length - 1; j++) {
        const c = toSegment(v, limit[j], limit[j + 1])
        const dd = Math.hypot(c[0] - v[0], c[1] - v[1])
        if (dd < d) {
          d = dd
          q = c
        }
      }
      if (d > best.err)
        best = { pts: polys[k], err: d, from: v, to: q }
    }
    levels.push(best)
  }
  return { limit, levels }
}

const built = Object.fromEntries(Object.entries(SHAPES).map(([k, s]) => [k, build(s.pts)]))
/** pixels per world unit at distance 1: the curved shape's control mesh is 0.4 px off at the far end */
const SCALE = 0.4 * 2 ** FAR / built.curved.levels[0].err

const shape = ref('curved')
const near = ref(0)
const threshold = ref(0.5)
const picked = ref<number | null>(null)

const distance = computed(() => 2 ** (FAR - near.value))
const data = computed(() => built[shape.value])
const pixels = computed(() => data.value.levels.map(l => l.err * SCALE / distance.value))
/** first level whose error is small enough */
const stop = computed(() => {
  const i = pixels.value.findIndex(p => p <= threshold.value)
  return i < 0 ? MAXL : i
})
const rows = computed(() => pixels.value.slice(0, stop.value + 1))
const shown = computed(() => Math.min(picked.value ?? stop.value, stop.value))
watch([shape, near, threshold], () => (picked.value = null))

const sx = (p: P2) => W / 2 + p[0] * 112
const sy = (p: P2) => H - 28 - p[1] * 135
const path = (p: P2[]) => p.map(q => `${sx(q).toFixed(1)},${sy(q).toFixed(1)}`).join(' ')
const cur = computed(() => data.value.levels[shown.value])
const fmt = (p: number) => (p >= 10 ? p.toFixed(0) : p >= 0.1 ? p.toFixed(1) : p < 0.005 ? '0' : p.toFixed(2))
</script>

<template>
  <div class="flat">
    <div class="row">
      <div class="demo" :style="{ width: `${W}px` }">
        <div class="demo-title">
          從側面看其中一塊（放大來看）
        </div>
        <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="view">
          <polyline :points="path(data.limit)" fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
          <polyline :points="path(cur.pts)" fill="none" stroke="#2563eb" stroke-width="2" />
          <circle v-for="(p, i) in cur.pts" :key="i" :cx="sx(p)" :cy="sy(p)" :r="shown > 2 ? 2 : 4" fill="#2563eb" />
          <template v-if="cur.err > 1e-6">
            <line :x1="sx(cur.from)" :y1="sy(cur.from)" :x2="sx(cur.to)" :y2="sy(cur.to)" stroke="#dc2626" stroke-width="3" />
            <text x="14" y="26" fill="#dc2626" class="err">最大誤差（紅色那段）：螢幕上 {{ fmt(pixels[shown]) }} px</text>
          </template>
        </svg>
        <div class="demo-note">
          <span class="lg grey" /> limit surface　<span class="lg blue" /> 現在的 mesh（Level {{ shown }}）
        </div>
      </div>
      <div class="demo steps">
        <div class="demo-title">
          Flatness test：誤差 ≤ {{ threshold }} px 嗎？
        </div>
        <div
          v-for="(p, k) in rows" :key="k" class="step"
          :class="{ ok: k === stop, on: k === shown }" @click="picked = k"
        >
          <span class="lv">Level {{ k }}</span>
          <span class="px">{{ fmt(p) }} px</span>
          <span class="verdict">{{ k === stop ? (p <= threshold ? '夠平了，停' : '切到上限') : '太大，再切一次' }}</span>
        </div>
        <div class="result">
          這一塊切 <b>{{ stop }}</b> 次
        </div>
      </div>
    </div>
    <div class="demo controls">
      <div class="demo-row">
        <span class="end">遠</span>
        <label class="slider">
          <input v-model.number="near" type="range" min="0" :max="FAR" step="0.5">
        </label>
        <span class="end">近</span>
        <span class="dist">距離 ×{{ distance % 1 ? distance.toFixed(1) : distance }}</span>
        <span class="sep" />
        <button v-for="(s, k) in SHAPES" :key="k" class="chip" :class="{ on: shape === k }" @click="shape = k as string">
          {{ s.label }}
        </button>
        <span class="sep" />
        <span>門檻</span>
        <button v-for="t in [0.5, 2]" :key="t" class="chip" :class="{ on: threshold === t }" @click="threshold = t">
          {{ t }} px
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.row {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 36px;
}
.view {
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}
.err {
  font-size: 15px;
  font-weight: 600;
}
.lg {
  display: inline-block;
  width: 22px;
  height: 4px;
  vertical-align: middle;
  border-radius: 2px;
}
.lg.grey {
  background: #94a3b8;
}
.lg.blue {
  background: #2563eb;
}
.steps {
  width: 330px;
  align-items: stretch;
  margin: 0;
}
.steps .demo-title {
  text-align: center;
}
.step {
  display: flex;
  gap: 10px;
  padding: 3px 10px;
  border: 1.5px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  cursor: pointer;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.step.ok {
  border-color: #86efac;
  background: #f0fdf4;
}
.step.on {
  outline: 2px solid #2563eb;
}
.lv {
  font-weight: 600;
  width: 62px;
}
.px {
  width: 62px;
  white-space: nowrap;
  text-align: right;
}
.verdict {
  color: #b91c1c;
}
.step.ok .verdict {
  color: #15803d;
  font-weight: 600;
}
.result {
  text-align: center;
  font-size: 17px;
  margin-top: 2px;
}
.end {
  font-weight: 600;
}
.dist {
  min-width: 80px;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}
.sep {
  width: 10px;
}
</style>

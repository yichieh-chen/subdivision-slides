<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed, ref } from 'vue'

/**
 * How one point of a B-spline curve is computed: rounds of lerp between neighbours,
 * drawn the way de Casteljau is usually drawn for Bezier curves (this is de Boor's algorithm
 * on uniform knots). Degree n uses n + 1 neighbouring control points and n rounds.
 */
const W = 540
const H = 250
const P: P2[] = [[40, 205], [115, 55], [225, 45], [305, 175], [410, 200], [495, 70]]
const ROUND = ['#f59e0b', '#16a34a', '#dc2626']
const LABEL = ['1 次：折線', '2 次：Chaikin 的極限', '3 次：Cubic B-spline']

const degree = ref(2)
/** position along the curve, 0 to 1 */
const s = ref(0.36)

const lerp = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** every round of the computation at parameter u; rounds[0] are the control points that take part */
function rounds(n: number, u: number): P2[][] {
  const k = Math.min(Math.floor(u), P.length - 1)
  const out: P2[][] = [P.slice(k - n, k + 1)]
  for (let r = 1; r <= n; r++) {
    const prev = out[r - 1]
    const next: P2[] = []
    for (let j = 1; j < prev.length; j++) {
      const i = k - n + r + j - 1
      next.push(lerp(prev[j - 1], prev[j], (u - i) / (n + 1 - r)))
    }
    out.push(next)
  }
  return out
}

const range = (n: number) => [n, P.length - 1e-6]
const u = computed(() => {
  const [a, b] = range(degree.value)
  return a + (b - a) * s.value
})
const steps = computed(() => rounds(degree.value, u.value))
const point = computed(() => steps.value[degree.value][0])
const curve = computed(() => {
  const [a, b] = range(degree.value)
  const n = degree.value
  return Array.from({ length: 161 }, (_, i) => rounds(n, a + (b - a) * i / 160)[n][0])
})
const path = (p: P2[]) => p.map(q => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <polyline :points="path(P)" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="5 4" />
      <polyline :points="path(curve)" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round" />
      <circle v-for="(p, i) in P" :key="`c${i}`" :cx="p[0]" :cy="p[1]" r="5" fill="#fff" stroke="#94a3b8" stroke-width="2" />
      <polyline :points="path(steps[0])" fill="none" stroke="#0f172a" stroke-width="2.2" />
      <circle v-for="(p, i) in steps[0]" :key="`a${i}`" :cx="p[0]" :cy="p[1]" r="6.5" fill="#0f172a" />
      <template v-for="r in degree" :key="r">
        <polyline v-if="r < degree" :points="path(steps[r])" fill="none" :stroke="ROUND[r - 1]" stroke-width="2.2" />
        <circle
          v-for="(p, i) in steps[r]" :key="`r${r}-${i}`" :cx="p[0]" :cy="p[1]"
          :r="r === degree ? 8 : 5.5" :fill="ROUND[r - 1]" stroke="#fff" stroke-width="1.5"
        />
      </template>
      <circle :cx="point[0]" :cy="point[1]" r="12" fill="none" :stroke="ROUND[degree - 1]" stroke-width="2" />
    </svg>
    <div class="demo-title">
      {{ degree }} 次：用 <b>{{ degree + 1 }}</b> 個相鄰的 control points（黑色），做 <b>{{ degree }}</b> 輪 lerp
    </div>
    <div class="demo-row">
      <span v-for="r in degree" :key="r" class="lg"><i :style="{ background: ROUND[r - 1] }" />第 {{ r }} 輪</span>
    </div>
    <div class="demo-row">
      <button v-for="(l, i) in LABEL" :key="i" class="chip" :class="{ on: degree === i + 1 }" @click="degree = i + 1">
        {{ l }}
      </button>
      <label class="slider">
        沿著曲線走
        <input v-model.number="s" type="range" min="0" max="1" step="0.005">
      </label>
    </div>
  </div>
</template>

<style scoped>
.lg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}
.lg i {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * Why degree n B-splines are C^(n-1): taking the derivative removes one round of lerp.
 * Each row is one degree, built from the same control values. The columns are the curve's height,
 * its slope (first derivative) and how fast the slope changes (second derivative), plotted along
 * the curve. A continuous graph is drawn in green, one that jumps at the joints in red.
 * Rows appear one at a time with the slide's clicks.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 2 })

const C = [0.15, 0.95, 0.25, 0.9, 0.1, 0.8, 0.35, 0.7]
const U0 = 3
const U1 = C.length
const PW = 190
const PH = 62

/** uniform B-spline basis function N(i, p) on integer knots */
function basis(i: number, p: number, u: number): number {
  if (p === 0)
    return u >= i && u < i + 1 ? 1 : 0
  return (u - i) / p * basis(i, p - 1, u) + (i + p + 1 - u) / p * basis(i + 1, p - 1, u)
}
/** d-th derivative of the degree-n curve: a degree n - d curve of the d-th differences of the control values */
function value(n: number, d: number, u: number) {
  let c = C
  for (let k = 0; k < d; k++)
    c = c.map((x, i) => (i === 0 ? 0 : x - c[i - 1]))
  return c.reduce((sum, x, i) => (i < d ? sum : sum + x * basis(i, n - d, u)), 0)
}

interface Cell { paths: string[], state: 'ok' | 'jump' | 'none', text: string }

function cell(n: number, d: number): Cell {
  if (d > n)
    return { paths: [], state: 'none', text: '全部是 0，只在接點跳一下' }
  const spans: [number, number][][] = []
  let lo = Infinity
  let hi = -Infinity
  for (let k = U0; k < U1; k++) {
    const pts: [number, number][] = []
    for (let j = 0; j <= 24; j++) {
      const u = k + Math.min(j / 24, 0.9999)
      const y = value(n, d, u)
      lo = Math.min(lo, y)
      hi = Math.max(hi, y)
      pts.push([u, y])
    }
    spans.push(pts)
  }
  const pad = (hi - lo) * 0.12 || 1
  const sx = (u: number) => 6 + (u - U0) / (U1 - U0) * (PW - 12)
  const sy = (y: number) => PH - 6 - (y - lo + pad) / (hi - lo + 2 * pad) * (PH - 12)
  const paths = spans.map(p => p.map(q => `${sx(q[0]).toFixed(1)},${sy(q[1]).toFixed(1)}`).join(' '))
  const jump = d === n
  return { paths, state: jump ? 'jump' : 'ok', text: jump ? '在接點會跳' : '連續' }
}

const ROWS = [
  { n: 1, name: '1 次（折線）', result: 'C⁰' },
  { n: 2, name: '2 次（Chaikin）', result: 'C¹' },
  { n: 3, name: '3 次（Cubic）', result: 'C²' },
]
const table = ROWS.map(r => ({ ...r, cells: [0, 1, 2].map(d => cell(r.n, d)) }))
const joints = Array.from({ length: U1 - U0 - 1 }, (_, i) => 6 + (i + 1) / (U1 - U0) * (PW - 12))
const shown = computed(() => Math.min(props.step, 2) + 1)
</script>

<template>
  <div class="ladder">
    <div class="head" />
    <div class="head">
      曲線本身
    </div>
    <div class="head">
      方向（微分一次）
    </div>
    <div class="head">
      彎曲程度（微分兩次）
    </div>
    <div class="head" />
    <template v-for="(row, i) in table" :key="row.n">
      <div class="name" :class="{ hide: i >= shown }">
        {{ row.name }}
      </div>
      <div v-for="(c, d) in row.cells" :key="d" class="cell" :class="[c.state, { hide: i >= shown }]">
        <svg :width="PW" :height="PH" :viewBox="`0 0 ${PW} ${PH}`">
          <line v-for="(x, j) in joints" :key="j" :x1="x" :x2="x" y1="3" :y2="PH - 3" stroke="#cbd5e1" stroke-dasharray="3 3" />
          <line v-if="c.state === 'none'" x1="6" :x2="PW - 6" :y1="PH / 2" :y2="PH / 2" stroke="#94a3b8" stroke-width="2" />
          <polyline
            v-for="(p, j) in c.paths" :key="j" :points="p" fill="none"
            :stroke="c.state === 'ok' ? '#16a34a' : '#dc2626'" stroke-width="2.5" stroke-linejoin="round"
          />
        </svg>
        <div class="verdict">
          {{ c.text }}
        </div>
      </div>
      <div class="result" :class="{ hide: i >= shown }">
        {{ row.result }}
      </div>
    </template>
  </div>
</template>

<style scoped>
.ladder {
  display: grid;
  grid-template-columns: 150px repeat(3, 200px) 60px;
  gap: 4px 10px;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  line-height: 1.3;
}
.head {
  font-weight: 600;
  text-align: center;
}
.name {
  font-weight: 600;
}
.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 2px 0;
}
.cell.ok {
  border-color: #86efac;
  background: #f0fdf4;
}
.cell.jump {
  border-color: #fecaca;
  background: #fef2f2;
}
.verdict {
  font-size: 13px;
}
.ok .verdict {
  color: #15803d;
}
.jump .verdict {
  color: #b91c1c;
  font-weight: 600;
}
.none .verdict {
  color: #64748b;
}
.result {
  font-size: 26px;
  font-weight: 700;
  color: #2563eb;
  text-align: center;
}
.hide {
  visibility: hidden;
}
</style>

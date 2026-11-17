<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Weight diagrams ("masks" / "stencils"): which neighbours a new point is averaged from.
 * kind = butterfly | loop-edge | loop-vertex
 */
const props = withDefaults(defineProps<{ kind?: 'butterfly' | 'loop-edge' | 'loop-vertex' }>(), { kind: 'butterfly' })

type P = [number, number]
const w = ref(0)
const n = ref(6)

const fmt = (x: number) => {
  const fracs: [number, string][] = [[1 / 2, '1/2'], [1 / 8, '1/8'], [-1 / 16, '−1/16'], [3 / 8, '3/8'], [1 / 16, '1/16'], [5 / 8, '5/8'], [10 / 16, '10/16'], [3 / 16, '3/16'], [7 / 16, '7/16']]
  if (Math.abs(x) < 1e-9)
    return '0'
  const hit = fracs.find(([v]) => Math.abs(v - x) < 1e-9)
  return hit ? hit[1] : x.toFixed(3).replace('-', '−')
}

const radius = (weight: number) => 6 + 22 * Math.min(0.6, Math.abs(weight))

interface Node { p: P, label: string, weight: number, color: string }

const butterfly = computed(() => {
  const dx = 70
  const dy = 78
  const cx = 230
  const cy = 130
  const a: P[] = [[cx - dx, cy], [cx + dx, cy]]
  const b: P[] = [[cx, cy - dy], [cx, cy + dy]]
  const c: P[] = [[cx - 2 * dx, cy - dy], [cx + 2 * dx, cy - dy], [cx - 2 * dx, cy + dy], [cx + 2 * dx, cy + dy]]
  const d: P[] = [[cx - 3 * dx, cy], [cx + 3 * dx, cy]]
  const edges: [P, P][] = [
    [a[0], a[1]], [a[0], b[0]], [a[1], b[0]], [a[0], b[1]], [a[1], b[1]],
    [c[0], b[0]], [b[0], c[1]], [c[2], b[1]], [b[1], c[3]],
    [c[0], a[0]], [c[2], a[0]], [c[1], a[1]], [c[3], a[1]],
    [d[0], a[0]], [d[0], c[0]], [d[0], c[2]], [d[1], a[1]], [d[1], c[1]], [d[1], c[3]],
  ]
  const nodes: Node[] = [
    ...a.map(p => ({ p, label: 'a', weight: 1 / 2 - w.value, color: '#2563eb' })),
    ...b.map(p => ({ p, label: 'b', weight: 1 / 8 + 2 * w.value, color: '#16a34a' })),
    ...c.map(p => ({ p, label: 'c', weight: -1 / 16 - w.value, color: '#dc2626' })),
    ...d.map(p => ({ p, label: 'd', weight: w.value, color: '#9333ea' })),
  ]
  return { edges, nodes, target: [cx, cy] as P }
})

const beta = computed(() => (1 / n.value) * (5 / 8 - (3 / 8 + Math.cos((2 * Math.PI) / n.value) / 4) ** 2))

const loopVertex = computed(() => {
  const c: P = [230, 135]
  const ring: P[] = Array.from({ length: n.value }, (_, i) => {
    const t = (2 * Math.PI * i) / n.value - Math.PI / 2
    return [c[0] + 105 * Math.cos(t), c[1] + 105 * Math.sin(t)] as P
  })
  const edges: [P, P][] = ring.flatMap((p, i) => [[c, p], [p, ring[(i + 1) % n.value]]] as [P, P][])
  const nodes: Node[] = ring.map(p => ({ p, label: 'β', weight: beta.value, color: '#2563eb' }))
  return { edges, nodes, target: c, centre: 1 - n.value * beta.value }
})

const loopEdge = computed(() => {
  const a: P[] = [[150, 135], [310, 135]]
  const b: P[] = [[230, 35], [230, 235]]
  const edges: [P, P][] = [[a[0], a[1]], [a[0], b[0]], [a[1], b[0]], [a[0], b[1]], [a[1], b[1]]]
  const nodes: Node[] = [
    ...a.map(p => ({ p, label: '', weight: 3 / 8, color: '#2563eb' })),
    ...b.map(p => ({ p, label: '', weight: 1 / 8, color: '#16a34a' })),
  ]
  return { edges, nodes, target: [230, 135] as P }
})

const view = computed(() => (props.kind === 'butterfly' ? butterfly.value : props.kind === 'loop-edge' ? loopEdge.value : loopVertex.value))
</script>

<template>
  <div class="demo" style="width: 460px">
    <svg width="460" height="270" viewBox="0 0 460 270">
      <line
        v-for="(e, i) in view.edges" :key="i" :x1="e[0][0]" :y1="e[0][1]" :x2="e[1][0]" :y2="e[1][1]"
        stroke="#94a3b8" stroke-width="1.5"
      />
      <g v-for="(nd, i) in view.nodes" :key="`n${i}`">
        <circle :cx="nd.p[0]" :cy="nd.p[1]" :r="radius(nd.weight)" :fill="nd.color" opacity="0.9" />
        <text :x="nd.p[0]" :y="nd.p[1] - radius(nd.weight) - 6" text-anchor="middle" style="font-size: 15px" font-weight="bold" :fill="nd.color">
          {{ fmt(nd.weight) }}
        </text>
      </g>
      <circle :cx="view.target[0]" :cy="view.target[1]" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
      <text
        v-if="kind === 'loop-vertex'" :x="view.target[0]" :y="view.target[1] + 24" text-anchor="middle"
        style="font-size: 15px" font-weight="bold" fill="#f97316"
      >
        {{ fmt(loopVertex.centre) }}
      </text>
    </svg>
    <div v-if="kind === 'butterfly'" class="demo-row">
      <label class="slider">
        <span>w = {{ w.toFixed(3) }}</span>
        <input v-model.number="w" type="range" min="-0.05" max="0.05" step="0.005">
      </label>
      <span class="demo-note">a = 1/2 − w　b = 1/8 + 2w　c = −1/16 − w　d = w</span>
    </div>
    <div v-else-if="kind === 'loop-vertex'" class="demo-row">
      <label class="slider">
        <span>n = {{ n }}</span>
        <input v-model.number="n" type="range" min="3" max="9" step="1">
      </label>
      <span class="demo-note">{{ n === 6 ? 'regular vertex (degree 6)' : 'extraordinary vertex' }} · 權重總和永遠是 1</span>
    </div>
    <div v-else class="demo-note">
      <b style="color:#f97316">●</b> 新的 edge point = 3/8 × 兩個端點 + 1/8 × 對面兩個點
    </div>
  </div>
</template>

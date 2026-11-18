<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { midpointSplit } from '../lib/mesh'

/**
 * Midpoint displacement, one step at a time:
 *   0  a flat square (two triangles)
 *   1  a new vertex at the midpoint of every edge
 *   2  connect them: every triangle becomes four
 *   3  push the new vertices up or down by a random amount (at most s)
 *   4  the next round: same three steps, but the amount is k times smaller
 * Left: the mesh in 3D. Right: one edge seen from the side.
 */
const props = withDefaults(defineProps<{ step?: number, size?: number, k?: number }>(), { step: 0, size: 300, k: 0.5 })

const stage = computed(() => Math.max(0, Math.min(4, props.step)))
const seed = ref(3)

/** a repeatable random number in [-1, 1] */
function rand(i: number, salt: number) {
  const s = Math.sin(i * 127.1 + salt * 311.7 + seed.value * 74.7) * 43758.5453
  const r = (s - Math.floor(s)) * 2 - 1
  // keep away from zero so that every push is easy to see
  return Math.sign(r || 1) * (0.4 + 0.6 * Math.abs(r))
}

/** a value that eases to 1 while `on` is true and back to 0 otherwise */
function tween(on: () => boolean) {
  const t = ref(on() ? 1 : 0)
  let raf = 0
  watch(on, (v) => {
    cancelAnimationFrame(raf)
    const from = t.value
    const to = v ? 1 : 0
    const t0 = performance.now()
    const run = (now: number) => {
      const u = Math.min(1, (now - t0) / 900)
      t.value = from + (to - from) * (u * u * (3 - 2 * u))
      if (u < 1)
        raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
  })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return t
}
const t1 = tween(() => stage.value >= 3)
const t2 = tween(() => stage.value >= 4)

// ------------------------------------------------------------------ 3D side

const S0 = 0.55
const flat: Mesh = { v: [[-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1]], f: [[0, 2, 1], [0, 3, 2]] }
const split1 = midpointSplit(flat)
const n0 = flat.v.length
const n1 = split1.v.length

/** round 1: the new vertices move by at most S0 */
const level1 = computed<Mesh>(() => ({
  v: split1.v.map((p, i): V3 => (i < n0 ? p : [p[0], p[1] + rand(i, 1) * S0 * t1.value, p[2]])),
  f: split1.f,
}))
/** round 2: split again, the newest vertices move by at most k * S0 */
const level2 = computed<Mesh>(() => {
  const s = midpointSplit(level1.value)
  return {
    v: s.v.map((p, i): V3 => (i < n1 ? p : [p[0], p[1] + rand(i, 2) * S0 * props.k * t2.value, p[2]])),
    f: s.f,
  }
})

const mesh = computed(() => (stage.value >= 4 ? level2.value : stage.value >= 2 ? level1.value : flat))
const layers = computed<MeshLayer[]>(() => [{ mesh: mesh.value, color: '#6aaa64' }])

const OLD = '#1e3a8a'
const NEW = '#f97316'
const points = computed<Point3D[]>(() => {
  const lift = (p: V3): V3 => [p[0], p[1] + 0.02, p[2]]
  if (stage.value >= 4)
    return level2.value.v.map((p, i) => ({ p: lift(p), color: i < n1 ? OLD : NEW, r: i < n1 ? 4.5 : 4 }))
  const out: Point3D[] = flat.v.map(p => ({ p: lift(p), color: OLD, r: 5 }))
  if (stage.value >= 1) {
    for (let i = n0; i < n1; i++)
      out.push({ p: lift(level1.value.v[i]), color: NEW, r: 5 })
  }
  return out
})

// ----------------------------------------------------------------- side view

const W = 300
const Y = 160
const AX = 40
const BX = 260
const MX = (AX + BX) / 2
const RANGE = 85
const m = computed(() => Y - rand(1, 7) * RANGE * 0.85 * t1.value)
const q = computed(() => [0, 1].map((i) => {
  const x = i ? (MX + BX) / 2 : (AX + MX) / 2
  const base = (Y + m.value) / 2
  return { x, base, y: base - rand(2 + i, 7) * RANGE * props.k * 0.85 * t2.value }
}))
const profile = computed(() => {
  const pts = stage.value >= 4
    ? [[AX, Y], [q.value[0].x, q.value[0].y], [MX, m.value], [q.value[1].x, q.value[1].y], [BX, Y]]
    : stage.value >= 3 ? [[AX, Y], [MX, m.value], [BX, Y]] : [[AX, Y], [BX, Y]]
  return pts.map(p => p.join(',')).join(' ')
})

const captions = [
  ['一開始：一塊平的正方形，2 個 triangles', '從側面看一條 edge：平的'],
  ['每條 edge 的中點插入一個新 vertex（橘色）', '中點在 edge 上，高度還沒變'],
  ['連接新的 vertices：每個 triangle 變成 4 個', '還是平的，只是面變多'],
  ['新的 vertices 隨機往上或往下推', '推多少是隨機的，但不會超過 ±s'],
  ['下一輪：再切一次，再隨機推', '這一輪最多只能推 ±k·s，起伏比較小'],
]
const steps = ['原本', '1 插入中點', '2 切成 4 個', '3 隨機上下推', '下一輪：幅度 × k']
</script>

<template>
  <div class="terrain-step">
    <div class="steps">
      <span v-for="(s, i) in steps" :key="i" class="step" :class="{ on: i === stage, done: i < stage }">{{ s }}</span>
    </div>
    <div class="row">
      <div class="demo" :style="{ width: `${size + 80}px` }">
        <Mesh3D :layers="layers" :points="points" :width="size + 40" :height="size - 30" :yaw="0.5" :pitch="0.5" :zoom="0.82" />
        <div class="demo-note">
          {{ captions[stage][0] }}
        </div>
      </div>
      <div class="demo" :style="{ width: `${size + 80}px` }">
        <svg :width="size" :height="size - 30" :viewBox="`0 15 ${W} ${W - 30}`">
          <line :x1="AX" :y1="Y" :x2="BX" :y2="Y" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4" />
          <!-- how far the midpoint may move in round 1 -->
          <g v-if="stage >= 3" :opacity="stage >= 4 ? 0.35 : 1">
            <line :x1="MX" :y1="Y - RANGE" :x2="MX" :y2="Y + RANGE" stroke="#f97316" stroke-width="2" />
            <line :x1="MX - 9" :y1="Y - RANGE" :x2="MX + 9" :y2="Y - RANGE" stroke="#f97316" stroke-width="2" />
            <line :x1="MX - 9" :y1="Y + RANGE" :x2="MX + 9" :y2="Y + RANGE" stroke="#f97316" stroke-width="2" />
            <text :x="MX + 14" :y="Y + RANGE + 4" class="lbl new">±s</text>
          </g>
          <!-- and in round 2 -->
          <template v-if="stage >= 4">
            <g v-for="(p, i) in q" :key="i">
              <line :x1="p.x" :y1="p.base - RANGE * k" :x2="p.x" :y2="p.base + RANGE * k" stroke="#f97316" stroke-width="2" />
              <line :x1="p.x - 7" :y1="p.base - RANGE * k" :x2="p.x + 7" :y2="p.base - RANGE * k" stroke="#f97316" stroke-width="2" />
              <line :x1="p.x - 7" :y1="p.base + RANGE * k" :x2="p.x + 7" :y2="p.base + RANGE * k" stroke="#f97316" stroke-width="2" />
            </g>
            <text :x="q[1].x + 12" :y="q[1].base + RANGE * k + 4" class="lbl new">±k·s</text>
          </template>
          <polyline :points="profile" fill="none" stroke="#3f7d3a" stroke-width="3.5" stroke-linejoin="round" />
          <circle :cx="AX" :cy="Y" r="7" :fill="OLD" />
          <circle :cx="BX" :cy="Y" r="7" :fill="OLD" />
          <circle v-if="stage >= 1" :cx="MX" :cy="m" r="8" :fill="stage >= 4 ? OLD : NEW" stroke="#fff" stroke-width="2" />
          <template v-if="stage >= 4">
            <circle v-for="(p, i) in q" :key="`q${i}`" :cx="p.x" :cy="p.y" r="7" :fill="NEW" stroke="#fff" stroke-width="2" />
          </template>
        </svg>
        <div class="demo-note">
          {{ captions[stage][1] }}
        </div>
      </div>
    </div>
    <button class="chip again" :class="{ hidden: stage < 3 }" @click="seed++">
      換一組亂數
    </button>
  </div>
</template>

<style scoped>
.terrain-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.steps {
  display: flex;
  gap: 10px;
}
.step {
  padding: 2px 14px;
  border: 1px solid #94a3b8;
  border-radius: 999px;
  font-size: 16px;
  opacity: 0.45;
  transition: all 0.3s ease;
}
.step.done {
  opacity: 0.8;
}
.step.on {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  opacity: 1;
}
.row {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.lbl {
  font-size: 16px;
}
.lbl.new {
  fill: #c2410c;
  font-weight: 600;
}
.demo-note {
  font-size: 16px;
  opacity: 0.85;
}
.again {
  padding: 2px 12px;
  border: 1px solid #94a3b8;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
}
.again.hidden {
  visibility: hidden;
}
</style>

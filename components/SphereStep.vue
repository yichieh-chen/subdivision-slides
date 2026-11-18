<script setup lang="ts">
import type { V3 } from '../lib/mesh'
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { add, len, midpointSplit, mul, shapes, sub } from '../lib/mesh'

/**
 * One round of sphere subdivision, one step at a time:
 *   0  the octahedron
 *   1  a new vertex at the midpoint of every edge
 *   2  connect them: every triangle becomes four
 *   3  push the new vertices out onto the sphere
 * Left: the whole mesh in 3D. Right: a cut through the centre and one edge.
 */
const props = withDefaults(defineProps<{ step?: number, size?: number }>(), { step: 0, size: 300 })

const stage = computed(() => Math.max(0, Math.min(3, props.step)))

// ------------------------------------------------------------------ 3D side

const base = shapes.octahedron()
const split = midpointSplit(base)
const nOld = base.v.length
const YAW = 0.6
const PITCH = 0.42
const ZOOM = 0.9

/** the face that looks most directly at the viewer */
const HI = (() => {
  const depth = (p: V3) => p[1] * Math.sin(PITCH) + (-p[0] * Math.sin(YAW) + p[2] * Math.cos(YAW)) * Math.cos(PITCH)
  let best = 0
  let bestZ = -Infinity
  base.f.forEach((f, i) => {
    const z = f.reduce((s, j) => s + depth(base.v[j]), 0)
    if (z > bestZ) {
      bestZ = z
      best = i
    }
  })
  return best
})()

// how far the new vertices have been pushed out: 0 = midpoint, 1 = on the sphere
const t = ref(stage.value >= 3 ? 1 : 0)
let raf = 0
watch(stage, (s) => {
  cancelAnimationFrame(raf)
  const from = t.value
  const to = s >= 3 ? 1 : 0
  if (from === to)
    return
  const t0 = performance.now()
  const run = (now: number) => {
    const k = Math.min(1, (now - t0) / 900)
    t.value = from + (to - from) * (k * k * (3 - 2 * k))
    if (k < 1)
      raf = requestAnimationFrame(run)
  }
  raf = requestAnimationFrame(run)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

const pushed = computed<V3[]>(() => split.v.map((p, i) => {
  if (i < nOld)
    return p
  return add(p, mul(sub(mul(p, 1 / len(p)), p), t.value))
}))

const BLUE = '#5b8def'
const LIGHT = '#bfdbfe'
const layers = computed<MeshLayer[]>(() => {
  if (stage.value < 2)
    return [{ mesh: base, faceColors: base.f.map((_, i) => (i === HI ? LIGHT : BLUE)) }]
  return [{
    mesh: { v: pushed.value, f: split.f },
    faceColors: split.f.map((_, i) => (Math.floor(i / 4) === HI ? (i % 4 === 3 ? '#fdba74' : LIGHT) : BLUE)),
  }]
})
const points = computed<Point3D[]>(() => {
  const out: Point3D[] = base.v.map(p => ({ p: mul(p, 1.01), color: '#1e3a8a', r: 5 }))
  if (stage.value >= 1) {
    for (let i = nOld; i < split.v.length; i++)
      out.push({ p: mul(pushed.value[i], 1.01), color: '#f97316', r: 5 })
  }
  return out
})

// silhouette of the unit sphere under Mesh3D's perspective (camera distance 4.2)
const ring = computed(() => props.size * 0.43 * ZOOM * (4.2 / Math.sqrt(4.2 * 4.2 - 1)) * 2)

// ------------------------------------------------------------- cut-away side

const W = 300
const O: [number, number] = [140, 158]
const R = 118
const A: [number, number] = [O[0], O[1] - R]
const B: [number, number] = [O[0] + R, O[1]]
const M = computed<[number, number]>(() => {
  const r = R * (Math.SQRT1_2 + (1 - Math.SQRT1_2) * t.value)
  return [O[0] + r * Math.SQRT1_2, O[1] - r * Math.SQRT1_2]
})
const ON: [number, number] = [O[0] + R * Math.SQRT1_2, O[1] - R * Math.SQRT1_2]

const captions = [
  ['原本的 octahedron：6 個 vertices 都在球面上', '切開來看：一條 edge 是球裡面的一條直線'],
  ['每條 edge 的中點插入一個新 vertex（橘色）', '中點在直線上，所以在球的裡面'],
  ['連接新的 vertices：每個 triangle 變成 4 個', '形狀完全沒變，只是面變多'],
  ['新的 vertices 被推到球面上，表面鼓起來', '從球心往外推，直到碰到球面'],
]
const steps = ['原本', '1 插入中點', '2 切成 4 個', '3 往外推']
</script>

<template>
  <div class="sphere-step">
    <div class="steps">
      <span v-for="(s, i) in steps" :key="i" class="step" :class="{ on: i === stage, done: i < stage }">{{ s }}</span>
    </div>
    <div class="row">
      <div class="demo" :style="{ width: `${size + 60}px` }">
        <div class="stage" :style="{ width: `${size}px`, height: `${size}px` }">
          <Mesh3D
            :layers="layers" :points="points" :width="size" :height="size"
            :yaw="YAW" :pitch="PITCH" :zoom="ZOOM" front-points
          />
          <div class="ghost" :style="{ width: `${ring}px`, height: `${ring}px` }" />
        </div>
        <div class="demo-note">
          {{ captions[stage][0] }}
        </div>
      </div>
      <div class="demo" :style="{ width: `${size + 60}px` }">
        <svg :width="size" :height="size" :viewBox="`0 0 ${W} ${W}`">
          <circle :cx="O[0]" :cy="O[1]" :r="R" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4" />
          <text :x="O[0] - R * 0.62" :y="O[1] - R * 0.86" class="lbl" fill="#64748b">球面</text>
          <circle :cx="O[0]" :cy="O[1]" r="3.5" fill="#64748b" />
          <text :x="O[0] - 8" :y="O[1] + 20" text-anchor="end" class="lbl" fill="#64748b">球心</text>
          <!-- the original edge -->
          <line
            :x1="A[0]" :y1="A[1]" :x2="B[0]" :y2="B[1]"
            :stroke="stage >= 3 ? '#94a3b8' : '#1e3a8a'" :stroke-width="stage >= 3 ? 1.5 : 3"
            :stroke-dasharray="stage >= 3 ? '5 4' : undefined"
          />
          <template v-if="stage >= 3">
            <line :x1="O[0]" :y1="O[1]" :x2="ON[0]" :y2="ON[1]" stroke="#f97316" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" />
            <polyline :points="`${A.join(',')} ${M.join(',')} ${B.join(',')}`" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linejoin="round" />
          </template>
          <circle :cx="A[0]" :cy="A[1]" r="7" fill="#1e3a8a" />
          <circle :cx="B[0]" :cy="B[1]" r="7" fill="#1e3a8a" />
          <template v-if="stage >= 1">
            <circle :cx="M[0]" :cy="M[1]" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
            <text :x="M[0] + 14" :y="M[1] - 10" class="lbl new">新 vertex</text>
          </template>
        </svg>
        <div class="demo-note">
          {{ captions[stage][1] }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sphere-step {
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
  gap: 30px;
}
.stage {
  position: relative;
}
.ghost {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1.5px dashed #94a3b8;
  border-radius: 50%;
  pointer-events: none;
}
.lbl {
  font-size: 14px;
}
.lbl.new {
  fill: #c2410c;
  font-weight: 600;
}
.demo-note {
  font-size: 16px;
  opacity: 0.85;
}
</style>

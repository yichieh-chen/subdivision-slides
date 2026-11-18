<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed, ref, watch } from 'vue'
import { add, catmullClark, len, mul, normalize, shapes, sub, voxels } from '../lib/mesh'

/**
 * Pull one control point of a coarse mesh and watch the subdivided surface follow.
 * With `highlight`, the part of the surface that actually moved is tinted,
 * which shows that a control point only has local influence.
 */
const props = withDefaults(defineProps<{
  shape?: 'cube' | 'bar'
  /** tint the faces that moved */
  highlight?: boolean
  level?: number
  pull?: number
  width?: number
  height?: number
}>(), {
  shape: 'cube',
  highlight: false,
  level: 3,
  pull: 0,
  width: 400,
  height: 310,
})

const BLUE: V3 = [91, 141, 239]
const ORANGE: V3 = [249, 115, 22]
const MAX_PULL = 0.8

const pull = ref(props.pull)
const showHighlight = ref(props.highlight)
watch(() => props.pull, v => (pull.value = v))
watch(() => props.highlight, v => (showHighlight.value = v))

const base = computed<Mesh>(() =>
  normalize(props.shape === 'bar' ? voxels([[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0]]) : shapes.cube()),
)

/** the corner with the largest x + y + z */
const target = computed(() => {
  let best = 0
  base.value.v.forEach((p, i) => {
    const q = base.value.v[best]
    if (p[0] + p[1] + p[2] > q[0] + q[1] + q[2])
      best = i
  })
  return best
})

const pulled = computed<Mesh>(() => {
  const dir: V3 = props.shape === 'bar' ? [0.35, 0.9, 0.25] : [0.577, 0.577, 0.577]
  const v = base.value.v.map((p, i) => (i === target.value ? add(p, mul(dir, pull.value)) : p))
  return { v, f: base.value.f }
})

function subdivide(m: Mesh) {
  for (let i = 0; i < props.level; i++)
    m = catmullClark(m)
  return m
}
// Catmull-Clark keeps vertex order independent of positions, so the two results line up index by index.
const rest = computed(() => subdivide(base.value))
const surface = computed(() => subdivide(pulled.value))

const toHex = (c: V3) => `#${c.map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`

const moved = computed(() => surface.value.v.map((p, i) => len(sub(p, rest.value.v[i]))))

const faceColors = computed(() => {
  const top = Math.max(...moved.value)
  return surface.value.f.map((f) => {
    if (!showHighlight.value || top < 1e-6)
      return toHex(BLUE)
    const d = f.reduce((s, i) => s + moved.value[i], 0) / f.length
    // anything that moved at all is clearly tinted; untouched faces stay blue
    const t = d < 1e-6 ? 0 : 0.35 + 0.65 * Math.sqrt(d / top)
    return toHex(add(mul(BLUE, 1 - t), mul(ORANGE, t)))
  })
})

const movedShare = computed(() => {
  const n = surface.value.f.filter(f => f.some(i => moved.value[i] > 1e-6)).length
  return Math.round((n / surface.value.f.length) * 100)
})

const layers = computed<MeshLayer[]>(() => [
  { mesh: surface.value, faceColors: faceColors.value },
  { mesh: pulled.value, wire: true, color: '#0f172a' },
])

const points = computed<Point3D[]>(() =>
  pulled.value.v.map((p, i) => (i === target.value
    ? { p, color: '#f97316', r: 7 }
    : { p, color: '#ef4444', r: 4 })),
)
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <Mesh3D :layers="layers" :points="points" :width="width" :height="height" :zoom="shape === 'bar' ? 1.05 : 0.8" :yaw="0.5" :pitch="0.35" />
    <div class="demo-row">
      <label class="slider">
        <span class="pull-label"><b class="dot" /> 往外拉</span>
        <input v-model.number="pull" type="range" min="0" :max="MAX_PULL" step="0.02">
      </label>
      <label class="check"><input v-model="showHighlight" type="checkbox"> 標出有動的地方</label>
    </div>
    <div class="demo-note">
      <template v-if="showHighlight && pull > 0">
        只有 {{ movedShare }}% 的表面有動 · 拖曳可旋轉
      </template>
      <template v-else>
        虛線是 control mesh，紅點是 control points · 拖曳可旋轉
      </template>
    </div>
  </div>
</template>

<style scoped>
.demo .slider span.pull-label {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f97316;
}
</style>

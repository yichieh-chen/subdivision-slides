<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { add, avg, buildEdges, catmullClark, cross, mul, normalize, shapes, sub } from '../lib/mesh'

/**
 * The same shape built two ways.
 *   left   a patchwork: one patch per face of the control mesh, each with its own colour
 *   right  one subdivision surface
 * step 0 shows both, step 1 edits each one in the same place:
 * the patch comes away from its neighbours (a crack), the subdivision surface just follows.
 *
 * The left side is an illustration, not a real NURBS evaluation: away from the corners
 * the Catmull-Clark limit surface is exactly a set of bicubic B-spline patches, so we
 * reuse it and only colour and move it per patch.
 */
const props = withDefaults(defineProps<{ step?: number, width?: number, height?: number, level?: number }>(), {
  step: 0,
  width: 400,
  height: 250,
  level: 3,
})

const base = normalize(shapes.double())
const refine = (m: Mesh) => {
  let out = m
  for (let i = 0; i < props.level; i++)
    out = catmullClark(out)
  return out
}
const smooth = refine(base)
/** every control face turns into this many small faces, kept in order */
const PER = 4 ** props.level

// ---- the patch (and the control point) that gets edited: front face, middle of the top bar
const centre = (f: number[]) => avg(f.map(i => base.v[i]))
const normalOf = (f: number[]) => cross(sub(base.v[f[1]], base.v[f[0]]), sub(base.v[f[2]], base.v[f[0]]))
const PICK = base.f.reduce((best, f, i) => {
  const score = (g: number[]) => (normalOf(g)[2] > 0 ? 0 : 100) + Math.abs(centre(g)[0]) - centre(g)[1]
  return score(f) < score(base.f[best]) ? i : best
}, 0)
/** the corner of that patch which is pulled on the subdivision side */
const PULL = base.f[PICK].reduce((a, b) => (base.v[b][0] + base.v[b][1] > base.v[a][0] + base.v[a][1] ? b : a))
const AMOUNT = 0.3

// ---- one colour per patch, never the same as a neighbour
const PALETTE = ['#93c5fd', '#fdba74', '#86efac', '#fde047', '#c4b5fd', '#f9a8d4', '#5eead4']
const patchColor = (() => {
  const near: number[][] = base.f.map(() => [])
  for (const e of buildEdges(base).values()) {
    if (e.faces.length === 2) {
      near[e.faces[0]].push(e.faces[1])
      near[e.faces[1]].push(e.faces[0])
    }
  }
  const out: number[] = []
  base.f.forEach((_, i) => {
    const used = new Set(near[i].map(j => out[j]))
    let c = i % PALETTE.length
    while (used.has(c))
      c = (c + 1) % PALETTE.length
    out[i] = c
  })
  return out.map(c => PALETTE[c])
})()
const faceColors = smooth.f.map((_, i) => patchColor[Math.floor(i / PER)])

// ---- animation
const t = ref(props.step >= 1 ? 1 : 0)
let raf = 0
watch(() => props.step >= 1, (on) => {
  cancelAnimationFrame(raf)
  const from = t.value
  const to = on ? 1 : 0
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

// ---- left: the picked patch gets its own copy of its vertices and moves alone
const patchFaces = smooth.f.slice(PICK * PER, (PICK + 1) * PER)
const patchVerts = [...new Set(patchFaces.flat())]
const patchCentre = avg(patchVerts.map(i => smooth.v[i]))
const patched = computed<Mesh>(() => {
  if (t.value === 0)
    return smooth
  const n = smooth.v.length
  const slot = new Map(patchVerts.map((v, i) => [v, n + i]))
  const moved = patchVerts.map((i): V3 => {
    const p = smooth.v[i]
    // lifted towards the viewer and slightly smaller, so that it no longer meets its neighbours
    const q = add(patchCentre, mul(sub(p, patchCentre), 1 - 0.1 * t.value))
    return [q[0], q[1], q[2] + AMOUNT * 0.6 * t.value]
  })
  const f = smooth.f.map((face, i) => (Math.floor(i / PER) === PICK ? face.map(j => slot.get(j)!) : face))
  return { v: [...smooth.v, ...moved], f }
})
const leftLayers = computed<MeshLayer[]>(() => [{ mesh: patched.value, faceColors, edges: false, backColor: '#7f1d1d' }])

// ---- right: move one control point and subdivide again
const cage = computed<Mesh>(() => {
  if (t.value === 0)
    return base
  return { v: base.v.map((p, i): V3 => (i === PULL ? [p[0], p[1], p[2] + AMOUNT * 1.6 * t.value] : p)), f: base.f }
})
const surface = computed(() => (t.value === 0 ? smooth : refine(cage.value)))
const rightLayers = computed<MeshLayer[]>(() => [
  { mesh: surface.value, color: '#5b8def', edges: false },
  { mesh: cage.value, wire: true, color: '#0f172a' },
])
const rightPoints = computed<Point3D[]>(() => (props.step >= 1 ? [{ p: cage.value.v[PULL], color: '#ef4444', r: 6 }] : []))

const captions = [
  ['要拆成很多塊 patch 再拼起來（一塊一個顏色）', `整個形狀只有 1 個 control mesh（虛線）`],
  ['只調其中一塊：邊界對不上，出現裂縫（crack）', '拉一個 control point：周圍一起動，沒有接縫'],
]
const stage = computed(() => (props.step >= 1 ? 1 : 0))
</script>

<template>
  <div class="patch-compare">
    <div class="demo" :style="{ width: `${width}px` }">
      <div class="demo-title">
        NURBS / Bézier patches
      </div>
      <Mesh3D :layers="leftLayers" :width="width" :height="height" :yaw="0.55" :pitch="0.4" :zoom="1.5" />
      <div class="caption" :class="{ bad: stage === 1 }">
        {{ captions[stage][0] }}
      </div>
    </div>
    <div class="demo" :style="{ width: `${width}px` }">
      <div class="demo-title">
        Subdivision surface
      </div>
      <Mesh3D :layers="rightLayers" :points="rightPoints" :width="width" :height="height" :yaw="0.55" :pitch="0.4" :zoom="1.5" />
      <div class="caption" :class="{ good: stage === 1 }">
        {{ captions[stage][1] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.patch-compare {
  display: flex;
  justify-content: center;
  gap: 24px;
}
.caption {
  font-size: 16px;
  text-align: center;
  min-height: 1.6em;
}
.caption.bad {
  color: #b91c1c;
  font-weight: 600;
}
.caption.good {
  color: #15803d;
  font-weight: 600;
}
</style>

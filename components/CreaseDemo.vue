<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer, Segment3D } from './Mesh3D.vue'
import { computed } from 'vue'
import { add, avg, buildEdges, edgeKey, mul, normalize, shapes } from '../lib/mesh'

/**
 * Catmull-Clark on a cube whose four top edges are marked as creases (drawn in red).
 * `sharp` is how many rounds use the hard-edge rules before the regular rules take over:
 *   0            no crease at all, the whole cube turns round
 *   1, 2, ...    semi-hard edge
 *   99           hard edge
 * Hard-edge rules: vertices on a crease do not move, crease edge points sit at the midpoint.
 */
const props = withDefaults(defineProps<{
  sharp?: number
  level?: number
  maxLevel?: number
  title?: string
  width?: number
  height?: number
  zoom?: number
  autoRotate?: boolean
}>(), { sharp: 99, level: 3, maxLevel: 4, width: 280, height: 230, zoom: 1.15, autoRotate: true })

interface Creased { mesh: Mesh, crease: Set<string> }

function step({ mesh: m, crease }: Creased, hard: boolean): Creased {
  const edges = buildEdges(m)
  const nV = m.v.length
  const nF = m.f.length
  const facePoints = m.f.map(f => avg(f.map(i => m.v[i])))
  const edgePoints: V3[] = []
  const mids: V3[][] = m.v.map(() => [])
  const onCrease = m.v.map(() => false)
  const next = new Set<string>()
  for (const [key, e] of edges) {
    const mid = avg([m.v[e.a], m.v[e.b]])
    mids[e.a].push(mid)
    mids[e.b].push(mid)
    const marked = crease.has(key)
    edgePoints[e.index] = hard && marked ? mid : avg([m.v[e.a], m.v[e.b], ...e.faces.map(i => facePoints[i])])
    if (marked) {
      onCrease[e.a] = onCrease[e.b] = true
      // both halves of a crease edge stay creases
      next.add(edgeKey(e.a, nV + nF + e.index))
      next.add(edgeKey(e.b, nV + nF + e.index))
    }
  }
  const vFaces: number[][] = m.v.map(() => [])
  m.f.forEach((f, fi) => f.forEach(i => vFaces[i].push(fi)))
  const vertexPoints = m.v.map((p, i) => {
    if (hard && onCrease[i])
      return p
    const n = mids[i].length
    const F = avg(vFaces[i].map(fi => facePoints[fi]))
    const R = avg(mids[i])
    return mul(add(add(F, mul(R, 2)), mul(p, n - 3)), 1 / n)
  })
  const f: number[][] = []
  m.f.forEach((face, fi) => {
    const n = face.length
    for (let i = 0; i < n; i++) {
      const prev = face[(i + n - 1) % n]
      const cur = face[i]
      const nxt = face[(i + 1) % n]
      f.push([cur, nV + nF + edges.get(edgeKey(cur, nxt))!.index, nV + fi, nV + nF + edges.get(edgeKey(prev, cur))!.index])
    }
  })
  return { mesh: { v: [...vertexPoints, ...facePoints, ...edgePoints], f }, crease: next }
}

const cube = normalize(shapes.cube())
const top = new Set<string>()
for (const [key, e] of buildEdges(cube)) {
  if (cube.v[e.a][1] > 0 && cube.v[e.b][1] > 0)
    top.add(key)
}

const levels = computed<Creased[]>(() => {
  const out: Creased[] = [{ mesh: cube, crease: top }]
  for (let i = 0; i < props.maxLevel; i++)
    out.push(step(out[i], i < props.sharp))
  return out
})
const current = computed(() => levels.value[Math.max(0, Math.min(props.level, props.maxLevel))])

const layers = computed<MeshLayer[]>(() => {
  const out: MeshLayer[] = [{ mesh: current.value.mesh, color: '#5b8def' }]
  if (props.level > 0)
    out.push({ mesh: cube, wire: true, color: '#0f172a' })
  return out
})

const segments = computed<Segment3D[]>(() => {
  const { mesh, crease } = current.value
  const lift = (p: V3): V3 => mul(p, 1.01)
  return [...crease].map((key) => {
    const [a, b] = key.split('_').map(Number)
    return { a: lift(mesh.v[a]), b: lift(mesh.v[b]), color: '#dc2626', width: 3.5 }
  })
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <div v-if="title" class="demo-title">
      {{ title }}
    </div>
    <Mesh3D :layers="layers" :segments="segments" :width="width" :height="height" :zoom="zoom" :auto-rotate="autoRotate" />
  </div>
</template>

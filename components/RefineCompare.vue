<script setup lang="ts">
import type { Mesh } from '../lib/mesh'
import type { MeshLayer } from './Mesh3D.vue'
import { computed } from 'vue'
import { avg, buildEdges, catmullClark, edgeKey, normalize, shapes } from '../lib/mesh'

/**
 * The same cube split the same number of times, with and without moving the vertices.
 * Both sides always have identical topology; only the right side changes shape.
 */
const props = withDefaults(defineProps<{
  /** how many times to subdivide */
  step?: number
  maxStep?: number
  width?: number
  height?: number
}>(), { step: 0, maxStep: 3, width: 330, height: 250 })

/** Catmull-Clark's split (every face becomes quads) without moving anything. */
function splitOnly(m: Mesh): Mesh {
  const edges = buildEdges(m)
  const nV = m.v.length
  const nF = m.f.length
  const facePoints = m.f.map(f => avg(f.map(i => m.v[i])))
  const edgePoints = [...edges.values()].map(e => avg([m.v[e.a], m.v[e.b]]))
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
  return { v: [...m.v, ...facePoints, ...edgePoints], f }
}

const level = computed(() => Math.max(0, Math.min(props.step, props.maxStep)))
const base = normalize(shapes.cube())

function run(step: (m: Mesh) => Mesh) {
  let m = base
  for (let i = 0; i < level.value; i++)
    m = step(m)
  return m
}
const refined = computed(() => run(splitOnly))
const smoothed = computed(() => run(catmullClark))

const left = computed<MeshLayer[]>(() => [{ mesh: refined.value, color: '#e2725b' }])
const right = computed<MeshLayer[]>(() => [{ mesh: smoothed.value, color: '#5b8def' }])
</script>

<template>
  <div class="compare">
    <div class="row">
      <div class="demo" :style="{ width: `${width}px` }">
        <div class="demo-title">
          只有 Refine
        </div>
        <Mesh3D :layers="left" :width="width" :height="height" :zoom="0.85" auto-rotate />
        <div class="demo-note">
          {{ level === 0 ? '原本的 cube' : '還是方塊，只是格子變多' }}
        </div>
      </div>
      <div class="demo" :style="{ width: `${width}px` }">
        <div class="demo-title">
          Refine + Smooth
        </div>
        <Mesh3D :layers="right" :width="width" :height="height" :zoom="0.85" auto-rotate />
        <div class="demo-note">
          {{ level === 0 ? '原本的 cube' : '越切越圓' }}
        </div>
      </div>
    </div>
    <div class="count">
      切了 <b>{{ level }}</b> 次：兩邊都是 <b>{{ refined.v.length }}</b> 個 vertices、<b>{{ refined.f.length }}</b> 個 faces
    </div>
  </div>
</template>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 70px;
}
.demo-title {
  font-size: 19px;
}
.demo-note {
  font-size: 16px;
  opacity: 0.85;
}
.count {
  font-size: 20px;
}
</style>

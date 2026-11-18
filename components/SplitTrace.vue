<script setup lang="ts">
import { computed } from 'vue'

/**
 * What each part of Split_One_Level does, on two triangles that share an edge:
 *   0  the input mesh
 *   1  copy old vertices
 *   2  for each edge: a new vertex, and the edge becomes two
 *   3  for each face: new edges inside, four new faces
 *   4  the output mesh
 *   5  what the data structure has to answer for one edge
 */
const props = withDefaults(defineProps<{ step?: number, width?: number }>(), { step: 0, width: 400 })

type P = [number, number]
const W = 400
const H = 310

const V: P[] = [[35, 250], [235, 280], [150, 55], [365, 105]]
const TRIS = [[0, 1, 2], [1, 3, 2]]
const EDGES = [[0, 1], [1, 2], [2, 0], [1, 3], [3, 2]]
/** the edge both triangles share */
const SHARED = 1

const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const M = EDGES.map(([a, b]) => mid(V[a], V[b]))
const edgeOf = (a: number, b: number) => EDGES.findIndex(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))

const pts = (ps: P[]) => ps.map(p => p.join(',')).join(' ')

/** the four pieces of every triangle: three corners, then the middle */
const pieces = TRIS.flatMap(([a, b, c]) => {
  const ab = M[edgeOf(a, b)]
  const bc = M[edgeOf(b, c)]
  const ca = M[edgeOf(c, a)]
  return [[V[a], ab, ca], [V[b], bc, ab], [V[c], ca, bc], [ab, bc, ca]].map((p, i) => ({ p: pts(p as P[]), i }))
})
/** the three new edges inside every triangle */
const inner = TRIS.flatMap(([a, b, c]) => {
  const ab = M[edgeOf(a, b)]
  const bc = M[edgeOf(b, c)]
  const ca = M[edgeOf(c, a)]
  return [[ab, bc], [bc, ca], [ca, ab]]
})
/** every old edge as its two halves */
const halves = EDGES.flatMap(([a, b], i) => [[V[a], M[i]], [M[i], V[b]]])

const stage = computed(() => Math.max(0, Math.min(5, props.step)))
/** one hue per original face: [corner pieces, middle piece] */
const TINT = [['#bbf7d0', '#6ee7a0'], ['#ddd6fe', '#b7a4fb']]

const captions = [
  '輸入的 mesh：4 個 vertices、5 條 edges、2 個 faces',
  '舊的 vertices 原封不動搬過來',
  '每條 edge：1 個新 vertex，1 條 edge 變 2 條',
  '每個 face：裡面連 3 條新 edge，變成 4 個 faces',
  '輸出的 mesh：9 個 vertices、16 條 edges、8 個 faces',
  '給一條 edge，要馬上找到它的 2 個端點和兩邊的 faces',
]
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <svg :width="width" :height="(H * width) / W" :viewBox="`0 0 ${W} ${H}`">
      <!-- faces -->
      <template v-if="stage <= 2 || stage === 5">
        <polygon
          v-for="(t, i) in TRIS" :key="`t${i}`" class="fade" :points="pts(t.map(j => V[j]))"
          :fill="stage === 5 ? (i ? '#ddd6fe' : '#bbf7d0') : '#dbeafe'" :opacity="stage === 1 ? 0.3 : 1"
        />
      </template>
      <template v-else>
        <polygon
          v-for="(q, i) in pieces" :key="`q${i}`" class="fade" :points="q.p"
          :fill="stage === 3 ? TINT[Math.floor(i / 4)][q.i === 3 ? 1 : 0] : '#dbeafe'"
        />
      </template>

      <!-- old edges, whole or as two halves -->
      <template v-if="stage <= 1 || stage === 5">
        <line
          v-for="(e, i) in EDGES" :key="`e${i}`" class="fade"
          :x1="V[e[0]][0]" :y1="V[e[0]][1]" :x2="V[e[1]][0]" :y2="V[e[1]][1]"
          :stroke="stage === 5 && i === SHARED ? '#f97316' : '#1e3a8a'"
          :stroke-width="stage === 5 && i === SHARED ? 6 : 2.5"
          :opacity="stage === 1 ? 0.2 : 1" stroke-linecap="round"
        />
      </template>
      <template v-else>
        <line
          v-for="(h, i) in halves" :key="`h${i}`" class="fade"
          :x1="h[0][0]" :y1="h[0][1]" :x2="h[1][0]" :y2="h[1][1]"
          :stroke="stage === 2 ? (i % 2 ? '#0ea5e9' : '#1e3a8a') : '#1e3a8a'"
          :stroke-width="stage === 2 ? 4 : 2.5" stroke-linecap="round"
        />
      </template>

      <!-- new edges inside the faces -->
      <template v-if="stage === 3 || stage === 4">
        <line
          v-for="(e, i) in inner" :key="`i${i}`" class="appear"
          :x1="e[0][0]" :y1="e[0][1]" :x2="e[1][0]" :y2="e[1][1]"
          :stroke="stage === 3 ? '#f97316' : '#1e3a8a'" :stroke-width="stage === 3 ? 4 : 2.5" stroke-linecap="round"
        />
      </template>

      <!-- vertices -->
      <g v-if="stage === 1" class="appear">
        <circle v-for="(p, i) in V" :key="`ring${i}`" :cx="p[0]" :cy="p[1]" r="15" fill="none" stroke="#1e3a8a" stroke-width="2" stroke-dasharray="3 3" />
      </g>
      <g v-if="stage === 5" class="appear">
        <circle v-for="i in EDGES[SHARED]" :key="`end${i}`" :cx="V[i][0]" :cy="V[i][1]" r="15" fill="none" stroke="#f97316" stroke-width="3" />
        <text :x="V[1][0] + 20" :y="V[1][1] + 8" class="lbl">端點</text>
        <text :x="V[2][0] - 20" :y="V[2][1] - 14" class="lbl" text-anchor="end">端點</text>
        <text x="130" y="205" class="lbl face" text-anchor="middle">face 1</text>
        <text x="262" y="150" class="lbl face" text-anchor="middle">face 2</text>
      </g>
      <circle v-for="(p, i) in V" :key="`v${i}`" :cx="p[0]" :cy="p[1]" r="7" fill="#1e3a8a" />
      <template v-if="stage >= 2 && stage <= 4">
        <circle
          v-for="(p, i) in M" :key="`m${i}`" class="appear" :cx="p[0]" :cy="p[1]"
          :r="stage === 2 ? 8 : 6.5" :fill="stage === 4 ? '#1e3a8a' : '#f97316'" stroke="#fff" :stroke-width="stage === 4 ? 0 : 2"
        />
      </template>
    </svg>
    <div class="demo-note">
      {{ captions[stage] }}
    </div>
  </div>
</template>

<style scoped>
.fade {
  transition: fill 0.4s ease, stroke 0.4s ease, opacity 0.4s ease, stroke-width 0.4s ease;
}
.appear {
  animation: appear 0.5s ease both;
}
@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
.lbl {
  font-size: 15px;
  font-weight: 600;
  fill: #c2410c;
}
.lbl.face {
  fill: #334155;
}
.demo-note {
  font-size: 16px;
  opacity: 0.9;
  min-height: 3em;
  text-align: center;
}
</style>

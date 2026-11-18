<script setup lang="ts">
import type { V3 } from '../lib/mesh'
import type { MeshLayer, Point3D, Segment3D } from './Mesh3D.vue'
import { computed } from 'vue'
import { add, buildEdges, edgeKey, len, mul, normalize, shapes, sphereSplit, triangulate } from '../lib/mesh'

/**
 * Which vertices a triangle scheme reads, marked on a real 3D mesh (an icosphere).
 *   butterfly    the edge being split, then a (step 1), b (step 2), c (step 3)
 *   loop-edge    the four vertices behind a Loop edge point, with their weights
 *   loop-vertex  a regular vertex and the six neighbours that pull it
 *   extra        an extraordinary vertex and the one ring the modified rule reads
 */
const props = withDefaults(defineProps<{
  mode?: 'butterfly' | 'loop-edge' | 'loop-vertex' | 'extra'
  step?: number
  width?: number
  height?: number
}>(), { mode: 'butterfly', step: 99, width: 400, height: 330 })

const BLUE = '#2563eb'
const GREEN = '#16a34a'
const RED = '#dc2626'
const PURPLE = '#7c3aed'
const ORANGE = '#f97316'

let mesh = triangulate(normalize(shapes.icosahedron()))
mesh = { v: mesh.v.map(p => mul(p, 1 / len(p))), f: mesh.f }
const nOriginal = mesh.v.length
mesh = sphereSplit(sphereSplit(mesh))

const edges = buildEdges(mesh)
const nb: number[][] = mesh.v.map(() => [])
for (const e of edges.values()) {
  nb[e.a].push(e.b)
  nb[e.b].push(e.a)
}
/** the vertex across edge (a, b) that is not `not` */
const across = (a: number, b: number, not: number) => edges.get(edgeKey(a, b))!.opp.find(i => i !== not)!
const onSphere = (p: V3): V3 => mul(p, 1 / len(p))
const lift = (p: V3): V3 => mul(p, 1.012)

// A regular edge: both ends and all eight butterfly vertices have nothing special about them.
const regular = [...edges.values()].find((e) => {
  const ring = [e.a, e.b, ...e.opp]
  return ring.every(i => nb[i].length === 6 && i >= nOriginal)
})!
const A = [regular.a, regular.b]
const B = regular.opp
const C = [across(A[0], B[0], A[1]), across(A[0], B[1], A[1]), across(A[1], B[0], A[0]), across(A[1], B[1], A[0])]

// An extraordinary vertex (one of the icosahedron's corners) and one of its edges.
const X = 0
const X0 = nb[X][0]

const focus = computed<V3>(() => {
  if (props.mode === 'extra')
    return onSphere(add(mul(mesh.v[X], 2), mesh.v[X0]))
  if (props.mode === 'loop-vertex')
    return mesh.v[A[0]]
  return onSphere(add(mesh.v[A[0]], mesh.v[A[1]]))
})
// turn the mesh so the marked vertices face the viewer, a little off-centre so it still reads as 3D
const yaw = computed(() => Math.atan2(-focus.value[0], focus.value[2]) + 0.16)
const pitch = computed(() => Math.atan2(focus.value[1], Math.hypot(focus.value[0], focus.value[2])) + 0.12)

const layers = computed<MeshLayer[]>(() => [{ mesh, color: '#e6edf7' }])

const dotAt = (i: number, color: string, label?: string, r = 9): Point3D => ({ p: lift(mesh.v[i]), color, r, label })

const points = computed<Point3D[]>(() => {
  const s = props.step
  if (props.mode === 'butterfly') {
    return [
      ...(s >= 3 ? C.map(i => dotAt(i, RED, 'c')) : []),
      ...(s >= 2 ? B.map(i => dotAt(i, GREEN, 'b')) : []),
      ...(s >= 1 ? A.map(i => dotAt(i, BLUE, 'a', 10)) : []),
      { p: lift(onSphere(add(mesh.v[A[0]], mesh.v[A[1]]))), color: ORANGE, r: 8, label: '新的點' },
    ]
  }
  if (props.mode === 'loop-edge') {
    return [
      ...B.map(i => dotAt(i, GREEN, '1/8')),
      ...A.map(i => dotAt(i, BLUE, '3/8', 10)),
      { p: lift(onSphere(add(mesh.v[A[0]], mesh.v[A[1]]))), color: ORANGE, r: 8, label: '新的點' },
    ]
  }
  if (props.mode === 'loop-vertex')
    return [...nb[A[0]].map(i => dotAt(i, BLUE, '1/16')), dotAt(A[0], PURPLE, '10/16', 11)]
  return [
    ...nb[X].map(i => dotAt(i, BLUE)),
    dotAt(X, RED, '奇異點', 11),
    { p: lift(onSphere(add(mesh.v[X], mesh.v[X0]))), color: ORANGE, r: 8, label: '新的點' },
  ]
})

const segments = computed<Segment3D[]>(() => {
  const seg = (i: number, j: number, color: string, width = 4): Segment3D => ({ a: lift(mesh.v[i]), b: lift(mesh.v[j]), color, width })
  if (props.mode === 'loop-vertex')
    return nb[A[0]].map(i => seg(A[0], i, PURPLE, 3))
  if (props.mode === 'extra')
    return [...nb[X].filter(i => i !== X0).map(i => seg(X, i, RED, 3)), seg(X, X0, ORANGE, 5)]
  return [seg(A[0], A[1], ORANGE, 5)]
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <Mesh3D
      :layers="layers" :points="points" :segments="segments" :width="width" :height="height"
      :yaw="yaw" :pitch="pitch" :zoom="1.6" front-points
    />
    <div class="demo-note">
      拖曳可旋轉
    </div>
  </div>
</template>

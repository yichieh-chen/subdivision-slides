<script setup lang="ts">
import type { MeshLayer } from './Mesh3D.vue'
import { buildEdges, catmullClark, normalize, shapes } from '../lib/mesh'

/**
 * The idea behind per-face texturing (Ptex): every face of the control mesh
 * owns one small texture, so the model never has to be unwrapped into one flat picture.
 * Shown here as one colour per control face, carried through the subdivision.
 */
const props = withDefaults(defineProps<{ shape?: string, width?: number, height?: number, level?: number }>(), {
  shape: 'tshape',
  width: 380,
  height: 250,
  level: 3,
})

const base = normalize(shapes[props.shape]())
let smooth = base
for (let i = 0; i < props.level; i++)
  smooth = catmullClark(smooth)
const PER = 4 ** props.level

const PALETTE = ['#93c5fd', '#fdba74', '#86efac', '#fde047', '#c4b5fd', '#f9a8d4', '#5eead4']
const near: number[][] = base.f.map(() => [])
for (const e of buildEdges(base).values()) {
  if (e.faces.length === 2) {
    near[e.faces[0]].push(e.faces[1])
    near[e.faces[1]].push(e.faces[0])
  }
}
const pick: number[] = []
base.f.forEach((_, i) => {
  const used = new Set(near[i].map(j => pick[j]))
  let c = i % PALETTE.length
  while (used.has(c))
    c = (c + 1) % PALETTE.length
  pick[i] = c
})
const layers: MeshLayer[] = [
  { mesh: smooth, faceColors: smooth.f.map((_, i) => PALETTE[pick[Math.floor(i / PER)]]), edges: false },
  { mesh: base, wire: true, color: '#0f172a' },
]
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <Mesh3D :layers="layers" :width="width" :height="height" :zoom="1.15" auto-rotate />
    <div class="demo-note">
      示意：control mesh（虛線）的每個 face 各有一張自己的小貼圖
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed } from 'vue'
import { catmullClarkDetail, normalize, shapes } from '../lib/mesh'

/** One Catmull-Clark iteration on a cube, revealed step by step with the slide's clicks. */
const props = withDefaults(defineProps<{ step?: number, width?: number, height?: number }>(), {
  step: 0,
  width: 400,
  height: 320,
})

const cube = normalize(shapes.cube())
const cc = catmullClarkDetail(cube)

const layers = computed<MeshLayer[]>(() => {
  if (props.step >= 4)
    return [{ mesh: cc.mesh, color: '#5b8def' }, { mesh: cube, wire: true }]
  return [{ mesh: cube, wire: true, color: '#0f172a' }]
})

const points = computed<Point3D[]>(() => {
  const out: Point3D[] = []
  const s = props.step
  if (s < 3)
    cube.v.forEach(p => out.push({ p, color: '#0f172a', r: 5 }))
  if (s >= 1)
    cc.facePoints.forEach(p => out.push({ p, color: '#f97316', r: 5.5 }))
  if (s >= 2)
    cc.edgePoints.forEach(p => out.push({ p, color: '#0ea5e9', r: 5 }))
  if (s >= 3)
    cc.vertexPoints.forEach(p => out.push({ p, color: '#16a34a', r: 5.5 }))
  return out
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <Mesh3D :layers="layers" :points="points" :width="width" :height="height" :zoom="1.05" auto-rotate />
    <div class="demo-row">
      <span><b style="color:#f97316">●</b> face point</span>
      <span><b style="color:#0ea5e9">●</b> edge point</span>
      <span><b style="color:#16a34a">●</b> moved vertex</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeshLayer } from './Mesh3D.vue'
import { computed } from 'vue'
import { normalize, shapes, sphereSplit, triangulate, uvSphere } from '../lib/mesh'

/** A static (rotatable) shape, used for side-by-side comparisons. */
const props = withDefaults(defineProps<{
  kind?: 'uv-sphere' | 'ico-sphere'
  title?: string
  width?: number
  height?: number
  color?: string
}>(), { kind: 'uv-sphere', width: 300, height: 260, color: '#5b8def' })

const layers = computed<MeshLayer[]>(() => {
  if (props.kind === 'uv-sphere')
    return [{ mesh: uvSphere(14, 24), color: props.color }]
  let m = triangulate(normalize(shapes.icosahedron()))
  for (let i = 0; i < 2; i++)
    m = sphereSplit(m)
  return [{ mesh: m, color: props.color }]
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <Mesh3D :layers="layers" :width="width" :height="height" :pitch="0.9" auto-rotate />
    <div v-if="title" class="demo-title">
      {{ title }}
    </div>
    <div class="demo-note">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MeshLayer } from './Mesh3D.vue'
import { computed, ref } from 'vue'
import { terrain } from '../lib/mesh'

const props = withDefaults(defineProps<{ width?: number, height?: number }>(), { width: 460, height: 300 })

const level = ref(1)
const roughness = ref(0.5)
const seed = ref(7)

const SEA = -0.12

function colorFor(h: number) {
  if (h <= SEA + 1e-6)
    return '#3b82c4'
  if (h < 0.02)
    return '#d9c98a'
  if (h < 0.22)
    return '#5fa35a'
  if (h < 0.42)
    return '#8a7458'
  return '#f1f5f9'
}

const layers = computed<MeshLayer[]>(() => {
  const m = terrain(level.value, roughness.value, seed.value)
  const faceColors = m.f.map(f => colorFor((m.v[f[0]][1] + m.v[f[1]][1] + m.v[f[2]][1]) / 3))
  // flatten everything below sea level so water looks like water
  const v = m.v.map(p => [p[0], Math.max(p[1], SEA), p[2]] as [number, number, number])
  return [{ mesh: { v, f: m.f }, faceColors, edges: level.value <= 3 }]
})
const faces = computed(() => layers.value[0].mesh.f.length)
</script>

<template>
  <div class="demo" :style="{ width: `${props.width}px` }">
    <Mesh3D :layers="layers" :width="props.width" :height="props.height" :pitch="0.6" :yaw="0.5" :zoom="1.25" auto-rotate />
    <div class="demo-row">
      <label class="slider">
        <span>Level {{ level }}</span>
        <input v-model.number="level" type="range" min="0" max="5" step="1">
      </label>
      <label class="slider">
        <span>k = {{ roughness.toFixed(2) }}</span>
        <input v-model.number="roughness" type="range" min="0.3" max="0.8" step="0.05">
      </label>
      <button class="chip" @click="seed++">
        new seed
      </button>
    </div>
    <div class="demo-note">
      {{ faces }} faces · k 越大地形越崎嶇
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/** The triangles around one vertex: the higher its degree, the thinner each triangle gets. */
const props = withDefaults(defineProps<{
  degree?: number
  min?: number
  max?: number
  width?: number
}>(), { degree: 24, min: 3, max: 24, width: 400 })

const W = 400
const H = 300
const C: [number, number] = [200, 150]
const R = 125

const n = ref(props.degree)
const rim = computed(() =>
  Array.from({ length: n.value }, (_, i) => {
    const a = (2 * Math.PI * i) / n.value - Math.PI / 2
    return [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]
  }),
)
const tris = computed(() =>
  rim.value.map((p, i) => `${C.join(',')} ${p.join(',')} ${rim.value[(i + 1) % n.value].join(',')}`),
)
const angle = computed(() => Math.round(360 / n.value))
const note = computed(() => {
  if (n.value === 6)
    return '6 個剛好是正三角形'
  return n.value < 6 ? '三角形比較寬' : n.value >= 12 ? '三角形又細又長' : '三角形開始變窄'
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <svg :width="width" :height="(H * width) / W" :viewBox="`0 0 ${W} ${H}`">
      <polygon
        v-for="(t, i) in tris" :key="i" :points="t"
        :fill="i === 0 ? '#fdba74' : '#dbeafe'" stroke="#1e3a8a" stroke-width="1.5" stroke-linejoin="round"
      />
      <circle v-for="(p, i) in rim" :key="`r${i}`" :cx="p[0]" :cy="p[1]" r="4" fill="#1e3a8a" />
      <circle :cx="C[0]" :cy="C[1]" r="8" fill="#ef4444" stroke="#fff" stroke-width="2" />
    </svg>
    <div class="demo-title">
      degree {{ n }}：每個三角形在中心只有約 {{ angle }}°
    </div>
    <div class="demo-row">
      <label class="slider">
        <span>degree</span>
        <input v-model.number="n" type="range" :min="min" :max="max" step="1">
      </label>
    </div>
    <div class="demo-note">
      {{ note }}
    </div>
  </div>
</template>

<style scoped>
.demo .slider span {
  min-width: 0;
}
.demo-title {
  font-size: 17px;
}
.demo-note {
  font-size: 15px;
}
</style>

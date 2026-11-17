<script setup lang="ts">
import { computed } from 'vue'

/** The two halves of every subdivision step: split (topology), then move (geometry). */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type P = [number, number]
const W = 360
const H = 300
const C: P = [180, 160]
const R = 120
const at = (deg: number, r = R): P => [C[0] + r * Math.cos((deg * Math.PI) / 180), C[1] - r * Math.sin((deg * Math.PI) / 180)]
const A = [at(90), at(210), at(330)]
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const M0 = [mid(A[0], A[1]), mid(A[1], A[2]), mid(A[2], A[0])]
const M1 = [at(150), at(270), at(30)]

const M = computed(() => (props.step >= 3 ? M1 : M0))
const tris = computed(() => {
  const m = M.value
  return [[A[0], m[0], m[2]], [A[1], m[1], m[0]], [A[2], m[2], m[1]], [m[0], m[1], m[2]]]
})
const pts = (t: P[]) => t.map(p => p.join(',')).join(' ')
const caption = computed(() => [
  'Coarse mesh：一個三角形',
  '① 在每條 edge 的中點 insert 一個新 vertex',
  '② 把新 vertex 連起來：1 個 face 變成 4 個（topology 改變）',
  '③ 把新 vertex 移到新位置（geometry 改變），形狀更接近圓',
][Math.min(props.step, 3)])
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <circle :cx="C[0]" :cy="C[1]" :r="R" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 4" />
      <polygon v-if="step < 2" :points="pts(A)" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" />
      <template v-else>
        <polygon
          v-for="(t, i) in tris" :key="i" :points="pts(t)" :fill="i === 3 ? '#bfdbfe' : '#dbeafe'"
          stroke="#1e3a8a" stroke-width="2" class="tri"
        />
      </template>
      <circle v-for="(p, i) in A" :key="`a${i}`" :cx="p[0]" :cy="p[1]" r="6" fill="#1e3a8a" />
      <template v-if="step >= 1">
        <circle v-for="(p, i) in M" :key="`m${i}`" :cx="p[0]" :cy="p[1]" r="6" fill="#f97316" class="dot" />
      </template>
    </svg>
    <div class="demo-title">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
.dot {
  transition: cx 0.5s ease, cy 0.5s ease;
}
</style>

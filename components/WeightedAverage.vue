<script setup lang="ts">
import { computed, ref } from 'vue'

/** Slide a point between A and B to see what the two weights do. */
const props = withDefaults(defineProps<{
  /** weight of B, in eighths (2 means 3/4 A + 1/4 B) */
  eighths?: number
  width?: number
}>(), { eighths: 2, width: 420 })

const W = 420
const H = 170
const A: [number, number] = [60, 120]
const B: [number, number] = [360, 120]

const k = ref(props.eighths)
const wB = computed(() => k.value / 8)
const x = computed(() => A[0] + (B[0] - A[0]) * wB.value)

const GLYPH: Record<string, string> = { '1/8': '⅛', '1/4': '¼', '3/8': '⅜', '1/2': '½', '5/8': '⅝', '3/4': '¾', '7/8': '⅞' }
function frac(n: number) {
  if (n === 0)
    return '0'
  if (n === 8)
    return '1'
  const g = [4, 2, 1].find(d => n % d === 0)!
  return GLYPH[`${n / g}/${8 / g}`]
}
const wa = computed(() => frac(8 - k.value))
const wb = computed(() => frac(k.value))

const note = computed(() => {
  if (k.value === 4)
    return '兩邊各佔一半：剛好是中點'
  if (k.value === 0 || k.value === 8)
    return `全部都給 ${k.value === 0 ? 'A' : 'B'}：就是 ${k.value === 0 ? 'A' : 'B'} 自己`
  return `${k.value < 4 ? 'A' : 'B'} 的權重比較大：新的點比較靠近 ${k.value < 4 ? 'A' : 'B'}`
})
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <div class="formula">
      新的點 = <b class="wa">{{ wa }}</b> A + <b class="wb">{{ wb }}</b> B
    </div>
    <svg :width="width" :height="(H * width) / W" :viewBox="`0 0 ${W} ${H}`">
      <line :x1="A[0]" :y1="A[1]" :x2="B[0]" :y2="B[1]" stroke="#cbd5e1" stroke-width="3" />
      <g stroke="#cbd5e1" stroke-width="2">
        <line v-for="i in 7" :key="i" :x1="A[0] + ((B[0] - A[0]) * i) / 8" :y1="A[1] - 6" :x2="A[0] + ((B[0] - A[0]) * i) / 8" :y2="A[1] + 6" />
      </g>
      <circle :cx="A[0]" :cy="A[1]" r="11" fill="#1e3a8a" />
      <circle :cx="B[0]" :cy="B[1]" r="11" fill="#f97316" />
      <text :x="A[0]" :y="A[1] - 22" text-anchor="middle" class="lbl" fill="#1e3a8a">A</text>
      <text :x="B[0]" :y="B[1] - 22" text-anchor="middle" class="lbl" fill="#f97316">B</text>
      <circle :cx="x" :cy="A[1]" r="9" fill="#fff" stroke="#0f172a" stroke-width="3.5" class="dot" />
      <text :x="x" :y="A[1] - 44" text-anchor="middle" class="new">新的點</text>
      <line :x1="x" :y1="A[1] - 38" :x2="x" :y2="A[1] - 14" stroke="#0f172a" stroke-width="1.5" />
    </svg>
    <div class="demo-row">
      <label class="slider">
        <span>B 的權重</span>
        <input v-model.number="k" type="range" min="0" max="8" step="1">
      </label>
    </div>
    <div class="demo-note">
      {{ note }} · {{ wa }} + {{ wb }} = 1
    </div>
  </div>
</template>

<style scoped>
.formula {
  font-size: 26px;
  font-weight: 600;
}
.formula .wa {
  color: #1e3a8a;
}
.formula .wb {
  color: #f97316;
}
.lbl {
  font-size: 22px;
  font-weight: 700;
}
.new {
  font-size: 15px;
  fill: #0f172a;
}
.dot {
  transition: cx 0.2s ease;
}
.demo-note {
  font-size: 15px;
}
</style>

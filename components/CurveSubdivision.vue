<script setup lang="ts">
import type { CurveScheme, P2 } from '../lib/curves'
import { computed, ref, watch } from 'vue'
import { subdivideCurve } from '../lib/curves'

const props = withDefaults(defineProps<{
  scheme?: CurveScheme
  /** more than one entry shows a scheme switcher */
  schemes?: CurveScheme[]
  level?: number
  maxLevel?: number
  /** displayed width in px; the board keeps a 520 x 280 coordinate space */
  width?: number
  points?: P2[]
}>(), {
  scheme: 'chaikin',
  level: 0,
  maxLevel: 5,
  width: 520,
  points: () => [[40, 230], [90, 110], [170, 50], [250, 120], [300, 230], [400, 235], [420, 110], [485, 45]],
})

const labels: Record<CurveScheme, string> = {
  chaikin: 'Chaikin (quadratic B-spline)',
  cubic: 'Cubic B-spline',
  fourPoint: '4-point (interpolating)',
}
const colors: Record<CurveScheme, string> = {
  chaikin: '#f87171',
  cubic: '#fbbf24',
  fourPoint: '#34d399',
}

const VW = 520
const VH = 280
const pts = ref<P2[]>(props.points.map(p => [...p] as P2))
const scheme = ref<CurveScheme>(props.scheme)
const level = ref(props.level)
watch(() => props.level, v => (level.value = v))

const svg = ref<SVGSVGElement>()
const drag = ref(-1)

const curve = computed(() => subdivideCurve(pts.value, scheme.value, level.value))
const path = (p: P2[]) => p.map(q => q.join(',')).join(' ')

function toLocal(e: PointerEvent): P2 {
  // getScreenCTM accounts for the scale transform Slidev applies to the slide
  const m = svg.value!.getScreenCTM()!.inverse()
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
  return [
    Math.max(8, Math.min(VW - 8, p.x)),
    Math.max(8, Math.min(VH - 8, p.y)),
  ]
}
function onDown(i: number, e: PointerEvent) {
  drag.value = i
  svg.value!.setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (drag.value >= 0)
    pts.value[drag.value] = toLocal(e)
}
function reset() {
  pts.value = props.points.map(p => [...p] as P2)
}
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <div v-if="schemes && schemes.length > 1" class="demo-row">
      <button v-for="s in schemes" :key="s" class="chip" :class="{ on: s === scheme }" @click="scheme = s">
        {{ labels[s] }}
      </button>
    </div>
    <svg
      ref="svg" :width="width" :height="(width * VH) / VW" :viewBox="`0 0 ${VW} ${VH}`" class="board"
      @pointermove="onMove" @pointerup="drag = -1" @pointercancel="drag = -1"
    >
      <polyline :points="path(pts)" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4" />
      <polyline
        v-if="level > 0" :points="path(curve)" fill="none" :stroke="colors[scheme]" stroke-width="2.5"
        stroke-linejoin="round" stroke-linecap="round"
      />
      <template v-if="level > 0 && level <= 3">
        <circle v-for="(p, i) in curve" :key="`c${i}`" :cx="p[0]" :cy="p[1]" r="2.6" :fill="colors[scheme]" />
      </template>
      <g v-for="(p, i) in pts" :key="i" class="handle" @pointerdown.prevent="onDown(i, $event)">
        <circle :cx="p[0]" :cy="p[1]" r="14" fill="transparent" />
        <circle :cx="p[0]" :cy="p[1]" r="6" fill="#0b1220" stroke="#f1f5f9" stroke-width="2" />
        <text :x="p[0] + 9" :y="p[1] - 9" style="font-size: 14px" fill="#94a3b8">P{{ i + 1 }}</text>
      </g>
    </svg>
    <div class="demo-row">
      <label class="slider">
        <span>Level {{ level }}</span>
        <input v-model.number="level" type="range" min="0" :max="maxLevel" step="1">
      </label>
      <button class="chip" @click="reset">
        reset
      </button>
      <span class="demo-note">{{ curve.length }} points · 拖曳控制點試試看</span>
    </div>
  </div>
</template>

<style scoped>
.board {
  background: #111827;
  border: 1px solid #334155;
  border-radius: 8px;
}
.handle {
  cursor: grab;
}
</style>

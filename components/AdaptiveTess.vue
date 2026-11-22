<script setup lang="ts">
import type { Mesh } from '../lib/mesh'
import type { MeshLayer } from './Mesh3D.vue'
import { computed, ref } from 'vue'
import { catmullClark, normalize, shapes } from '../lib/mesh'

/**
 * Adaptive tessellation: how far the camera is decides how many times the model is subdivided.
 *   left   what the player sees: the model shrinks as it moves away
 *   right  the mesh that is actually drawn for it, always shown at the same size
 * Turning "adaptive" off draws the finest mesh at every distance: the left picture
 * hardly changes, the face count does.
 */
const props = withDefaults(defineProps<{ width?: number, height?: number, shape?: string }>(), {
  width: 330,
  height: 240,
  shape: 'tshape',
})

const MAX = 4
const levels = (() => {
  const out: Mesh[] = [normalize(shapes[props.shape]())]
  for (let i = 0; i < MAX; i++)
    out.push(catmullClark(out[i]))
  return out
})()

/** distance as a power of two: 0 is right in front of the camera */
const far = ref(0)
const adaptive = ref(true)
const distance = computed(() => 2 ** far.value)
/** twice as far means half as big on screen, so one subdivision less is enough */
const level = computed(() => (adaptive.value ? Math.max(0, MAX - Math.round(far.value)) : MAX))
const mesh = computed(() => levels[level.value])
const finest = levels[MAX].f.length

const seen = computed<MeshLayer[]>(() => [{ mesh: mesh.value, color: '#5b8def', edges: false }])
const drawn = computed<MeshLayer[]>(() => [{ mesh: mesh.value, color: '#5b8def' }])
const saved = computed(() => Math.round((1 - mesh.value.f.length / finest) * 100))
</script>

<template>
  <div class="adaptive">
    <div class="row">
      <div class="demo" :style="{ width: `${width}px` }">
        <div class="demo-title">
          玩家看到的畫面
        </div>
        <div class="screen">
          <Mesh3D :layers="seen" :width="width" :height="height" :zoom="1.25 / distance" auto-rotate />
        </div>
        <div class="demo-note">
          距離變 2 倍，在畫面上就只剩一半大
        </div>
      </div>
      <div class="demo" :style="{ width: `${width}px` }">
        <div class="demo-title">
          實際拿去畫的 mesh（放大來看）
        </div>
        <Mesh3D :layers="drawn" :width="width" :height="height" :zoom="1.25" auto-rotate />
        <div class="count" :class="{ waste: !adaptive && far >= 1 }">
          Level {{ level }}：<b>{{ mesh.f.length }}</b> faces
          <span v-if="adaptive && saved > 0">（省下 {{ saved }}%）</span>
          <span v-if="!adaptive && far >= 1">（遠了還是畫最細的）</span>
        </div>
      </div>
    </div>
    <div class="demo controls">
      <div class="demo-row">
        <label class="slider">
          <span>距離 ×{{ distance % 1 ? distance.toFixed(1) : distance }}</span>
          <input v-model.number="far" type="range" min="0" :max="MAX" step="0.5">
        </label>
        <label class="check"><input v-model="adaptive" type="checkbox"> adaptive</label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adaptive {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.screen {
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}
.count {
  font-size: 16px;
}
.count.waste {
  color: #b91c1c;
}
.controls .slider span {
  min-width: 90px;
}
</style>

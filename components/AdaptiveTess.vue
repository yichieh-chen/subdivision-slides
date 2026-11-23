<script setup lang="ts">
import type { Mesh } from '../lib/mesh'
import type { MeshLayer } from './Mesh3D.vue'
import { computed, ref } from 'vue'
import { catmullClark, normalize, shapes } from '../lib/mesh'

/**
 * Adaptive tessellation: how far the camera is decides how many times the model is subdivided.
 *   left   what the player sees: the model shrinks as it moves away
 *   right  the mesh that is actually drawn for it, always shown at the same size
 * The slider starts far away with the bare control mesh and moves the camera closer,
 * so the model is subdivided step by step, the way the rest of the deck shows it.
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

/** how close the camera has come: 0 is far away, MAX is right in front of it */
const near = ref(0)
const adaptive = ref(true)
/** every step closer halves the distance */
const distance = computed(() => 2 ** (MAX - near.value))
/** half as far means twice as big on screen, which is worth one more subdivision */
const level = computed(() => (adaptive.value ? Math.round(near.value) : MAX))
const isFar = computed(() => near.value <= MAX - 1)
const mesh = computed(() => levels[level.value])

const seen = computed<MeshLayer[]>(() => [{ mesh: mesh.value, color: '#5b8def', edges: false }])
const drawn = computed<MeshLayer[]>(() => [{ mesh: mesh.value, color: '#5b8def' }])
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
          距離剩一半，在畫面上就變 2 倍大
        </div>
      </div>
      <div class="demo" :style="{ width: `${width}px` }">
        <div class="demo-title">
          實際拿去畫的 mesh（放大來看）
        </div>
        <Mesh3D :layers="drawn" :width="width" :height="height" :zoom="1.25" auto-rotate />
        <div class="count" :class="{ waste: !adaptive && isFar }">
          Level {{ level }}：<b>{{ mesh.f.length }}</b> faces
          <span v-if="adaptive && level === 0">（就是 control mesh）</span>
          <span v-if="adaptive && level > 0">（多切了 {{ level }} 次）</span>
          <span v-if="!adaptive && isFar">（這麼遠還是畫最細的）</span>
        </div>
      </div>
    </div>
    <div class="demo controls">
      <div class="demo-row">
        <span class="end">遠</span>
        <label class="slider">
          <input v-model.number="near" type="range" min="0" :max="MAX" step="0.5">
        </label>
        <span class="end">近</span>
        <span class="dist">距離 ×{{ distance % 1 ? distance.toFixed(1) : distance }}</span>
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
.end {
  font-weight: 600;
}
.dist {
  min-width: 90px;
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}
</style>

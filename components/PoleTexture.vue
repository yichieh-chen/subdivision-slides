<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

/**
 * A checkerboard texture wrapped onto a sphere with latitude / longitude coordinates.
 * Every column of the texture has to squeeze into the pole, which is what a
 * lat-long sphere mesh does to any image mapped onto it.
 */
const props = withDefaults(defineProps<{
  cols?: number
  rows?: number
  size?: number
  /** tilt towards the viewer, in radians; about 1.0 looks down at the pole */
  pitch?: number
}>(), { cols: 24, rows: 12, size: 300, pitch: 0.95 })

const canvas = ref<HTMLCanvasElement>()
const yaw = ref(0.3)
const pitch = ref(props.pitch)
const dragging = ref(false)

const DARK = [226, 114, 91]
const LIGHT = [253, 236, 230]

function draw() {
  const c = canvas.value
  if (!c)
    return
  const N = props.size * 2
  if (c.width !== N) {
    c.width = N
    c.height = N
  }
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(N, N)
  const cp = Math.cos(pitch.value)
  const sp = Math.sin(pitch.value)
  const cy = Math.cos(yaw.value)
  const sy = Math.sin(yaw.value)
  const R = N / 2 - 4
  const SS = 2
  for (let py = 0; py < N; py++) {
    for (let px = 0; px < N; px++) {
      let r = 0
      let g = 0
      let b = 0
      let hit = 0
      for (let s = 0; s < SS * SS; s++) {
        const x = (px + ((s % SS) + 0.5) / SS - N / 2) / R
        const y = -(py + (Math.floor(s / SS) + 0.5) / SS - N / 2) / R
        const d = x * x + y * y
        if (d > 1)
          continue
        const z = Math.sqrt(1 - d)
        // undo the view rotation to get the point on the sphere itself
        const y1 = y * cp + z * sp
        const z1 = -y * sp + z * cp
        const x2 = x * cy - z1 * sy
        const z2 = x * sy + z1 * cy
        const u = (Math.atan2(z2, x2) / (2 * Math.PI) + 0.5) * props.cols
        const v = (Math.asin(Math.max(-1, Math.min(1, y1))) / Math.PI + 0.5) * props.rows
        const col = (Math.floor(u) + Math.floor(v)) % 2 === 0 ? DARK : LIGHT
        const shade = 0.5 + 0.5 * Math.max(0, x * 0.3 + y * 0.4 + z * 0.85)
        r += col[0] * shade
        g += col[1] * shade
        b += col[2] * shade
        hit++
      }
      const i = (py * N + px) * 4
      if (hit) {
        img.data[i] = r / hit
        img.data[i + 1] = g / hit
        img.data[i + 2] = b / hit
        img.data[i + 3] = (255 * hit) / (SS * SS)
      }
    }
  }
  ctx.putImageData(img, 0, 0)
}

function onDown(e: PointerEvent) {
  dragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging.value)
    return
  yaw.value += e.movementX * 0.01
  pitch.value = Math.max(-1.5, Math.min(1.5, pitch.value + e.movementY * 0.01))
  draw()
}

watch(() => [props.cols, props.rows, props.size], draw)
onMounted(draw)
</script>

<template>
  <div class="pole">
    <div class="demo">
      <svg :width="170" :height="85" :viewBox="`0 0 ${cols} ${rows}`" class="flat" preserveAspectRatio="none">
        <template v-for="r in rows" :key="r">
          <rect
            v-for="c in cols" :key="c" :x="c - 1" :y="r - 1" width="1" height="1"
            :fill="(r + c) % 2 === 0 ? '#e2725b' : '#fdece6'"
          />
        </template>
      </svg>
      <div class="demo-note">
        原本的貼圖：每格一樣大
      </div>
    </div>
    <div class="arrow">
      →
    </div>
    <div class="demo">
      <canvas
        ref="canvas" class="ball" :style="{ width: `${size}px`, height: `${size}px` }"
        @pointerdown="onDown" @pointermove="onMove" @pointerup="dragging = false" @pointercancel="dragging = false"
      />
      <div class="demo-note">
        貼到經緯度球上 · 拖曳可旋轉
      </div>
    </div>
  </div>
</template>

<style scoped>
.pole {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.flat {
  border: 1px solid #94a3b8;
}
.arrow {
  font-size: 30px;
  opacity: 0.4;
}
.ball {
  cursor: grab;
  touch-action: none;
  display: block;
}
.demo-note {
  font-size: 15px;
  opacity: 0.85;
}
</style>

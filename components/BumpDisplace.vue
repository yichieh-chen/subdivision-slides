<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer } from './Mesh3D.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { mul, normalize, shapes, sphereSplit } from '../lib/mesh'

/**
 * The same height texture used in two ways.
 *   left   bump mapping: a perfect sphere, only the shading normal is tilted per pixel
 *   right  displacement: a subdivided sphere whose vertices are really pushed in and out
 * The slider sets how many times the right-hand mesh is subdivided: with few vertices
 * there is nothing to push, which is why displacement needs subdivision.
 */
const props = withDefaults(defineProps<{ width?: number, height?: number, level?: number }>(), {
  width: 330,
  height: 270,
  level: 1,
})

const ZOOM = 0.86
const MAX = 4
const AMP = 0.085
const FREQ = 9
/** the "texture": a height for every direction on the sphere */
const heightAt = (p: V3) => (AMP / 3) * (Math.sin(FREQ * p[0]) + Math.sin(FREQ * p[1]) + Math.sin(FREQ * p[2]))

// ------------------------------------------------------------ displacement

const level = ref(props.level)
const spheres = (() => {
  const out: Mesh[] = [normalize(shapes.icosahedron())]
  for (let i = 0; i < MAX; i++)
    out.push(sphereSplit(out[i]))
  return out
})()
const displaced = spheres.map((m): Mesh => ({ v: m.v.map(p => mul(p, 1 + heightAt(p))), f: m.f }))
const layers = computed<MeshLayer[]>(() => [{ mesh: displaced[level.value], color: '#5b8def' }])

// ------------------------------------------------------------ bump mapping

const canvas = ref<HTMLCanvasElement>()
const view = ref({ yaw: 0.6, pitch: 0.42 })
function onView(yaw: number, pitch: number) {
  if (yaw !== view.value.yaw || pitch !== view.value.pitch)
    view.value = { yaw, pitch }
}

function drawBump() {
  const c = canvas.value
  if (!c)
    return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = Math.round(props.width * dpr)
  const H = Math.round(props.height * dpr)
  if (c.width !== W || c.height !== H) {
    c.width = W
    c.height = H
  }
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(W, H)
  // same size on screen as the unit sphere drawn by Mesh3D (camera distance 4.2)
  const R = Math.min(props.width, props.height) * 0.43 * ZOOM * (4.2 / Math.sqrt(4.2 * 4.2 - 1)) * dpr
  const cy = Math.cos(view.value.yaw)
  const sy = Math.sin(view.value.yaw)
  const cp = Math.cos(view.value.pitch)
  const sp = Math.sin(view.value.pitch)
  const base = [0x5B, 0x8D, 0xEF]
  const k = (AMP / 3) * FREQ
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const X = (i + 0.5 - W / 2) / R
      const Y = (H / 2 - j - 0.5) / R
      const d = X * X + Y * Y
      if (d > 1)
        continue
      const Z = Math.sqrt(1 - d)
      // view space back to the sphere's own space
      const py = Y * cp + Z * sp
      const z0 = -Y * sp + Z * cp
      const px = X * cy - z0 * sy
      const pz = X * sy + z0 * cy
      // slope of the height texture, with the part along the normal removed
      let gx = k * Math.cos(FREQ * px)
      let gy = k * Math.cos(FREQ * py)
      let gz = k * Math.cos(FREQ * pz)
      const along = gx * px + gy * py + gz * pz
      gx -= along * px
      gy -= along * py
      gz -= along * pz
      // the tilted normal: this is all that bump mapping changes
      let nx = px - gx
      let ny = py - gy
      let nz = pz - gz
      const l = Math.hypot(nx, ny, nz)
      nx /= l
      ny /= l
      nz /= l
      // and into view space again for the light
      const vx = nx * cy + nz * sy
      const w0 = -nx * sy + nz * cy
      const vy = ny * cp - w0 * sp
      const vz = ny * sp + w0 * cp
      const shade = 0.45 + 0.55 * Math.abs(vx * 0.35 + vy * 0.45 + vz * 0.82)
      const o = (j * W + i) * 4
      img.data[o] = base[0] * shade
      img.data[o + 1] = base[1] * shade
      img.data[o + 2] = base[2] * shade
      // soften the outline a little
      img.data[o + 3] = 255 * Math.min(1, (1 - Math.sqrt(d)) * R)
    }
  }
  ctx.putImageData(img, 0, 0)
}
watch(view, drawBump)
onMounted(drawBump)
</script>

<template>
  <div class="bump-displace">
    <div class="demo" :style="{ width: `${width}px` }">
      <div class="demo-title">
        Bump mapping
      </div>
      <canvas ref="canvas" :style="{ width: `${width}px`, height: `${height}px` }" />
      <div class="caption">
        只改光影：<b>輪廓還是正圓</b>
      </div>
      <div class="demo-note">
        mesh 完全沒有動
      </div>
    </div>
    <div class="demo" :style="{ width: `${width}px` }">
      <div class="demo-title">
        Subdivision + Displacement
      </div>
      <Mesh3D :layers="layers" :width="width" :height="height" :zoom="ZOOM" auto-rotate @view="onView" />
      <div class="caption">
        真的把 vertices 推出去：<b>輪廓也凹凸</b>
      </div>
      <div class="demo-row">
        <label class="slider">
          <span>Level {{ level }}</span>
          <input v-model.number="level" type="range" min="0" :max="MAX" step="1">
        </label>
        <span class="demo-note">{{ displaced[level].v.length }} vertices</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bump-displace {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.caption {
  font-size: 16px;
}
canvas {
  display: block;
}
</style>

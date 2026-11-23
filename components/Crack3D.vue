<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import type { MeshLayer } from './Mesh3D.vue'
import { computed } from 'vue'

/**
 * Cracks between two neighbouring patches of one curved surface, in 3D (drag to turn).
 *   step 0  both patches are cut equally fine: the shared edge matches
 *   step 1  the far patch is cut coarsely: its straight edges no longer follow the fine patch's
 *           curved edge, the gaps in between are holes (dark red)
 *   step 2  the holes are closed with extra triangles (green)
 */
const props = withDefaults(defineProps<{ step?: number, width?: number, height?: number }>(), {
  step: 0,
  width: 560,
  height: 320,
})

const FINE = 8
const COARSE = 2
const surface = (x: number, z: number): V3 => [x, 0.6 * (1 - z * z) - 0.1 * x * x - 0.25, z]

function build(step: number) {
  const mesh: Mesh = { v: [], f: [] }
  const colors: string[] = []
  const grid = (x0: number, x1: number, nx: number, nz: number, color: string) => {
    const base = mesh.v.length
    for (let i = 0; i <= nx; i++) {
      for (let k = 0; k <= nz; k++)
        mesh.v.push(surface(x0 + (x1 - x0) * i / nx, -1 + 2 * k / nz))
    }
    for (let i = 0; i < nx; i++) {
      for (let k = 0; k < nz; k++) {
        const a = base + i * (nz + 1) + k
        mesh.f.push([a, a + 1, a + nz + 2, a + nz + 1])
        colors.push(color)
      }
    }
  }
  grid(-1.25, 0, 5, FINE, '#3b82f6')
  if (step === 0) {
    grid(0, 1.25, 5, FINE, '#93c5fd')
  }
  else {
    grid(0, 1.25, 1, COARSE, '#93c5fd')
    // the holes along the shared edge x = 0: between each straight coarse edge and the fine vertices above it
    const per = FINE / COARSE
    for (let c = 0; c < COARSE; c++) {
      const base = mesh.v.length
      for (let k = 0; k <= per; k++)
        mesh.v.push(surface(0, -1 + 2 * (c * per + k) / FINE))
      for (let k = 1; k < per; k++) {
        mesh.f.push([base, base + k, base + k + 1])
        colors.push(step >= 2 ? '#22c55e' : '#7f1d1d')
      }
    }
  }
  return { mesh, colors }
}

const built = computed(() => build(Math.min(props.step, 2)))
const layers = computed<MeshLayer[]>(() => [{ mesh: built.value.mesh, faceColors: built.value.colors }])
const caption = computed(() => [
  '兩塊切得一樣細：共用的邊完全對得起來',
  '右邊那塊切得比較粗：它的邊是直的，左邊那塊的邊是彎的，中間對不起來就破洞（深紅色）',
  '修法：在破洞的地方補上三角形（綠色），表面就沒有縫了',
][Math.min(props.step, 2)])
</script>

<template>
  <div class="demo" :style="{ width: `${width + 80}px` }">
    <Mesh3D :layers="layers" :width="width" :height="height" :yaw="-0.85" :pitch="0.3" :zoom="0.9" />
    <div class="demo-title cap">
      {{ caption }}
    </div>
    <div class="demo-note">
      <span class="sw fine" /> 切得細的那塊　<span class="sw coarse" /> 切得粗的那塊　可以用滑鼠拖著轉
    </div>
  </div>
</template>

<style scoped>
.cap {
  text-align: center;
  min-height: 2.8em;
}
.sw {
  display: inline-block;
  width: 14px;
  height: 14px;
  vertical-align: middle;
  border-radius: 3px;
}
.sw.fine {
  background: #3b82f6;
}
.sw.coarse {
  background: #93c5fd;
}
</style>

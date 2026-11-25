<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * What adaptive tessellation looks like in a game: the ground seen from the player's eye,
 * drawn as wireframe. Cells close to the camera are split into smaller ones, far cells stay big.
 * The slider walks the camera forward, the fine region moves along with it.
 * Turning "adaptive" off splits every cell to the finest level.
 */
const W = 440
const H = 280
const HORIZON = 56
const F = 190
/** top view: world x in [-6, 6] across, 15 units of depth upwards, following the camera */
const TW = 300
const TS = TW / 12
const TDEPTH = 11
const EYE = 0.7
const ROOT = 2
const MAXL = 3
const COLORS = ['#dcfce7', '#a7f3c0', '#4ade80', '#16a34a']

const walk = ref(0)
const adaptive = ref(true)

interface Cell { x: number, z: number, s: number, l: number }

const cells = computed(() => {
  const out: Cell[] = []
  const zc = walk.value
  const visit = (x: number, z: number, s: number, l: number) => {
    const d = Math.hypot(x + s / 2, z + s / 2 - zc)
    if (l < MAXL && (!adaptive.value || s / d > 0.45)) {
      const h = s / 2
      visit(x, z, h, l + 1)
      visit(x + h, z, h, l + 1)
      visit(x, z + h, h, l + 1)
      visit(x + h, z + h, h, l + 1)
    }
    else if (z + s - zc > 0.1) {
      out.push({ x, z, s, l })
    }
  }
  for (let z = 0; z < 28; z += ROOT) {
    for (let x = -6; x < 6; x += ROOT)
      visit(x, z, ROOT, 0)
  }
  return out.sort((a, b) => b.z - a.z)
})

function project(x: number, z: number) {
  const dz = Math.max(z - walk.value, 0.1)
  return `${(W / 2 + F * x / dz).toFixed(1)},${(HORIZON + F * EYE / dz).toFixed(1)}`
}
const quad = (c: Cell) => [project(c.x, c.z), project(c.x + c.s, c.z), project(c.x + c.s, c.z + c.s), project(c.x, c.z + c.s)].join(' ')
function top(c: Cell) {
  const y = H - 24 - (c.z + c.s - walk.value) * TS
  return { x: TW / 2 + c.x * TS, y, s: c.s * TS }
}
const topCells = computed(() => cells.value.filter(c => c.z - walk.value < TDEPTH))
</script>

<template>
  <div class="ground">
    <div class="row">
      <div class="demo" :style="{ width: `${W}px` }">
        <div class="demo-title">
          玩家看到的地面
        </div>
        <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`" class="view">
          <defs>
            <linearGradient id="ag-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#bae6fd" />
              <stop offset="1" stop-color="#f0f9ff" />
            </linearGradient>
          </defs>
          <rect :width="W" :height="HORIZON" fill="url(#ag-sky)" />
          <rect :y="HORIZON" :width="W" :height="H - HORIZON" fill="#dcfce7" />
          <polygon
            v-for="(c, i) in cells" :key="i" :points="quad(c)"
            :fill="COLORS[c.l]" stroke="#14532d" :stroke-width="c.l === 0 ? 0.8 : 0.5"
          />
        </svg>
      </div>
      <div class="demo" :style="{ width: `${TW}px` }">
        <div class="demo-title">
          從天上往下看
        </div>
        <svg :width="TW" :height="H" :viewBox="`0 0 ${TW} ${H}`" class="view">
          <rect :width="TW" :height="H" fill="#f8fafc" />
          <rect
            v-for="(c, i) in topCells" :key="i" v-bind="{ x: top(c).x, y: top(c).y, width: top(c).s, height: top(c).s }"
            :fill="COLORS[c.l]" stroke="#14532d" stroke-width="0.6"
          />
          <rect :y="H - 24" :width="TW" height="24" fill="#f8fafc" />
          <circle :cx="TW / 2" :cy="H - 24" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
          <text :x="TW / 2 + 12" :y="H - 7" class="tag" style="fill: #dc2626">玩家</text>
          <text x="8" y="20" class="tag">遠：格子大</text>
          <text x="8" :y="H - 34" class="tag">近：格子小</text>
        </svg>
      </div>
    </div>
    <div class="demo">
      <div class="demo-row">
        <span>往前走</span>
        <label class="slider">
          <input v-model.number="walk" type="range" min="0" max="10" step="0.05">
        </label>
        <label class="check"><input v-model="adaptive" type="checkbox"> adaptive</label>
        <span class="count" :class="{ waste: !adaptive }">這一格畫面要畫 <b>{{ cells.length }}</b> 個面</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ground {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.row {
  display: flex;
  justify-content: center;
  gap: 32px;
}
.view {
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
}
.tag {
  font-size: 14px;
  font-weight: 600;
  fill: #14532d;
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 4px;
}
.count {
  min-width: 210px;
  font-variant-numeric: tabular-nums;
}
.count.waste {
  color: #b91c1c;
}
</style>

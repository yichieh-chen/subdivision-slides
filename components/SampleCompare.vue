<script setup lang="ts">
import { computed } from 'vue'

/**
 * Image enlargement next to subdivision, one stage at a time:
 *   0  the original (small image / coarse polygon)
 *   1  new samples are inserted, but have no value yet
 *   2  new samples get their value from nearby old ones
 */
const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

type P = [number, number]
type RGB = [number, number, number]

const W = 400
const H = 300

// ------------------------------------------------------------ image side

const N = 3
const M = 2 * N - 1
const hex = (h: string): RGB => [0, 2, 4].map(i => Number.parseInt(h.slice(1 + i, 3 + i), 16)) as RGB
const SRC: RGB[][] = [
  ['#1e3a8a', '#3b82f6', '#bfdbfe'],
  ['#3b82f6', '#fde68a', '#fb923c'],
  ['#bfdbfe', '#fb923c', '#c2410c'],
].map(r => r.map(hex))

const css = (c: RGB) => `rgb(${c.map(Math.round).join(',')})`
const avgColor = (cs: RGB[]): RGB => [0, 1, 2].map(k => cs.reduce((s, c) => s + c[k], 0) / cs.length) as RGB

interface Cell { key: string, x: number, y: number, size: number, old: boolean, fill: string, empty: boolean }

const cells = computed<Cell[]>(() => {
  const out: Cell[] = []
  if (props.stage === 0) {
    const size = 70
    const x0 = (W - N * size) / 2
    const y0 = (H - N * size) / 2
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++)
        out.push({ key: `${2 * r}_${2 * c}`, x: x0 + c * size, y: y0 + r * size, size, old: true, fill: css(SRC[r][c]), empty: false })
    }
    return out
  }
  const size = 52
  const x0 = (W - M * size) / 2
  const y0 = (H - M * size) / 2
  for (let r = 0; r < M; r++) {
    for (let c = 0; c < M; c++) {
      const old = r % 2 === 0 && c % 2 === 0
      // a new pixel is the average of the old pixels around it
      const rs = r % 2 === 0 ? [r / 2] : [(r - 1) / 2, (r + 1) / 2]
      const cs = c % 2 === 0 ? [c / 2] : [(c - 1) / 2, (c + 1) / 2]
      const fill = css(avgColor(rs.flatMap(i => cs.map(j => SRC[i][j]))))
      out.push({ key: `${r}_${c}`, x: x0 + c * size, y: y0 + r * size, size, old, fill, empty: !old && props.stage < 2 })
    }
  }
  return out
})

/** the new pixel we point at in stage 2, and the two old pixels it comes from */
const pick = computed(() => {
  const at = (key: string) => cells.value.find(c => c.key === key)!
  return { target: at('0_1'), from: [at('0_0'), at('0_2')] }
})

// ------------------------------------------------------ subdivision side

const OLD: P[] = [[95, 85], [215, 50], [320, 120], [300, 235], [170, 255], [70, 185]]
const n = OLD.length
const at = (i: number) => OLD[((i % n) + n) % n]
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const MID = OLD.map((p, i) => mid(p, at(i + 1)))
// 4-point rule: (-1, 9, 9, -1) / 16 of the four nearest old vertices
const MOVED: P[] = OLD.map((_, i) => {
  const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
  return [(-a[0] + 9 * b[0] + 9 * c[0] - d[0]) / 16, (-a[1] + 9 * b[1] + 9 * c[1] - d[1]) / 16]
})

const fresh = computed(() => (props.stage >= 2 ? MOVED : MID))
const outline = computed(() => {
  if (props.stage < 2)
    return OLD
  return OLD.flatMap((p, i) => [p, MOVED[i]])
})
const pts = (ps: P[]) => ps.map(p => p.join(',')).join(' ')

const HI = 1
const sources = [at(HI - 1), at(HI), at(HI + 1), at(HI + 2)]

const captions = computed(() => [
  ['原本的小圖：3 × 3 個 pixels', '原本的 coarse mesh：6 個 vertices'],
  ['格子變多了，新的 pixel 還沒有顏色', '每條 edge 插入一個新 vertex，位置還沒決定'],
  ['新 pixel 的顏色 = 旁邊舊 pixels 的平均', '新 vertex 的位置 = 附近舊 vertices 的加權平均'],
][Math.min(props.stage, 2)])
</script>

<template>
  <div class="compare">
    <div class="demo" :style="{ width: `${W}px` }">
      <div class="demo-title">
        Image enlargement
      </div>
      <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
        <rect
          v-for="c in cells" :key="c.key" class="cell"
          :x="c.x + 1.5" :y="c.y + 1.5" :width="c.size - 3" :height="c.size - 3" rx="3"
          :fill="c.empty ? 'transparent' : c.fill"
          :stroke="c.empty ? '#94a3b8' : c.old ? '#0f172a' : 'transparent'"
          :stroke-width="c.old ? 2 : 1.5"
          :stroke-dasharray="c.empty ? '4 3' : undefined"
        />
        <template v-if="stage === 1">
          <text
            v-for="c in cells.filter(c => c.empty)" :key="`q${c.key}`"
            :x="c.x + c.size / 2" :y="c.y + c.size / 2 + 6" text-anchor="middle" class="q"
          >?</text>
        </template>
        <g v-if="stage >= 2" class="fade">
          <rect
            :x="pick.target.x + 1.5" :y="pick.target.y + 1.5" :width="pick.target.size - 3" :height="pick.target.size - 3"
            rx="3" fill="none" stroke="#f97316" stroke-width="4"
          />
          <g v-for="(f, i) in pick.from" :key="i" :transform="`translate(${f.x + f.size / 2} ${f.y + f.size / 2}) scale(${i ? -1 : 1} 1)`">
            <path d="M 0 0 H 20" stroke="#fff" stroke-width="7" stroke-linecap="round" />
            <path d="M 0 0 H 20" stroke="#f97316" stroke-width="4" stroke-linecap="round" />
            <path d="M 17 -9 L 31 0 L 17 9 Z" fill="#f97316" stroke="#fff" stroke-width="1.5" />
          </g>
        </g>
      </svg>
      <div class="demo-note">
        {{ captions[0] }}
      </div>
    </div>

    <div class="demo" :style="{ width: `${W}px` }">
      <div class="demo-title">
        Subdivision
      </div>
      <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
        <polygon v-if="stage >= 2" :points="pts(OLD)" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4" />
        <polygon :points="pts(outline)" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" />
        <g v-if="stage >= 2" class="fade">
          <line
            v-for="(s, i) in sources" :key="i" :x1="s[0]" :y1="s[1]" :x2="MOVED[HI][0]" :y2="MOVED[HI][1]"
            stroke="#f97316" stroke-width="2.5" stroke-dasharray="2 4" stroke-linecap="round"
          />
          <circle v-for="(s, i) in sources" :key="`s${i}`" :cx="s[0]" :cy="s[1]" r="11" fill="none" stroke="#f97316" stroke-width="2.5" />
        </g>
        <circle v-for="(p, i) in OLD" :key="`o${i}`" :cx="p[0]" :cy="p[1]" r="6.5" fill="#1e3a8a" />
        <template v-if="stage >= 1">
          <circle
            v-for="(p, i) in fresh" :key="`n${i}`" class="dot" :cx="p[0]" :cy="p[1]"
            :r="stage >= 2 && i === HI ? 9 : 6.5"
            :fill="stage >= 2 ? '#f97316' : '#fff'" stroke="#f97316" stroke-width="2.5"
          />
        </template>
      </svg>
      <div class="demo-note">
        {{ captions[1] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare {
  display: flex;
  justify-content: center;
  gap: 40px;
}
.compare .demo-title {
  font-size: 19px;
}
.compare .demo-note {
  font-size: 16px;
  opacity: 0.85;
}
.cell {
  transition: x 0.5s ease, y 0.5s ease, width 0.5s ease, height 0.5s ease, fill 0.5s ease;
}
.dot {
  transition: cx 0.5s ease, cy 0.5s ease, fill 0.5s ease;
}
.q {
  font-size: 20px;
  fill: #94a3b8;
  font-weight: 600;
}
.fade {
  animation: fade-in 0.5s ease 0.3s both;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

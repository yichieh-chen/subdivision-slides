<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed } from 'vue'
import { cubic, fourPoint } from '../lib/curves'

/**
 * Cubic B-spline and 4-point subdivision one step at a time, in the same style as CornerCut.
 *
 * cubic:      0 polygon · 1 edge points · 2 vertex points · 3 connect · 4 repeat · 5 limit
 * fourPoint:  0 polygon · 1 insert      · 2 connect       · 3 repeat  · 4 limit
 */
const props = withDefaults(defineProps<{ scheme?: 'cubic' | 'fourPoint', step?: number }>(), { scheme: 'cubic', step: 0 })

const W = 520
const H = 250
const P: P2[] = [[50, 210], [150, 50], [330, 60], [470, 200]]
const path = (p: P2[]) => p.map(q => q.join(',')).join(' ')
const mid = (a: P2, b: P2): P2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]

const isCubic = computed(() => props.scheme === 'cubic')
/** cubic B-spline rule with the usual boundary rule: the two end points stay where they are */
function cubicOpen(p: P2[]): P2[] {
  return [p[0], ...cubic(p), p[p.length - 1]]
}
const rule = computed(() => (isCubic.value ? cubicOpen : fourPoint))
const last = computed(() => (isCubic.value ? 5 : 4))
const s = computed(() => Math.max(0, Math.min(last.value, props.step)))

const L1 = computed(() => rule.value(P))
const L2 = computed(() => rule.value(L1.value))
const LN = computed(() => rule.value(rule.value(rule.value(L2.value))))

// ---- cubic: edge points are the midpoints, vertex points are the moved old points
const edgePts = P.slice(0, -1).map((p, i) => mid(p, P[i + 1]))
const vertexPts = [1, 2].map(i => ({ from: P[i], to: cubic(P)[2 * i - 1] }))

// ---- 4-point: one new point per edge, pushed away from the plain midpoint
const inserted = P.slice(0, -1).map((p, i) => ({ mid: mid(p, P[i + 1]), to: fourPoint(P)[2 * i + 1] }))

/** which step first shows the connected polyline, the second round and the limit curve */
const at = computed(() => (isCubic.value ? { connect: 3, repeat: 4, limit: 5 } : { connect: 2, repeat: 3, limit: 4 }))

const caption = computed(() => (isCubic.value
  ? [
      '一開始：只有 control polygon',
      '① Edge points：每條邊的中點放一個新點（½、½）',
      '② Vertex points：舊的點往兩邊鄰居靠近一點（⅛、¾、⅛），頭尾不動',
      '③ Connect：照順序連起來，舊的折線丟掉',
      '④ Repeat：對新的折線再做一次',
      '重複很多次之後，就是一條 smooth curve（不通過中間的 P2、P3）',
    ]
  : [
      '一開始：只有 control polygon',
      '① Insert：每條邊插入一個新點，用前後 4 個點算，會比中點更往外',
      '② Connect：舊的點不動，跟新的點一起連起來',
      '③ Repeat：對新的折線再做一次',
      '重複很多次之後，就是一條通過所有 control points 的 smooth curve',
    ])[s.value])

/** where each P label sits relative to its point, so that no edge runs through it */
const NAME: P2[] = [[-30, 5], [-8, -14], [0, -14], [13, 5]]

const RED = '#dc2626'
const BLUE = '#2563eb'
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <!-- control polygon -->
      <polyline
        :points="path(P)" fill="none" stroke="#0f172a" stroke-width="2"
        :opacity="s >= at.connect ? 0.25 : 1" :stroke-dasharray="s >= at.connect ? '5 4' : ''"
      />

      <!-- cubic, step 2: which three points one vertex point is made from -->
      <g v-if="isCubic && s === 2" class="appear">
        <polyline :points="path([P[0], P[1], P[2]])" fill="none" stroke="#93c5fd" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
        <text :x="P[0][0] + 18" :y="P[0][1] + 12" class="w" :fill="BLUE">⅛</text>
        <text :x="P[1][0] - 34" :y="P[1][1] + 4" class="w" :fill="BLUE">¾</text>
        <text :x="P[2][0] - 40" :y="P[2][1] + 28" class="w" :fill="BLUE">⅛</text>
      </g>
      <!-- 4-point, step 1: which four points one new point is made from -->
      <g v-if="!isCubic && s === 1" class="appear">
        <polyline :points="path(P)" fill="none" stroke="#fca5a5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" />
        <text :x="P[0][0] + 18" :y="P[0][1] + 12" class="w" :fill="RED">−1/16</text>
        <text :x="P[1][0] - 52" :y="P[1][1] + 4" class="w" :fill="RED">9/16</text>
        <text :x="P[2][0] - 48" :y="P[2][1] + 28" class="w" :fill="RED">9/16</text>
        <text :x="P[3][0] - 66" :y="P[3][1] + 12" class="w" :fill="RED">−1/16</text>
      </g>

      <!-- old control points -->
      <g
        v-for="(p, i) in P" :key="i"
        :opacity="isCubic && s >= 2 && i > 0 && i < P.length - 1 ? 0.35 : 1"
      >
        <circle :cx="p[0]" :cy="p[1]" r="6" fill="#fff" stroke="#0f172a" stroke-width="2" />
        <text :x="p[0] + NAME[i][0]" :y="p[1] + NAME[i][1]" class="name" fill="#0f172a">P{{ i + 1 }}</text>
      </g>

      <!-- first round, connected -->
      <polyline
        v-if="s >= at.connect && s < at.limit" class="appear" :points="path(L1)" fill="none" :stroke="RED" stroke-width="2.2"
        :opacity="s >= at.repeat ? 0.3 : 1"
      />

      <!-- cubic: edge points, then vertex points -->
      <template v-if="isCubic">
        <g v-if="s >= 1 && s < at.limit" :opacity="s >= at.repeat ? 0.3 : 1">
          <circle v-for="(p, i) in edgePts" :key="`e${i}`" class="appear" :cx="p[0]" :cy="p[1]" r="5" :fill="RED" />
          <template v-if="s === 1">
            <text v-for="(p, i) in edgePts" :key="`et${i}`" :x="p[0] + (i === 2 ? -22 : 9)" :y="p[1] + 20" class="w" :fill="RED">½</text>
          </template>
        </g>
        <g v-if="s >= 2 && s < at.limit" :opacity="s >= at.repeat ? 0.3 : 1">
          <g v-for="(v, i) in vertexPts" :key="`v${i}`" class="appear">
            <line v-if="s === 2" :x1="v.from[0]" :y1="v.from[1]" :x2="v.to[0]" :y2="v.to[1]" :stroke="BLUE" stroke-width="2" stroke-dasharray="2 3" />
            <circle :cx="v.to[0]" :cy="v.to[1]" r="5.5" :fill="BLUE" />
          </g>
        </g>
      </template>

      <!-- 4-point: inserted points -->
      <template v-else>
        <g v-if="s >= 1 && s < at.limit" :opacity="s >= at.repeat ? 0.3 : 1">
          <g v-for="(q, i) in inserted" :key="`n${i}`" class="appear">
            <template v-if="s === 1">
              <circle :cx="q.mid[0]" :cy="q.mid[1]" r="5" fill="#fff" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2" />
              <line :x1="q.mid[0]" :y1="q.mid[1]" :x2="q.to[0]" :y2="q.to[1]" :stroke="RED" stroke-width="2" stroke-dasharray="2 3" />
            </template>
            <circle :cx="q.to[0]" :cy="q.to[1]" r="5" :fill="RED" />
          </g>
        </g>
      </template>

      <!-- second round -->
      <g v-if="s === at.repeat" class="appear">
        <polyline :points="path(L2)" fill="none" :stroke="RED" stroke-width="2.2" />
        <circle v-for="(p, i) in L2" :key="`r${i}`" :cx="p[0]" :cy="p[1]" r="3.5" :fill="RED" />
      </g>
      <!-- many rounds -->
      <polyline v-if="s >= at.limit" class="appear" :points="path(LN)" fill="none" :stroke="RED" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <div class="demo-title">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
.w {
  font-size: 15px;
  font-weight: 600;
}
.name {
  font-size: 15px;
}
/* a white outline keeps labels readable where a line passes behind them */
.w,
.name {
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 4px;
  stroke-linejoin: round;
}
svg {
  overflow: visible;
}
.appear {
  animation: appear 0.45s ease both;
}
@keyframes appear {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

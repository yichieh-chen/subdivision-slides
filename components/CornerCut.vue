<script setup lang="ts">
import type { P2 } from '../lib/curves'
import { computed } from 'vue'
import { chaikin } from '../lib/curves'

/** Step-by-step corner cutting, driven by the slide's click counter. */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 520
const H = 250
const P: P2[] = [[50, 210], [150, 50], [330, 60], [470, 200]]
const Q = chaikin(P)
const Q2 = chaikin(Q)
const Q3 = chaikin(chaikin(Q2))
const path = (p: P2[]) => p.map(q => q.join(',')).join(' ')
/** where each P label sits relative to its point, so that no edge runs through it */
const NAME: P2[] = [[-30, 5], [-8, -14], [0, -14], [13, 5]]

const caption = computed(() => [
  '一開始：只有 control polygon（控制多邊形）',
  '① Insert：每條邊上取 1/4 與 3/4 的位置，各放一個新點',
  '② Connect：把新點連起來，舊的 corner 就被「切掉」了',
  '③ Repeat：對新的折線再做一次，corner 越切越小',
  '重複很多次之後，折線看起來就是一條 smooth curve',
][Math.min(props.step, 4)])
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <polyline
        :points="path(P)" fill="none" stroke="#0f172a" stroke-width="2"
        :opacity="step >= 2 ? 0.25 : 1" :stroke-dasharray="step >= 2 ? '5 4' : ''"
      />
      <g v-for="(p, i) in P" :key="i" :opacity="step >= 2 ? 0.35 : 1">
        <circle :cx="p[0]" :cy="p[1]" r="6" fill="#fff" stroke="#0f172a" stroke-width="2" />
        <text :x="p[0] + NAME[i][0]" :y="p[1] + NAME[i][1]" class="lbl" style="font-size: 15px" fill="#0f172a">P{{ i + 1 }}</text>
      </g>
      <polyline v-if="step >= 2" :points="path(Q)" fill="none" stroke="#dc2626" stroke-width="2.2" :opacity="step >= 3 ? 0.3 : 1" />
      <g v-if="step >= 1" :opacity="step >= 3 ? 0.3 : 1">
        <circle v-for="(p, i) in Q" :key="i" :cx="p[0]" :cy="p[1]" r="5" fill="#dc2626" />
        <template v-if="step === 1">
          <text v-for="(p, i) in Q" :key="`t${i}`" :x="p[0] + (i >= 4 ? -34 : 9)" :y="p[1] + 18" class="lbl" style="font-size: 14px" fill="#dc2626">
            {{ i % 2 === 0 ? '1/4' : '3/4' }}
          </text>
        </template>
      </g>
      <g v-if="step === 3">
        <polyline :points="path(Q2)" fill="none" stroke="#dc2626" stroke-width="2.2" />
        <circle v-for="(p, i) in Q2" :key="i" :cx="p[0]" :cy="p[1]" r="3.5" fill="#dc2626" />
      </g>
      <polyline v-if="step >= 4" :points="path(Q3)" fill="none" stroke="#dc2626" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <div class="demo-title">
      {{ caption }}
    </div>
  </div>
</template>

<style scoped>
/* a white outline keeps labels readable where a line passes behind them */
.lbl {
  paint-order: stroke;
  stroke: #fff;
  stroke-width: 4px;
  stroke-linejoin: round;
}
svg {
  overflow: visible;
}
</style>

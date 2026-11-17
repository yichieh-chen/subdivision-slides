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
        :points="path(P)" fill="none" stroke="#e2e8f0" stroke-width="2"
        :opacity="step >= 2 ? 0.25 : 1" :stroke-dasharray="step >= 2 ? '5 4' : ''"
      />
      <g v-for="(p, i) in P" :key="i" :opacity="step >= 2 ? 0.35 : 1">
        <circle :cx="p[0]" :cy="p[1]" r="6" fill="#0b1220" stroke="#f1f5f9" stroke-width="2" />
        <text :x="p[0] - 6" :y="p[1] - 12" style="font-size: 15px" fill="#e2e8f0">P{{ i + 1 }}</text>
      </g>
      <polyline v-if="step >= 2" :points="path(Q)" fill="none" stroke="#f87171" stroke-width="2.2" :opacity="step >= 3 ? 0.3 : 1" />
      <g v-if="step >= 1" :opacity="step >= 3 ? 0.3 : 1">
        <circle v-for="(p, i) in Q" :key="i" :cx="p[0]" :cy="p[1]" r="5" fill="#f87171" />
        <template v-if="step === 1">
          <text v-for="(p, i) in Q" :key="`t${i}`" :x="p[0] + 9" :y="p[1] + 16" style="font-size: 14px" fill="#f87171">
            {{ i % 2 === 0 ? '1/4' : '3/4' }}
          </text>
        </template>
      </g>
      <g v-if="step === 3">
        <polyline :points="path(Q2)" fill="none" stroke="#f87171" stroke-width="2.2" />
        <circle v-for="(p, i) in Q2" :key="i" :cx="p[0]" :cy="p[1]" r="3.5" fill="#f87171" />
      </g>
      <polyline v-if="step >= 4" :points="path(Q3)" fill="none" stroke="#f87171" stroke-width="3" stroke-linejoin="round" />
    </svg>
    <div class="demo-title">
      {{ caption }}
    </div>
  </div>
</template>

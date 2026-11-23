<script setup lang="ts">
import { computed } from 'vue'

/**
 * Why neighbouring patches of different levels crack, and how the crack is closed.
 * Top view of two patches that share an edge: the left one was subdivided once more.
 * Its new edge point M moved to a smoother position, the right patch still draws the
 * straight edge A-B, so a thin hole A-M-B opens (exaggerated here).
 * step 0  the two patches   step 1  the T-junction and the crack   step 2  fill triangle
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const W = 560
const H = 270
const A = [300, 40]
const B = [300, 230]
const M = [278, 135]
const L = [[70, 40], [185, 40], [70, 135], [185, 135], [70, 230], [185, 230]]
const R = [[500, 40], [500, 230]]
const pts = (...p: number[][]) => p.map(q => q.join(',')).join(' ')

const caption = computed(() => [
  '左邊這塊離鏡頭近，多切了一次。右邊這塊比較遠，沒有切。',
  '共用的邊上，左邊多了一個點 M 而且被移到新位置，右邊還是畫直線 A–B，中間就破一個洞',
  '修法：建三角形的時候，在洞的位置補一個三角形 A–M–B，表面就 watertight 了',
][Math.min(props.step, 2)])
</script>

<template>
  <div class="demo" :style="{ width: `${W}px` }">
    <svg :width="W" :height="H" :viewBox="`0 0 ${W} ${H}`">
      <!-- right patch: one quad -->
      <polygon :points="pts(A, R[0], R[1], B)" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" />
      <!-- left patch: four quads -->
      <polygon :points="pts(L[0], L[1], L[3], L[2])" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />
      <polygon :points="pts(L[1], A, M, L[3])" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />
      <polygon :points="pts(L[2], L[3], L[5], L[4])" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />
      <polygon :points="pts(L[3], M, B, L[5])" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />
      <!-- the hole -->
      <polygon
        :points="pts(A, M, B)"
        :fill="step >= 2 ? '#86efac' : step === 1 ? '#fecaca' : '#fff'"
        :stroke="step >= 2 ? '#15803d' : step === 1 ? '#dc2626' : '#1e3a8a'" stroke-width="2"
      />
      <g v-if="step >= 1">
        <circle :cx="M[0]" :cy="M[1]" r="6" :fill="step >= 2 ? '#15803d' : '#dc2626'" />
        <text :x="M[0] - 26" :y="M[1] - 9" class="lbl" :fill="step >= 2 ? '#15803d' : '#dc2626'">M</text>
        <circle :cx="A[0]" :cy="A[1]" r="5" fill="#0f172a" />
        <circle :cx="B[0]" :cy="B[1]" r="5" fill="#0f172a" />
        <text :x="A[0] - 5" :y="A[1] - 12" class="lbl" fill="#0f172a">A</text>
        <text :x="B[0] - 5" :y="B[1] + 26" class="lbl" fill="#0f172a">B</text>
      </g>
      <g v-if="step === 1">
        <line x1="356" y1="135" x2="304" y2="135" stroke="#dc2626" stroke-width="2" />
        <polygon points="300,135 310,130 310,140" fill="#dc2626" />
        <text x="362" y="141" class="lbl" fill="#dc2626">crack</text>
        <text x="196" y="160" class="tag" fill="#dc2626">T-junction</text>
      </g>
      <text v-if="step >= 2" x="312" y="141" class="lbl" fill="#15803d">補一個三角形</text>
      <text x="128" y="258" class="tag" fill="#334155" text-anchor="middle">近：Level n+1</text>
      <text x="400" y="258" class="tag" fill="#334155" text-anchor="middle">遠：Level n</text>
    </svg>
    <div class="demo-title cap">
      {{ caption }}
    </div>
    <div class="demo-note">
      縫的大小是誇大畫的，實際上只有一兩個 pixel，但是會透出背景的顏色
    </div>
  </div>
</template>

<style scoped>
.lbl {
  font-size: 17px;
  font-weight: 600;
}
.tag {
  font-size: 14px;
}
.cap {
  text-align: center;
  min-height: 2.8em;
}
</style>

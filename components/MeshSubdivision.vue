<script setup lang="ts">
import type { Mesh, MeshScheme } from '../lib/mesh'
import type { MeshLayer, Point3D } from './Mesh3D.vue'
import { computed, ref, watch } from 'vue'
import { meshSchemes, normalize, shapeLabels, shapes, triangulate } from '../lib/mesh'

const props = withDefaults(defineProps<{
  shape?: string
  /** more than one entry shows a shape switcher */
  shapes?: string[]
  scheme?: MeshScheme
  /** more than one entry shows a scheme switcher */
  schemes?: MeshScheme[]
  level?: number
  maxLevel?: number
  /** triangulate the control mesh first even when the scheme accepts quads */
  triangulated?: boolean
  cage?: boolean
  /** mark the original control vertices */
  marks?: boolean
  /** only show the marks facing the viewer (for sphere-like shapes) */
  frontMarks?: boolean
  color?: string
  width?: number
  height?: number
  zoom?: number
  autoRotate?: boolean
  title?: string
  /** hide the slider and counts (for decorative use) */
  controls?: boolean
}>(), {
  shape: 'cube',
  scheme: 'catmull-clark',
  level: 0,
  maxLevel: 4,
  cage: true,
  marks: false,
  color: '#5b8def',
  width: 400,
  height: 300,
  zoom: 1,
  autoRotate: true,
  controls: true,
})

const FACE_LIMIT = 6000

const shape = ref(props.shape)
const scheme = ref<MeshScheme>(props.scheme)
const level = ref(props.level)
const showCage = ref(props.cage)
watch(() => props.level, v => (level.value = v))

const base = computed<Mesh>(() => {
  const m = normalize(shapes[shape.value]())
  return meshSchemes[scheme.value].tri || props.triangulated ? triangulate(m) : m
})

const levels = computed<Mesh[]>(() => {
  const out = [base.value]
  for (let i = 0; i < props.maxLevel; i++) {
    const next = meshSchemes[scheme.value].step(out[i])
    if (next.f.length > FACE_LIMIT)
      break
    out.push(next)
  }
  return out
})

const current = computed(() => levels.value[Math.min(level.value, levels.value.length - 1)])

const layers = computed<MeshLayer[]>(() => {
  const out: MeshLayer[] = [{ mesh: current.value, color: props.color }]
  if (showCage.value && level.value > 0)
    out.push({ mesh: base.value, wire: true, color: '#0f172a' })
  return out
})

const points = computed<Point3D[]>(() =>
  props.marks ? base.value.v.map(p => ({ p, color: '#ef4444', r: 4.5 })) : [],
)
</script>

<template>
  <div class="demo" :style="{ width: `${width}px` }">
    <div v-if="title" class="demo-title">
      {{ title }}
    </div>
    <div v-if="schemes && schemes.length > 1" class="demo-row">
      <button v-for="s in schemes" :key="s" class="chip" :class="{ on: s === scheme }" @click="scheme = s">
        {{ meshSchemes[s].label }}
      </button>
    </div>
    <div v-if="props.shapes && props.shapes.length > 1" class="demo-row">
      <button v-for="s in props.shapes" :key="s" class="chip" :class="{ on: s === shape }" @click="shape = s">
        {{ shapeLabels[s] }}
      </button>
    </div>
    <Mesh3D :layers="layers" :points="points" :width="width" :height="height" :zoom="zoom" :auto-rotate="autoRotate" :front-points="frontMarks" />
    <div v-if="controls" class="demo-row">
      <label class="slider">
        <span>Level {{ Math.min(level, levels.length - 1) }}</span>
        <input v-model.number="level" type="range" min="0" :max="levels.length - 1" step="1">
      </label>
      <label class="check"><input v-model="showCage" type="checkbox"> control mesh</label>
    </div>
    <div v-if="controls" class="demo-note">
      {{ current.v.length }} vertices · {{ current.f.length }} faces · 拖曳可旋轉
    </div>
  </div>
</template>

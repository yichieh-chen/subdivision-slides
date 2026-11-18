<script setup lang="ts">
import type { Mesh, V3 } from '../lib/mesh'
import { useIsSlideActive } from '@slidev/client'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { buildEdges } from '../lib/mesh'

export interface MeshLayer {
  mesh: Mesh
  /** hex colour, e.g. #4f8ef7 */
  color?: string
  /** one hex colour per face, overrides `color` */
  faceColors?: string[]
  /** draw edges only (used for the control cage) */
  wire?: boolean
  /** draw the edges of filled faces */
  edges?: boolean
}
export interface Point3D { p: V3, color: string, r?: number, /** text drawn next to the point */ label?: string }
/** a highlighted line between two points in space */
export interface Segment3D { a: V3, b: V3, color: string, width?: number }

const props = withDefaults(defineProps<{
  layers: MeshLayer[]
  points?: Point3D[]
  segments?: Segment3D[]
  width?: number
  height?: number
  yaw?: number
  pitch?: number
  zoom?: number
  autoRotate?: boolean
  /** hide points on the far side (only sensible for convex shapes centred on the origin) */
  frontPoints?: boolean
}>(), {
  points: () => [],
  segments: () => [],
  width: 420,
  height: 340,
  yaw: 0.6,
  pitch: 0.42,
  zoom: 1,
  autoRotate: false,
})

const canvas = ref<HTMLCanvasElement>()
const yaw = ref(props.yaw)
const pitch = ref(props.pitch)
const dragging = ref(false)
const isActive = useIsSlideActive()
let raf = 0

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map(i => Number.parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

function draw() {
  const c = canvas.value
  if (!c)
    return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (c.width !== props.width * dpr || c.height !== props.height * dpr) {
    c.width = props.width * dpr
    c.height = props.height * dpr
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, props.width, props.height)
  ctx.lineJoin = 'round'

  const cy = Math.cos(yaw.value)
  const sy = Math.sin(yaw.value)
  const cp = Math.cos(pitch.value)
  const sp = Math.sin(pitch.value)
  const D = 4.2
  const S = Math.min(props.width, props.height) * 0.43 * props.zoom
  // rotate into view space
  const view = (p: V3): V3 => {
    const x = p[0] * cy + p[2] * sy
    const z0 = -p[0] * sy + p[2] * cy
    return [x, p[1] * cp - z0 * sp, p[1] * sp + z0 * cp]
  }
  // perspective-project a view-space point to [x, y, depth]
  const screen = (q: V3): V3 => {
    const k = (S * D) / (D - q[2])
    return [props.width / 2 + q[0] * k, props.height / 2 - q[1] * k, q[2]]
  }
  const project = (p: V3) => screen(view(p))

  interface Poly { pts: V3[], z: number, fill: string, stroke: string | null }
  const polys: Poly[] = []
  const wires: { pts: V3[], layer: MeshLayer }[] = []

  for (const layer of props.layers) {
    const vv = layer.mesh.v.map(view)
    const pv = vv.map(screen)
    if (layer.wire) {
      wires.push({ pts: pv, layer })
      continue
    }
    const base = hexToRgb(layer.color ?? '#5b8def')
    const manyFaces = layer.mesh.f.length > 2500
    layer.mesh.f.forEach((f, fi) => {
      const pts = f.map(i => pv[i])
      // Newell normal in view space, for simple two-sided shading
      let nx = 0
      let ny = 0
      let nz = 0
      let z = 0
      for (let i = 0; i < f.length; i++) {
        const a = vv[f[i]]
        const b = vv[f[(i + 1) % f.length]]
        nx += (a[1] - b[1]) * (a[2] + b[2])
        ny += (a[2] - b[2]) * (a[0] + b[0])
        nz += (a[0] - b[0]) * (a[1] + b[1])
        z += a[2]
      }
      const l = Math.hypot(nx, ny, nz) || 1
      const shade = 0.45 + 0.55 * Math.abs((nx * 0.35 + ny * 0.45 + nz * 0.82) / l)
      const rgb = layer.faceColors ? hexToRgb(layer.faceColors[fi]) : base
      const col = rgb.map(v => Math.round(v * shade))
      polys.push({
        pts,
        z: z / pts.length,
        fill: `rgb(${col[0]},${col[1]},${col[2]})`,
        stroke: layer.edges === false ? null : `rgba(15,23,42,${manyFaces ? 0.12 : 0.38})`,
      })
    })
  }

  polys.sort((a, b) => a.z - b.z)
  ctx.lineWidth = 0.8
  for (const p of polys) {
    ctx.beginPath()
    p.pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])))
    ctx.closePath()
    ctx.fillStyle = p.fill
    ctx.fill()
    // stroking in the fill colour hides the hairline gaps between faces
    ctx.strokeStyle = p.stroke ?? p.fill
    ctx.stroke()
  }

  for (const w of wires) {
    ctx.strokeStyle = w.layer.color ?? '#0f172a'
    ctx.globalAlpha = 0.55
    ctx.lineWidth = 1.3
    ctx.setLineDash([5, 4])
    ctx.beginPath()
    for (const e of buildEdges(w.layer.mesh).values()) {
      ctx.moveTo(w.pts[e.a][0], w.pts[e.a][1])
      ctx.lineTo(w.pts[e.b][0], w.pts[e.b][1])
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }

  ctx.lineCap = 'round'
  for (const s of props.segments) {
    const a = project(s.a)
    const b = project(s.b)
    ctx.strokeStyle = s.color
    ctx.lineWidth = s.width ?? 4
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
  }

  const pts = props.points.map(p => ({ ...p, q: project(p.p) }))
    .filter(p => !props.frontPoints || p.q[2] > -0.05)
    .sort((a, b) => a.q[2] - b.q[2])
  for (const p of pts) {
    ctx.beginPath()
    ctx.arc(p.q[0], p.q[1], p.r ?? 5, 0, Math.PI * 2)
    ctx.fillStyle = p.color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
  ctx.font = '700 15px "Noto Sans TC", sans-serif'
  ctx.textBaseline = 'middle'
  for (const p of pts) {
    if (!p.label)
      continue
    const x = p.q[0] + (p.r ?? 5) + 4
    const y = p.q[1] - (p.r ?? 5) - 3
    ctx.lineWidth = 4
    ctx.strokeStyle = '#fff'
    ctx.strokeText(p.label, x, y)
    ctx.fillStyle = p.color
    ctx.fillText(p.label, x, y)
  }
}

function tick() {
  if (props.autoRotate && isActive.value && !dragging.value) {
    yaw.value += 0.006
    draw()
  }
  raf = requestAnimationFrame(tick)
}

function onDown(e: PointerEvent) {
  dragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}
function onMove(e: PointerEvent) {
  if (!dragging.value)
    return
  yaw.value += e.movementX * 0.012
  pitch.value = Math.max(-1.5, Math.min(1.5, pitch.value + e.movementY * 0.012))
  draw()
}
function onUp() {
  dragging.value = false
}

watch(() => [props.layers, props.points, props.segments, props.width, props.height, props.zoom], draw)
onMounted(() => {
  draw()
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas
    ref="canvas"
    class="mesh3d"
    :style="{ width: `${width}px`, height: `${height}px` }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  />
</template>

<style scoped>
.mesh3d {
  cursor: grab;
  touch-action: none;
  display: block;
}
.mesh3d:active {
  cursor: grabbing;
}
</style>

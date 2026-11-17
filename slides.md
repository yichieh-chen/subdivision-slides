---
theme: seriph
title: Subdivision
info: Computer Graphics 課堂報告：Subdivision Curves & Surfaces
colorSchema: dark
transition: slide-left
fonts:
  sans: Noto Sans TC
layout: center
class: text-center
---

<div class="flex justify-center items-center gap-2 mb-2">
  <MeshSubdivision shape="tshape" :level="0" :controls="false" :cage="false" :width="190" :height="170" />
  <div class="text-3xl opacity-40">→</div>
  <MeshSubdivision shape="tshape" :level="1" :controls="false" :cage="false" :width="190" :height="170" />
  <div class="text-3xl opacity-40">→</div>
  <MeshSubdivision shape="tshape" :level="3" :controls="false" :cage="false" :width="190" :height="170" />
</div>

<h1 class="cover-title">Subdivision</h1>

從粗糙的 mesh 長出 smooth 的 curve 與 surface

<div class="small mt-6">Computer Graphics · 課堂報告</div>

<!--
開場：今天不推公式，用動畫和可以自己玩的 demo 來看 subdivision 在做什麼。
-->

---
layout: two-cols
---

# 今天要講什麼

1. **Why**：為什麼需要 subdivision
2. **Warm-up**：球面與 fractal terrain
3. **定位**：NURBS、Mesh、Subdivision
4. **Subdivision Curves**：Chaikin、B-spline、4-point
5. **Subdivision Surfaces**：Doo-Sabin、Catmull-Clark
6. **Triangle schemes**：Butterfly、Loop
7. **總結**：creases、該用哪一種

<div class="small mt-6">投影片裡的圖大多可以拖曳、可以調 slider。</div>

::right::

<MeshSubdivision shape="tshape" scheme="catmull-clark" :level="3" :width="420" :height="300" />

---
src: ./pages/01-why.md
---

---
src: ./pages/02-warmup.md
---

---
src: ./pages/03-position.md
---

---
src: ./pages/04-curves.md
---

---
src: ./pages/05-surfaces.md
---

---
src: ./pages/06-triangles.md
---

---
src: ./pages/07-wrapup.md
---

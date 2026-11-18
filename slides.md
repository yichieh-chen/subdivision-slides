---
theme: seriph
title: Subdivision
info: Computer Graphics 課堂報告：Subdivision Curves & Surfaces
colorSchema: light
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
開場：今天的主題是 subdivision，中文叫細分。

一句話講完：從一個很粗的 mesh 開始，一直切、一直調整，最後長出平滑的曲線或曲面。上面三張圖就是同一個形狀切 0 次、1 次、3 次的樣子。

今天不會推很多公式，主要用動畫和可以現場操作的 demo 來看它在做什麼。
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

<!--
先講今天的路線，總共七段。我負責前四段，講到 curve 為止；surface 之後由我的夥伴接著講。

前四段的順序：先講為什麼需要 subdivision，再用球和地形兩個最簡單的例子暖身，接著看它跟 NURBS、polygon mesh 比起來的位置，最後在 2D 的曲線上把觀念弄懂。

提醒大家：投影片上的圖大多可以拖曳、可以拉 slider，等一下會現場操作。
-->

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

---
layout: section
---

# 6. Triangle Schemes

Modified Butterfly 與 Loop

---
layout: two-cols
---

# Regular 與 Extraordinary

Triangle mesh 的 subdivision 都是同一種切法：
每條 edge 切一半，<span class="key">每個 face 切成 4 個</span>。

- 新長出來的 vertex，degree 一定是 **6** → <span class="key">regular</span>
- Degree 不是 6 的 vertex → <span class="key">extraordinary</span>
- Extraordinary vertex 的數量不會增加，只會是原本 control mesh 上的那些

<div class="small mt-4">

所以規則通常寫兩套：一套給 regular 的地方，一套特別處理 extraordinary vertex。
右邊拉 $n$ 看看 Loop 對不同 degree 的權重。

</div>

::right::

<Stencil kind="loop-vertex" />

---
layout: two-cols
---

# Butterfly Scheme

**Interpolating**：舊的 vertex 不動，只算每條 edge 上的新點。

新點 <b style="color:#f97316">●</b> = 周圍 vertices 的 weighted sum：

- <b style="color:#2563eb">a</b>：edge 的兩個端點（最重要）
- <b style="color:#16a34a">b</b>：兩邊三角形的對角
- <b style="color:#dc2626">c</b>：再外面一圈，權重是 <span class="key">負的</span>
- <b style="color:#9333ea">d</b>：由參數 $w$ 控制

<div class="small mt-3">

形狀像一隻蝴蝶，所以叫 butterfly。
$w$ 決定 surface 貼 control mesh 貼得多緊。

</div>

::right::

<Stencil kind="butterfly" />

---
layout: two-cols
---

# Modified Butterfly

原本的 butterfly 只在 degree 6 的地方才 smooth。

**Modified** 版本多加了規則：

- Edge 有一端是 extraordinary vertex
  → 只用 <span class="key">那個 vertex 的一圈鄰居</span> 來算
- 兩端都是 extraordinary → 兩邊各算一次再平均
- Boundary 上的 edge → 新點直接放中點

<v-click>

結果：<b style="color:#ef4444">●</b> 原本的 control points 都還在 surface 上。

</v-click>

::right::

<MeshSubdivision
  shape="icosahedron" :shapes="['icosahedron', 'octahedron', 'tshape']" scheme="butterfly"
  :level="1" :max-level="4" marks color="#34d399" :width="400" :height="290"
/>

---

# Why not Butterfly?

<div class="flex gap-4 items-start">
<div class="flex-1">

Interpolating 聽起來很好，但是：

- 只有 $C^1$，不是 $C^2$
- 不夠 **fair**：表面容易有小波浪（wiggles）
- 對 noise 很敏感：control points 一歪，surface 就跟著歪

<v-click>

<div class="mt-4">

同一個 control mesh，右邊 **Loop** 比較小顆但比較順。
這就是 approximating 換來的好處。

</div>

</v-click>

</div>
<MeshSubdivision shape="tshape" scheme="butterfly" :level="3" marks color="#34d399" :width="280" :height="240" title="Modified Butterfly" />
<MeshSubdivision shape="tshape" scheme="loop" :level="3" marks color="#a78bfa" :width="280" :height="240" title="Loop" />
</div>

---
layout: two-cols
---

# Loop Subdivision

以 Charles Loop 命名（不是因為規則裡有 loop）。
<span class="key">Approximating</span>，triangle mesh 最常用的 scheme。

**① Edge point**（右圖）

$$e = \tfrac{3}{8}(v_1 + v_2) + \tfrac{1}{8}(v_3 + v_4)$$

**② Move old vertices**

$$v_{new} = (1 - n\beta)\, v_{old} + \beta \sum_{j=1}^{n} v_j$$

<div class="small">

$n$ = degree。Regular（$n = 6$）時 $\beta = \tfrac{1}{16}$；
簡化版：$n = 3$ 用 $\tfrac{3}{16}$，其他用 $\tfrac{3}{8n}$。

</div>

::right::

<Stencil kind="loop-edge" />

---
layout: two-cols
---

# Loop：實際切切看

- 每個 triangle → 4 個 triangles
- 舊的 vertex 也會被往內拉
  → surface 會比 control mesh <span class="key">小一圈</span>
- Regular 的地方 $C^2$，extraordinary vertex 是 $C^1$

<v-click>

**Boundary 與 crease 的特殊規則**

- Edge point 直接放在中點
- 舊的點只看 boundary 上的左右鄰居：
  $\tfrac{1}{8},\ \tfrac{3}{4},\ \tfrac{1}{8}$（就是 cubic B-spline curve 的規則）

</v-click>

::right::

<MeshSubdivision
  shape="icosahedron" :shapes="['icosahedron', 'octahedron', 'tetrahedron', 'tshape', 'ring']" scheme="loop"
  :level="1" :max-level="4" color="#a78bfa" :width="400" :height="290"
/>

---

# What to Use?

<div class="flex gap-4 items-start">
<div class="flex-1">

- 不需要 interpolate → <span class="key">Loop</span> 或 <span class="key">Catmull-Clark</span>
- 一定要通過 control points → Butterfly
- Triangle mesh → Loop
- Quad mesh → Catmull-Clark

<v-click>

<div class="mt-4">

**不要** 把 quad mesh 先切成 triangles 再做 Catmull-Clark：
多出來的對角線會讓 mesh 變得不規則，surface 也比較不平順。

</div>

</v-click>

</div>
<MeshSubdivision shape="tshape" scheme="catmull-clark" :level="2" :width="280" :height="240" title="Quads → Catmull-Clark" />
<MeshSubdivision shape="tshape" scheme="catmull-clark" triangulated :level="2" color="#e2725b" :width="280" :height="240" title="先 triangulate 再 Catmull-Clark" />
</div>

---
layout: section
---

# 3. Subdivision 的定位

在 NURBS 和 polygon mesh 之間

---

# NURBS vs. Mesh vs. Subdivision

| | NURBS / Bézier patch | Polygon mesh | Subdivision surface |
|---|---|---|---|
| 平滑度 | 天生 continuous | 天生 discrete | <span class="key">Limit surface 是 smooth 的</span> |
| 控制方式 | Control mesh，直覺 | 直接拉 vertices | <span class="key">Control mesh，直覺</span> |
| 形狀限制 | 只能是 grid（sheet、cylinder、torus） | 任意 topology | <span class="key">任意 topology</span> |
| 麻煩的地方 | 複雜形狀要拼很多 patch，接縫會裂開（cracks） | 要很多 vertices 才會平滑 | Extraordinary points 要特別處理 |

<v-click>

<div class="mt-6">

Subdivision 拿到兩邊的優點：像 NURBS 一樣 smooth、好控制，又像 mesh 一樣什麼形狀都能做。

</div>

</v-click>

---
layout: two-cols
---

# 任意 topology 的例子

右邊是一個有 <span class="key">洞</span> 的形狀。

- 用 NURBS：要拆成很多塊 patch 再縫起來
- 用 subdivision：整個 mesh 直接切，不用管洞

<div class="small mt-6">拉 slider 看它怎麼變平滑；勾 control mesh 看原本的形狀。</div>

::right::

<MeshSubdivision shape="ring" :shapes="['ring', 'tshape']" scheme="catmull-clark" :level="2" :width="400" :height="290" />

---
layout: two-cols
---

# 實際應用：Pixar

- *Geri&#39;s Game*（1997）：Pixar 第一部用 subdivision 做角色的短片
- *Ratatouille*：廚師的衣服、圍裙
- 之後幾乎都用 <span class="key">Catmull-Clark</span>

<v-click>

手會<b>分岔</b>成好幾根手指：

- NURBS：要拼很多塊 patch，接縫容易裂
- Subdivision：<b>一個</b> control mesh 包完整隻手

</v-click>

::right::

<MeshSubdivision
  shape="hand" scheme="catmull-clark" :level="3" :max-level="3" :width="420" :height="300" :zoom="1.15"
  title="示意：一個粗的 control mesh → 平滑的手"
/>

<div class="small mt-4 text-center">出處：DeRose, Kass, Truong,<br><i>Subdivision Surfaces in Character Animation</i>, SIGGRAPH 1998</div>

<!--
右邊不是電影裡的模型，是我們自己用方塊堆的一隻手，用來示意 Pixar 的做法。
把 slider 拉到 0：動畫師實際在調的就是這個很粗的 control mesh，只有幾十個點。
拉回 3：算出來的是平滑的手，而且手指分岔的地方沒有任何接縫。
Geri's Game 之前，Pixar 用 NURBS 做角色（例如 Toy Story），要花很多力氣處理 patch 之間的接縫。
-->

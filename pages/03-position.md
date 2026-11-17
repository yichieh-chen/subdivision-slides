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

<v-click>

**實際應用：Pixar**

- *Geri&#39;s Game*（1997）：Geri 的頭、手、衣服都是 subdivision surfaces
- *Ratatouille*：廚師的衣服、圍裙
- 之後 Pixar 的電影幾乎都用 **Catmull-Clark**

</v-click>

::right::

<MeshSubdivision shape="ring" :shapes="['ring', 'tshape']" scheme="catmull-clark" :level="2" :width="400" :height="290" />

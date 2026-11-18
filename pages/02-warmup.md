---
layout: section
---

# 2. Warm-up

兩個最簡單的 subdivision：球面與 fractal terrain

---

# 問題：怎麼把球切成 polygon？

最直覺的做法是用經緯度（polar coordinates）一格一格切，但是：

<div class="flex justify-center gap-12 mt-2">
  <ShapeView kind="uv-sphere" title="經緯度切法" color="#e2725b">
    中間是四邊形，但格子越往南北極越擠；<br>極點是一圈細長的三角形，degree 很高
  </ShapeView>
  <ShapeView kind="ico-sphere" title="Subdivision 切法" color="#5b8def">
    全部是三角形，大小幾乎一樣
  </ShapeView>
</div>

---
layout: two-cols
---

# Sphere Subdivision

從一個全是三角形的正多面體開始：
**Octahedron**（8 面）或 **Icosahedron**（20 面）

每一輪：

1. 每條 edge 的中點插入一個新 vertex
2. 把所有 vertex <span class="key">往外推到球面上</span>
3. 每個 triangle 切成 4 個

<v-click>

<div class="small mt-4">

觀察：新長出來的 vertex 的 degree 都是 6（regular）。
只有最一開始的那幾個點 degree 不是 6，叫做 <span class="key">extraordinary points</span>。

</div>

</v-click>

::right::

<MeshSubdivision
  shape="octahedron" :shapes="['octahedron', 'icosahedron']" scheme="sphere"
  :max-level="4" :cage="false" :width="400" :height="290"
/>

<!--
問大家：這個 scheme 是 interpolating 嗎？是，舊的點本來就在球面上，不會再動。
-->

---
layout: two-cols
---

# Fractal Terrain

**Fractal**：放大來看，局部和整體長得很像。
山上有丘陵，丘陵上有石頭……

做法和球幾乎一樣，只改第 2 步：

1. 每條 edge 的中點插入新 vertex
2. 把新 vertex <span class="key">隨機往上或往下推</span>
3. 每個 triangle 切成 4 個

<v-click>

關鍵：每切一層，隨機位移的大小要乘上一個比例 $k$

$$s_{i+1} = k \cdot s_i$$

<div class="small">不然細節會跟大山一樣高，變成一團雜訊。</div>

</v-click>

::right::

<Terrain :width="420" :height="290" />

---

# 演算法長什麼樣子？

球和 terrain 用的是同一個骨架，只有「新 vertex 放哪」不同：

```text {all|2|3-5|6-8|9}
Split_One_Level(mesh):
    copy old vertices
    for each edge:
        create a new vertex            # 放在哪？ 這行決定了是哪種 scheme
        create two new edges
    for each face:
        create new edges inside the face
        create 4 new faces
    replace old vertices, edges and faces
```

<v-click at="5">

**難的不是數學，是 data structure：**
給一條 edge，要能快速找到它的兩個端點、兩邊的 face、鄰居的 vertex。

</v-click>

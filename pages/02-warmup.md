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

# Degree 高會有什麼問題？

一個 vertex 的 <span class="key">degree</span> = 有幾條 edge 連到它。

極點接了所有經線，degree 很高：

- 周圍的三角形 <span class="key">又細又長</span>
- 光影和貼圖在那附近容易不自然
- 一小塊地方擠了很多點，<b>浪費</b>

<div class="small mt-4">拉 slider：degree 越高，三角形越細。</div>

::right::

<div class="mt-10">
  <DegreeFan :degree="24" />
</div>

<!--
先定義 degree：一個點連出去幾條邊。
紅點就是極點。一圈是 360 度，連 24 條邊的話每個三角形只分到 15 度，一定又尖又細。
把 slider 往左拉到 6：這時候每個三角形剛好是正三角形，最平均。
-->

---

# 實際貼圖會怎樣？

<div class="mt-2">把一張 <b>每格一樣大</b> 的棋盤格，貼到經緯度切法的球上：</div>

<div class="mt-2">
  <PoleTexture :size="225" />
</div>

<div class="mt-1">

- 赤道附近：格子還算方正
- 越往極點：格子被 <span class="key">擠成細長條</span>，最後全部擠進同一個點

</div>

<!--
這是把貼圖實際貼上去的結果，不是示意圖：每個格子在原圖上都一樣大。
貼圖最上面那一整排，在球上全部要塞進極點這一個點，所以圖案在那裡一定會被擠壓。
地球儀、天空球在極點附近常看到的「一圈放射狀」就是這個原因。
可以拖曳把球轉到側面，對比赤道和極點。
-->

---
layout: two-cols
---

# Extraordinary points

Subdivision 的規則是照「正常」的點設計的：

- 三角形 mesh：degree <span class="key">6</span>
- 四邊形 mesh：degree <span class="key">4</span>

這種點叫 <span class="key">regular</span>，其他都叫 <span class="key">extraordinary</span>。

<v-click>

- Extraordinary point 附近比較不平滑
- Degree 離正常值越遠，通常越糟
- 所以這種點 <b>越少越好</b>

</v-click>

::right::

<MeshSubdivision
  shape="octahedron" :shapes="['octahedron', 'icosahedron']" scheme="sphere"
  :level="2" :max-level="4" :cage="false" marks front-marks :width="400" :height="270"
  title="紅點是 extraordinary，其他都是 regular"
/>

<!--
三角形 mesh 裡 degree 6 最「正常」，就像上一頁 slider 拉到 6 的樣子。
右邊這顆球只有紅色那幾個點不是 degree 6（八面體是 4，二十面體是 5），其他全部都是 6。
對比經緯度切法：極點的 degree 是二十幾。
這顆球怎麼切出來的？下一頁。之後每個 scheme 都會遇到 extraordinary points，是整份報告反覆出現的主題。
-->

---
layout: two-cols
---

# Sphere Subdivision

從一個全是三角形的正多面體開始：
**Octahedron**（8 面）或 **Icosahedron**（20 面）

每一輪：

1. 每條 edge 的中點插入一個新 vertex
2. 連接新的 vertices，triangle 切成 4 個
3. 把新的 vertices <span class="key">往外推到球面上</span>

::right::

<MeshSubdivision
  shape="octahedron" :shapes="['octahedron', 'icosahedron']" scheme="sphere"
  :max-level="4" :cage="false" :width="400" :height="290"
/>

<!--
步驟 1、2 是 Refine，步驟 3 是 Smooth。
中點在球的裡面，不往外推的話切再多次還是原來的多面體。
問大家：這個 scheme 是 interpolating 嗎？是，舊的點本來就在球面上，不會再動。
-->

---
clicks: 3
---

# 一輪拆開來看

<div class="mt-2">
  <SphereStep :step="$clicks" />
</div>

<!--
按一下走一步。左邊是整個 mesh，淺色那一面是我們盯著看的 triangle；右邊是把球切開、從側面看一條 edge。
[click] 步驟 1：每條 edge 的中點插入一個新 vertex。注意右邊：中點在直線上，直線在球的裡面。
[click] 步驟 2：把新的 vertices 連起來，一個 triangle 變四個。形狀完全沒變，到這裡都只是 Refine。
[click] 步驟 3：把新的 vertices 從球心往外推到球面上。這是 Smooth，表面才鼓起來。
舊的深藍色點從頭到尾沒有動。
-->

---
layout: two-cols
---

# Fractal Terrain

**Fractal**：放大來看，局部和整體長得很像。
山上有丘陵，丘陵上有石頭……

做法和球幾乎一樣，只改第 3 步：

1. 每條 edge 的中點插入新 vertex
2. 連接新的 vertices，triangle 切成 4 個
3. 把新的 vertices <span class="key">隨機往上或往下推</span>

<v-click>

關鍵：每切一層，隨機位移的大小要乘上一個比例 $k$

$$s_{i+1} = k \cdot s_i$$

<div class="small">不然細節會跟大山一樣高，變成一團雜訊。</div>

</v-click>

::right::

<Terrain :width="420" :height="290" />

---
clicks: 4
---

# 地形的一輪拆開來看

<div class="mt-2">
  <TerrainStep :step="$clicks" />
</div>

<!--
跟球那頁一樣，按一下走一步。左邊是整塊地，右邊是從側面看其中一條 edge。
[click] 步驟 1：每條 edge 的中點插入一個新 vertex。
[click] 步驟 2：連起來，一個 triangle 變四個。到這裡還是平的，跟球一模一樣。
[click] 步驟 3：這裡不一樣了。新的點隨機往上或往下推，最多推 s。可以按「換一組亂數」，每次結果都不同。
[click] 下一輪再做同樣三件事，但這次最多只能推 k 乘 s。k 是 0.5，所以起伏只有上一輪的一半：大的起伏先定下來，小的細節疊在上面。
-->

---
layout: two-cols
---

# 演算法長什麼樣子？

球和 terrain 的骨架一樣，只差一行：

```text {all|2|3-5|6-8|9}
Split_One_Level(mesh):
  copy old vertices
  for each edge:
    create a new vertex  # 放哪？決定 scheme
    create two new edges
  for each face:
    create new edges inside
    create 4 new faces
  replace old mesh
```

<v-click at="5">

**難的不是數學，是 data structure。**

</v-click>

::right::

<div class="mt-12">
  <SplitTrace :step="$clicks" />
</div>

<!--
右邊的圖會跟著左邊標亮的那幾行變化。用兩個共用一條 edge 的 triangle 當例子。
[click] 先把舊的 vertices 原封不動搬過來。
[click] 對每條 edge：產生一個新 vertex，一條 edge 變兩條。「放哪」這一行決定了是哪種 scheme：推到球面是球，隨機上下推是 terrain。注意中間那條共用的 edge 只做一次。
[click] 對每個 face：把新的 vertices 連起來，裡面多 3 條 edge，變成 4 個 faces。
[click] 換掉舊的 mesh，這一輪結束。4 個點變 9 個，2 個面變 8 個。
[click] 真正難寫的是 data structure：給一條 edge，要能馬上找到它的兩個端點、兩邊的 face、鄰居的 vertex。後面的 scheme 都要靠鄰居算加權平均。
-->

---
layout: section
---

# 3. Subdivision 的定位

在 NURBS 和 polygon mesh 之間

<!--
第三段很短，回答一個問題：已經有 NURBS 和 polygon mesh 了，為什麼還要 subdivision？

答案是它剛好站在兩者中間，兩邊的優點都拿到。
-->

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

<!--
先用一句話介紹 NURBS：它是用一張四邊形 grid 的 control points 定義出來的平滑曲面，可以想成 Bézier curve 的曲面版。

然後一列一列看表格。

平滑度：NURBS 天生就是平滑的；polygon mesh 是一片一片平的；subdivision 的 limit surface 是平滑的。

控制方式：NURBS 和 subdivision 都是拉 control mesh，很直覺。

形狀限制：NURBS 只能是 grid，所以只能做出一張紙、圓柱、甜甜圈這類形狀；mesh 和 subdivision 什麼形狀都可以。

麻煩的地方：NURBS 遇到複雜形狀要拼很多塊 patch，接縫會裂開；mesh 要很多點才平滑；subdivision 要特別處理 extraordinary points。

[click] 結論：subdivision 像 NURBS 一樣平滑、好控制，又像 mesh 一樣什麼形狀都能做。

下一頁用一個例子把「形狀限制」那一列畫出來。
-->

---
clicks: 1
---

# 任意 topology 的例子

同一個有 <span class="key">兩個洞</span> 的形狀，兩種做法。按下一步，在同一個地方各調一下。

<PatchCompare :step="$clicks" />

<div class="small mt-2 text-center">左邊是示意圖：每塊 patch 都是一張 4 邊形的 grid，一張包不住有洞、有分岔的形狀，只能拼。拖曳可旋轉。</div>

<!--
這頁是把上一頁表格裡「形狀限制」那一格畫出來。

左邊：NURBS 的每一塊 patch 都是一張四邊形的 grid，所以這個形狀要拆成很多塊，一塊一個顏色。

右邊：subdivision 只有一個 control mesh，就是虛線那個方塊形狀。

[click] 現在兩邊在同一個位置調一下。

左邊只動了一塊 patch，它的邊界就跟鄰居對不上，中間裂開看得到裡面，這就是 crack。

實際上動畫師要把旁邊每一塊都一起調，接縫才會合。

右邊只拉一個 control point（紅點），旁邊的表面自動跟著變，永遠是一整片。
-->

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
  shape="hand" scheme="catmull-clark" :level="2" :max-level="2" :width="420" :height="300" :zoom="1.15"
  title="示意：一個粗的 control mesh → 平滑的手"
/>

<div class="small mt-4 text-center">出處：DeRose, Kass, Truong,<br><i>Subdivision Surfaces in Character Animation</i>, SIGGRAPH 1998</div>

<!--
右邊不是電影裡的模型，是我們自己用方塊堆的一隻手，用來示意 Pixar 的做法。

把 slider 拉到 0：動畫師實際在調的就是這個很粗的 control mesh，只有幾十個點。

拉回 2：算出來的是平滑的手，而且手指分岔的地方沒有任何接縫。

Geri's Game 之前，Pixar 用 NURBS 做角色（例如 Toy Story），要花很多力氣處理 patch 之間的接縫。
-->

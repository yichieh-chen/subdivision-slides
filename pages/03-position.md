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

---

# 實際應用：遊戲裡的 Adaptive Tessellation

遊戲只存粗的 control mesh，畫的時候才切細，而且 <span class="key">離鏡頭越遠切越少</span>。

<AdaptiveTess />

<!--
電影可以一格算好幾個小時，遊戲一秒要畫 60 格，所以不能每個模型都切到最細。

遊戲的做法是只存粗的 control mesh，畫的時候才由顯示卡切細，這叫 tessellation。而且會看距離決定切幾次，叫 adaptive tessellation。

左邊是玩家看到的畫面，右邊是同一個時間實際拿去畫的 mesh，放大給大家看。

現在把距離的 slider 往右拉。模型離鏡頭越遠，在畫面上越小。距離每變成兩倍，大小剩一半，所以少切一次就夠了，faces 的數量變成四分之一。

拉到最遠：左邊只剩幾個 pixel，右邊其實只是最粗的 control mesh，但是玩家完全看不出來。

再把 adaptive 的勾拿掉：現在不管多遠都畫最細的。左邊的畫面幾乎沒有差別，但是右邊要畫的 faces 是幾十倍、幾百倍。這些都是浪費掉的。

判斷的原則很簡單：一個細節在螢幕上比一個 pixel 還小，就不值得用三角形去畫它。

補充：同一個模型上，近的部分和遠的部分也可以切不同次數。這時候切得粗和切得細的交界要特別處理，不然會出現裂縫。這個裂縫後面的總結會再看到。
-->

---

# 延伸：Subdivision 搭配 Displacement

切細之後有很多 vertices，就可以把 <span class="key">貼圖上的細節真的推出來</span>。兩邊用的是同一張高度貼圖。

<BumpDisplace :level="3" />

<div class="small mt-1 text-center">出處：Lee, Moreton, Hoppe, <i>Displaced Subdivision Surfaces</i>, SIGGRAPH 2000</div>

<!--
Subdivision 切出來的大量 vertices 還有一個用途：搭配 displacement map，把表面的細節真的推出來。

先說清楚：貼圖本身不是 subdivision 的技術，這裡講的是兩者怎麼搭配。

左邊是 bump mapping。球本身完全沒有動，只是照著貼圖去改每個 pixel 的 normal，讓光影看起來有凹凸。注意看邊緣：輪廓還是一個正圓，因為形狀根本沒變。

右邊是 displacement mapping。同一張高度貼圖，但這次是真的把每個 vertex 沿著 normal 推出去或壓進去，所以連輪廓都是凹凸的。

現在把右邊的 slider 拉到 0：只有 12 個 vertices，根本沒有東西可以推，看不出貼圖的樣子。

慢慢往右拉：每切一次 vertices 變成大約四倍，細節才一層一層跑出來。

所以 displacement 一定要搭配 subdivision：先切出夠多的 vertices，再照貼圖去推。

回想前面的 fractal terrain，其實是同一個結構：切細，再把新的點推出去。差別只是 terrain 推的量是隨機的，這裡是從貼圖讀出來的。

順序是先 subdivision 再 displacement：先切出夠多的點，每個點再用自己的貼圖座標去查要推多少。

電影裡角色皮膚的皺紋、鱗片，大多是這樣做的。
-->

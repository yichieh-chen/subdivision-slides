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

# 遊戲裡的 Adaptive Tessellation

<span class="key">近的切細，遠的切粗。</span>

<AdaptiveGround />

<!--
先看一個大家玩遊戲時其實都看過，只是沒注意到的東西。

左邊是從玩家眼睛看出去的地面，我把線框畫出來。右邊是同一塊地面，從天上往下看，紅點是玩家。

看右邊：玩家腳邊的格子切得很小，越遠的格子越大。

再看左邊：雖然格子大小差很多，但是在玩家的畫面上，每一格看起來差不多大。這就是目的。

為什麼可以這樣？因為遠的東西在螢幕上很小，切再細也看不出來。

現在拉 slider 往前走。細的區域會一直跟著玩家移動。

所以這不是事先做好的模型，而是每一格畫面重新決定哪裡要切細。

把 adaptive 的勾拿掉：全部都切到最細。看下面的數字，要畫的面多了很多倍，但是遠方那些面擠在一起，根本分不出來。

這個技術就叫 adaptive tessellation。tessellation 是把面切細，adaptive 是看情況決定切多少。
-->

---

# 一個模型：走近才切細

遊戲只存粗的 control mesh，<span class="key">靠近了才 subdivide</span>。

<AdaptiveTess />

<!--
剛剛是地面，現在換成一個模型。

左邊是玩家看到的畫面，右邊是同一個時間實際拿去畫的 mesh，放大給大家看。

一開始模型在很遠的地方，左邊只有幾個 pixel。右邊拿去畫的就是最粗的 control mesh，完全沒有切。

把 slider 往右拉，讓鏡頭靠近。模型變大，粗的 mesh 會開始看得出稜角，所以多切一次，faces 變成四倍。

拉到最近：切了四次，跟前面幾頁看到的 subdivision 是同一件事。

所以 subdivision 在遊戲裡的用法是：只存粗的，需要的時候才切。

再把 slider 拉回最遠，把 adaptive 的勾拿掉：左邊的畫面幾乎沒有差別，但是右邊要畫的 faces 是幾百倍，都是浪費掉的。
-->

---
clicks: 1
---

# 同一個模型上，也不用切一樣細

<span class="key">彎的地方多切，平的地方少切。</span>

<AdaptiveOutline :step="$clicks" />

<!--
再更進一步。同一個模型上，每個地方也不需要切一樣細。

這是一個角色的頭的輪廓。現在每個地方都切一樣細，為了讓耳朵夠圓，整圈都要放這麼密，總共 189 個點。

可是看臉頰這一段，它幾乎是直的。直的地方放再多點，形狀也不會更準。

[click] 這是 adaptive 的結果。耳朵很彎，所以點很密。臉頰很平，點就很少。

形狀看起來一樣，但是只用了 55 個點，不到原來的三分之一。

所以決定切多少有兩個因素：離鏡頭多近，還有這個地方有多彎。
-->

---

# 電腦怎麼判斷要不要再切？

量 mesh 和真正的曲面 <span class="key">在螢幕上差幾個 pixel</span>，這叫 Flatness test。

<FlatnessTest />

<div class="small mt-1 text-center">出處：Bunnell, <i>Adaptive Tessellation of Subdivision Surfaces with Displacement Mapping</i>, GPU Gems 2, 2005</div>

<!--
前面兩頁說「近的多切、彎的多切」。那電腦要怎麼把這兩件事變成一個可以算的規則？

這是 NVIDIA 在 GPU Gems 2 裡面的做法，只問一個問題：現在的 mesh 和真正的曲面，在螢幕上差幾個 pixel？

左邊是從側面看模型的其中一塊。灰色是真正的曲面，藍色是現在的 mesh，紅色那一段就是兩者的差距。

右邊是判斷的過程。現在模型在很遠的地方，差距不到半個 pixel，觀眾看不出來，所以不用切。

把 slider 往右拉，讓鏡頭靠近。同樣的差距在螢幕上變大了，超過半個 pixel，所以切一次，再量一次。還是太大就再切，直到通過為止。

再把形狀換成「平的」：不管鏡頭多近，差距都是 0，永遠不用切。

所以「離得近」和「形狀彎」這兩件事，用「螢幕上差幾個 pixel」一個數字就全部包含了。

門檻也可以調。調成 2 個 pixel，切的次數變少，畫得比較快，但是比較粗。這是品質和速度的取捨。

補充，有人問再講：模型會先分成很多塊，每一塊各自做這個測試，而且整個計算是在顯示卡上做的。
-->

---
clicks: 2
---

# 切的次數不同，交界會裂開

代價：相鄰兩塊切的次數不同，中間會有 <span class="key">crack</span>，要補起來。

<Crack3D :step="$clicks" />

<!--
每個地方切的次數不一樣，很省，但是有一個代價。

這是一塊彎彎的曲面，像一個山谷，分成前後兩塊。前面那塊離我們近，後面那塊離我們遠。現在兩塊切得一樣細，中間那條共用的邊完全對得起來。

[click] 因為後面那塊離鏡頭比較遠，所以它只切得很粗。

看中間那條邊。前面那塊有很多點，所以它的邊是彎的。後面那塊點很少，它的邊只有兩段直線。

一邊是彎的，一邊是直的，中間就空出來了。深紅色的地方就是破洞，這叫 crack。

可以把模型轉一下，從不同角度看這個洞。

實際上這個洞只有一兩個 pixel，但是會透出背景的顏色，動起來的時候會閃，很明顯。

[click] 修法是在破洞的地方多補幾個三角形，把它填起來。這樣表面就完全沒有縫，叫做 watertight。

crack 這個名詞後面的總結還會再出現一次。
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

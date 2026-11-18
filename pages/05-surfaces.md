---
layout: section
---

# 5. Subdivision Surfaces

把曲線的想法搬到 3D

<!--
前面看的是曲線：一條折線，一直切角，最後變成一條平滑的曲線。

接下來做的事情完全一樣，只是把「折線」換成「mesh」。一個很粗的 mesh，一直切，最後變成一個平滑的曲面。

這一段我會講兩個方法：Doo-Sabin 和 Catmull-Clark。這兩個都是從剛剛的曲線方法長出來的，所以開始之前，先花兩頁複習等一下一直會用到的東西。
-->

---
layout: two-cols
---

# 複習：Chaikin 切角

每條 edge 上放兩個新點，舊的點丟掉：

- 靠近 $A$ 的：$\tfrac34 A + \tfrac14 B$
- 靠近 $B$ 的：$\tfrac14 A + \tfrac34 B$

<div class="small mt-4">

新點在 edge 的 1/4 處。離哪個端點近，那個端點就佔 $\tfrac34$。

</div>

::right::

<CurveSubdivision scheme="chaikin" :level="1" :width="440" />

<!--
第一個複習是 Chaikin 切角，等一下的 Doo-Sabin 就是從它來的。

一條折線，每條邊有兩個端點 A 和 B。在這條邊上放兩個新的點：一個在離 A 四分之一的地方，一個在離 B 四分之一的地方。然後把舊的點全部丟掉，把新的點連起來。原本的角就被切掉了。

公式裡的四分之三和四分之一是「權重」，意思是這個新點有多少比例來自 A、多少來自 B。靠近 A 的那個點，A 佔四分之三，B 佔四分之一。離誰近，誰的權重就大。

請記住四分之三和四分之一這兩個數字，等一下 Doo-Sabin 的權重就是用它們乘出來的。

右邊可以拉 level 看它越切越圓。
-->

---

# 複習：$C^0$、$C^1$、$C^2$ 是什麼？

描述「接起來的地方有多順」。數字越大越順。

<div class="grid grid-cols-3 gap-6 mt-2">
<div>
<svg viewBox="0 0 200 110" class="w-full">
  <polyline points="20,95 100,22 180,95" fill="none" stroke="#2563eb" stroke-width="4" stroke-linejoin="miter" />
  <circle cx="100" cy="22" r="6" fill="#ef4444" />
</svg>

**$C^0$：位置連續**

<div class="small">沒有斷開，但是有尖角。</div>
</div>
<div>
<svg viewBox="0 0 200 110" class="w-full">
  <path d="M15,30 L100,30 A65,65 0 0 1 165,95" fill="none" stroke="#2563eb" stroke-width="4" />
  <circle cx="100" cy="30" r="6" fill="#ef4444" />
</svg>

**$C^1$：切線也連續**

<div class="small">沒有尖角。但直線接圓弧：彎的程度突然改變。</div>
</div>
<div>
<svg viewBox="0 0 200 110" class="w-full">
  <path d="M15,95 C80,95 95,20 185,20" fill="none" stroke="#2563eb" stroke-width="4" />
</svg>

**$C^2$：曲率也連續**

<div class="small">連彎的程度都是慢慢變的，反光也順。</div>
</div>
</div>

<div class="small mt-4">

Chaikin 的 limit curve 是 $C^1$，cubic B-spline 是 $C^2$。推廣到 surface 之後也一樣。

</div>

<!--
第二個複習是 C0、C1、C2。等一下比較每個方法好不好，都是在比這個，所以先講清楚。

它們描述的是：曲線或曲面，接起來的地方有多順。數字越大越順。

左邊是 C0，只有位置連續。意思是線沒有斷開，兩段有接在一起，但是接的地方可以有尖角，像紅點那裡。

中間是 C1，切線也連續。切線就是線前進的方向。C1 的意思是經過接點的時候方向不會突然轉彎，所以沒有尖角。但是看這張圖：左邊是直線，右邊是圓弧，在紅點接起來。方向是順的，可是直線完全不彎，圓弧一開始就很彎，「彎的程度」在紅點突然從零跳到很彎。這個彎的程度叫曲率。

右邊是 C2，連曲率都連續。彎的程度是慢慢變的，沒有突然跳。

曲面也是一樣的意思。C1 的曲面摸起來沒有摺痕。C2 的曲面連反光都很平順，C1 的曲面反光在某些地方會看起來斷一下。所以做車子、做角色都希望是 C2。

最後一行：Chaikin 切到極限是 C1，三次 B-spline 是 C2。把它們推廣到曲面之後也一樣，Doo-Sabin 是 C1，Catmull-Clark 是 C2。
-->

---

# 一樣的流程，換成 surface

1. 從一個 <span class="key">control mesh</span>（control polytope）開始
2. 每一輪照著規則把它切細
3. 夠細了就停

每個 scheme 的規則分成兩部分，而且都是 <span class="key">local</span> 的（只看附近一小圈鄰居）：

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

**Topological rule**<br>連接關係怎麼變？
（一個面切成幾個、新的 edge 怎麼連）

</div>
<div>

**Geometric rule**<br>位置怎麼變？
（新的點放哪、舊的點要不要動）

</div>
</div>

<!--
流程就三步：先有一個粗的 mesh，叫 control mesh；每一輪照規則切細；夠細就停。

每個方法的「規則」都可以拆成兩個問題來看。

第一個是 topological rule，問的是「怎麼連」。例如一個面要切成幾個小面、新的邊怎麼接。這個只管連接關係，不管點在哪裡。

第二個是 geometric rule，問的是「放哪裡」。新的點座標是多少、舊的點要不要移動。

還有一個重點：這兩種規則都是 local 的。意思是算一個新點的時候，只需要看它旁邊一小圈的鄰居，不用看整個 mesh。所以算起來很快，也很好寫程式。

等一下每介紹一個方法，我都會用這兩個問題來講：它怎麼連、點放哪。
-->

---

# Subdivision Schemes 的分類

<div class="grid grid-cols-2 gap-8">
<div>

**怎麼切（topology）**

| | |
|---|---|
| <span class="key">Primal</span>（face split） | 把 face 切成更小的 faces |
| <span class="key">Dual</span>（vertex split） | 把 vertex 拆成好幾個 vertices |

**點怎麼動（geometry）**

| | |
|---|---|
| <span class="key">Approximating</span> | 不通過 control points |
| <span class="key">Interpolating</span> | 通過 control points |

</div>
<div>

<v-click>

**今天會看到的四個：**

| Scheme | Mesh | 類型 | $C^n$ |
|---|---|---|---|
| Doo-Sabin | 任意 | Dual, approx. | $C^1$ |
| Catmull-Clark | 任意 | Primal, approx. | $C^2$ |
| Mod. Butterfly | Triangle | Primal, interp. | $C^1$ |
| Loop | Triangle | Primal, approx. | $C^2$ |

<div class="small">其他還有 Kobbelt、Midedge、Biquartic…</div>

</v-click>

</div>
</div>

<!--
方法很多，所以先分類。分類就是用剛剛那兩個問題。

第一個問題，怎麼切。Primal 是「切面」：一個面切成好幾個小面，原本的頂點還留著。Dual 是「拆點」：一個頂點被拆成好幾個新的頂點，原本的頂點不見了，那個角就被切掉。

第二個問題，點怎麼動。Approximating 是曲面「不會通過」原本的控制點，只是靠近它，舊的點每一輪都會被移動。Interpolating 是曲面「會通過」原本的控制點，舊的點永遠不動。

（按一下）今天講的四個方法放進表格。Doo-Sabin 是唯一的 dual。Butterfly 是唯一的 interpolating。

最右邊是連續性。C1 的意思是曲面的切線方向是連續的，看起來沒有摺痕。C2 是連曲率都連續，反光看起來會更順。Loop 和 Catmull-Clark 是 C2，比較平滑，所以最常用。不過它們在 extraordinary vertex 那幾個特別的點上只有 C1，這個等一下會解釋。
-->

---

# Primal vs. Dual：看 Cube

<div class="flex gap-4 items-start">
<div class="flex-1">

- **Primal**：切 face，舊的 vertex <span class="key">還在</span>
- **Dual**：拆 vertex，舊的角<span class="key">被切掉</span>

<div class="small mt-4">紅點是原本 8 個 vertices 的位置。</div>

</div>
<MeshSubdivision shape="cube" scheme="catmull-clark" :level="1" :max-level="3" marks :width="280" :height="240" title="Primal：Catmull-Clark" />
<MeshSubdivision shape="cube" scheme="doo-sabin" :level="1" :max-level="3" marks color="#f59e0b" :width="280" :height="240" title="Dual：Doo-Sabin" />
</div>

<!--
Primal 和 dual 用講的比較抽象，直接看立方體切一次。紅點是原本立方體八個角的位置。

左邊是 primal 的例子，Catmull-Clark。它是把每個面切成四個小面。切完之後，原本的八個角都還有對應的頂點，只是位置被往內拉了。面變多了，但是角還在。

右邊是 dual 的例子，Doo-Sabin。看角的地方：原本的一個角不見了，變成一個小三角形。一個頂點被拆成三個新的頂點，角被切掉了。

所以一句話記：primal 是切面、角還在；dual 是拆點、角被切掉。
-->

---
layout: two-cols
---

# Doo-Sabin

3D 版的 corner cutting。每一輪：

1. 找出每個 face 的中心（barycenter）
2. 每個 face 裡，往中心 <span class="key">縮出</span> 一個比較小的 face
3. 把新的點連起來：舊的 **face**、**edge**、**vertex** 各變成一個新 face

<div class="small mt-3">每個 vertex 都被拆開、角被切掉，所以是 dual scheme。</div>

::right::

<MeshSubdivision
  shape="cube" :shapes="['cube', 'tshape', 'ring']" scheme="doo-sabin"
  :level="1" :max-level="4" color="#f59e0b" :width="400" :height="290"
/>

<!--
第一個方法是 Doo-Sabin。它就是剛剛 Chaikin 切角的 3D 版。

Chaikin 在曲線上做的事是：每條邊上，靠近兩個端點的地方各放一個新點，然後把舊的角丟掉。

Doo-Sabin 在每個面上做一樣的事。第一步，找每個面的中心。第二步，在每個面裡面，每個頂點往中心的方向放一個新的點。一個四邊形的面有四個頂點，所以會得到四個新點，它們圍成一個比較小的四邊形，就像把這個面往內縮。

第三步是把新的點連起來，會出現三種新的面。原本每個面，縮小之後還是一個面。原本每條邊，兩邊的面各縮了一點，中間空出來的地方補一個四邊形。原本每個頂點，周圍的面都縮了，那個角空出來，補一個面。

以立方體為例，右邊可以看：6 個面還是 6 個面，12 條邊變成 12 個四邊形，8 個角變成 8 個三角形，因為立方體每個角連著 3 個面。

原本的頂點完全不見了，一個頂點被拆成好幾個新頂點，所以它是 dual scheme。
-->

---

# Doo-Sabin：切完有哪些 face？

| 舊的 | 變成 | Cube 的例子 |
|---|---|---|
| 每個 **face** | 一個縮小的 face（邊數不變） | 6 個 quad |
| 每條 **edge** | 一個 quad | 12 個 quad |
| 每個 **vertex** | 一個 face（邊數 = degree） | 8 個 triangle |

<div class="small mt-4">

Cube 切一次：$6 + 12 + 8 = 26$ 個 faces，$6 \times 4 = 24$ 個 vertices。<br>
角上是 triangle，因為 cube 的每個角連著 3 個 faces。

</div>

<!--
把上一頁第三步講清楚：切完之後到底有哪些面。

想像立方體的每個面都是一張紙，每張紙往自己的中心縮小一圈。縮完之後，面和面之間會出現空隙，要補起來。

第一種，原本的每個面，縮小之後還是一個面，邊數不變。立方體有六個面，所以是六個四邊形。

第二種，原本的每條邊。一條邊的兩側各有一個面，兩個面都縮了，中間空出一條縫，補一個四邊形。立方體有十二條邊，所以是十二個四邊形。

第三種，原本的每個頂點。一個頂點周圍的面都縮了，角的地方空出一個洞，補一個面。這個面有幾個邊，看那個頂點連了幾個面。立方體每個角連三個面，所以補的是三角形，總共八個。

加起來，立方體切一次是二十六個面。頂點的話，每個面裡有四個新點，六個面，所以二十四個頂點。上一頁的 demo 下面也有顯示這兩個數字。
-->

---
layout: two-cols
---

# 新的點放哪？

新的點 = 這 <span class="key">4 個點的平均</span>：

- 舊的 vertex 自己
- 這個 face 的中心
- 旁邊兩條 edge 的中點

<v-click>

例：看左下角 $(0,0)$

$$\frac{(0,0) + (2,2) + (2,0) + (0,2)}{4} = (1,1)$$

</v-click>

::right::

<svg viewBox="0 0 320 300" width="340" class="mx-auto mt-6">
  <rect x="50" y="40" width="220" height="220" fill="none" stroke="#64748b" stroke-width="2" />
  <g stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 4">
    <line x1="105" y1="205" x2="50" y2="260" /><line x1="105" y1="205" x2="160" y2="150" /><line x1="105" y1="205" x2="160" y2="260" /><line x1="105" y1="205" x2="50" y2="150" />
  </g>
  <g fill="#94a3b8"><circle cx="270" cy="260" r="5" /><circle cx="270" cy="40" r="5" /><circle cx="50" cy="40" r="5" /></g>
  <circle cx="50" cy="260" r="7" fill="#2563eb" />
  <circle cx="160" cy="150" r="6" fill="#7f1d1d" />
  <circle cx="160" cy="260" r="6" fill="#16a34a" /><circle cx="50" cy="150" r="6" fill="#16a34a" />
  <circle cx="105" cy="205" r="8" fill="#f59e0b" stroke="#fff" stroke-width="2" />
  <g fill="currentColor">
    <text x="30" y="286" style="font-size: 15px">(0,0)</text><text x="250" y="286" style="font-size: 15px">(4,0)</text><text x="250" y="28" style="font-size: 15px">(4,4)</text><text x="30" y="28" style="font-size: 15px">(0,4)</text>
    <text x="170" y="146" style="font-size: 14px">中心 (2,2)</text><text x="142" y="286" style="font-size: 14px">(2,0)</text><text x="6" y="155" style="font-size: 14px">(0,2)</text>
    <text x="118" y="200" fill="#b45309" style="font-size: 15px">(1,1)</text>
  </g>
</svg>

<!--
剛剛說每個面「往中心縮」，那到底縮多少？這頁給精確的規則。

一個新的點，是四個點的平均。看右邊的圖，我們要算左下角這個藍色頂點對應的新點。

四個點是：第一，舊的頂點自己，藍色那個。第二，這個面的中心，暗紅色那個。第三和第四，從這個頂點出去的兩條邊的中點，綠色那兩個。把這四個點的座標加起來除以四，就是新的點，橘色那個。

（按一下）用數字算一次。假設這個面是邊長 4 的正方形，左下角是 (0,0)。面的中心是 (2,2)。兩條邊的中點是 (2,0) 和 (0,2)。四個加起來是 (4,4)，除以四是 (1,1)。

所以新的點在 (1,1)，從角落往中心走了一點。四個角都這樣做，會得到四個新點，圍成一個比較小的正方形。
-->

---
layout: two-cols
---

# Chaikin 做兩次？

<v-clicks>

- **橫的做一次**：上下兩條 edge 各取 1/4 處

  $P = \tfrac34 A + \tfrac14 B$　　$Q = \tfrac34 D + \tfrac14 C$

- **直的再做一次**：$P$ 到 $Q$ 取 1/4 處

  新的點 $= \tfrac34 P + \tfrac14 Q$

- **展開**：$\tfrac{9}{16}A + \tfrac{3}{16}B + \tfrac{3}{16}D + \tfrac{1}{16}C$

</v-clicks>

::right::

<svg viewBox="0 0 320 300" width="340" class="mx-auto mt-6">
  <rect x="50" y="40" width="220" height="220" fill="none" stroke="#64748b" stroke-width="2" />
  <line x1="105" y1="260" x2="105" y2="40" stroke="#16a34a" stroke-width="2" stroke-dasharray="5 4" />
  <g fill="#2563eb">
    <circle cx="50" cy="260" r="7" /><circle cx="270" cy="260" r="7" /><circle cx="270" cy="40" r="7" /><circle cx="50" cy="40" r="7" />
  </g>
  <circle cx="105" cy="260" r="6" fill="#16a34a" /><circle cx="105" cy="40" r="6" fill="#16a34a" />
  <circle cx="105" cy="205" r="8" fill="#f59e0b" stroke="#fff" stroke-width="2" />
  <g fill="currentColor">
    <text x="30" y="288" style="font-size: 17px">A</text><text x="276" y="288" style="font-size: 17px">B</text><text x="276" y="28" style="font-size: 17px">C</text><text x="30" y="28" style="font-size: 17px">D</text>
    <text x="99" y="288" fill="#15803d" style="font-size: 17px">P</text><text x="99" y="28" fill="#15803d" style="font-size: 17px">Q</text>
    <text x="118" y="210" fill="#b45309" style="font-size: 15px">新的點</text>
  </g>
</svg>

<!--
前面說 Doo-Sabin 是 Chaikin 的 3D 版。這頁說明這句話是真的可以算出來的。

Chaikin 是在一條線上做的：取四分之一的地方，權重是四分之三和四分之一。一個四邊形的面有兩個方向，橫的和直的。我們兩個方向各做一次 Chaikin。看右邊的圖，四個角叫 A、B、C、D，A 在左下角。

（按一下）第一步，橫的方向做一次。下面那條邊是 A 到 B，取離 A 四分之一的地方，得到 P。P 等於四分之三 A 加四分之一 B。上面那條邊是 D 到 C，同樣取離 D 四分之一的地方，得到 Q。Q 等於四分之三 D 加四分之一 C。

（按一下）第二步，直的方向再做一次。把 P 和 Q 連起來，就是綠色的虛線。在這條線上取離 P 四分之一的地方，就是橘色的新點。新的點等於四分之三 P 加四分之一 Q。

（按一下）第三步，把 P 和 Q 代進去展開。四分之三乘四分之三是十六分之九，這是 A 的。四分之三乘四分之一是十六分之三，這是 B 的。四分之一乘四分之三也是十六分之三，這是 D 的。四分之一乘四分之一是十六分之一，這是 C 的。

用上一頁的數字驗算：A 是 (0,0)，B 是 (4,0)，所以 P 是 (1,0)。D 是 (0,4)，C 是 (4,4)，所以 Q 是 (1,4)。P 到 Q 的四分之一處是 (1,1)。跟上一頁用四個點平均算出來的一模一樣。

所以「四個點的平均」和「Chaikin 兩個方向各做一次」是同一件事的兩種說法。
-->

---
layout: two-cols
---

# Doo-Sabin 的權重

Quad 的四個角各佔多少：

- 最近的角：$\tfrac34 \times \tfrac34 = \tfrac{9}{16}$
- 相鄰的兩個角：$\tfrac34 \times \tfrac14 = \tfrac{3}{16}$
- 對角：$\tfrac14 \times \tfrac14 = \tfrac{1}{16}$

<div class="small mt-4">

加起來是 1。Chaikin 是 $C^1$，所以 Doo-Sabin 的 limit surface 也是 $C^1$。

</div>

::right::

<svg viewBox="0 0 320 300" width="340" class="mx-auto mt-6">
  <rect x="50" y="40" width="220" height="220" fill="none" stroke="#64748b" stroke-width="2" />
  <rect x="105" y="95" width="110" height="110" fill="#f59e0b22" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" />
  <g fill="#2563eb">
    <circle cx="50" cy="260" r="7" /><circle cx="270" cy="260" r="7" /><circle cx="50" cy="40" r="7" /><circle cx="270" cy="40" r="7" />
  </g>
  <circle cx="160" cy="150" r="5" fill="#7f1d1d" />
  <g fill="#f59e0b">
    <circle cx="105" cy="205" r="8" stroke="#fff" stroke-width="2" /><circle cx="215" cy="205" r="5" /><circle cx="105" cy="95" r="5" /><circle cx="215" cy="95" r="5" />
  </g>
  <g fill="currentColor">
    <text x="14" y="288" style="font-size: 17px">9/16</text><text x="262" y="288" style="font-size: 17px">3/16</text><text x="14" y="28" style="font-size: 17px">3/16</text><text x="262" y="28" style="font-size: 17px">1/16</text>
    <text x="118" y="230" fill="#b45309" style="font-size: 15px">新的點</text><text x="112" y="138" style="font-size: 13px">face 中心</text>
  </g>
</svg>

<!--
把上一頁的結果畫成一張圖，這就是 Doo-Sabin 在四邊形上的權重。

橘色大的那個是新的點。離它最近的那個角，權重是四分之三乘四分之三，十六分之九，最大。相鄰的兩個角，各是四分之三乘四分之一，十六分之三。對角最遠的那個，是四分之一乘四分之一，十六分之一，最小。

四個數字加起來：九加三加三加一是十六，所以總和是 1。權重加起來是 1 的意思是，新的點是這四個角的加權平均，一定落在這個面裡面，不會跑到外面去。

最後是平滑度。Chaikin 切到極限是 C1 的曲線。Doo-Sabin 是它的曲面版，所以極限曲面也是 C1：沒有摺痕，但是沒有到 C2 那麼順。規則的地方它其實就是雙二次 B-spline 曲面。

另外補充兩點，被問到可以回答。第一，切一次之後每個頂點都剛好連四條邊，很規則。第二，唯一不規則的是那些不是四邊形的面，例如立方體角上的三角形，它們的數量之後不會再變多。
-->

---
layout: two-cols
---

# 複習：Cubic B-spline 的切法

和 Chaikin 不同：舊的點<span class="key">留著，但是要移動</span>。

- **Edge 上的新點**：兩個端點各 $\tfrac12$
- **舊的點**：自己 $\tfrac34$，左右鄰居各 $\tfrac18$

<div class="small mt-4">

Catmull-Clark 是它的 surface 版：一樣是「加新的點」＋「移動舊的點」。

</div>

::right::

<CurveSubdivision scheme="cubic" :level="1" :width="440" />

<!--
講 Catmull-Clark 之前，先複習它的曲線版，三次 B-spline 的切法。

Chaikin 是把舊的點全部丟掉。三次 B-spline 不一樣，舊的點會留下來，但是每一輪都要移動一下。

所以每一輪做兩件事。第一，每條邊的中間加一個新點，位置是兩個端點各二分之一，也就是邊的中點。第二，舊的點要移動，新的位置是自己佔四分之三，左邊的鄰居佔八分之一，右邊的鄰居佔八分之一。也就是被兩邊的鄰居稍微拉過去一點。

因為用到的鄰居比 Chaikin 多，所以比較平滑，極限是 C2。

等一下的 Catmull-Clark 就是這個的曲面版。它一樣做這兩件事：加新的點，然後移動舊的點。只是曲面上「新的點」有兩種，面上的和邊上的。
-->

---
layout: two-cols
clicks: 4
---

# Catmull-Clark 四步驟

把 cubic B-spline 推廣到 surface。

<div :class="{ 'opacity-30': $clicks !== 1 }">

**① Face point**
每個 face 的中心

</div>
<div :class="{ 'opacity-30': $clicks !== 2 }">

**② Edge point**
兩個端點 + 兩邊的 face point 取平均

</div>
<div :class="{ 'opacity-30': $clicks !== 3 }">

**③ Move old vertices**
舊的 vertex 往鄰居的平均靠過去

</div>
<div :class="{ 'opacity-30': $clicks !== 4 }">

**④ Connect**
把新的點連成 quads

</div>

::right::

<CatmullClarkSteps :step="$clicks" :width="400" :height="320" />

<!--
第二個方法是 Catmull-Clark，這是最有名的一個。Doo-Sabin 是從 Chaikin（二次 B-spline）來的，Catmull-Clark 是從三次 B-spline 來的，所以比較平滑。

它每一輪做四件事，我一步一步按。

（按一下）第一步，face point。每個面放一個新點，位置是這個面所有頂點的平均，也就是面的中心。

（按一下）第二步，edge point。每條邊放一個新點。注意它不是邊的中點。它是四個點的平均：這條邊的兩個端點，加上這條邊兩側的兩個 face point。因為用到了 face point，所以一定要先做第一步。

（按一下）第三步，移動舊的頂點。舊的頂點不會留在原地，會往周圍鄰居的平均位置靠過去。這就是為什麼它是 approximating，曲面不會通過原本的控制點。

（按一下）第四步，連線。每個 face point 連到它周圍的 edge point，edge point 再連到舊頂點。結果每個小面都是四邊形：一個 face point、兩個 edge point、一個舊頂點。

所以一個 n 邊形的面會被切成 n 個四邊形。面被切成小面，舊頂點還在，所以它是 primal scheme。
-->

---
layout: two-cols
---

# Catmull-Clark Rules

- **Face point** $f$ = face 所有 vertices 的平均
- **Edge point** $e = \dfrac{v_1 + v_2 + f_1 + f_2}{4}$
- **舊的 vertex**（它連著 $n$ 條 edge）

$$v_{new} = \frac{F + 2R + (n-3)\,v_{old}}{n}$$

<div class="small">

$F$：周圍 face points 的平均　$R$：周圍 edge 中點的平均<br>（中點 = 舊 edge 兩端點的平均，<b>不是</b>藍色的 edge point）

</div>

<v-click>

- 切一次之後 <span class="key">全部變成 quads</span>
- Approximating，幾乎到處 $C^2$
- Extraordinary vertex（degree ≠ 4）是 $C^1$

</v-click>

::right::

<MeshSubdivision
  shape="tshape" :shapes="['cube', 'tshape', 'ring', 'tetrahedron']" scheme="catmull-clark"
  :level="1" :width="400" :height="290"
/>

<!--
這頁把剛剛四步寫成公式。

Face point 是面上所有頂點的平均。Edge point 是兩個端點加兩個 face point，除以四。

舊頂點的公式比較長。n 是這個頂點連了幾條邊。F 是它周圍所有 face point 的平均。R 是它周圍所有邊的中點的平均。注意這裡的中點就是原本那條邊兩個端點的平均，不是第二步算出來的藍色 edge point。新位置是 F 加兩倍 R 加 n 減 3 倍的舊位置，全部除以 n。

用最常見的情況代進去看：n 等於 4 的時候，是 F 加 2R 加 1 倍的自己，除以 4。也就是自己只佔四分之一，其他四分之三都是被鄰居拉過去的。

老師的投影片是另一種寫法，但是是同一條公式：自己佔 n 分之 n 減 2，相鄰頂點的平均佔 n 分之 1，face point 的平均佔 n 分之 1。把 R 展開就會發現兩個是一樣的。

（按一下）三個性質。第一，切一次之後全部變成四邊形，不管原本是三角形還是五邊形。第二，它是 approximating，曲面幾乎到處都是 C2。如果 mesh 是很規則的四邊形格子，切到極限得到的就是雙三次 B-spline 曲面，所以說它是三次 B-spline 的推廣；但 B-spline 只能用在規則格子上，Catmull-Clark 任何 mesh 都可以。第三，「幾乎」的例外是 extraordinary vertex，那裡只有 C1，下一頁解釋。

算一個點只需要看緊鄰的一圈鄰居。Pixar 的電影從 Geri's Game 之後基本上都用這個方法。右邊可以換不同形狀切切看，注意切出來會比原本的 control mesh 小一圈。
-->

---

# 舊的 vertex 怎麼動？

<div class="grid grid-cols-2 gap-8">
<div>

$$v_{new} = \frac{F + 2R + (n-3)\,v_{old}}{n}$$

最常見的 $n = 4$：

| 誰 | 佔多少 |
|---|---|
| 自己 $v_{old}$ | $\tfrac14$ |
| $R$：舊 edge 中點的平均（不是 edge point） | $\tfrac24$ |
| $F$：face points 的平均 | $\tfrac14$ |

</div>
<div>

<v-click>

- 自己只剩 $\tfrac14$，其他都是被鄰居拉走的
  → surface 比 control mesh <span class="key">小一圈</span>

- 另一種寫法，是同一條公式：

$$\tfrac{n-2}{n}\,v_{old} + \tfrac1n N + \tfrac1n F$$

<div class="small">

$N$：相鄰 vertices 的平均

</div>

</v-click>

</div>
</div>

<!--
上一頁最長的那條公式，這頁拆開來看。

n 是這個頂點連了幾條邊。F 是它周圍所有 face point 的平均。R 是它周圍所有邊的中點的平均，注意是原本邊的中點，不是 edge point。

最常見的情況是 n 等於 4。代進去：分子是 F 加兩倍的 R 加一倍的自己，分母是 4。所以自己佔四分之一，邊的中點佔四分之二，face point 佔四分之一。三個加起來是 1。

（按一下）自己只佔四分之一，其他四分之三都是被周圍的鄰居拉過去的。所以舊的頂點每一輪都會往內移動很多，最後的曲面會比原本的 control mesh 小一圈。這就是 approximating。

下面是同一條公式的另一種寫法，老師的投影片是這樣寫的。自己佔 n 分之 n 減 2，相鄰頂點的平均佔 n 分之 1，face point 的平均佔 n 分之 1。

為什麼一樣？因為邊的中點就是自己和鄰居的平均，所以 R 等於自己加 N 再除以二，兩倍的 R 就是自己加 N。代回第一條公式，就會得到第二條。

n 等於 4 的時候，第二種寫法是自己佔四分之二，N 佔四分之一，F 佔四分之一。跟曲線的四分之三、八分之一、八分之一是同一個精神：自己佔最多，鄰居分一點。
-->

---
layout: two-cols
clicks: 2
---

# 用 Cube 算一次 ①

Cube 的 8 個 vertices 是 $(\pm1, \pm1, \pm1)$。

<div v-click="1">

**Face point**（上面的 face）

4 個角 $(\pm1,\ 1,\ \pm1)$ 平均 → <b style="color:#f97316">$(0,\ 1,\ 0)$</b>

</div>

<div v-click="2">

**Edge point**（<b style="color:#dc2626">紅色</b> edge）

兩個端點 $(1,1,1),\ (1,1,-1)$<br>
＋兩邊 face points $(0,1,0),\ (1,0,0)$<br>
4 個平均 →<b style="color:#2563eb">$(0.75,\ 0.75,\ 0)$</b>

<div class="small">不是中點 <b style="color:#9333ea">(1, 1, 0)</b>：被兩邊的 face point 往內拉了。</div>

</div>

::right::

<svg viewBox="20 20 370 290" width="420" class="mx-auto mt-2">
<polygon points="58.2,106.8 238.2,106.8 301.8,43.2 121.8,43.2" fill="#f9731622" stroke="none" />
<line x1="301.8" y1="43.2" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="238.2" y1="286.8" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="301.8" y1="223.2" x2="301.8" y2="43.2" stroke="#64748b" stroke-width="2"/>
<line x1="301.8" y1="223.2" x2="238.2" y2="286.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="106.8" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="43.2" x2="301.8" y2="43.2" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="43.2" x2="58.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="286.8" x2="238.2" y2="286.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="286.8" x2="58.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="223.2" x2="301.8" y2="223.2" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="121.8" y1="223.2" x2="121.8" y2="43.2" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="121.8" y1="223.2" x2="58.2" y2="286.8" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<g v-click="1">
<circle cx="180.0" cy="75.0" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
<text x="170.0" y="63.0" fill="#f97316" text-anchor="end" style="font-size: 14px">(0, 1, 0)</text>
</g>
<g v-click="2">
<line x1="238.2" y1="106.8" x2="301.8" y2="43.2" stroke="#dc2626" stroke-width="4"/>
<circle cx="270.0" cy="165.0" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
<text x="282.0" y="170.0" fill="#f97316" text-anchor="start" style="font-size: 14px">(1, 0, 0)</text>
<line x1="247.5" y1="97.5" x2="238.2" y2="106.8" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="247.5" y1="97.5" x2="301.8" y2="43.2" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="247.5" y1="97.5" x2="180.0" y2="75.0" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3"/>
<line x1="247.5" y1="97.5" x2="270.0" y2="165.0" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3"/>
<circle cx="270.0" cy="75.0" r="7" fill="none" stroke="#9333ea" stroke-width="2.5"/>
<text x="282.0" y="71.0" fill="#9333ea" text-anchor="start" style="font-size: 14px">中點 (1, 1, 0)</text>
<circle cx="247.5" cy="97.5" r="8" fill="#2563eb" stroke="#fff" stroke-width="2"/>
<text x="235.5" y="123.5" fill="#2563eb" text-anchor="end" style="font-size: 14px">(0.75, 0.75, 0)</text>
</g>
</svg>

<!--
公式看完，用立方體實際算一次。立方體的八個頂點是正負 1 的組合，右邊是這個立方體，(1,1,1) 是正前方右上角那個角。

（按一下）先算 face point。看上面那個面，就是右邊塗淡橘色的面。它的四個角 y 都是 1，x 和 z 是正負 1。平均起來 x 和 z 都抵消變成 0，所以 face point 是 (0,1,0)，就是這個面的正中心，橘色的點。同樣的道理，右邊那個面的 face point 是 (1,0,0)，前面那個面是 (0,0,1)。

（按一下）再算 edge point。看紅色這條邊，從 (1,1,1) 到 (1,1,-1)，它是上面和右面兩個面的交界。Edge point 是四個點的平均，圖上藍色虛線連到的四個點：兩個端點，加上上面的 face point (0,1,0)，加右面的 face point (1,0,0)。四個加起來是 (3,3,0)，除以四是 (0.75, 0.75, 0)，就是藍色的點。

注意紫色空心的那個是這條邊的中點，(1,1,0)。藍色的 edge point 不在中點上，它被兩側的面往內拉了。這個紫色中點下一頁還會用到。
-->

---
layout: two-cols
clicks: 4
---

# 用 Cube 算一次 ②：$v_{new}$

角 $v_{old} = (1,1,1)$ 連 3 條 edge → $n = 3$

<div v-click="1">

<b style="color:#f97316">$F$</b> = 3 個 face points 的平均
$(0,1,0),\ (1,0,0),\ (0,0,1)$ → $\left(\tfrac13, \tfrac13, \tfrac13\right)$

</div>

<div v-click="2">

<b style="color:#9333ea">$R$</b> = 3 條舊 edge <span class="key">中點</span>的平均
$(1,1,0),\ (1,0,1),\ (0,1,1)$ → $\left(\tfrac23, \tfrac23, \tfrac23\right)$

</div>

<div v-click="3">

<b style="color:#16a34a">$v_{new}$</b> $= \dfrac{F + 2R + 0 \cdot v_{old}}{3}$<br>
$= \tfrac13\left(\tfrac13 + \tfrac43\right) = \tfrac59 \approx 0.56$

</div>

<div v-click="4" class="small">

驗算（老師的寫法）：$\tfrac13 \cdot 1 + \tfrac13 \cdot \tfrac13 + \tfrac13 \cdot \tfrac13 = \tfrac59$

</div>

::right::

<svg viewBox="20 20 370 290" width="420" class="mx-auto mt-2">
<defs><marker id="cc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#16a34a" /></marker></defs>
<line x1="301.8" y1="43.2" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="238.2" y1="286.8" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="301.8" y1="223.2" x2="301.8" y2="43.2" stroke="#64748b" stroke-width="2"/>
<line x1="301.8" y1="223.2" x2="238.2" y2="286.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="106.8" x2="238.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="43.2" x2="301.8" y2="43.2" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="43.2" x2="58.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="286.8" x2="238.2" y2="286.8" stroke="#64748b" stroke-width="2"/>
<line x1="58.2" y1="286.8" x2="58.2" y2="106.8" stroke="#64748b" stroke-width="2"/>
<line x1="121.8" y1="223.2" x2="301.8" y2="223.2" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="121.8" y1="223.2" x2="121.8" y2="43.2" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="121.8" y1="223.2" x2="58.2" y2="286.8" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 4"/>
<line x1="238.2" y1="106.8" x2="270.0" y2="75.0" stroke="#9333ea" stroke-width="4"/>
<line x1="238.2" y1="106.8" x2="238.2" y2="196.8" stroke="#9333ea" stroke-width="4"/>
<line x1="238.2" y1="106.8" x2="148.2" y2="106.8" stroke="#9333ea" stroke-width="4"/>
<circle cx="238.2" cy="106.8" r="8" fill="currentColor" />
<text x="250.2" y="126.8" fill="currentColor" text-anchor="start" style="font-size: 16px">v<tspan style="font-size: 11px" dy="4">old</tspan></text>
<g v-click="1">
<circle cx="180.0" cy="75.0" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
<circle cx="270.0" cy="165.0" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
<circle cx="148.2" cy="196.8" r="8" fill="#f97316" stroke="#fff" stroke-width="2"/>
<text x="168.0" y="67.0" fill="#f97316" text-anchor="end" style="font-size: 16px">f₁</text>
<text x="282.0" y="171.0" fill="#f97316" text-anchor="start" style="font-size: 16px">f₂</text>
<text x="136.2" y="202.8" fill="#f97316" text-anchor="end" style="font-size: 16px">f₃</text>
</g>
<g v-click="2">
<circle cx="270.0" cy="75.0" r="7" fill="#9333ea" stroke="#fff" stroke-width="2"/>
<circle cx="238.2" cy="196.8" r="7" fill="#9333ea" stroke="#fff" stroke-width="2"/>
<circle cx="148.2" cy="106.8" r="7" fill="#9333ea" stroke="#fff" stroke-width="2"/>
<text x="282.0" y="71.0" fill="#9333ea" text-anchor="start" style="font-size: 16px">m₁</text>
<text x="250.2" y="202.8" fill="#9333ea" text-anchor="start" style="font-size: 16px">m₂</text>
<text x="136.2" y="100.8" fill="#9333ea" text-anchor="end" style="font-size: 16px">m₃</text>
</g>
<g v-click="3">
<line x1="238.2" y1="106.8" x2="212.3" y2="132.7" stroke="#16a34a" stroke-width="2.5" marker-end="url(#cc-arrow)"/>
<circle cx="212.3" cy="132.7" r="8" fill="#16a34a" stroke="#fff" stroke-width="2"/>
<text x="200.3" y="154.7" fill="#16a34a" text-anchor="end" style="font-size: 16px">v<tspan style="font-size: 11px" dy="4">new</tspan></text>
</g>
</svg>

<!--
這頁算一個舊頂點移動到哪裡，就是前面那條最長的公式。

看右邊黑色的點，(1,1,1) 這個角，叫 v old。它連了三條邊，就是加粗的三條紫色線，所以 n 等於 3。

（按一下）第一個要算的是 F：這個角周圍三個面的 face point 的平均。這三個面是上面、右面、前面，face point 就是圖上三個橘色的點 f1、f2、f3，座標是 (0,1,0)、(1,0,0)、(0,0,1)。三個加起來是 (1,1,1)，除以三，F 是三分之一、三分之一、三分之一。

（按一下）第二個要算的是 R：連到這個角的三條舊邊，各取中點，再平均。三個中點是紫色的 m1、m2、m3，座標是 (1,1,0)、(1,0,1)、(0,1,1)。注意這是原本那條邊兩個端點的平均，不是上一頁藍色的 edge point。三個加起來是 (2,2,2)，除以三，R 是三分之二。

（按一下）代進公式。三個座標都一樣，所以只算一個數字就好。分子是 F 加兩倍的 R 加 n 減 3 倍的自己。n 減 3 是 0，所以自己那一項不見了。F 是三分之一，兩倍 R 是三分之四，加起來三分之五。除以 n，也就是除以 3，是九分之五，大約 0.56。綠色的點就是 v new，原本在 1 的角被拉到 0.56，往立方體中心移了很多。

（按一下）最後用老師投影片的寫法驗算一次。自己佔 n 分之 n 減 2，就是三分之一，乘上 1。三個相鄰舊頂點是 (1,1,-1)、(1,-1,1)、(-1,1,1)，平均是三分之一，佔 n 分之 1。F 也是三分之一，佔 n 分之 1。三分之一加九分之一加九分之一，一樣是九分之五。兩種寫法答案一樣。

這就是為什麼立方體一直切，會變成一顆比原本小的球。
-->

---

# Extraordinary Vertex 是什麼？

數一個 vertex 連了幾條 edge，叫它的 <span class="key">degree</span>。

<div class="grid grid-cols-3 gap-6 mt-2">
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="100,92 100.0,46.0 54.0,46.0 54.0,92.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 54.0,92.0 54.0,138.0 100.0,138.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 100.0,138.0 146.0,138.0 146.0,92.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 146.0,92.0 146.0,46.0 100.0,46.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="100" y1="92" x2="100.0" y2="46.0" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="54.0" y2="92.0" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="100.0" y2="138.0" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="146.0" y2="92.0" stroke="#16a34a" stroke-width="4" />
<circle cx="100" cy="92" r="8" fill="#16a34a" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#16a34a" text-anchor="middle" style="font-size: 17px; font-weight: 600">degree 4 → regular</text>
</svg>

<div class="small text-center">像棋盤，最正常</div>
</div>
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="100,92 100.0,46.0 60.2,69.0 60.2,115.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 60.2,115.0 100.0,138.0 139.8,115.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 139.8,115.0 139.8,69.0 100.0,46.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="100" y1="92" x2="100.0" y2="46.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="60.2" y2="115.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="139.8" y2="115.0" stroke="#dc2626" stroke-width="4" />
<circle cx="100" cy="92" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">degree 3</text>
</svg>

<div class="small text-center">例：cube 的 8 個角</div>
</div>
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="100,92 100.0,46.0 56.3,31.8 56.3,77.8" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 56.3,77.8 29.2,115.0 73.0,129.2" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 73.0,129.2 100.0,166.4 127.0,129.2" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 127.0,129.2 170.8,115.0 143.7,77.8" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 143.7,77.8 143.7,31.8 100.0,46.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="100" y1="92" x2="100.0" y2="46.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="56.3" y2="77.8" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="73.0" y2="129.2" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="127.0" y2="129.2" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="143.7" y2="77.8" stroke="#dc2626" stroke-width="4" />
<circle cx="100" cy="92" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">degree 5</text>
</svg>

<div class="small text-center">5 個 face 圍著一個點</div>
</div>
</div>

<div class="small mt-2">

Quad mesh：degree 4 是 <span class="key">regular</span>，其他都是 <span class="key">extraordinary</span>。（Triangle mesh 是 degree 6，暖身那段看過。）

</div>

<!--
前面一直說 Catmull-Clark「幾乎」到處都是 C2，例外就是 extraordinary vertex。這幾頁把它講清楚。

先教一個詞：degree。數一個頂點連了幾條邊，那個數字就是它的 degree。圖上粗的線就是要數的邊。

左邊這個點連了四條邊，degree 4。四個四邊形圍著它，就像棋盤上的一個交叉點。四邊形 mesh 裡這是最正常的情況，叫 regular。

中間這個點只連三條邊，degree 3。三個面圍著它。立方體的八個角就是這樣，每個角只有三個面。

右邊這個點連了五條邊，degree 5，五個面圍著它。

規則就一句話：四邊形 mesh 裡 degree 4 是 regular，不是 4 的都叫 extraordinary，中文可以叫奇異點。三角形 mesh 的標準不一樣，是 6，前面暖身那段已經看過。

為什麼要在意？因為 Catmull-Clark 的規則是照著 degree 4 設計的。在奇異點那裡，曲面會比較不平滑。所以接下來要問兩個問題：切的時候，奇異點會不會變多？為什麼它那裡比較不平滑？
-->
---
clicks: 1
---

# 切一次：每個 face 的中心會變成什麼？

Face point 會連到這個 face <span class="key">每條 edge 上的 edge point</span> → 連幾條 = 這個 face 有幾條邊

<div class="grid grid-cols-3 gap-6 mt-2">
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="150.9,41.1 49.1,41.1 49.1,142.9 150.9,142.9" fill="#f973160f" stroke="#64748b" stroke-width="2" />
<line x1="100" y1="92" x2="100.0" y2="41.1" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="49.1" y2="92.0" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="100.0" y2="142.9" stroke="#16a34a" stroke-width="4" />
<line x1="100" y1="92" x2="150.9" y2="92.0" stroke="#16a34a" stroke-width="4" />
<circle cx="100.0" cy="41.1" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="49.1" cy="92.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="100.0" cy="142.9" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="150.9" cy="92.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="150.9" cy="41.1" r="4" fill="#64748b" />
<circle cx="49.1" cy="41.1" r="4" fill="#64748b" />
<circle cx="49.1" cy="142.9" r="4" fill="#64748b" />
<circle cx="150.9" cy="142.9" r="4" fill="#64748b" />
<circle cx="100" cy="92" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#16a34a" text-anchor="middle" style="font-size: 17px; font-weight: 600">中心 degree 4 ✓</text>
</svg>

<div class="small text-center">Quad → 4 個 quads</div>
</div>
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="100.0,20.0 37.6,128.0 162.4,128.0" fill="#f973160f" stroke="#64748b" stroke-width="2" />
<line x1="100" y1="92" x2="68.8" y2="74.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="100.0" y2="128.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="131.2" y2="74.0" stroke="#dc2626" stroke-width="4" />
<circle cx="68.8" cy="74.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="100.0" cy="128.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="131.2" cy="74.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="100.0" cy="20.0" r="4" fill="#64748b" />
<circle cx="37.6" cy="128.0" r="4" fill="#64748b" />
<circle cx="162.4" cy="128.0" r="4" fill="#64748b" />
<circle cx="100" cy="92" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">中心 degree 3 ✗</text>
</svg>

<div class="small text-center">Triangle → 3 個 quads</div>
</div>
<div>

<svg viewBox="0 0 200 200" width="100%" class="mx-auto">
<polygon points="100.0,20.0 31.5,69.8 57.7,150.2 142.3,150.2 168.5,69.8" fill="#f973160f" stroke="#64748b" stroke-width="2" />
<line x1="100" y1="92" x2="65.8" y2="44.9" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="44.6" y2="110.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="100.0" y2="150.2" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="155.4" y2="110.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="92" x2="134.2" y2="44.9" stroke="#dc2626" stroke-width="4" />
<circle cx="65.8" cy="44.9" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="44.6" cy="110.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="100.0" cy="150.2" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="155.4" cy="110.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="134.2" cy="44.9" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="100.0" cy="20.0" r="4" fill="#64748b" />
<circle cx="31.5" cy="69.8" r="4" fill="#64748b" />
<circle cx="57.7" cy="150.2" r="4" fill="#64748b" />
<circle cx="142.3" cy="150.2" r="4" fill="#64748b" />
<circle cx="168.5" cy="69.8" r="4" fill="#64748b" />
<circle cx="100" cy="92" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="100" y="192" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">中心 degree 5 ✗</text>
</svg>

<div class="small text-center">Pentagon → 5 個 quads</div>
</div>
</div>

<div v-click="1" class="mt-2">

不是 quad 的 face：切完就<span class="key">消失</span>（全變 quads），但它的中心留下<span class="key">一個 extraordinary vertex</span>。

</div>

<!--
現在看 Catmull-Clark 切一次的時候，會不會產生新的奇異點。先看新的 face point，就是每個面中間那個橘色的點。

回想 Catmull-Clark 第四步「連線」：face point 會連到這個面每一條邊上的 edge point，就是藍色的點。所以 face point 連幾條線，就看這個面有幾條邊。

左邊是四邊形：四條邊，中心連四條線，degree 4，regular，沒問題。這個四邊形被切成四個小四邊形。

中間是三角形：三條邊，中心只連三條線，degree 3，是奇異點。三角形被切成三個四邊形。

右邊是五邊形：五條邊，中心連五條線，degree 5，也是奇異點。五邊形被切成五個四邊形。

（按一下）所以結論是：不是四邊形的面，切一次之後就消失了，因為它被切成好幾個四邊形。但是它不是完全沒留下痕跡，它的中心會變成一個奇異點，degree 等於原本那個面的邊數。
-->
---
clicks: 1
---

# 其他的點呢？

<div class="grid grid-cols-2 gap-8">
<div>

<svg viewBox="0 0 240 160" width="100%" class="mx-auto">
<polygon points="30,25 120,25 120,115 30,115" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="120,25 210,25 210,115 120,115" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="75.0" y1="70.0" x2="75.0" y2="25" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="75.0" y1="70.0" x2="75.0" y2="115" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="75.0" y1="70.0" x2="30" y2="70.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="165.0" y1="70.0" x2="165.0" y2="25" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="165.0" y1="70.0" x2="165.0" y2="115" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="165.0" y1="70.0" x2="210" y2="70.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="120" y1="70.0" x2="120" y2="25" stroke="#2563eb" stroke-width="4" />
<line x1="120" y1="70.0" x2="120" y2="115" stroke="#2563eb" stroke-width="4" />
<line x1="120" y1="70.0" x2="75.0" y2="70.0" stroke="#2563eb" stroke-width="4" />
<line x1="120" y1="70.0" x2="165.0" y2="70.0" stroke="#2563eb" stroke-width="4" />
<circle cx="75.0" cy="70.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
<circle cx="165.0" cy="70.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
<circle cx="120" cy="70.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="120" cy="25" r="5" fill="#64748b" />
<circle cx="120" cy="115" r="5" fill="#64748b" />
<text x="120" y="150" fill="#16a34a" text-anchor="middle" style="font-size: 17px; font-weight: 600">edge point：連 4 條 ✓</text>
</svg>

<div class="small">舊 edge 剩下的兩半（2 條）＋兩邊的 face point（2 條）→ <b>一定是 4</b></div>
</div>
<div>

<svg viewBox="0 0 240 160" width="100%" class="mx-auto">
<polygon points="120,72 120.0,20.0 75.0,46.0 75.0,98.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="97.5" y1="59.0" x2="120.0" y2="46.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="97.5" y1="59.0" x2="97.5" y2="85.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<circle cx="97.5" cy="59.0" r="6" fill="#f97316" stroke="#fff" stroke-width="2" />
<polygon points="120,72 75.0,98.0 120.0,124.0 165.0,98.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="120.0" y1="98.0" x2="97.5" y2="85.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="120.0" y1="98.0" x2="142.5" y2="85.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<circle cx="120.0" cy="98.0" r="6" fill="#f97316" stroke="#fff" stroke-width="2" />
<polygon points="120,72 165.0,98.0 165.0,46.0 120.0,20.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="142.5" y1="59.0" x2="142.5" y2="85.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<line x1="142.5" y1="59.0" x2="120.0" y2="46.0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3" />
<circle cx="142.5" cy="59.0" r="6" fill="#f97316" stroke="#fff" stroke-width="2" />
<line x1="120" y1="72" x2="120.0" y2="46.0" stroke="#dc2626" stroke-width="4" />
<line x1="120" y1="72" x2="97.5" y2="85.0" stroke="#dc2626" stroke-width="4" />
<line x1="120" y1="72" x2="142.5" y2="85.0" stroke="#dc2626" stroke-width="4" />
<circle cx="120.0" cy="46.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="97.5" cy="85.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="142.5" cy="85.0" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="120" cy="72" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="120" y="150" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">舊的 vertex：還是 3 條</text>
</svg>

<div class="small">每條舊 edge 剩一半，連到 edge point → <b>degree 不變</b></div>
</div>
</div>

<div v-click="1" class="mt-4">

- **第 1 輪**：extraordinary = 原本的 ＋ 每個非 quad face 一個
- **第 2 輪起**：face 全是 quad → 新的點都是 degree 4 → <span class="key">數量不再增加</span>

</div>

<!--
上一頁看了 face point。切完之後還有兩種點：edge point 和舊的頂點。

左邊是 edge point。兩個面共用中間那條邊，藍色的 edge point 在這條邊上。它連出去的線有四條：往上、往下各一條，是原本那條邊被切成的兩半；往左、往右各一條，連到兩邊的 face point，橘色的點。二加二，一定是四條。不管 mesh 長什麼樣子，一條邊永遠是被兩個面共用，所以 edge point 一定是 degree 4，一定是 regular。

右邊是舊的頂點。用 degree 3 的角當例子。切完之後，原本連出去的三條邊，每條都被 edge point 切成兩半，舊的頂點只連到靠近自己的那一半。所以它還是連三條，degree 沒有變。原本是奇異點的，切完還是奇異點；原本是 regular 的，切完還是 regular。

（按一下）把三種點放在一起：

第一輪，奇異點等於原本就有的，再加上每個不是四邊形的面各留下一個。

第二輪開始，所有的面都已經是四邊形了。上一頁說四邊形的中心是 degree 4，這一頁說 edge point 一定是 degree 4，舊的點 degree 不變。所以從第二輪開始，新產生的點全部是 regular，奇異點的數量不會再增加。
-->
---
layout: two-cols
---

# 數一數

切一次之後的 extraordinary vertices
= 原本就有的 ＋ 非 quad 的 face

| | 原本的 | 非 quad face | 切完 |
|---|---|---|---|
| Cube | 8（角） | 0 | **8** |
| Tetrahedron | 4（角） | 4 | **8** |
| GAMES101 | 2 | 2 | **4** |

<div class="small mt-2">之後再切幾次都一樣多。</div>

::right::

<MeshSubdivision
  shape="tetrahedron" :shapes="['tetrahedron', 'cube', 'tshape']" scheme="catmull-clark"
  :level="1" :max-level="4" marks :width="400" :height="290"
/>

<div class="small text-center">紅點是原本的 4 個角；另外 4 個在每個三角形的正中間</div>

<!--
用前兩頁的規則數三個例子。規則是：原本的奇異點，加上不是四邊形的面有幾個。

立方體：六個面都是四邊形，不會多出新的奇異點。原本的八個角每個都是 degree 3。所以切一次之後是八個。

正四面體：四個面都是三角形，所以會多出四個。原本的四個角也都是 degree 3，又四個。總共八個。右邊的 demo 就是正四面體，紅點是原本的四個角；另外四個奇異點在每個三角形面的正中間，可以轉轉看，那裡是三條線交在一起。

第三個例子是 GAMES101 課程裡的：一個 mesh 大部分是四邊形，但是有兩個三角形，還有兩個 degree 5 的點。原本的奇異點是兩個 degree 5 的，加上兩個三角形各留下一個 degree 3 的，總共四個。

右邊可以把 level 往上拉，奇異點的數量不會變，只是周圍越切越密。
-->
---
clicks: 1
---

# 為什麼那裡只有 $C^1$？

<div class="grid grid-cols-2 gap-8">
<div>

<svg viewBox="0 0 200 180" width="250" class="mx-auto">
<rect x="80" y="62" width="40" height="40" fill="#16a34a33" stroke="none" />
<line x1="40" y1="22" x2="40" y2="142" stroke="#94a3b8" stroke-width="1.5" />
<line x1="80" y1="22" x2="80" y2="142" stroke="#94a3b8" stroke-width="1.5" />
<line x1="120" y1="22" x2="120" y2="142" stroke="#94a3b8" stroke-width="1.5" />
<line x1="160" y1="22" x2="160" y2="142" stroke="#94a3b8" stroke-width="1.5" />
<line x1="40" y1="22" x2="160" y2="22" stroke="#94a3b8" stroke-width="1.5" />
<line x1="40" y1="62" x2="160" y2="62" stroke="#94a3b8" stroke-width="1.5" />
<line x1="40" y1="102" x2="160" y2="102" stroke="#94a3b8" stroke-width="1.5" />
<line x1="40" y1="142" x2="160" y2="142" stroke="#94a3b8" stroke-width="1.5" />
<circle cx="40" cy="22" r="4" fill="#334155" />
<circle cx="40" cy="62" r="4" fill="#334155" />
<circle cx="40" cy="102" r="4" fill="#334155" />
<circle cx="40" cy="142" r="4" fill="#334155" />
<circle cx="80" cy="22" r="4" fill="#334155" />
<circle cx="80" cy="62" r="4" fill="#334155" />
<circle cx="80" cy="102" r="4" fill="#334155" />
<circle cx="80" cy="142" r="4" fill="#334155" />
<circle cx="120" cy="22" r="4" fill="#334155" />
<circle cx="120" cy="62" r="4" fill="#334155" />
<circle cx="120" cy="102" r="4" fill="#334155" />
<circle cx="120" cy="142" r="4" fill="#334155" />
<circle cx="160" cy="22" r="4" fill="#334155" />
<circle cx="160" cy="62" r="4" fill="#334155" />
<circle cx="160" cy="102" r="4" fill="#334155" />
<circle cx="160" cy="142" r="4" fill="#334155" />
<text x="100" y="172" fill="#16a34a" text-anchor="middle" style="font-size: 16px; font-weight: 600">4×4 個點 → B-spline ✓</text>
</svg>

<div class="small">

Regular：周圍是整齊的 4×4 格子 → 切出來就是 **bicubic B-spline** → $C^2$

</div>
</div>
<div>

<svg viewBox="0 0 200 180" width="250" class="mx-auto">
<polygon points="100,80 100.0,36.0 61.9,58.0 61.9,102.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,80 61.9,102.0 100.0,124.0 138.1,102.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,80 138.1,102.0 138.1,58.0 100.0,36.0" fill="#94a3b81f" stroke="#94a3b8" stroke-width="1.5" />
<line x1="100" y1="80" x2="100.0" y2="36.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="80" x2="61.9" y2="102.0" stroke="#dc2626" stroke-width="4" />
<line x1="100" y1="80" x2="138.1" y2="102.0" stroke="#dc2626" stroke-width="4" />
<circle cx="100" cy="80" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="100" y="172" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">degree 3：湊不出 4×4</text>
</svg>

<div class="small">

Extraordinary：沒有 4×4 格子可以對 → 規則照樣能算，但只保證 $C^1$

</div>
</div>
</div>

<div v-click="1" class="mt-4">

每切一次，不整齊的範圍<span class="key">縮小一半</span> → 最後只剩那<span class="key">一個點</span>是 $C^1$，其他地方都是 $C^2$。

</div>

<!--
最後一個問題：為什麼曲面在奇異點那裡只有 C1？

左邊是 regular 的情況。Catmull-Clark 的規則是從三次 B-spline 推廣來的。在整齊的四邊形格子上，一小塊曲面，例如綠色那格，由周圍四乘四、十六個控制點決定，算出來剛好就是雙三次 B-spline 曲面。B-spline 曲面我們知道是 C2，所以這裡是 C2。

右邊是奇異點。只有三個面圍著中間這個點，排不出整齊的四乘四格子，所以那裡沒有一個 B-spline 曲面可以對上。Catmull-Clark 的規則在這裡還是照樣可以算，切出來的曲面也還是平滑的，但是數學上只能保證到 C1，也就是沒有摺痕，但曲率不一定連續。

（按一下）那會不會整個曲面都被影響？不會。每切一次，奇異點周圍「不整齊」的那一圈就縮小一半，外面的部分都變成整齊的格子。一直切下去，不整齊的範圍縮到只剩那一個點。所以整個曲面只有奇異點那一個點是 C1，其他地方全部是 C2。

加上前面說的，奇異點數量很少而且固定。所以整體看起來還是很平滑。

四邊形的方法講到這裡。接下來看專門給三角形 mesh 用的方法。
-->

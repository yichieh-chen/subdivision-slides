---
layout: section
---

# 5. Subdivision Surfaces

把曲線的想法搬到 3D

<!--
前面看的是曲線：一條折線，一直切角，最後變成一條平滑的曲線。

接下來做的事情完全一樣，只是把「折線」換成「mesh」。一個很粗的 mesh，一直切，最後變成一個平滑的曲面。

這一段我會講兩個方法：Doo-Sabin 和 Catmull-Clark。這兩個都是從剛剛的曲線方法長出來的。
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
layout: two-cols
---

# Doo-Sabin 的權重

新的點 = 這 4 個點的平均：
舊 vertex、face 中心、兩條 edge 的中點

<v-click>

Face 是 quad 時，權重是

$$\tfrac{9}{16},\ \tfrac{3}{16},\ \tfrac{3}{16},\ \tfrac{1}{16}$$

就是 Chaikin 的 $\tfrac34, \tfrac14$ <span class="key">兩個方向各做一次</span>

<div class="small">

Limit surface 是 $C^1$。

</div>

</v-click>

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
剛剛說「往中心縮」，那到底縮多少？這頁給精確的規則。

一個新的點，是四個點的平均。這四個點是：舊的頂點自己、這個面的中心、還有從這個頂點出去的兩條邊的中點。四個點加起來除以四。

（按一下）如果這個面是四邊形，把它展開來算，會得到四個頂點的權重是 9/16、3/16、3/16、1/16。看右邊的圖：離新點最近的那個角是 9/16，相鄰的兩個角各 3/16，對角最遠的那個是 1/16。

這組數字不是亂來的。Chaikin 的權重是 3/4 和 1/4。一個四邊形有兩個方向，橫的做一次 Chaikin、直的再做一次，權重相乘：3/4 乘 3/4 是 9/16，3/4 乘 1/4 是 3/16，1/4 乘 1/4 是 1/16。所以說 Doo-Sabin 是 Chaikin 的 3D 版，是真的可以算出來的。

最後兩個性質。第一，極限曲面是 C1。Chaikin 的極限是二次 B-spline 曲線，所以這裡的極限是雙二次 B-spline 曲面。第二，切一次之後每個頂點都剛好連四條邊，很規則。唯一不規則的是那些不是四邊形的面，例如立方體角上的三角形，但它們的數量之後不會再變多。
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

$F$：周圍 face points 的平均　$R$：周圍 edge 中點的平均

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

舊頂點的公式比較長。n 是這個頂點連了幾條邊。F 是它周圍所有 face point 的平均。R 是它周圍所有邊的中點的平均。新位置是 F 加兩倍 R 加 n 減 3 倍的舊位置，全部除以 n。

用最常見的情況代進去看：n 等於 4 的時候，是 F 加 2R 加 1 倍的自己，除以 4。也就是自己只佔四分之一，其他四分之三都是被鄰居拉過去的。

老師的投影片是另一種寫法，但是是同一條公式：自己佔 n 分之 n 減 2，相鄰頂點的平均佔 n 分之 1，face point 的平均佔 n 分之 1。把 R 展開就會發現兩個是一樣的。

（按一下）三個性質。第一，切一次之後全部變成四邊形，不管原本是三角形還是五邊形。第二，它是 approximating，曲面幾乎到處都是 C2。如果 mesh 是很規則的四邊形格子，切到極限得到的就是雙三次 B-spline 曲面，所以說它是三次 B-spline 的推廣；但 B-spline 只能用在規則格子上，Catmull-Clark 任何 mesh 都可以。第三，「幾乎」的例外是 extraordinary vertex，那裡只有 C1，下一頁解釋。

算一個點只需要看緊鄰的一圈鄰居。Pixar 的電影從 Geri's Game 之後基本上都用這個方法。右邊可以換不同形狀切切看，注意切出來會比原本的 control mesh 小一圈。
-->

---
layout: two-cols
---

# Extraordinary Vertices

Quad mesh：degree 4 是 <span class="key">regular</span>，
其他是 <span class="key">extraordinary vertex</span>。

Catmull-Clark 切一次之後：

- 不是 quad 的 face 全部消失
- 每個變成一個 extraordinary vertex

<v-click>

之後新的點 degree 都是 4
→ 數量<span class="key">不會再增加</span>

</v-click>

::right::

<MeshSubdivision
  shape="tetrahedron" :shapes="['tetrahedron', 'cube', 'tshape']" scheme="catmull-clark"
  :level="1" :max-level="4" marks :width="400" :height="290"
/>

<!--
剛剛一直說「幾乎到處 C2」，那個「幾乎」指的就是這頁要講的 extraordinary vertex，中文可以叫奇異點。

先講什麼是正常。在一個全是四邊形的格子裡，像棋盤一樣，每個頂點都剛好連四條邊。連四條邊的叫 regular。不是四條的，例如三條或五條，就叫 extraordinary。

Catmull-Clark 切一次會發生三件事。第一，每個面都被切成四邊形，所以三角形、五邊形這些不是四邊形的面全部消失。第二，但是那些面的 face point 會連出跟面的邊數一樣多的邊。例如一個三角形，它的 face point 連三條邊，所以它變成一個 degree 3 的奇異點。第三，原本就是奇異點的頂點還是奇異點，degree 不會變。

右邊是正四面體，四個三角形。切一次之後，原本四個頂點都是 degree 3，再加上四個 face point 也是 degree 3，總共八個奇異點。

（按一下）重點是再切下去不會變多。因為第二輪開始所有的面都是四邊形了，新產生的 face point 和 edge point 都剛好連四條邊。所以奇異點只有第一輪會增加，之後數量固定，只是周圍越切越密。

曲面在規則的地方是 C2，只有在這幾個奇異點上降成 C1。因為數量很少而且固定，所以整體看起來還是很平滑。

四邊形的方法講到這裡。接下來看專門給三角形 mesh 用的方法。
-->

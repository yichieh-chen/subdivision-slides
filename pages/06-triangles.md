---
layout: section
---

# 6. Triangle Schemes

Modified Butterfly 與 Loop

<!--
剛剛的 Catmull-Clark 最適合四邊形。但是很多 mesh 是三角形的，例如掃描出來的模型、遊戲裡的模型。

這一段講兩個專門給三角形 mesh 用的方法：Modified Butterfly 和 Loop。一個是 interpolating，一個是 approximating，剛好可以對比。
-->

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

右邊拉 $n$，看 Loop 對不同 degree 用的權重。

</div>

::right::

<Stencil kind="loop-vertex" />

<!--
三角形的方法，切法都一樣：每條邊的中間加一個點，把這三個新點連起來，一個三角形就變成四個小三角形。這是 topological rule，Butterfly 和 Loop 都用這個。兩個方法的差別只在 geometric rule，也就是點放在哪裡。

再來是 regular 的定義。四邊形格子是連四條邊算正常。三角形格子是連六條邊算正常，想像蜂巢的形狀，一個點周圍剛好六個三角形。

切的時候，每條邊中間新加的點，一定剛好連六條邊，所以新的點全部是 regular。

Degree 不是六的就是 extraordinary。它們只會是一開始 control mesh 上就有的那些頂點，切再多次數量也不會增加。例如正二十面體每個頂點連五條邊，所以那十二個頂點一直是奇異點，其他新長出來的全部是 regular。

這種「大部分規則、只有少數幾個奇異點」的 mesh 叫 semi-regular mesh。

regular 的頂點，自己的權重是十六分之十，六個鄰居各十六分之一。

所以每個方法的規則都要寫兩套：一套給 regular 的地方，一套處理奇異點。右邊這張圖是 Loop 的權重，可以拉 n 看不同 degree 的權重怎麼變，等一下講 Loop 的時候會再回來。
-->

---
layout: two-cols
---

# 為什麼新的點都是 regular？

Edge 上的新點 <b style="color:#f97316">●</b> 會連到 <span class="key">6</span> 個點：

- 這條 edge 的兩個端點：2 條
- 兩邊的 triangle 裡，另外兩條 edge 上的新點：2 × 2 = 4 條

<div class="small mt-4">

所以新的點 degree 一定是 6。<br>
例：icosahedron 的 12 個 vertices 都是 degree 5，切幾次都是這 12 個 extraordinary vertices。

</div>

::right::

<svg viewBox="0 0 320 300" width="340" class="mx-auto mt-6">
  <g fill="none" stroke="#94a3b8" stroke-width="1.5">
    <polygon points="50,150 270,150 160,30" /><polygon points="50,150 270,150 160,270" />
    <line x1="105" y1="90" x2="215" y2="90" stroke-dasharray="4 4" /><line x1="105" y1="210" x2="215" y2="210" stroke-dasharray="4 4" />
  </g>
  <g stroke="#f97316" stroke-width="3">
    <line x1="160" y1="150" x2="50" y2="150" /><line x1="160" y1="150" x2="270" y2="150" />
    <line x1="160" y1="150" x2="105" y2="90" /><line x1="160" y1="150" x2="215" y2="90" />
    <line x1="160" y1="150" x2="105" y2="210" /><line x1="160" y1="150" x2="215" y2="210" />
  </g>
  <g fill="#2563eb"><circle cx="50" cy="150" r="7" /><circle cx="270" cy="150" r="7" /><circle cx="160" cy="30" r="7" /><circle cx="160" cy="270" r="7" /></g>
  <g fill="#16a34a"><circle cx="105" cy="90" r="6" /><circle cx="215" cy="90" r="6" /><circle cx="105" cy="210" r="6" /><circle cx="215" cy="210" r="6" /></g>
  <circle cx="160" cy="150" r="9" fill="#f97316" stroke="#fff" stroke-width="2" />
  <g fill="currentColor">
    <text x="28" y="142" style="font-size: 15px">1</text><text x="282" y="142" style="font-size: 15px">2</text>
    <text x="86" y="84" style="font-size: 15px">3</text><text x="224" y="84" style="font-size: 15px">4</text>
    <text x="86" y="230" style="font-size: 15px">5</text><text x="224" y="230" style="font-size: 15px">6</text>
  </g>
</svg>

<!--
上一頁說新長出來的點一定是 degree 6。為什麼？這頁數給大家看。

右邊的圖是兩個三角形，共用中間那條橫的邊。藍色是舊的頂點。每條邊的中間都加一個新點：橘色是中間這條邊上的新點，綠色是另外四條邊上的新點。

現在數橘色的點連了幾條線。

往左、往右各一條，連到這條邊原本的兩個端點，圖上的 1 和 2。這是因為原本的邊被新點切成兩半。

上面那個三角形被切成四個小三角形，所以橘色的點會連到上面三角形另外兩條邊上的新點，圖上的 3 和 4。

下面那個三角形也一樣，連到 5 和 6。

總共六條。不管 mesh 長什麼樣子，只要一條邊是被兩個三角形共用，結果都是六。所以新的點一定是 regular。

這就代表奇異點只會是一開始 control mesh 上就有的那些頂點。例如正二十面體有十二個頂點，每個都連五條邊，所以奇異點永遠就是這十二個，其他新長出來的幾十個、幾百個點全部都是 regular。
-->

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

形狀像蝴蝶。$w$ 決定 surface 貼 control mesh 多緊。

</div>

::right::

<Stencil kind="butterfly" />

<!--
先講 Butterfly。它是 interpolating，所以舊的頂點完全不動。每一輪只需要算一件事：每條邊上新加的那個點放哪裡。

新的點是周圍一些頂點乘上權重再加起來。看右邊的圖，橘色是要算的新點。

a 是這條邊的兩個端點，權重是二分之一減 w，最大，因為離新點最近。

b 是這條邊兩側兩個三角形的對角，權重是八分之一加 2w。

c 是再外面一圈的四個點，權重是負的十六分之一減 w。注意是負的。負的權重會把新點往外推，這樣曲面才不會縮小，才能通過原本的點。

d 是沿著這條邊往兩頭再延伸出去的兩個點，權重就是 w。

這十個點的形狀像一隻蝴蝶，所以叫 butterfly。所有權重加起來剛好是 1。w 是一個可以調的參數，可以在右邊拉拉看。w 等於 0 的時候 d 沒有作用，只剩八個點。

下一頁講三個常被問到的細節。
-->

---

# Butterfly：三個細節

<v-clicks>

- **權重加起來是 1**（$w = 0$ 時）：$\ 2 \times \tfrac12 + 2 \times \tfrac18 + 4 \times \left(-\tfrac{1}{16}\right) = 1$

- **為什麼 c 是負的？**
  權重全是正的 → 新點只會落在舊點「之間」→ surface 往內縮。
  但舊的點不能動，所以新點要<span class="key">往外推</span>才會圓 → 需要負的權重。

- **程式怎麼找到 a、b、c、d？**
  每個 vertex 把連出去的 edges <span class="key">照順序</span>存成 list。
  這條 edge 的前後一格是 b，再一格是 c，正對面是 d。

</v-clicks>

<!--
Butterfly 有三個細節，老師可能會問。

（按一下）第一，權重加起來是 1。用 w 等於 0 來算：a 有兩個，各二分之一，加起來是 1。b 有兩個，各八分之一，加起來是四分之一。c 有四個，各負的十六分之一，加起來是負的四分之一。1 加四分之一減四分之一，剛好是 1。w 不是 0 的時候，加起來也還是 1。權重和是 1，新的點才是周圍這些點的加權平均。

（按一下）第二，為什麼 c 的權重是負的？

如果權重全部是正的，新的點一定落在舊的點「之間」，像 Loop 那樣，曲面會一直往內縮。Approximating 的方法可以接受往內縮，因為舊的點也會跟著動。

但是 Butterfly 是 interpolating，舊的點不能動。如果新的點只落在兩個端點的正中間，那切再多次都還是原本那個有稜有角的形狀，不會變圓。要變圓，新的點必須比直線的中點再「凸出去」一點。負的權重就是在做這件事：它讓新的點往遠離 c 的方向移動，也就是往外推。

這跟前面曲線的 4-point scheme 是同一個道理，那裡兩端的權重也是負的。

（按一下）第三是實作的問題。給一條邊，程式怎麼知道哪些點是 a、b、c、d？

作法是每個頂點把它連出去的邊，照順時針或逆時針的順序存成一個 list。regular 的頂點一定有六條邊。從「我們要切的這條邊」在 list 裡的位置出發：前一格和後一格連到的點就是 b，再往前、再往後一格是 c，正對面那一格是 d。
-->

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

<!--
剛剛那個蝴蝶形狀的規則有個前提：邊的兩個端點都要連六條邊，這樣周圍才剛好有那十個點。如果有一端是奇異點，蝴蝶的形狀就湊不出來，硬套的話曲面在那裡會不平滑。

所以有了 Modified Butterfly，多加了幾條規則。

第一，如果邊的一端是奇異點、另一端是 regular，就不用蝴蝶了，改成只看奇異點那一端：用那個奇異點本身，加上它周圍一圈的鄰居來算。權重下一頁有。

第二，如果兩端都是奇異點，就兩端各自用上面的方法算一個位置，再把兩個結果平均。這種情況只會在第一輪出現，因為之後新長出來的點都是 regular。

第三，邊界上的邊，新點直接放在中點，不移動。

（按一下）右邊是正二十面體，紅色的點是原本的十二個控制點。不管切幾次，紅點都還在曲面上，這就是 interpolating。而且因為正二十面體每個點是 degree 5，所以這裡全部都在用 modified 的規則。
-->

---

# Modified Butterfly：Extraordinary 的權重

$v$ 是 extraordinary vertex，$e_0 \dots e_{N-1}$ 是它的鄰居（$e_0$ 是這條 edge 的另一端）

| $N$ | $v$ | 鄰居的權重 |
|---|---|---|
| 3 | $\tfrac34$ | $e_0: \tfrac{5}{12}$，$e_1, e_2: -\tfrac{1}{12}$ |
| 4 | $\tfrac34$ | $e_0: \tfrac38$，$e_1: 0$，$e_2: -\tfrac18$，$e_3: 0$ |
| ≥ 5 | $\tfrac34$ | $e_j: \tfrac1N\left[\tfrac14 + \cos\tfrac{2\pi j}{N} + \tfrac12\cos\tfrac{4\pi j}{N}\right]$ |

<div class="small mt-4">

可以證明這樣在 extraordinary vertex 上也是 $C^1$：把 subdivision 寫成 <b>matrix</b>，分析 eigenvalues。

</div>

<!--
這頁是上一頁第一條規則的實際數字。

v 是奇異點，它有 N 個鄰居，照順序叫 e0、e1 一直到 e N 減 1。e0 是我們正在切的這條邊的另一個端點。

不管 N 是多少，v 自己的權重都是四分之三。

N 等於 3 的時候，e0 是十二分之五，另外兩個是負的十二分之一。

N 等於 4 的時候，e0 是八分之三，對面的 e2 是負的八分之一，旁邊的 e1 和 e3 是 0。

N 大於等於 5 的時候用一條公式，裡面是 cosine，j 是第幾個鄰居。

每一列加起來都是 1，可以自己驗算：四分之三加十二分之五減十二分之二，等於 1。

為什麼用這些數字就會平滑？這是可以證明的。證明的方法是把一輪 subdivision 寫成一個矩陣，然後分析它的 eigenvalue。這跟前面曲線那段分析收斂的方法是一樣的。
-->

---

# Boundary 怎麼辦？

Boundary 的外面沒有鄰居，蝴蝶的 10 個點湊不齊。

- Boundary 上的 edge：新點直接放在 <span class="key">中點</span>，不移動
- Boundary 上的 vertex 幾乎都是 extraordinary（少了一側的鄰居）
- Sharp corner 需要另外的規則（這裡不細講）

<!--
前面的 mesh 都是封閉的，像球、立方體。如果 mesh 有邊界，例如一張紙、一個沒有蓋子的杯子，會遇到問題：邊界的外面沒有東西，蝴蝶需要的十個鄰居湊不齊。

處理的方法比較簡單。邊界上的邊，照樣在中間加一個新點，但是這個新點就直接放在邊的中點，不用任何權重去移動它。

另外，邊界上的頂點因為少了一側的鄰居，連的邊數通常不是六，所以它們幾乎都是奇異點。

最後，如果邊界上有尖角，例如正方形紙的四個角，需要再另外的規則。那個超出這堂課的範圍，這裡不細講。
-->

---

# Why not Butterfly?

<div class="flex gap-4 items-start">
<div class="flex-1">

- 只有 $C^1$，不是 $C^2$
- 不夠 **fair**：容易有 wiggles
- 對 noise 很敏感

<v-click>

<div class="small mt-4">

**Loop** 比較小顆，但比較順：這是 approximating 換來的好處。

</div>

</v-click>

</div>
<MeshSubdivision shape="tshape" scheme="butterfly" :level="3" marks color="#34d399" :width="280" :height="240" title="Modified Butterfly" />
<MeshSubdivision shape="tshape" scheme="loop" :level="3" marks color="#a78bfa" :width="280" :height="240" title="Loop" />
</div>

<!--
Butterfly 會通過所有控制點，聽起來很理想，那為什麼大家不都用它？

第一，它只有 C1。切線連續，但是曲率不連續，反光看起來沒有 C2 那麼順。

第二，它不夠 fair。fair 的意思是曲面看起來順不順、有沒有多餘的起伏。Butterfly 為了硬通過每個點，表面常常會有小小的波浪。

第三，對 noise 很敏感。因為每個控制點都一定要通過，所以如果資料有一點點誤差，例如掃描出來的點歪了一點，曲面就會跟著歪，誤差完全被保留下來。

這跟用三次曲線做內插會遇到的問題很像：硬要通過每個點，曲線就容易扭來扭去。

（按一下）看下面兩張圖，是同一個 T 字形。左邊 Butterfly 通過紅色的控制點，但表面有點凹凸。右邊 Loop 沒有通過紅點，整個縮小了一圈，但是很平順。這就是 approximating 的交換：放棄通過控制點，換來比較平滑的曲面。

所以接下來講 Loop。
-->

---
layout: two-cols
---

# Loop Subdivision

以 Charles Loop 命名。<span class="key">Approximating</span>，triangle mesh 最常用。

**① Edge point**（右圖）

$$e = \tfrac{3}{8}(v_1 + v_2) + \tfrac{1}{8}(v_3 + v_4)$$

**② Move old vertices**

$$v_{new} = (1 - n\beta)\, v_{old} + \beta \sum_{j=1}^{n} v_j$$

<div class="small">

$n$ = degree，$v_j$ 是舊的鄰居。$\beta$ 是多少，下一頁說。

</div>

::right::

<Stencil kind="loop-edge" />

<!--
Loop 這個名字是人名，Charles Loop，不是因為規則裡有迴圈。

切法跟 Butterfly 一樣，一個三角形切成四個。不一樣的是它是 approximating，所以每一輪要算兩種點。

第一種，邊上的新點。看右邊的圖，一條邊被兩個三角形共用，所以附近有四個頂點。邊的兩個端點各佔八分之三，兩個三角形的對角各佔八分之一。兩個八分之三加兩個八分之一，剛好是 1。端點離得近，所以權重大。

第二種，舊的頂點要移動。n 是這個頂點的 degree，也就是它有幾個鄰居。每個鄰居的權重是 beta，n 個鄰居總共佔 n 乘 beta，剩下的 1 減 n beta 是自己的。這裡的鄰居指的是舊的鄰居，不是新加的點。

beta 到底是多少，下一頁說。
-->

---

# Loop：$\beta$ 是多少？

每個鄰居拿 $\beta$，自己拿剩下的 $1 - n\beta$。

| $n$（degree） | 每個鄰居 $\beta$ | 自己 $1 - n\beta$ |
|---|---|---|
| 3 | $\tfrac{3}{16}$ | $\tfrac{7}{16}$ |
| 6（regular） | $\tfrac{1}{16}$ | $\tfrac{10}{16}$ |
| 其他 | $\tfrac{3}{8n}$ | $\tfrac{5}{8}$ |

<div class="small mt-4">

這是常用的簡化版。Loop 原本的公式是 $\beta = \tfrac1n\left[\tfrac58 - \left(\tfrac38 + \tfrac14\cos\tfrac{2\pi}{n}\right)^2\right]$，$n = 6$ 時一樣是 $\tfrac{1}{16}$。

</div>

<!--
上一頁的公式裡，每個鄰居的權重是 beta，有 n 個鄰居，所以鄰居總共拿走 n 乘 beta，剩下的 1 減 n beta 是自己的。

beta 是多少，看這個頂點的 degree。

最重要的是中間那一列，regular 的情況，n 等於 6。beta 是十六分之一。六個鄰居各十六分之一，總共十六分之六，自己是剩下的十六分之十。這組數字請記起來：十六分之十，和六個十六分之一。

n 等於 3 的時候，beta 是十六分之三，三個鄰居總共十六分之九，自己是十六分之七。

其他的 n，beta 用 8n 分之 3。這時候 n 乘 beta 剛好是八分之三，所以不管 n 是多少，自己都是八分之五。n 等於 6 代進去也是八分之五，就是十六分之十，是一致的。

下面小字：這張表是後來的人提出的簡化版，比較好算。Loop 自己原本的公式比較複雜，裡面有 cosine。兩個版本在 n 等於 6 的時候都是十六分之一，其他的 n 數字會差一點點，但是切出來的曲面都是平滑的，看起來幾乎一樣。

前面 Regular 與 Extraordinary 那頁右邊可以拉 n 的圖，用的是原本 cosine 的版本。
-->

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
- 舊的點用 $\tfrac{1}{8},\ \tfrac{3}{4},\ \tfrac{1}{8}$（cubic B-spline curve 的規則）

</v-click>

::right::

<MeshSubdivision
  shape="icosahedron" :shapes="['icosahedron', 'octahedron', 'tetrahedron', 'tshape', 'ring']" scheme="loop"
  :level="1" :max-level="4" color="#a78bfa" :width="400" :height="290"
/>

<!--
右邊實際切切看。正二十面體切幾次就很像一顆球。

幾個特性。每個三角形變四個，所以每切一次面數變四倍。舊的頂點每一輪都會被鄰居往內拉，所以最後的曲面比原本的 control mesh 小一圈，這跟 Catmull-Clark 一樣。

連續性也跟 Catmull-Clark 一樣：規則的地方 C2，奇異點上 C1。

（按一下）如果 mesh 有邊界，或是有想保留的摺痕，要用特殊的規則，不然邊界會被往內拉、縮起來。

邊界上，邊的新點直接放中點。舊的頂點只看邊界上左右兩個鄰居，權重是八分之一、四分之三、八分之一。這組數字前面看過，就是三次 B-spline 曲線的 subdivision 規則。意思是邊界那條線，自己會變成一條三次 B-spline 曲線，不受裡面的面影響。
-->

---

# Loop vs. Butterfly

| | Modified Butterfly | Loop |
|---|---|---|
| 類型 | Interpolating | Approximating |
| 舊的 vertex | 不動 | 會移動 |
| 通過 control points | ✓ | ✗（小一圈） |
| 平滑度 | $C^1$ | $C^2$（extraordinary 是 $C^1$） |
| 缺點 | Wiggles、怕 noise | 形狀會縮小 |

<div class="small mt-4">切法一樣：每個 triangle 切成 4 個。差別只在點放哪裡。</div>

<!--
三角形的兩個方法都講完了，放在一起比。

先講一樣的地方：切法完全一樣，每條邊中間加一個點，一個三角形變四個。它們的 topological rule 是同一個。差別全部在 geometric rule，也就是點放哪裡。

第一列，類型。Butterfly 是 interpolating，Loop 是 approximating。

第二列，舊的頂點。Butterfly 不動，所以每一輪只要算邊上的新點。Loop 會移動，所以每一輪要算兩種點。

第三列，會不會通過控制點。Butterfly 會。Loop 不會，曲面會比 control mesh 小一圈。

第四列，平滑度。Butterfly 只有 C1。Loop 是 C2，只有在奇異點上是 C1。

第五列，缺點。Butterfly 的表面容易有小波浪，而且控制點有誤差的話會完全保留下來。Loop 的缺點是形狀會縮小，沒辦法精確控制曲面通過哪裡。

所以結論是：除非一定要通過控制點，不然用 Loop。
-->

---

# What to Use?

<div class="flex gap-4 items-start">
<div class="flex-1">

- Triangle mesh → <span class="key">Loop</span>
- Quad mesh → <span class="key">Catmull-Clark</span>
- 一定要 interpolate → Butterfly

<v-click>

<div class="small mt-4">

**不要** 把 quad mesh 先 triangulate 再做 Catmull-Clark：mesh 會變得不規則，surface 比較不順。

</div>

</v-click>

</div>
<MeshSubdivision shape="tshape" scheme="catmull-clark" :level="2" :width="280" :height="240" title="Quads → Catmull-Clark" />
<MeshSubdivision shape="tshape" scheme="catmull-clark" triangulated :level="2" color="#e2725b" :width="280" :height="240" title="先 triangulate 再 Catmull-Clark" />
</div>

<!--
講了四個方法，到底該用哪一個？

先問需不需要通過控制點。不需要的話，用 Loop 或 Catmull-Clark，因為它們是 C2，比較平滑。一定要通過控制點，才用 Butterfly。

再看 mesh 是什麼形狀。三角形的 mesh 用 Loop，四邊形的 mesh 用 Catmull-Clark。

（按一下）有一件事不要做：把四邊形的 mesh 先切成三角形，再拿去做 Catmull-Clark。

看下面兩張圖，是同一個 T 字形。左邊直接用四邊形做 Catmull-Clark，很平順。右邊先把每個四邊形切一條對角線變成兩個三角形，再做 Catmull-Clark，表面變得凹凸不平。

原因是切對角線之後，頂點連的邊數變多、變得不一致，原本規則的格子變成一堆奇異點，而且對角線有方向性，曲面就會沿著對角線的方向皺起來。

所以原則是：mesh 是什麼形狀，就用適合那個形狀的方法。
-->

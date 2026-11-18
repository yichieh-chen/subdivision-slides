---
layout: section
---

# 4. Subdivision Curves

先在 2D 的曲線上把觀念弄懂

---
clicks: 4
---

# Corner Cutting：把角切掉

曲線版的 subdivision 最容易理解：一直把 <span class="key">角</span> 切掉，折線就會變圓。<span class="small">（以 Chaikin 為例）</span>

<CornerCut :step="$clicks" />

---
layout: two-cols
---

# Chaikin Algorithm

對每一條邊 $P_i P_{i+1}$，產生兩個新點：

$$
\begin{aligned}
Q &= \tfrac{3}{4} P_i + \tfrac{1}{4} P_{i+1} \\
R &= \tfrac{1}{4} P_i + \tfrac{3}{4} P_{i+1}
\end{aligned}
$$

- 舊的點全部丟掉 → <span class="key">approximating</span>
- $n$ 個點變成 $2(n-1)$ 個點
- Limit curve 剛好是 **quadratic B-spline**

<div class="small mt-4">不用記公式：就是「每條邊的 1/4 和 3/4 處」。</div>

::right::

<CurveSubdivision scheme="chaikin" :level="1" :width="440" />

---

# 為什麼一直切會收斂？

<div class="grid grid-cols-2 gap-8">
<div>

每個新點都是舊點的 <span class="key">加權平均</span>，而且權重加起來是 1：

$$\tfrac{3}{4} + \tfrac{1}{4} = 1$$

<v-clicks>

- 平均出來的點一定落在舊點「之間」，不會亂跑
- 每切一次，相鄰兩點的距離大約 <b>變成一半</b>
- 所以點會越來越密、越來越靠近同一條曲線

</v-clicks>

</div>
<div>

<v-click>

**數學上怎麼證明？**（知道有這回事就好）

把一次 subdivision 寫成矩陣 $A$：

$$\begin{pmatrix} Q \\ R \end{pmatrix} = \underbrace{\tfrac{1}{4}\begin{pmatrix} 3 & 1 \\ 1 & 3 \end{pmatrix}}_{A} \begin{pmatrix} P_1 \\ P_2 \end{pmatrix}$$

切 $k$ 次就是乘 $A^k$。$A$ 的 eigenvalues 是 $1$ 和 $\tfrac{1}{2}$：
$\tfrac12$ 那一項一直縮小到消失，只剩下 $1$ 那一項 → 收斂。

</v-click>

</div>
</div>

---
layout: two-cols
---

# Cubic B-spline

想要更 smooth？讓更多鄰居參與平均：

- **Edge point**（邊上的新點）

$$Q_{2i-1} = \tfrac{1}{2} P_i + \tfrac{1}{2} P_{i+1}$$

- **Vertex point**（舊的點也要移動）

$$Q_{2i} = \tfrac{1}{8} P_{i-1} + \tfrac{3}{4} P_i + \tfrac{1}{8} P_{i+1}$$

<div class="small mt-4">

Limit curve 是 <span class="key">cubic B-spline</span>，比 Chaikin 更平滑。之後會推廣成 Catmull-Clark。

</div>

::right::

<CurveSubdivision scheme="cubic" :level="1" :width="440" />

<!--
Chaikin 會把舊的點丟掉。Cubic B-spline 不丟，而是有兩種點。
Edge point：每條邊上的新點，就是兩個端點各一半，也就是中點。
Vertex point：舊的點要移動，自己佔四分之三，左右鄰居各佔八分之一。
這三組數字（½、½）和（⅛、¾、⅛）請記一下，下一頁的圖上標的就是它們。
-->

---
clicks: 5
---

# Cubic B-spline：一步一步看

把上一頁的兩個公式套在四個點上：<span class="key">舊的點不丟掉，而是移動</span>。

<CurveSteps scheme="cubic" :step="$clicks" />

<!--
現在把上一頁的公式實際做一次。跟 Corner Cutting 那頁同樣的四個點，方便比較。
[click] 第一步是 edge point 的公式：每條邊的中點放一個新點，紅色。圖上的 ½ 就是公式裡的二分之一、二分之一。
[click] 第二步是 vertex point 的公式：舊的點也要動。以 P2 為例，它自己佔四分之三，左右鄰居各佔八分之一，所以往鄰居的方向靠近一點，變成藍色的點。頭尾兩個點沒有兩邊的鄰居，這裡讓它們留在原地。
[click] 第三步：把紅點和藍點照順序連起來，舊的折線就不要了。
[click] 再做一次。
[click] 做很多次就是平滑的曲線。它不通過 control points，所以是 approximating。
-->

---
layout: two-cols
---

# 4-point Scheme

**Interpolating**：如果希望曲線 <span class="key">一定要通過</span> control points？

- 舊的點 **完全不動**
- 每條邊中間插入一個新點，用前後共 4 個點來算：

$$Q = \frac{-P_{i-1} + 9 P_i + 9 P_{i+1} - P_{i+2}}{16}$$

<div class="small mt-4">

負的權重把新點往外「頂」，曲線才不會扁掉。代價是容易有小波動（wiggle）。

</div>

::right::

<CurveSubdivision scheme="fourPoint" :level="1" :width="440" />

<!--
前兩個方法曲線都不通過 control points。如果一定要通過，就用 4-point scheme。
舊的點完全不動，只在每條邊中間插入一個新點。
公式拆開看：近的兩個點各九除以十六，遠的兩個點各負一除以十六，加起來還是 1。
下一頁的圖上標的 9/16 和 −1/16 就是這四個權重。
-->

---
clicks: 4
---

# 4-point Scheme：一步一步看

把上一頁的公式套在四個點上：<span class="key">舊的點完全不動</span>，只插入新的點。

<CurveSteps scheme="fourPoint" :step="$clicks" />

<!--
把上一頁的公式實際做一次，還是同樣的四個點。
[click] 每條邊插入一個新點。以中間那條邊為例，用前後共四個點來算：近的兩個各九除以十六，遠的兩個各負一除以十六。虛線圈是單純的中點，紅點是實際的位置，負的權重把它往外頂。
[click] 舊的點留在原地，跟新的點一起連起來。
[click] 再做一次。
[click] 做很多次就是平滑的曲線，而且通過每一個 control point，所以是 interpolating。
-->

---

# 平滑度：$C^0$、$C^1$、$C^2$ 是什麼？

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

Chaikin 的 limit curve 是 $C^1$，cubic B-spline 是 $C^2$，4-point 是 $C^1$。推廣到 surface 之後也一樣。

</div>

<!--
比較三個方法之前，先講 C0、C1、C2。下一頁的比較表，還有後面比較每個 surface 的方法好不好，都是在比這個，所以先講清楚。

它們描述的是：曲線或曲面，接起來的地方有多順。數字越大越順。

左邊是 C0，只有位置連續。意思是線沒有斷開，兩段有接在一起，但是接的地方可以有尖角，像紅點那裡。

中間是 C1，切線也連續。切線就是線前進的方向。C1 的意思是經過接點的時候方向不會突然轉彎，所以沒有尖角。但是看這張圖：左邊是直線，右邊是圓弧，在紅點接起來。方向是順的，可是直線完全不彎，圓弧一開始就很彎，「彎的程度」在紅點突然從零跳到很彎。這個彎的程度叫曲率。

右邊是 C2，連曲率都連續。彎的程度是慢慢變的，沒有突然跳。

曲面也是一樣的意思。C1 的曲面摸起來沒有摺痕。C2 的曲面連反光都很平順，C1 的曲面反光在某些地方會看起來斷一下。所以做車子、做角色都希望是 C2。

最後一行：Chaikin 切到極限是 C1，三次 B-spline 是 C2，4-point 是 C1。下一頁會把這三個放在一起比。之後把它們推廣到曲面也一樣，Doo-Sabin 是 C1，Catmull-Clark 是 C2。
-->

---

# 比一比：Approximating vs. Interpolating

<div class="flex gap-6 items-start">
<div class="flex-1">

| Scheme | 通過？ | 平滑度 |
|---|---|---|
| Chaikin | ✗ | $C^1$ |
| Cubic | ✗ | $C^2$ |
| 4-point | ✓ | $C^1$ |

<div class="small mt-4">

「通過」= 通過 control points。<br>$C^1$：切線連續。$C^2$：連曲率都連續。

</div>

</div>
<CurveSubdivision :schemes="['chaikin', 'cubic', 'fourPoint']" scheme="chaikin" :level="4" :width="500" />
</div>

---
layout: section
---

# 4. Subdivision Curves

先在 2D 的曲線上把觀念弄懂

<!--
第四段講曲線。曲面比較難想像，所以先在 2D 的曲線上把觀念弄懂。

會看三個方法：Chaikin、cubic B-spline、4-point。之後的 surface scheme 都是從它們推廣出來的。
-->

---
clicks: 4
---

# Corner Cutting：把角切掉

曲線版的 subdivision 最容易理解：一直把 <span class="key">角</span> 切掉，折線就會變圓。<span class="small">（以 Chaikin 為例）</span>

<CornerCut :step="$clicks" />

<!--
曲線版的 subdivision 最好懂：一直把角切掉，折線就會變圓。這裡用 Chaikin 當例子。

一開始只有四個 control points 連成的折線。

[click] Insert：每條邊上，在四分之一和四分之三的位置各放一個新點。

[click] Connect：把新的點連起來，原本的角就被切掉了。

[click] Repeat：對新的折線再做一次，角越切越小。

[click] 做很多次之後，看起來就是一條平滑的曲線。

注意舊的 control points 都被丟掉了，曲線沒有通過它們。
-->

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

<!--
把上一頁的動作寫成公式。

對每一條邊產生兩個新點：Q 靠近 P_i，所以 P_i 佔四分之三、P_{i+1} 佔四分之一；R 反過來。

三個重點：

第一，舊的點全部丟掉，所以是 approximating。

第二，n 個點會變成 2(n−1) 個點。例如 4 個點變 6 個，再變 10 個。

第三，它的 limit curve 剛好是 quadratic B-spline。

公式不用背，記得「每條邊的四分之一和四分之三」就好。

右邊可以拉 slider 看切幾次的結果，也可以拖 control points。
-->

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

<!--
這頁回答：為什麼切下去會越來越接近一條固定的曲線，而不是亂跑？

先看左邊。每個新點都是舊點的加權平均，權重加起來是 1。

[click] 所以新點一定落在舊點之間，不會跑到外面去。

[click] 每切一次，相鄰兩點的距離大約變成一半。

[click] 點越來越密、彼此越來越近，最後就貼在同一條曲線上。

[click] 右邊是數學上的說法，知道有這回事就好。把切一次寫成矩陣 A，切 k 次就是乘 k 次 A。

Eigenvalue 可以這樣理解：它是「每乘一次 A，某個量會被放大或縮小幾倍」。

這裡有兩個量。兩個點的相加，每次都不變，對應 eigenvalue 1。兩個點的距離，每次變一半，對應 eigenvalue 二分之一。

距離一直乘二分之一，最後變成零，只剩下不變的那個部分，所以收斂。

如果有人問細節：舉 P1 等於 0、P2 等於 8 的例子，切一次變成 2 和 6，相加還是 8，距離從 8 變成 4。
-->

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
clicks: 2
---

# 權重從哪裡來？

Chaikin 的 ¾、¼，cubic 的 ½、½ 和 ⅛、¾、⅛ 都不是湊出來的：subdivision 其實就是在 B-spline 的 <span class="key">knot vector 裡插入新的 knots</span>。先看最簡單的 order 1（折線）。

<BlossomSteps :degree="1" :step="$clicks" />

<!--
前面看到的權重，¾、¼，½、½，⅛、¾、⅛，大家可能會想：這些數字是怎麼來的？老師的投影片用 B-spline 的 knot 把它們推出來，這幾頁就是在做這件事。

先講一個名詞：knot vector。B-spline 除了 control points，還有一串數字叫 knots，用來決定每一段曲線管參數的哪一段。uniform 的意思是 knots 等間隔，例如 0、1、2、3。

這裡的 order 1 指的是一次，也就是折線。每個 control point 對應一個 knot，所以可以直接用 knot 幫它命名：P(0)、P(1)、P(2)…

[click] 重點一：只有相對值重要。把 knots 全部乘 2，變成 0、2、4、6，形狀完全不變，只是名字換成 P(0)、P(2)、P(4)。

[click] 重點二：現在 1、3、5 這些位置空出來了，把它們插回去。P(1) 在 P(0) 和 P(2) 的正中間，因為 1 在 0 和 2 的正中間。
結果是同一條折線，但點變成兩倍密。這就是 subdivision：曲線沒變，控制點變多了。

接下來 order 2、order 3 做的是同一件事，只是每個點的名字變成兩個、三個數字。
-->

---

# Blossom：用 knots 幫點命名

Order $k$ 的 B-spline，每個 control point 用 <span class="key">$k$ 個相鄰的 knots</span> 命名，例如 order 2：$P(0,2)$、$P(2,4)$、$P(4,6)$…

這個名字叫 <span class="key">blossom</span>（polar form），它有一個最重要的性質：

$$
f(u, c) = \frac{(b-c)\, f(u, a) + (c-a)\, f(u, b)}{b-a}
$$

<v-click>

**白話**：兩個點的名字只差 <b>一個數字</b>（一個是 $a$、一個是 $b$），
想要名字裡那個數字是 $c$ 的點，就在這兩點的線段上 <span class="key">照 $c$ 在 $a$、$b$ 之間的比例走</span>。

例：$P(0,2)$ 和 $P(2,4)$ 都有 2，另一個數字是 0 和 4。要找 $P(1,2)$：1 在 0 到 4 的 ¼ 處，所以

$$P(1,2) = \tfrac34 P(0,2) + \tfrac14 P(2,4)$$

</v-click>

<!--
這頁是整段推導唯一要記的規則。

order k 的 B-spline，每個 control point 會用 k 個相鄰的 knots 命名。order 2 就是兩個數字，P(0,2)、P(2,4)。

這種命名方式叫 blossom，也叫 polar form。它有一個性質，就是上面的公式。公式看起來很長，其實意思很簡單。

[click] 白話講：兩個點的名字如果只差一個數字，一個是 a、一個是 b，那名字裡那個數字換成 c 的點，就在這兩點的連線上，位置照 c 在 a 和 b 之間的比例。

舉例：P(0,2) 和 P(2,4)，兩個都有 2，不一樣的數字是 0 和 4。要找 P(1,2)，1 在 0 到 4 之間的四分之一處，所以從 P(0,2) 往 P(2,4) 走四分之一，權重就是四分之三和四分之一。

這就是 Chaikin 的 ¾、¼。下一頁畫出來。
-->

---
clicks: 3
---

# Order 2：推出 Chaikin

<BlossomSteps :degree="2" :step="$clicks" />

<!--
Order 2 就是 quadratic B-spline，每個點用兩個 knots 命名。插入新的 knots 之後，我們要找的新點是 P(1,2)、P(2,3)、P(3,4)、P(4,5)…

[click] 先找 P(1,2)。它跟 P(0,2)、P(2,4) 都共用 2。不一樣的數字從 0 走到 4，要的是 1，在四分之一處。所以 P(1,2) 是四分之三的 P(0,2) 加四分之一的 P(2,4)。圖上那條邊兩頭的 0 和 4，還有中間的 1，就是在標這件事。

[click] 再找 P(2,3)。同一條邊，這次要 3，在四分之三處，權重反過來：四分之一、四分之三。

[click] 每一條邊都這樣做，每條邊產生兩個新點，連起來，就是前面看過的 Chaikin。所以 Chaikin 的 limit curve 是 quadratic B-spline，不是巧合，是因為它本來就是 quadratic B-spline 的 knot insertion。
-->

---
clicks: 4
---

# Order 3：推出 cubic 的 ½ 和 ⅛、¾、⅛

<BlossomSteps :degree="3" :step="$clicks" />

<!--
Order 3 就是 cubic，每個點用三個 knots 命名：P(0,2,4)、P(2,4,6)…

規則一樣，只是有時候要走兩步。

[click] Edge point：要找 P(4,5,6)。它跟 P(2,4,6)、P(4,6,8) 共用 4 和 6，不一樣的數字從 2 走到 8，要的是 5，剛好在正中間，所以是二分之一、二分之一。這就是 edge point 的規則。

[click] Vertex point P(3,4,5) 沒辦法一步走到，因為它跟任何兩個舊點都差不只一個數字。所以先算兩個中間點：
P(2,3,4)：從 P(0,2,4) 到 P(2,4,6)，數字 0 走到 6，要 3，在中間，½、½。
P(3,4,6)：從 P(2,4,6) 到 P(4,6,8)，數字 2 走到 8，要 3，在六分之一處，⅚、⅙。

[click] 這兩個中間點共用 3 和 4，不一樣的數字是 2 和 6，要 5，在四分之三處，所以 P(3,4,5) 等於 ¼ P(2,3,4) 加 ¾ P(3,4,6)。
把前面兩個代進去展開：P(0,2,4) 得到 ¼ × ½ = ⅛；P(2,4,6) 得到 ¼ × ½ + ¾ × ⅚ = ¾；P(4,6,8) 得到 ¾ × ⅙ = ⅛。就是 ⅛、¾、⅛。

[click] 每個位置都這樣做，就是 cubic B-spline subdivision。結論：所有曲線的權重都可以用同一個規則推出來，就是 blossom 的那個比例。
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

<!--
把三個曲線方法放在一起比。

Chaikin：不通過 control points，平滑度 C1。

Cubic B-spline：也不通過，但是最平滑，C2。

4-point：通過 control points，平滑度 C1，而且容易有小波動。

右邊可以切換三個 scheme，用同一組 control points 直接比較。切到 4-point 的時候，曲線會穿過每個點，但是比較不順。

結論是一個取捨：要曲線通過 control points，就要犧牲一點平滑度。

這個取捨到 surface 也一樣，接下來交給我的夥伴講 surface subdivision。
-->

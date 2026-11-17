---
layout: section
---

# 7. 總結

Creases、和 B-spline 的比較、延伸

<!--
最後一段收尾，講三件事：想要銳利的邊怎麼辦、subdivision 跟 B-spline 比起來好在哪、還有一個延伸的方法。
-->

---

# Making Creases：想要銳利的邊怎麼辦？

Subdivision 會把所有東西都變圓，但真實的物體常常有 <span class="key">sharp edges</span>。

<v-clicks>

- **Hard edge**：被標記成 crease 的 edge，改用 boundary 的規則
  - 新的 edge point 直接放在 <b>中點</b>
  - 沿著 crease 的點不被兩側的 face 拉走

- **Semi-hard edge**：前幾輪用 hard edge 的規則，之後換回正常規則
  → 得到一條「有點圓的稜線」，圓的程度可以控制

- 這種可以保留部分 sharp edges 的 surface 叫 <span class="key">piecewise-smooth subdivision surface</span>
  <span class="small">（Hoppe et al., SIGGRAPH '94）</span>

</v-clicks>

<!--
Subdivision 的特性是把所有東西都變圓。立方體切下去變成球。但是真的東西常常有銳利的邊，例如桌子的邊緣、杯子的杯口。如果全部變圓就不像了。

解法是把某些邊標記成 crease，摺痕的意思，這些邊用不一樣的規則。

（按一下）第一種是 hard edge。被標記的邊，改用邊界的規則：邊上的新點直接放在中點，不被兩側的面影響；crease 上的頂點也只看 crease 上的鄰居，不會被兩側的面拉走。這樣這條邊不管切幾次都還是銳利的。

（按一下）第二種是 semi-hard edge。前幾輪用 hard edge 的規則，之後換回正常的規則。前幾輪保住了邊的形狀，後面幾輪再稍微磨圓，結果是一條有點圓的稜線。用 hard 規則的輪數越多就越銳利，所以圓的程度是可以調的。真實的物體其實很少有完全銳利的邊，所以這個很實用。

（按一下）這種大部分平滑、但是保留某些銳利邊的曲面，有個名字叫 piecewise-smooth subdivision surface，是 Hoppe 他們在 1994 年的 SIGGRAPH 提出的。
-->

---

# 先看四個名詞

| | 意思 |
|---|---|
| **Tessellate** | 把曲面切成一堆 triangles，才能畫出來 |
| **Cracking** | 兩片曲面切的密度不同，交界對不上，出現裂縫 |
| **Trimming** | 把曲面挖掉一塊 |
| **Stitching** | 把兩片曲面縫在一起 |

<!--
下一頁要拿 subdivision 和 B-spline 曲面比較，會用到四個名詞，先解釋。

Tessellate：電腦的顯示卡只會畫三角形。B-spline 曲面是用數學式子定義的，要畫出來之前，必須先把它切成一堆小三角形。這個動作叫 tessellate。

Cracking：一個模型通常是好幾片 B-spline 曲面拼起來的。如果相鄰的兩片切成三角形的時候密度不一樣，例如一片切得細、一片切得粗，交界上的頂點就對不起來，中間會出現小裂縫，可以看到後面的東西。這叫 cracking。

Trimming：把曲面挖掉一塊，例如在車門上挖一個窗戶的洞。

Stitching：把兩片曲面縫在一起，而且接縫要平滑。
-->

---

# Why Subdivision？（和 B-spline 比）

| | B-spline surface | Subdivision surface |
|---|---|---|
| 要畫出來 | 要先 tessellate，小心 cracking | <span class="key">本來就是 mesh</span> |
| 解析度 | 整張 patch 一致 | 可以只在局部加細節 |
| Topology | 需要 regular grid | <span class="key">任何 mesh 都能切</span> |
| Trimming / stitching | 困難 | 容易 |
| (u, v) 參數化 | 不能控制 | 可以控制 |
| Creases、sharp edges | 很難做 | 容易 |

<!--
B-spline 曲面也是平滑的，那為什麼還需要 subdivision？這張表一列一列比。

第一列，要畫出來。電腦只會畫三角形。B-spline 是用數學式子定義的，要畫之前得先把它切成三角形，叫 tessellate。這時候要自己決定三角形切多大，而且兩片曲面接起來的地方如果切的密度不一樣，中間會出現裂縫，叫 cracking。Subdivision 沒有這個問題，它切出來本來就是 mesh，而且一定是連在一起的，要多少多邊形就切幾次。

第二列，解析度。B-spline 的控制點是一整張格子，想在某個地方加細節，就得加一整排或一整列控制點。Subdivision 可以只在需要的地方加細節。

第三列，topology。B-spline 需要規則的四邊形格子，所以有洞、有分支、有角的形狀很難做，要用很多片拼起來。Subdivision 任何 mesh 都能切，不管形狀多複雜，切出來都是平滑的曲面。這是最大的優點。

第四列，trimming 是把曲面挖掉一塊，stitching 是把兩片縫起來。B-spline 做這兩件事都很麻煩，subdivision 只要改 mesh 就好。

第五列，uv 參數化，貼圖會用到。B-spline 天生就有 uv，但是不能控制。Subdivision 是跟著切分一起得到的，可以控制。

第六列，摺痕和銳利的邊。B-spline 很難做，subdivision 就是上一頁的方法，很容易。
-->

---

# Exact Evaluation

想知道 limit surface 上某一點的精確位置，<span class="key">不用真的切無限次</span>。

<v-clicks>

- **Regular 的地方**：Catmull-Clark 的 limit surface 就是 bicubic B-spline，直接代公式
- **Extraordinary vertex 附近**：也有方法可以直接算（Stam, 1998）
- 每一種 scheme 都有對應的 <span class="key">mask</span>：用一圈鄰居的加權平均，一步算出 limit position

</v-clicks>

<!--
補充一個常被問的問題：是不是一定要切無限次，才知道極限曲面在哪裡？不用。

（按一下）規則的地方，Catmull-Clark 的極限曲面就是雙三次 B-spline，所以直接代 B-spline 的公式就可以算出來。

（按一下）奇異點附近比較麻煩，但是 Stam 在 1998 年也提出了可以直接算的方法。

（按一下）而且每一種方法都有對應的 mask。Mask 就是一組權重，把一個點和它周圍一圈鄰居做加權平均，一步就算出這個點最後會落在極限曲面的哪裡。這些權重查書就有，不用背。
-->

---

# 四個 Scheme 總整理

| | 類型 | Mesh | 平滑度 | 關鍵數字 |
|---|---|---|---|---|
| Doo-Sabin | Dual, approx. | 任意 | $C^1$ | $\tfrac{9}{16},\ \tfrac{3}{16},\ \tfrac{3}{16},\ \tfrac{1}{16}$ |
| Catmull-Clark | Primal, approx. | 任意 → quad | $C^2$ | Edge point = 4 點平均 |
| Mod. Butterfly | Primal, interp. | Triangle | $C^1$ | $\tfrac12,\ \tfrac18,\ -\tfrac{1}{16}$ |
| Loop | Primal, approx. | Triangle | $C^2$ | $\tfrac38,\ \tfrac18$；$\tfrac{10}{16},\ \tfrac{1}{16}$ |

<div class="small mt-4">

$C^2$ 的兩個，在 extraordinary vertex 上是 $C^1$。Regular：quad 是 degree 4，triangle 是 degree 6。

</div>

<!--
結論之前，把今天講的四個曲面方法放在一張表裡。

Doo-Sabin：唯一的 dual，approximating，什麼 mesh 都可以，C1。關鍵數字是十六分之九、十六分之三、十六分之三、十六分之一，來自 Chaikin 做兩次。

Catmull-Clark：primal，approximating，什麼 mesh 都可以，切一次之後全部變四邊形，C2。要記的是 edge point 是四個點的平均，不是邊的中點。

Modified Butterfly：primal，唯一的 interpolating，給三角形用，C1。關鍵數字是二分之一、八分之一、負的十六分之一，注意有負的。

Loop：primal，approximating，給三角形用，C2。關鍵數字有兩組：邊上的新點是八分之三和八分之一，regular 的舊頂點是十六分之十和十六分之一。

下面小字：C2 的那兩個，在奇異點上只有 C1。還有 regular 的定義，四邊形是連四條邊，三角形是連六條邊。
-->

---

# Conclusion

<div class="grid grid-cols-2 gap-8">
<div>

**Subdivision surfaces**

- Modeling 變簡單：control mesh 簡單又直覺
- 最大的優點：<span class="key">arbitrary topology</span>
- Limit surface 是 smooth 的
- 只 render 到需要的 level of detail

</div>
<div>

**一句話記住每個 scheme**

| | |
|---|---|
| Chaikin | 曲線切角，1/4 與 3/4 |
| Doo-Sabin | Chaikin 的 3D 版 |
| Catmull-Clark | Quad mesh 首選 |
| Butterfly | Interpolating |
| Loop | Triangle mesh 首選 |

</div>
</div>

<div class="small mt-6">

延伸：<b>T-Splines</b> 也支援任意 topology，但和 NURBS 更相容，製造業常用。

</div>

<!--
總結。

Subdivision surface 的好處：建模變簡單，只要做一個粗的 control mesh，簡單又直覺。最大的優點是任意 topology，什麼形狀都可以。極限曲面是平滑的。可以看需求決定切幾次，遠的東西切少一點，近的切多一點，這叫 level of detail。而且只需要存 control mesh，資料很小，程式也不複雜。

右邊每個方法用一句話記。Chaikin 是曲線切角，四分之一和四分之三。Doo-Sabin 是 Chaikin 的 3D 版。Catmull-Clark 是四邊形 mesh 的首選，Pixar 在用。Butterfly 會通過控制點，但是有小波浪。Loop 是三角形 mesh 的首選。

最後一個延伸叫 T-Splines。它跟 subdivision 一樣可以處理任意 topology，但是它跟 NURBS 的關係比較近、比較相容，所以工業設計和製造業用得比較多，因為那些領域原本都是用 NURBS。

我們的報告到這裡。
-->

---
layout: center
class: text-center
---

<h1 class="cover-title">Thank you</h1>

Q & A

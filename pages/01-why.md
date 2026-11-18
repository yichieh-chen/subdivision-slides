---
layout: section
---

# 1. Why Subdivision?

粗的好做，細的好看，能不能兩個都要？

---
layout: two-cols
---

# 先認識四個名詞

- <span class="key">Polygon mesh</span><br>
  用很多小多邊形拼成的 3D 表面

- <span class="key">Coarse mesh</span><br>
  點很少的 mesh，好調但有稜有角

- <span class="key">Control mesh</span><br>
  用來「控制」形狀的 coarse mesh（虛線）

- <span class="key">Control points</span><br>
  Control mesh 上的點（紅點）

::right::

<div class="flex justify-center items-center gap-1 mt-16">
  <MeshSubdivision shape="cube" :level="0" marks :controls="false" :width="205" :height="200" :zoom="0.8" title="Coarse mesh" />
  <div class="text-3xl opacity-40">→</div>
  <MeshSubdivision shape="cube" :level="3" marks :controls="false" :width="205" :height="200" :zoom="0.8" title="切細之後" />
</div>

<div class="small mt-4 text-center">左：8 個 vertices、12 條 edges、6 個 faces（點、邊、面）。<br>右：人只給了這 8 個點，其他都是算出來的。</div>

<!--
先把名詞講清楚，後面每一頁都會用到。
3D 模型通常是用很多小多邊形拼起來的，叫 polygon mesh。點少的叫 coarse mesh。
因為我們是用它來控制最後的形狀，所以也叫 control mesh，上面的點叫 control points。
-->

---
layout: two-cols
---

# Smooth versus General

- **Polygon mesh** 很通用，什麼形狀都能表示
- 但是要做出 <span class="key">smooth</span> 的表面，需要非常多、非常準的 polygon
- 在電影和遊戲製作裡，手動調這麼密的 mesh 太花時間

<v-click>

**Subdivision 的想法：**

- 美術只要做一個 <span class="key">coarse mesh</span>
- 細節和平滑的部分交給演算法 <span class="key">自動補上</span>

</v-click>

::right::

<MeshSubdivision shape="cube" scheme="catmull-clark" :width="400" :height="300" title="把 Level 往右拉" />

<!--
先讓大家自己拉 slider：一個 cube 只有 8 個點，拉到 level 4 就變成一顆很圓的東西。
-->

---
layout: two-cols
clicks: 1
---

# 拉動 control point

要改形狀，就去拉 <span class="key">control mesh</span> 上的點：

- 平滑的 surface 會被 <span class="key">拉過去</span>
- 會不會 <b>碰到</b> 那個點，由演算法決定

<div class="small">這裡用的 Catmull-Clark 不會碰到；有些 scheme 會。</div>

<v-click>

**而且影響是 <span class="key">局部</span> 的（local control）**

- 只有被拉的點 <b>附近</b> 會變形
- 離得遠的地方完全不動
- 改鼻子，不會動到耳朵

</v-click>

::right::

<ControlPull :shape="$clicks >= 1 ? 'bar' : 'cube'" :highlight="$clicks >= 1" :pull="0.6" />

<!--
拉 slider：橘色的 control point 往外移，裡面的 surface 跟著鼓出去。
這個例子裡 surface 沒有碰到那個點，但這是 Catmull-Clark 的特性，不是所有 scheme 都這樣；等一下講 interpolating / approximating 會再回來。
按下一步換成長條：橘色是有變形的部分，藍色是完全沒動的部分。
原因後面會看到：每個新的點都只用「附近」的舊點算出來。
-->

---
layout: two-cols
clicks: 3
---

# 每一步都只做兩件事

Subdivision = 重複做下面兩個動作：

1. <span class="key">Refine（split）</span>
   插入新的 vertices 和 edges，面變多
   → 改變的是 **topology**（連接關係）

2. <span class="key">Smooth（move）</span>
   把 vertices 移到新的位置
   → 改變的是 **geometry**（位置）

<div class="small mt-4">不同的 subdivision scheme，差別只在「怎麼切」和「移到哪」。</div>

::right::

<SplitDemo :step="$clicks" />

---
clicks: 1
---

# Step 1：決定新的 sample 在哪

把小圖放大，和把粗 mesh 變細，第一步都是 <span class="key">先加入新的 sample</span>。

<SampleCompare :stage="$clicks" />

<!--
先用大家熟悉的例子：把一張小圖放大。
左邊 3×3 的小圖放大後格子變多，多出來的 pixel 還沒有顏色。
右邊的 mesh 也一樣：每條 edge 插入一個新 vertex，但它該放哪裡還沒決定。這就是上一頁的 Refine。
-->

---
clicks: 1
---

# Step 2：決定新 sample 的值

新的 sample 沒有憑空出現的資訊，只能 <span class="key">看附近舊的 sample</span> 來決定。

<SampleCompare :stage="$clicks + 1" />

<!--
左邊：新 pixel 的顏色，是旁邊舊 pixel 混出來的。看橘色框那格，是左右兩格的平均。
右邊：新 vertex 的位置，也是用附近的舊 vertices 算出來的。看比較大的橘點，它用了圈起來的那四個舊點。
這就是上一頁的 Smooth。
-->

---

# 跟 Image 放大很像

整理一下，把小圖放大和把粗 mesh 變細是同一種思路：

| | Image enlargement | Subdivision |
|---|---|---|
| **Step 1：決定新的 sample 在哪** | Mapping：新 pixel 對應到原圖哪裡 | Insert 新的 vertices 和 edges |
| **Step 2：決定新 sample 的值** | Resampling：用鄰近 pixel 內插出顏色 | 用鄰近 vertices 算出新位置 |

<v-click>

<div class="mt-6">

重點：新的值都是從 <span class="key">附近舊的值做加權平均</span> 得來的。
後面看到的每一個 scheme，都只是不同的「加權平均規則」。

</div>

</v-click>

---
layout: two-cols
---

# 加權平均

整份投影片只需要這一個數學工具。

- **中點**：$\tfrac12 A + \tfrac12 B$，兩邊各佔一半
- 比例不一樣時，誰的 <span class="key">權重</span> 大就靠近誰
- 權重加起來一定是 <span class="key">1</span>

<v-click>

後面每個 scheme 只是換一組權重：

- Chaikin：$\tfrac34,\ \tfrac14$
- Cubic B-spline：$\tfrac12,\ \tfrac12$ 和 $\tfrac18,\ \tfrac34,\ \tfrac18$
- 4-point：$-\tfrac1{16},\ \tfrac9{16},\ \tfrac9{16},\ -\tfrac1{16}$

</v-click>

::right::

<div class="mt-20">
  <WeightedAverage />
</div>

<!--
拉 slider：權重偏向哪一邊，新的點就靠近哪一邊。兩個權重永遠加起來是 1。
表格只要帶過：後面會看到這些數字，它們都只是不同的權重，而且每一組加起來都是 1。細節到 curve 那一段再講。
-->

---
layout: two-cols
clicks: 5
---

# Limit curve / limit surface

切 <span class="key">無限多次</span> 之後收斂到的平滑形狀。

- 像 0.9、0.99、0.999 … 越來越接近 1
- 每切一次，就更接近 limit curve
- 實際上切 <span class="key">3 到 5 次</span>，看起來就夠 smooth 了

<div class="small mt-4">2D 的叫 limit curve，3D 的叫 limit surface，意思一樣。</div>

::right::

<div class="mt-12">
  <CurveSubdivision scheme="cubic" :level="$clicks" :width="440" />
</div>

<!--
每按一下多切一次。虛線是 control points 連成的折線，橘色是切出來的結果。
切到第 3、4 次之後幾乎看不出變化，這就是「收斂」：它越來越接近某一條固定的曲線，那條曲線就是 limit curve。
-->

---
layout: two-cols
---

# Interpolating

原本的 control points <span class="key">不會動</span>。

- 每一輪只決定 <b>新插入的點</b> 放哪裡
- 舊的點留在原地
- Limit curve 一定 <span class="key">通過</span> control points

<div class="small mt-4">像連連看：筆一定要經過每個點。<br>拖一個點試試看，曲線永遠穿過它。</div>

::right::

<div class="mt-12">
  <CurveSubdivision scheme="fourPoint" :level="4" :width="440" />
</div>

<!--
綠色的曲線穿過每一個白色的 control point。現場拖一個點，曲線會跟著，但永遠通過它。
這裡用的是後面會講的 4-point scheme，現在先不用提名字。
-->

---
layout: two-cols
---

# Approximating

原本的 control points <span class="key">也會被移動</span>。

- 每一輪，舊的點也重新做平均
- Limit curve 只 <span class="key">靠近</span> control points
- 換來的好處：通常 <b>更平滑</b>

<div class="small mt-4">像磁鐵：線被吸過去，但不用碰到。<br>前面拉 control point 的例子就是 approximating。</div>

::right::

<div class="mt-12">
  <CurveSubdivision scheme="cubic" :level="4" :width="440" />
</div>

<!--
同樣的 control points，這次曲線沒有碰到中間那些點，只是被它們拉過去，但整條線比上一頁更順。
回扣前面拉 control point 那頁：surface 沒碰到橘色的點，就是因為 Catmull-Clark 是 approximating。
後面每介紹一個 scheme，都會說它是哪一類。
-->

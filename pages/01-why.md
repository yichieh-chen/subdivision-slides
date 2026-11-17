---
layout: section
---

# 1. Why Subdivision?

粗的好做，細的好看，能不能兩個都要？

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

# 跟 Image 放大很像

把一張小圖放大，和把一個粗 mesh 變細，其實是同一種思路：

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

# 三個之後一直會用到的名詞

<v-clicks>

- <span class="key">Limit surface / limit curve</span>
  如果一直切下去（切無限多次），最後會收斂到的那個平滑形狀。
  實際上我們切 3 到 5 次，看起來就夠 smooth 了。

- <span class="key">Interpolating</span>（stationary）
  原本的 control points <b>不會動</b>，最後的曲面會「通過」它們。

- <span class="key">Approximating</span>（non-stationary）
  原本的 control points <b>也會被移動</b>，最後的曲面只是「靠近」它們，但通常更平滑。

</v-clicks>

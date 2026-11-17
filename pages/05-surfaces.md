---
layout: section
---

# 5. Subdivision Surfaces

把曲線的想法搬到 3D

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

| Scheme | Mesh | 類型 |
|---|---|---|
| Doo-Sabin | 任意 | Dual, approximating |
| Catmull-Clark | Quad | Primal, approximating |
| Mod. Butterfly | Triangle | Primal, interpolating |
| Loop | Triangle | Primal, approximating |

</v-click>

</div>
</div>

---
layout: two-cols
---

# Doo-Sabin：3D 的 corner cutting

把 Chaikin 推廣到 surface。每一輪：

1. 找出每個 face 的中心（barycenter）
2. 每個 face 裡，往中心 <span class="key">縮出</span> 一個比較小的 face
3. 把新的點「自然地」連起來：
   - 每個舊 **face** → 一個新 face
   - 每條舊 **edge** → 一個新 quad
   - 每個舊 **vertex** → 一個新 face（角被切掉）

<div class="small mt-3">Vertex 被拆開了，所以是 dual scheme。</div>

::right::

<MeshSubdivision
  shape="cube" :shapes="['cube', 'tshape', 'ring']" scheme="doo-sabin"
  :level="1" :max-level="4" color="#f59e0b" :width="400" :height="290"
/>

---
layout: two-cols
clicks: 4
---

# Catmull-Clark：一步一步看

把 cubic B-spline 推廣到 surface。

<div :class="{ 'opacity-30': $clicks !== 1 }">

**① Face point**
每個 face 的中心

</div>
<div :class="{ 'opacity-30': $clicks !== 2 }">

**② Edge point**
edge 的兩個端點 + 兩邊的 face point，4 個點取平均

</div>
<div :class="{ 'opacity-30': $clicks !== 3 }">

**③ Move old vertices**
舊的 vertex 往鄰居的平均位置靠過去

</div>
<div :class="{ 'opacity-30': $clicks !== 4 }">

**④ Connect**
face point → edge point → vertex，連成 quads

</div>

::right::

<CatmullClarkSteps :step="$clicks" :width="400" :height="320" />

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
- Approximating，limit surface 幾乎到處 $C^2$
- 只有 extraordinary vertices（degree ≠ 4）那裡是 $C^1$

</v-click>

::right::

<MeshSubdivision
  shape="tshape" :shapes="['cube', 'tshape', 'ring', 'tetrahedron']" scheme="catmull-clark"
  :level="1" :width="400" :height="290"
/>

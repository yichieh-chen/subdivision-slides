---
layout: section
---

# 7. 總結

Creases、和 B-spline 的比較、延伸

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

---

# Why Subdivision？（和 B-spline 比）

| | B-spline surface | Subdivision surface |
|---|---|---|
| 要畫出來 | 要先 tessellate，小心 cracking | <span class="key">本來就是 mesh</span> |
| 解析度 | 整張 patch 一致 | 可以只在局部加細節 |
| Topology | 需要 regular grid | <span class="key">任何 mesh 都能切</span> |
| Trimming / stitching | 困難 | 容易 |
| Creases、sharp edges | 很難做 | 容易 |

---

# Exact Evaluation

想知道 limit surface 上某一點的精確位置，<span class="key">不用真的切無限次</span>。

<v-clicks>

- **Regular 的地方**：Catmull-Clark 的 limit surface 就是 bicubic B-spline，直接代公式
- **Extraordinary vertex 附近**：也有方法可以直接算（Stam, 1998）
- 每一種 scheme 都有對應的 <span class="key">mask</span>：用一圈鄰居的加權平均，一步算出 limit position

</v-clicks>

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

---
layout: center
class: text-center
---

<h1 class="cover-title">Thank you</h1>

Q & A

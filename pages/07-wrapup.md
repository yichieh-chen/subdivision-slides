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
| 要畫出來 | 要先 tessellate，得自己決定三角形大小、小心 cracking | <span class="key">本來就是 mesh</span>，切幾次就有幾層細節 |
| 解析度 | 整張 patch 解析度一致 | 可以只在需要的地方加細節（multi-resolution） |
| Topology | 需要 regular grid，洞和角很難做 | <span class="key">任何 mesh 都能切</span> |
| Trimming / stitching | 困難 | 容易 |
| Creases、sharp edges | 很難做 | 容易 |

<v-click>

<div class="mt-4 small">

補充 <b>Exact evaluation</b>：不用真的切無限次。Catmull-Clark 在 regular 的地方就是 bicubic B-spline，可以直接代公式算出 limit surface 上的點；extraordinary vertex 附近也有方法（Stam, 1998）。

</div>

</v-click>

---

# Conclusion

<div class="grid grid-cols-2 gap-8">
<div>

**Subdivision surfaces**

- Modeling 變簡單：control mesh 簡單又直覺
- 最大的優點：<span class="key">arbitrary topology</span>
- Limit surface 是 smooth 的
- 可以依需求只 render 到需要的 level of detail
- 表示法很精簡，程式也不複雜

</div>
<div>

**一句話記住每個 scheme**

| | |
|---|---|
| Chaikin | 曲線切角，1/4 與 3/4 |
| Doo-Sabin | Chaikin 的 3D 版 |
| Catmull-Clark | Quad mesh 首選，Pixar 在用 |
| Butterfly | Interpolating，但有 wiggles |
| Loop | Triangle mesh 首選 |

</div>
</div>

<div class="small mt-6">

延伸：<b>T-Splines</b> 和 subdivision 一樣支援任意 topology，但和 NURBS 更相容，工業設計與製造業用得比較多。（Sederberg et al., SIGGRAPH '03）

</div>

---
layout: end
---

# Thank you

Q & A

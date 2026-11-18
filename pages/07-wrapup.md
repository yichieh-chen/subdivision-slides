---
layout: section
---

# 7. 總結

Creases、和 B-spline 的比較、延伸

<!--
最後一段收尾，講三件事：想要銳利的邊怎麼辦、subdivision 跟 B-spline 比起來好在哪、還有一個延伸的方法。
-->

---
clicks: 3
---

# Making Creases：想要銳利的邊怎麼辦？

Subdivision 會把所有東西變圓。想留下 <span class="key">sharp edge</span>，就把那幾條 edge 標成 <b style="color:#dc2626">crease</b>。

<div class="flex justify-center gap-14">
<CreaseDemo :sharp="0" :level="$clicks" :width="300" :height="255" title="正常規則：紅色那圈也變圓" />
<CreaseDemo :sharp="99" :level="$clicks" :width="300" :height="255" title="Hard edge：紅色那圈留著" />
</div>

<div class="small mt-2">

<b>Hard edge 的規則</b>：crease 上的舊點 <b>不移動</b>；crease 上的新點放在 <b>中點</b>。

</div>

<!--
Subdivision 的特性是把所有東西都變圓，立方體切下去會變成一顆球。但是真的東西常常有銳利的邊，例如桌子的邊緣、杯子的杯口。如果全部變圓就不像了。

解法是把某些 edge 標記成 crease，摺痕的意思。圖上紅色的就是 crease：cube 上面那一圈，四條 edge。兩邊是同一個 cube，差別只在規則。

（按三下，每按一下切一輪）左邊用正常的規則，紅色那一圈跟著一起縮進去，變成圓的。右邊用 hard edge 的規則，紅色那一圈一直留在原地，還是一個正方形，邊緣是銳利的；下面沒有標記的部分照樣變圓。

Hard edge 的規則只有兩條，在最下面那一行。第一，crease 上的舊點不移動。第二，crease 上新加的點直接放在中點，不看兩邊的 face。

為什麼這樣就會銳利？舊的點不動，新的點又剛好在兩個舊點的正中間，所以這條 edge 不管切幾次，都還是原來那條直線。
-->

---

# Semi-hard edge：有點圓的稜線

前幾輪用 hard edge 的規則，之後<span class="key">換回正常規則</span>。

<div class="flex justify-center gap-6">
<CreaseDemo :sharp="99" :level="4" :width="250" :height="210" title="每一輪都 hard" />
<CreaseDemo :sharp="2" :level="4" :width="250" :height="210" title="前 2 輪 hard" />
<CreaseDemo :sharp="1" :level="4" :width="250" :height="210" title="前 1 輪 hard" />
</div>

<div class="small mt-2">

Hard 的輪數越多越銳利 → 圓的程度<b>可以控制</b>。<br>
能留下部分 sharp edges 的 surface：<span class="key">piecewise-smooth subdivision surface</span>（Hoppe et al., SIGGRAPH '94）

</div>

<!--
真實的物體其實很少有完全銳利的邊，桌子的邊緣摸起來也是有一點圓的。所以有第二種做法，叫 semi-hard edge。

做法是：前幾輪用上一頁的 hard edge 規則，之後換回正常的規則。前幾輪先把邊的形狀保住，後面幾輪再把它稍微磨圓。

看圖，三個都是切四輪，紅色都是同一圈 crease。左邊每一輪都用 hard 規則，邊緣是銳利的。中間只有前兩輪用 hard，後兩輪用正常規則，邊緣有一點圓。右邊只有第一輪用 hard，邊緣更圓。

所以 hard 的輪數越多，邊就越銳利。圓的程度是可以調的。

這種大部分平滑、但是留下某些銳利邊的曲面，有個名字叫 piecewise-smooth subdivision surface，是 Hoppe 他們在 1994 年的 SIGGRAPH 提出的。
-->

---
layout: two-cols
clicks: 3
---

# 任何 mesh 都能切

- 有洞、有分支，都可以
- 想挖洞、想把兩塊接起來，<span class="key">改 mesh 就好</span>
- 不管 mesh 多複雜，切完都是 smooth surface

<div class="small mt-4">

按上面的按鈕可以換形狀。

</div>

::right::

<MeshSubdivision
  shape="ring" :shapes="['ring', 'hand', 'tshape']" scheme="catmull-clark"
  :level="$clicks" :max-level="3" :width="400" :height="300"
/>

<!--
在比較之前，先看 subdivision 用來建模有多方便。

右邊是一個中間有洞的形狀，用方塊拼出來的，很粗糙。（按三下，每按一下切一輪）切三輪之後變成一個平滑的環。我們完全沒有特別處理那個洞，規則跟切 cube 的時候一模一樣。

上面的按鈕可以換形狀。Hand 是一隻手，有五根手指，是有分支的形狀；T-shape 是 T 字形。切下去一樣都是平滑的。

所以用 subdivision 建模很自由：想挖一個洞，就把 mesh 上的幾個 face 拿掉；想把兩塊東西接起來，就把它們的 mesh 連起來。不管 mesh 多複雜，切下去一定會得到平滑的曲面。
-->

---

# 先看四個名詞

<div class="grid grid-cols-2 gap-x-6 gap-y-12 mt-10">
<div class="flex items-center gap-4">
<svg viewBox="0 0 232 112" width="250" style="flex: none">
<polygon points="6.0,92.0 11.2,90.4 16.5,88.8 21.8,87.4 27.0,86.2 32.2,85.1 37.5,84.4 42.8,83.9 48.0,83.8 53.2,83.9 58.5,84.4 63.8,85.1 69.0,86.2 74.2,87.4 79.5,88.8 84.8,90.4 90.0,92.0 90.9,88.8 91.8,85.5 92.6,82.2 93.5,79.0 94.4,75.8 95.2,72.5 96.1,69.2 97.0,66.0 97.9,62.8 98.8,59.5 99.6,56.2 100.5,53.0 101.4,49.8 102.2,46.5 103.1,43.2 104.0,40.0 98.8,37.1 93.5,34.3 88.2,31.7 83.0,29.4 77.8,27.5 72.5,26.1 67.2,25.3 62.0,25.0 56.8,25.3 51.5,26.1 46.2,27.5 41.0,29.4 35.8,31.7 30.5,34.3 25.2,37.1 20.0,40.0 19.1,43.2 18.2,46.5 17.4,49.8 16.5,53.0 15.6,56.2 14.8,59.5 13.9,62.8 13.0,66.0 12.1,69.2 11.2,72.5 10.4,75.8 9.5,79.0 8.6,82.2 7.8,85.5 6.9,88.8" fill="#2563eb2e" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" />
<polyline points="104,60 122.4,60.0" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" /><polygon points="128,60 120.8,63.5 120.8,56.5" fill="#64748b" />
<polygon points="130.0,92.0 158.0,84.9 165.0,55.9" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130.0,92.0 165.0,55.9 137.0,66.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="137.0,66.0 165.0,55.9 172.0,27.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="137.0,66.0 172.0,27.0 144.0,40.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="158.0,84.9 186.0,84.9 193.0,55.9" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="158.0,84.9 193.0,55.9 165.0,55.9" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="165.0,55.9 193.0,55.9 200.0,27.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="165.0,55.9 200.0,27.0 172.0,27.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="186.0,84.9 214.0,92.0 221.0,66.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="186.0,84.9 221.0,66.0 193.0,55.9" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="193.0,55.9 221.0,66.0 228.0,40.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="193.0,55.9 228.0,40.0 200.0,27.0" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<text x="52" y="106" fill="#64748b" text-anchor="middle" style="font-size: 13px; font-weight: 600">曲面</text>
<text x="178" y="106" fill="#64748b" text-anchor="middle" style="font-size: 13px; font-weight: 600">triangles</text>
</svg>
<div><b>Tessellate</b><br><span style="font-size: 1.1rem">把曲面切成 triangles，才能畫出來</span></div>
</div>
<div class="flex items-center gap-4">
<svg viewBox="0 0 232 112" width="250" style="flex: none">
<polygon points="22,12 116,12 116,92" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="22,12 116,92 22,92" fill="#2563eb2e" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="116.0,12.0 212,12.0 212,32.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="116.0,12.0 212,32.0 128.0,32.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="128.0,32.0 212,32.0 212,52.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="128.0,32.0 212,52.0 133.0,52.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="133.0,52.0 212,52.0 212,72.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="133.0,52.0 212,72.0 128.0,72.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="128.0,72.0 212,72.0 212,92.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="128.0,72.0 212,92.0 116.0,92.0" fill="#16a34a2e" stroke="#16a34a" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="116.0,12.0 128.0,32.0 133.0,52.0 128.0,72.0 116.0,92.0" fill="#dc2626" stroke="#dc2626" stroke-width="1" stroke-linejoin="round" />
<circle cx="116" cy="12" r="3.5" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
<circle cx="116" cy="92" r="3.5" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
<circle cx="128.0" cy="32.0" r="3.5" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
<circle cx="133.0" cy="52.0" r="3.5" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
<circle cx="128.0" cy="72.0" r="3.5" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
<text x="66" y="108" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">切得粗</text>
<text x="170" y="108" fill="#16a34a" text-anchor="middle" style="font-size: 13px; font-weight: 600">切得細</text>
</svg>
<div><b>Cracking</b><br><span style="font-size: 1.1rem">兩片切的密度不同，交界出現<b style="color:#dc2626">裂縫</b></span></div>
</div>
<div class="flex items-center gap-4">
<svg viewBox="0 0 232 112" width="250" style="flex: none">
<path d="M20.0 100.0 L29.4 98.3 L38.8 96.6 L48.1 95.1 L57.5 93.8 L66.9 92.7 L76.2 91.9 L85.6 91.4 L95.0 91.2 L104.4 91.4 L113.8 91.9 L123.1 92.7 L132.5 93.8 L141.9 95.1 L151.2 96.6 L160.6 98.3 L170.0 100.0 L171.4 96.5 L172.8 93.0 L174.1 89.5 L175.5 86.0 L176.9 82.5 L178.2 79.0 L179.6 75.5 L181.0 72.0 L182.4 68.5 L183.8 65.0 L185.1 61.5 L186.5 58.0 L187.9 54.5 L189.2 51.0 L190.6 47.5 L192.0 44.0 L182.6 40.9 L173.2 37.9 L163.9 35.1 L154.5 32.7 L145.1 30.7 L135.8 29.2 L126.4 28.3 L117.0 28.0 L107.6 28.3 L98.2 29.2 L88.9 30.7 L79.5 32.7 L70.1 35.1 L60.8 37.9 L51.4 40.9 L42.0 44.0 L40.6 47.5 L39.2 51.0 L37.9 54.5 L36.5 58.0 L35.1 61.5 L33.8 65.0 L32.4 68.5 L31.0 72.0 L29.6 75.5 L28.2 79.0 L26.9 82.5 L25.5 86.0 L24.1 89.5 L22.8 93.0 L21.4 96.5 Z M130.0 54.0 L129.3 57.3 L127.4 60.5 L124.3 63.4 L120.2 65.7 L115.3 67.5 L109.8 68.6 L104.0 69.0 L98.2 68.6 L92.7 67.5 L87.8 65.7 L83.7 63.4 L80.6 60.5 L78.7 57.3 L78.0 54.0 L78.7 50.7 L80.6 47.5 L83.7 44.6 L87.8 42.3 L92.7 40.5 L98.2 39.4 L104.0 39.0 L109.8 39.4 L115.3 40.5 L120.2 42.3 L124.3 44.6 L127.4 47.5 L129.3 50.7 Z" fill="#2563eb2e" stroke="#2563eb" stroke-width="2" fill-rule="evenodd" stroke-linejoin="round" />
<ellipse cx="104" cy="54" rx="26" ry="15" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3" />
<text x="104" y="59" fill="#dc2626" text-anchor="middle" style="font-size: 14px; font-weight: 600">洞</text>
</svg>
<div><b>Trimming</b><br><span style="font-size: 1.1rem">把曲面挖掉一塊</span></div>
</div>
<div class="flex items-center gap-4">
<svg viewBox="0 0 232 112" width="250" style="flex: none">
<polygon points="20,22 116.0,14.0 120.5,20.8 123.8,27.7 125.0,34.5 123.8,41.3 120.5,48.2 116.0,55.0 111.5,61.8 108.2,68.7 107.0,75.5 108.2,82.3 111.5,89.2 116.0,96.0 28,92" fill="#2563eb2e" stroke="#2563eb" stroke-width="2" stroke-linejoin="round" />
<polygon points="206,18 116.0,14.0 120.5,20.8 123.8,27.7 125.0,34.5 123.8,41.3 120.5,48.2 116.0,55.0 111.5,61.8 108.2,68.7 107.0,75.5 108.2,82.3 111.5,89.2 116.0,96.0 212,88" fill="#16a34a2e" stroke="#16a34a" stroke-width="2" stroke-linejoin="round" />
<polyline points="113.5,18.8 127.5,22.8" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="116.8,25.7 130.8,29.7" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="118.0,32.5 132.0,36.5" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="116.8,39.3 130.8,43.3" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="113.5,46.2 127.5,50.2" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="109.0,53.0 123.0,57.0" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="104.5,59.8 118.5,63.8" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="101.2,66.7 115.2,70.7" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="100.0,73.5 114.0,77.5" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="101.2,80.3 115.2,84.3" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="104.5,87.2 118.5,91.2" fill="none" stroke="#334155" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
<text x="66" y="60" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">第 1 片</text>
<text x="166" y="60" fill="#16a34a" text-anchor="middle" style="font-size: 13px; font-weight: 600">第 2 片</text>
</svg>
<div><b>Stitching</b><br><span style="font-size: 1.1rem">把兩片曲面縫在一起</span></div>
</div>
</div>

<!--
下一頁要拿 subdivision 和 B-spline 曲面比較，會用到四個名詞，先一個一個看圖。

左上，tessellate。電腦的顯示卡只會畫三角形。B-spline 曲面是用數學式子定義的，像左邊那片平滑的曲面，要畫出來之前，必須先把它切成一堆小三角形，像右邊那樣。這個動作叫 tessellate。

右上，cracking。一個模型通常是好幾片曲面拼起來的。圖上藍色那片切得粗，交界上只有上下兩個點，所以它的邊是一條直線。綠色那片切得細，交界上有五個點，所以它的邊是彎的。兩片的邊對不起來，中間紅色的地方就是裂縫，會看到後面的東西。這叫 cracking。

左下，trimming。把曲面挖掉一塊，例如在車門上挖一個窗戶的洞。

右下，stitching。把兩片曲面縫在一起，而且接縫要平滑。
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
layout: two-cols
---

# Exact Evaluation

想知道某個點<span class="key">最後停在哪</span>，不用真的切無限次。

<v-clicks>

- **Mask**：一組權重。把這個點和一圈鄰居加權平均，一步算出來
- Catmull-Clark 的 regular 處就是 <b>bicubic B-spline</b>，直接代公式
- Extraordinary vertex 附近也能直接算（Stam, 1998）

</v-clicks>

::right::

<div class="mt-10">

<svg viewBox="0 0 400 312" width="400" style="flex: none">
<polyline points="8,250 40,244 80,200 200,30 320,200 360,244 392,250" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
<polyline points="24.0,247.0 41.0,239.2 60.0,222.0 90.0,184.2 140.0,115.0 200.0,72.5 260.0,115.0 310.0,184.2 340.0,222.0 359.0,239.2 376.0,247.0" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="5 4" />
<polyline points="32.5,243.1 41.2,238.1 50.5,230.6 61.4,219.4 75.0,203.1 92.5,180.3 115.0,149.6 141.2,118.3 170.0,93.8 200.0,83.1 230.0,93.8 258.8,118.3 285.0,149.6 307.5,180.3 325.0,203.1 338.6,219.4 349.5,230.6 358.8,238.1 367.5,243.1" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="2 3" />
<polyline points="41.3,237.7 43.1,236.4 45.0,235.0 46.9,233.4 48.8,231.8 50.8,230.0 52.8,228.1 54.9,226.0 57.1,223.7 59.4,221.2 61.8,218.6 64.3,215.7 67.0,212.7 69.7,209.4 72.6,205.8 75.6,202.0 78.8,198.0 82.2,193.7 85.7,189.1 89.4,184.2 93.3,179.0 93.3,179.0 97.4,173.5 101.7,167.7 106.2,161.8 110.8,155.7 115.6,149.5 120.6,143.3 125.7,137.2 130.9,131.1 136.2,125.2 141.7,119.5 147.2,114.0 152.9,108.9 158.6,104.2 164.4,99.9 170.2,96.1 176.1,92.8 182.0,90.2 188.0,88.3 194.0,87.1 200.0,86.7 200.0,86.7 206.0,87.1 212.0,88.3 218.0,90.2 223.9,92.8 229.8,96.1 235.6,99.9 241.4,104.2 247.1,108.9 252.8,114.0 258.3,119.5 263.8,125.2 269.1,131.1 274.3,137.2 279.4,143.3 284.4,149.5 289.2,155.7 293.8,161.8 298.3,167.7 302.6,173.5 306.7,179.0 306.7,179.0 310.6,184.2 314.3,189.1 317.8,193.7 321.2,198.0 324.4,202.0 327.4,205.8 330.3,209.4 333.0,212.7 335.7,215.7 338.2,218.6 340.6,221.2 342.9,223.7 345.1,226.0 347.2,228.1 349.2,230.0 351.2,231.8 353.1,233.4 355.0,235.0 356.9,236.4 358.7,237.7" fill="none" stroke="#2563eb" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" />
<circle cx="8" cy="250" r="5" fill="#94a3b8" stroke="#fff" stroke-width="1.5" />
<circle cx="40" cy="244" r="5" fill="#94a3b8" stroke="#fff" stroke-width="1.5" />
<circle cx="360" cy="244" r="5" fill="#94a3b8" stroke="#fff" stroke-width="1.5" />
<circle cx="392" cy="250" r="5" fill="#94a3b8" stroke="#fff" stroke-width="1.5" />
<circle cx="80" cy="200" r="7" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
<circle cx="320" cy="200" r="7" fill="#16a34a" stroke="#fff" stroke-width="1.5" />
<circle cx="200" cy="30" r="8" fill="#dc2626" stroke="#fff" stroke-width="1.5" />
<polyline points="200,40 200.0,72.4" fill="none" stroke="#dc2626" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" /><polygon points="200.0,78.7 196.1,70.6 203.9,70.6" fill="#dc2626" />
<circle cx="200.0" cy="86.7" r="7" fill="#2563eb" stroke="#fff" stroke-width="1.5" />
<text x="200" y="16" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">4/6</text>
<text x="66" y="204" fill="#16a34a" text-anchor="end" style="font-size: 17px; font-weight: 600">1/6</text>
<text x="334" y="204" fill="#16a34a" text-anchor="start" style="font-size: 17px; font-weight: 600">1/6</text>
<polyline points="148,72.7 190.0,84.7" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
<text x="144" y="74.7" fill="#2563eb" text-anchor="end" style="font-size: 16px; font-weight: 600">最後停在這裡</text>
<text x="244" y="60.3" fill="#dc2626" text-anchor="start" style="font-size: 15px; font-weight: 600">一步算出來</text>
<text x="200" y="282" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 600">灰色：control points　虛線：切 1 次、2 次</text>
<text x="200" y="304" fill="#2563eb" text-anchor="middle" style="font-size: 14px; font-weight: 600">藍色：切無限次</text>
</svg>

</div>

<div class="small text-center">

例：cubic B-spline 曲線的 mask 是 1/6、4/6、1/6

</div>

<!--
補充一個常被問的問題：limit surface 是切無限次的結果，那是不是一定要切無限次，才知道某個點最後在哪裡？不用。

先看右邊的圖，這是曲線的例子，比較好懂。灰色實線是 control points 連起來的折線。虛線是切一次和切兩次的結果，越切越接近藍色那條線。藍色是切無限次之後的曲線。

現在只問一件事：最上面那個紅色的 control point，最後會停在藍線上的哪裡？答案是直接算：紅點自己乘六分之四，左右兩個綠色的鄰居各乘六分之一，加起來就是藍點的位置。中間那些虛線全部可以跳過。

（按一下）這組權重就叫 mask。Mask 就是一組權重，把一個點和它周圍一圈鄰居做加權平均，一步就算出這個點最後的位置。每一種 scheme 都有自己的 mask，這些數字查書就有，不用背。圖上這組六分之一、六分之四、六分之一，是 cubic B-spline 曲線的 mask。

（按一下）曲面也一樣。Catmull-Clark 在 regular 的地方，limit surface 就是 bicubic B-spline，所以直接代 B-spline 的公式就可以算出來。

（按一下）Extraordinary vertex 附近比較麻煩，但是 Stam 在 1998 年也提出了可以直接算的方法。
-->

---
clicks: 3
---

# 同一個 Cube，四種切法

<div class="flex justify-center gap-2 mt-2">
<div class="text-center">
<MeshSubdivision shape="cube" scheme="doo-sabin" :level="$clicks" :max-level="3" marks color="#f59e0b" :controls="false" :width="205" :height="200" title="Doo-Sabin" />
<div class="small">角被切掉</div>
</div>
<div class="text-center">
<MeshSubdivision shape="cube" scheme="catmull-clark" :level="$clicks" :max-level="3" marks color="#5b8def" :controls="false" :width="205" :height="200" title="Catmull-Clark" />
<div class="small">全部變成 quad</div>
</div>
<div class="text-center">
<MeshSubdivision shape="cube" scheme="butterfly" :level="$clicks" :max-level="3" marks color="#34d399" :controls="false" :width="205" :height="200" title="Butterfly" />
<div class="small">紅點留在表面上</div>
</div>
<div class="text-center">
<MeshSubdivision shape="cube" scheme="loop" :level="$clicks" :max-level="3" marks color="#a78bfa" :controls="false" :width="205" :height="200" title="Loop" />
<div class="small">紅點留在外面</div>
</div>
</div>

<div class="small mt-4 text-center">

<b style="color:#ef4444">紅點</b>是原本的 8 個 control points。只有 Butterfly 會通過它們（interpolating）。

</div>

<!--
總整理之前，把四個方法放在一起看。四個都是從同一個 cube 開始，紅點是 cube 原本的八個頂點。

（按三下，每按一下四個一起切一輪）

第一個 Doo-Sabin。它是 dual，每個頂點會變成一個小的 face，所以看起來是把角切掉。紅點留在外面。

第二個 Catmull-Clark。切完全部都是四邊形，形狀最圓滑。紅點也留在外面。

第三個 Butterfly。它只能切三角形，所以 cube 的每個面先被切成兩個三角形。它是 interpolating，紅點一直留在表面上。表面比較凹凸不平。

第四個 Loop。也是先切成三角形。它是 approximating，表面往內縮，紅點留在外面，表面比 Butterfly 平滑。

所以四個裡面，只有 Butterfly 會通過原本的 control points。
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

---
layout: section
---

# 6. Triangle Schemes

Modified Butterfly 與 Loop

<!--
剛剛的 Catmull-Clark 最適合四邊形。但是很多 mesh 是三角形的，例如掃描出來的模型、遊戲裡的模型。

這一段講兩個專門給三角形 mesh 用的方法：Modified Butterfly 和 Loop。一個是 interpolating，一個是 approximating，剛好可以對比。

開始之前先花四頁講三件事：三角形 mesh 的 regular 是什麼、三角形怎麼切、切完之後奇異點會不會變多。
-->

---

# 為什麼 Triangle Mesh 的 regular 是 6？

<span class="key">Regular</span> = 整齊鋪滿的時候，每個 vertex 的樣子。看一圈 360° 要幾個 face 才圍得滿：

<div class="grid grid-cols-2 gap-8 mt-2">
<div>

<svg viewBox="20 8 200 212" width="290" class="mx-auto">
<rect x="78" y="58" width="84" height="84" fill="#16a34a22" />
<line x1="36" y1="16" x2="36" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="36" y1="16" x2="204" y2="16" stroke="#94a3b8" stroke-width="1" />
<line x1="78" y1="16" x2="78" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="36" y1="58" x2="204" y2="58" stroke="#94a3b8" stroke-width="1" />
<line x1="120" y1="16" x2="120" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="36" y1="100" x2="204" y2="100" stroke="#94a3b8" stroke-width="1" />
<line x1="162" y1="16" x2="162" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="36" y1="142" x2="204" y2="142" stroke="#94a3b8" stroke-width="1" />
<line x1="204" y1="16" x2="204" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="36" y1="184" x2="204" y2="184" stroke="#94a3b8" stroke-width="1" />
<line x1="120" y1="100" x2="162.0" y2="100.0" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="120.0" y2="58.0" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="78.0" y2="100.0" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="120.0" y2="142.0" stroke="#16a34a" stroke-width="4" />
<text x="136.3" y="87.7" fill="#64748b" text-anchor="middle" style="font-size: 12px; font-weight: 500">90°</text>
<text x="103.7" y="87.7" fill="#64748b" text-anchor="middle" style="font-size: 12px; font-weight: 500">90°</text>
<text x="103.7" y="120.3" fill="#64748b" text-anchor="middle" style="font-size: 12px; font-weight: 500">90°</text>
<text x="136.3" y="120.3" fill="#64748b" text-anchor="middle" style="font-size: 12px; font-weight: 500">90°</text>
<circle cx="120" cy="100" r="8" fill="#16a34a" stroke="#fff" stroke-width="2" />
<text x="120" y="212" fill="#16a34a" text-anchor="middle" style="font-size: 15px; font-weight: 600">4 個圍一圈 → degree 4</text>
</svg>

<div class="small text-center">正方形的角是 90°：360 ÷ 90 = 4</div>
</div>
<div>

<svg viewBox="20 8 200 212" width="290" class="mx-auto">
<polygon points="166.0,100.0 143.0,60.2 97.0,60.2 74.0,100.0 97.0,139.8 143.0,139.8" fill="#16a34a22" stroke="none" stroke-width="0" />
<line x1="28.0" y1="20.3" x2="74.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="20.3" x2="51.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="20.3" x2="120.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="20.3" x2="97.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="20.3" x2="166.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="20.3" x2="143.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="20.3" x2="212.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="20.3" x2="189.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="60.2" x2="74.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="60.2" x2="97.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="60.2" x2="74.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="60.2" x2="120.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="60.2" x2="143.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="60.2" x2="120.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="60.2" x2="166.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="60.2" x2="189.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="60.2" x2="166.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="189.0" y1="60.2" x2="212.0" y2="20.3" stroke="#94a3b8" stroke-width="1" />
<line x1="189.0" y1="60.2" x2="212.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="100.0" x2="51.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="100.0" x2="74.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="100.0" x2="51.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="100.0" x2="97.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="100.0" x2="120.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="100.0" x2="97.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="100.0" x2="143.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="100.0" x2="166.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="100.0" x2="143.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="100.0" x2="189.0" y2="60.2" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="100.0" x2="212.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="100.0" x2="189.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="139.8" x2="74.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="139.8" x2="97.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="51.0" y1="139.8" x2="74.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="139.8" x2="120.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="139.8" x2="143.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="97.0" y1="139.8" x2="120.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="139.8" x2="166.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="139.8" x2="189.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="143.0" y1="139.8" x2="166.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="189.0" y1="139.8" x2="212.0" y2="100.0" stroke="#94a3b8" stroke-width="1" />
<line x1="189.0" y1="139.8" x2="212.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="179.7" x2="51.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="28.0" y1="179.7" x2="74.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="179.7" x2="97.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="74.0" y1="179.7" x2="120.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="179.7" x2="143.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="120.0" y1="179.7" x2="166.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="179.7" x2="189.0" y2="139.8" stroke="#94a3b8" stroke-width="1" />
<line x1="166.0" y1="179.7" x2="212.0" y2="179.7" stroke="#94a3b8" stroke-width="1" />
<line x1="120" y1="100" x2="166.0" y2="100.0" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="143.0" y2="60.2" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="97.0" y2="60.2" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="74.0" y2="100.0" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="97.0" y2="139.8" stroke="#16a34a" stroke-width="4" />
<line x1="120" y1="100" x2="143.0" y2="139.8" stroke="#16a34a" stroke-width="4" />
<text x="141.7" y="91.5" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<text x="120.0" y="79.0" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<text x="98.3" y="91.5" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<text x="98.3" y="116.5" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<text x="120.0" y="129.0" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<text x="141.7" y="116.5" fill="#64748b" text-anchor="middle" style="font-size: 11px; font-weight: 500">60°</text>
<circle cx="120" cy="100" r="8" fill="#16a34a" stroke="#fff" stroke-width="2" />
<text x="120" y="212" fill="#16a34a" text-anchor="middle" style="font-size: 15px; font-weight: 600">6 個圍一圈 → degree 6</text>
</svg>

<div class="small text-center">正三角形的角是 60°：360 ÷ 60 = 6</div>
</div>
</div>

<div class="small mt-2">

概念和前面一樣，只是數字不同：quad 的 regular 是 4，triangle 的 regular 是 <span class="key">6</span>。不是這個數字的就是 extraordinary。

</div>

<!--
前面講四邊形的時候說，連四條邊的頂點是 regular，不是四條的是 extraordinary。到了三角形，這個數字變成六。為什麼會變？這頁先講清楚。

Regular 的意思是：如果 mesh 排得最整齊，像磁磚一樣鋪滿，每個頂點會長什麼樣子。

看左邊，用正方形鋪。中間綠色的點，周圍要圍滿一圈三百六十度。正方形的一個角是九十度，三百六十除以九十是四，所以剛好四個正方形圍一圈。四個正方形就有四條邊從這個點出去，所以 degree 是四。

看右邊，用正三角形鋪。正三角形的一個角是六十度，三百六十除以六十是六，所以要六個三角形才圍得滿一圈。六個三角形就有六條邊從這個點出去，所以 degree 是六。

所以 regular 和 extraordinary 的概念跟前面完全一樣：regular 就是「整齊鋪滿時的樣子」，extraordinary 就是「不是那個樣子」。只是用四邊形鋪的時候那個數字是四，用三角形鋪的時候是六。

接下來講的 Butterfly 和 Loop 都是給三角形 mesh 用的，所以這一段裡，regular 是 degree 六，不是六的就是奇異點。
-->

---
layout: two-cols
---

# 切法：1 個變 4 個

1. 每條 edge 的中間加一個新點
2. 把 3 個新點連起來

Butterfly 和 Loop <span class="key">切法一樣</span>，差別只在點放哪：

| | 新的點 | 舊的點 |
|---|---|---|
| Butterfly | 用周圍的點算 | <b>不動</b> |
| Loop | 用周圍的點算 | <b>會移動</b> |

::right::

<svg viewBox="0 20 420 180" width="100%" class="mx-auto">
<polygon points="20,165 170,165 95,35" fill="#94a3b81a" stroke="#64748b" stroke-width="2" />
<polygon points="250,165 400,165 325,35" fill="#94a3b81a" stroke="#64748b" stroke-width="2" />
<line x1="325.0" y1="165.0" x2="362.5" y2="100.0" stroke="#2563eb" stroke-width="3" />
<line x1="362.5" y1="100.0" x2="287.5" y2="100.0" stroke="#2563eb" stroke-width="3" />
<line x1="287.5" y1="100.0" x2="325.0" y2="165.0" stroke="#2563eb" stroke-width="3" />
<circle cx="20" cy="165" r="6" fill="#64748b" />
<circle cx="170" cy="165" r="6" fill="#64748b" />
<circle cx="95" cy="35" r="6" fill="#64748b" />
<circle cx="250" cy="165" r="6" fill="#64748b" />
<circle cx="400" cy="165" r="6" fill="#64748b" />
<circle cx="325" cy="35" r="6" fill="#64748b" />
<circle cx="325.0" cy="165.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="362.5" cy="100.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="287.5" cy="100.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<line x1="190" y1="100" x2="228" y2="100" stroke="#64748b" stroke-width="3" />
<polygon points="238,100 226,93 226,107" fill="#64748b" />
<text x="95" y="190" fill="currentColor" text-anchor="middle" style="font-size: 15px; font-weight: 600">1 個 triangle</text>
<text x="325" y="190" fill="currentColor" text-anchor="middle" style="font-size: 15px; font-weight: 600">4 個 triangles</text>
</svg>

<div class="small text-center mt-4">藍點是新的點。這是 topological rule（怎麼連）；<br>點放哪裡是 geometric rule，後面再講。</div>

<!--
再來看三角形怎麼切。這一段的兩個方法，Butterfly 和 Loop，切法是一樣的。

看右圖。左邊是一個三角形。第一步，在每條邊的中間加一個新的點，就是藍色的三個點。第二步，把這三個藍點連起來。原本的一個三角形就變成四個小三角形：三個角各一個，中間一個倒過來的。

這是「怎麼連」的規則，也就是 topological rule。Butterfly 和 Loop 在這裡完全一樣。

它們不一樣的地方是「點放在哪裡」，也就是 geometric rule。看左邊的表：新的點，兩個方法都是用周圍的點加權平均算出來的，只是用的權重不同。舊的點，Butterfly 不動，所以曲面會通過原本的點；Loop 會移動，所以曲面不通過原本的點。

權重是多少，後面每個方法各自講。
-->

---
layout: two-cols
---

# 為什麼新的點都是 regular？

Edge 上的新點 <b style="color:#f97316">●</b> 會連到 <span class="key">6</span> 個點：

- 這條 edge 的兩個端點：2 條
- 兩邊的 triangle 裡，另外兩條 edge 上的新點：2 × 2 = 4 條

<div class="small mt-4">

加起來 6 條，所以新的點 degree 一定是 6 → 一定是 regular。

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
切完之後，新加的那些點是 regular 還是 extraordinary？這頁數給大家看。

右邊的圖是兩個三角形，共用中間那條橫的邊。藍色是舊的頂點。每條邊的中間都加一個新點：橘色是中間這條邊上的新點，綠色是另外四條邊上的新點。

現在數橘色的點連了幾條線。

往左、往右各一條，連到這條邊原本的兩個端點，圖上的 1 和 2。這是因為原本的邊被新點切成兩半。

上面那個三角形被切成四個小三角形，所以橘色的點會連到上面三角形另外兩條邊上的新點，圖上的 3 和 4。

下面那個三角形也一樣，連到 5 和 6。

總共六條。不管 mesh 長什麼樣子，只要一條邊是被兩個三角形共用，結果都是六。所以新的點一定是 regular。

那舊的點呢？下一頁。
-->

---

# 所以 extraordinary vertex 不會變多

<div class="grid grid-cols-3 gap-6 items-center">
<div>

<svg viewBox="0 5 220 215" width="100%" class="mx-auto">
<polygon points="110,100 110.0,18.0 32.0,74.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 32.0,74.7 61.8,166.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 61.8,166.3 158.2,166.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 158.2,166.3 188.0,74.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 188.0,74.7 110.0,18.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<line x1="110" y1="100" x2="110.0" y2="18.0" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="32.0" y2="74.7" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="61.8" y2="166.3" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="158.2" y2="166.3" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="188.0" y2="74.7" stroke="#dc2626" stroke-width="4" />
<circle cx="110.0" cy="18.0" r="6" fill="#64748b" />
<circle cx="32.0" cy="74.7" r="6" fill="#64748b" />
<circle cx="61.8" cy="166.3" r="6" fill="#64748b" />
<circle cx="158.2" cy="166.3" r="6" fill="#64748b" />
<circle cx="188.0" cy="74.7" r="6" fill="#64748b" />
<circle cx="110" cy="100" r="9" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="110" y="212" fill="#dc2626" text-anchor="middle" style="font-size: 15px; font-weight: 600">切之前：連 5 條</text>
</svg>

</div>
<div>

<svg viewBox="0 5 220 215" width="100%" class="mx-auto">
<polygon points="110,100 110.0,18.0 32.0,74.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 32.0,74.7 61.8,166.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 61.8,166.3 158.2,166.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 158.2,166.3 188.0,74.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,100 188.0,74.7 110.0,18.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<line x1="110.0" y1="59.0" x2="71.0" y2="87.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="110.0" y1="59.0" x2="71.0" y2="46.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="71.0" y1="87.3" x2="71.0" y2="46.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="71.0" y1="87.3" x2="85.9" y2="133.2" stroke="#94a3b8" stroke-width="1.5" />
<line x1="71.0" y1="87.3" x2="46.9" y2="120.5" stroke="#94a3b8" stroke-width="1.5" />
<line x1="85.9" y1="133.2" x2="46.9" y2="120.5" stroke="#94a3b8" stroke-width="1.5" />
<line x1="85.9" y1="133.2" x2="134.1" y2="133.2" stroke="#94a3b8" stroke-width="1.5" />
<line x1="85.9" y1="133.2" x2="110.0" y2="166.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="134.1" y1="133.2" x2="110.0" y2="166.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="134.1" y1="133.2" x2="149.0" y2="87.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="134.1" y1="133.2" x2="173.1" y2="120.5" stroke="#94a3b8" stroke-width="1.5" />
<line x1="149.0" y1="87.3" x2="173.1" y2="120.5" stroke="#94a3b8" stroke-width="1.5" />
<line x1="149.0" y1="87.3" x2="110.0" y2="59.0" stroke="#94a3b8" stroke-width="1.5" />
<line x1="149.0" y1="87.3" x2="149.0" y2="46.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="110.0" y1="59.0" x2="149.0" y2="46.3" stroke="#94a3b8" stroke-width="1.5" />
<line x1="110.0" y1="59.0" x2="110" y2="100" stroke="#16a34a" stroke-width="3.5" />
<line x1="110.0" y1="59.0" x2="110.0" y2="18.0" stroke="#16a34a" stroke-width="3.5" />
<line x1="110.0" y1="59.0" x2="71.0" y2="87.3" stroke="#16a34a" stroke-width="3.5" />
<line x1="110.0" y1="59.0" x2="149.0" y2="87.3" stroke="#16a34a" stroke-width="3.5" />
<line x1="110.0" y1="59.0" x2="71.0" y2="46.3" stroke="#16a34a" stroke-width="3.5" />
<line x1="110.0" y1="59.0" x2="149.0" y2="46.3" stroke="#16a34a" stroke-width="3.5" />
<line x1="110" y1="100" x2="71.0" y2="87.3" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="85.9" y2="133.2" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="134.1" y2="133.2" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="149.0" y2="87.3" stroke="#dc2626" stroke-width="4" />
<line x1="110" y1="100" x2="110.0" y2="59.0" stroke="#dc2626" stroke-width="6" />
<line x1="110" y1="100" x2="110.0" y2="59.0" stroke="#16a34a" stroke-width="2.5" />
<circle cx="110.0" cy="18.0" r="6" fill="#64748b" />
<circle cx="32.0" cy="74.7" r="6" fill="#64748b" />
<circle cx="61.8" cy="166.3" r="6" fill="#64748b" />
<circle cx="158.2" cy="166.3" r="6" fill="#64748b" />
<circle cx="188.0" cy="74.7" r="6" fill="#64748b" />
<circle cx="71.0" cy="46.3" r="5" fill="#94a3b8" />
<circle cx="46.9" cy="120.5" r="5" fill="#94a3b8" />
<circle cx="110.0" cy="166.3" r="5" fill="#94a3b8" />
<circle cx="173.1" cy="120.5" r="5" fill="#94a3b8" />
<circle cx="149.0" cy="46.3" r="5" fill="#94a3b8" />
<circle cx="71.0" cy="87.3" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="85.9" cy="133.2" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="134.1" cy="133.2" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="149.0" cy="87.3" r="6" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="110.0" cy="59.0" r="8" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="110" cy="100" r="9" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="110" y="212" fill="#dc2626" text-anchor="middle" style="font-size: 15px; font-weight: 600">切之後：還是 5 條</text>
</svg>

</div>
<div>

- <b style="color:#dc2626">舊的點</b>：每條 edge 只剩一半連著它 → degree 不變
- <b style="color:#16a34a">新的點</b>：一定是 6（上一頁）

→ Extraordinary vertex 只會是 <span class="key">control mesh 原本就有的</span>

</div>
</div>

<div class="small mt-2">

例：icosahedron 的 12 個角都是 degree 5 → 不管切幾次，永遠是這 12 個。其他幾百個新的點全部是 regular。

</div>

<!--
上一頁說新的點一定是 degree 六。那舊的點呢？

看左邊的圖。紅色的點連了五條邊，五個三角形圍著它，所以它是 degree 五的奇異點。

中間是切一次之後。每個三角形都被切成四個。看紅色的點：原本連出去的五條邊，每條都被中間的新點切成兩半，紅點只連著靠近自己的那一半。所以它還是連五條，degree 沒有變。

再看綠色的點，它是其中一條邊上新加的點。數它連出去的線：五條綠色的，加上連到紅點那條紅綠重疊的，剛好六條，跟上一頁說的一樣。

所以結論是：舊的點 degree 不變，新的點一定是六。奇異點只會是 control mesh 一開始就有的那些，切再多次也不會變多。

例如正二十面體，它的十二個角每個都是 degree 五。不管切幾次，奇異點永遠就是這十二個，其他新長出來的幾百個、幾千個點全部都是 regular。前面暖身那段看到球上的紅點就是它們。

這種大部分規則、只有少數幾個奇異點的 mesh，有個名字叫 semi-regular mesh。

所以等一下每個方法的規則都會有兩套：一套給 regular 的地方，一套專門處理這少數幾個奇異點。
-->

---
layout: two-cols
---

# Butterfly：每一輪只做一件事

Butterfly 是 <span class="key">interpolating</span>：

- 舊的點：<b>完全不動</b>
- 新的點：每條 edge 上加一個

所以整個方法只需要回答一個問題：

**Edge 上的新點要放在哪裡？**

::right::

<svg viewBox="0 10 445 190" width="100%" class="mx-auto">
<polygon points="25,165 185,165 105,30" fill="#94a3b81a" stroke="#64748b" stroke-width="2" stroke-linejoin="round" />
<line x1="198" y1="105" x2="242.2" y2="105.0" stroke="#64748b" stroke-width="3" stroke-linecap="round" /><polygon points="250,105 241.9,108.9 241.9,101.1" fill="#64748b" />
<circle cx="25" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="185" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="105" cy="30" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<polygon points="260,165 340.0,174.9 291.2,92.5" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="420,165 388.8,92.5 340.0,174.9" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="340,30 291.2,92.5 388.8,92.5" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="340.0,174.9 388.8,92.5 291.2,92.5" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<circle cx="260" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="420" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="340" cy="30" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="340.0" cy="174.9" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
<circle cx="388.8" cy="92.5" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
<circle cx="291.2" cy="92.5" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="105" y="192" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 500">切之前</text>
<text x="340" y="192" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 500">切之後</text>
</svg>

<div class="small text-center mt-2">黑色是舊的點，位置沒有變。<b style="color:#f97316">橘色</b>是新的點。</div>

<!--
先講 Butterfly。它是 interpolating 的方法，意思是曲面會通過原本的控制點。

要通過原本的點，最簡單的做法就是：舊的點完全不要動。

看右圖。左邊是切之前的一個三角形。右邊是切之後：黑色的三個點是舊的點，位置跟左邊一模一樣，沒有動。橘色的三個是新加的點，每條邊上一個。然後照前面講的切法，連成四個小三角形。

所以 Butterfly 每一輪只做一件事：算出橘色的新點要放在哪裡。整個方法就只有這一個問題。

注意橘色的點沒有剛好在邊的正中間，而是稍微往外凸一點。這樣一直切下去，形狀才會變圓。至於凸多少、怎麼算，下一頁一步一步講。
-->

---
layout: two-cols
clicks: 3
---

# 新的點怎麼算？

<div v-click="1">

**① 兩個端點** <b style="color:#2563eb">a</b>：各 $\tfrac12$

<div class="small">只做這步，新點就是 edge 的中點。</div>

</div>
<div v-click="2">

**② 兩邊的對角** <b style="color:#16a34a">b</b>：各 $\tfrac18$

<div class="small">把兩邊 triangle 的形狀也算進來。</div>

</div>
<div v-click="3">

**③ 更外面的四個點** <b style="color:#dc2626">c</b>：各 $-\tfrac{1}{16}$

<div class="small">

負的：把新點往外推。<br>
全部加起來：$2 \cdot \tfrac12 + 2 \cdot \tfrac18 - 4 \cdot \tfrac{1}{16} = 1$

</div>

</div>

::right::

<svg viewBox="25 45 270 215" width="100%" class="mx-auto">
<polygon points="120,150 200,150 160,80.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="120,150 200,150 160,219.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="120,150 160,80.7 80,80.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="120,150 160,219.3 80,219.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="200,150 160,80.7 240,80.7" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="200,150 160,219.3 240,219.3" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<g v-click="1">
<line x1="120" y1="150" x2="200" y2="150" stroke="#2563eb" stroke-width="4" stroke-linecap="round" />
<circle cx="120" cy="150" r="11" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="200" cy="150" r="11" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="102" y="156" fill="#2563eb" text-anchor="end" style="font-size: 17px; font-weight: 600">1/2</text>
<text x="218" y="156" fill="#2563eb" text-anchor="start" style="font-size: 17px; font-weight: 600">1/2</text>
</g>
<g v-click="2">
<circle cx="160" cy="80.7" r="9" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="160" cy="219.3" r="9" fill="#16a34a" stroke="#fff" stroke-width="2" />
<text x="160" y="64.7" fill="#16a34a" text-anchor="middle" style="font-size: 17px; font-weight: 600">1/8</text>
<text x="160" y="247.3" fill="#16a34a" text-anchor="middle" style="font-size: 17px; font-weight: 600">1/8</text>
</g>
<g v-click="3">
<circle cx="80" cy="80.7" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="80" y="64.7" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">−1/16</text>
<circle cx="80" cy="219.3" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="80" y="247.3" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">−1/16</text>
<circle cx="240" cy="80.7" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="240" y="64.7" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">−1/16</text>
<circle cx="240" cy="219.3" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="240" y="247.3" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">−1/16</text>
</g>
<circle cx="160.0" cy="150.0" r="9" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small text-center"><b style="color:#f97316">橘色</b>：要算的新點</div>

<!--
橘色的點是我們要算的新點，它在中間那條邊上。它的位置是周圍一些點的加權平均。我們一步一步把用到的點加進來。

（按一下）第一步，先用這條邊的兩個端點，藍色的 a。兩個各佔二分之一。如果只做這一步，新的點就是兩個端點的平均，也就是這條邊的中點。但這樣不夠，中點還在原本的平面上，切再多次也不會變圓。

（按一下）第二步，加上綠色的 b。這條邊的上面和下面各有一個三角形，b 就是這兩個三角形的另一個角。兩個各佔八分之一。這一步是把兩邊三角形的形狀也考慮進來。

（按一下）第三步，再加上紅色的 c，更外面的四個點。它們的權重是負的十六分之一。負的意思是：新的點要往「遠離 c」的方向移動，也就是被往外推。這樣新的點就會比中點再凸出去一點，曲面才會變圓。為什麼一定要負的，下下頁有一張圖專門解釋。

最後檢查：兩個二分之一是 1，兩個八分之一是四分之一，四個負十六分之一是負四分之一。1 加四分之一減四分之一，剛好是 1。權重加起來是 1，才是一個合理的加權平均。

這八個點的形狀像一隻蝴蝶，中間是身體，兩邊是翅膀，所以叫 Butterfly。
-->

---
layout: two-cols
---

# Butterfly：完整的權重

完整版多一個可以調的參數 $w$，再多兩個點 <b style="color:#9333ea">d</b>：

| 點 | 幾個 | 權重 |
|---|---|---|
| <b style="color:#2563eb">a</b> | 2 | $\tfrac12 - w$ |
| <b style="color:#16a34a">b</b> | 2 | $\tfrac18 + 2w$ |
| <b style="color:#dc2626">c</b> | 4 | $-\tfrac{1}{16} - w$ |
| <b style="color:#9333ea">d</b> | 2 | $w$ |

<div class="small mt-2">

$w = 0$ 就是上一頁。$w$ 決定 surface 貼 control mesh 貼得多緊。

</div>

::right::

<Stencil kind="butterfly" />

<!--
上一頁是最簡單的版本。老師投影片上的完整版多了一個參數 w，還多用了兩個點 d。

看左邊的表。a 是邊的兩個端點，權重是二分之一減 w。b 是兩邊的對角，八分之一加 2w。c 是外面四個點，負的十六分之一減 w。d 是沿著這條邊往兩頭再延伸出去的兩個點，權重就是 w。

把 w 設成 0，d 就沒有作用，其他三個剛好就是上一頁的二分之一、八分之一、負十六分之一。

不管 w 是多少，全部加起來都還是 1。w 是一個可以調的參數，決定曲面貼原本的 control mesh 貼得多緊。右邊可以拉 w，看每個點的權重怎麼變。

這十個點排起來像一隻蝴蝶。
-->

---
layout: two-cols
---

# Butterfly：為什麼 c 是負的？

<v-clicks>

- 權重加起來是 1（$w = 0$）：
  $2 \cdot \tfrac12 + 2 \cdot \tfrac18 + 4 \cdot \left(-\tfrac{1}{16}\right) = 1$
- 權重全是正的 → 新點落在舊點<span class="key">之間</span> → 越切越扁
- Butterfly 的舊點不能動 → 新點要<span class="key">往外推</span>才會圓 → 需要負的權重

</v-clicks>

<div class="small mt-4">右圖是側面（2D 剖面）。和曲線的 4-point scheme 同一個道理。</div>

::right::

<svg viewBox="0 30 340 240" width="100%" class="mx-auto">
<polyline points="20,230 110,95 230,95 320,230" fill="none" stroke="#64748b" stroke-width="2" />
<path d="M110,95 Q170.0,61.25 230,95" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" />
<circle cx="20" cy="230" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="320" cy="230" r="8" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="110" cy="95" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="230" cy="95" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="170.0" cy="95.0" r="6" fill="#94a3b8" />
<line x1="170.0" y1="95.0" x2="170.0" y2="84.1" stroke="#16a34a" stroke-width="2.5" />
<polygon points="170.0,76.1 164.0,87.1 176.0,87.1" fill="#16a34a" />
<circle cx="170.0" cy="78.1" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="24" y="258" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">c</text>
<text x="316" y="258" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">c</text>
<text x="104" y="79" fill="#2563eb" text-anchor="middle" style="font-size: 17px; font-weight: 600">a</text>
<text x="236" y="79" fill="#2563eb" text-anchor="middle" style="font-size: 17px; font-weight: 600">a</text>
<text x="170.0" y="143.0" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 500">灰點：只用 a，還是平的</text>
<text x="170.0" y="60.1" fill="#f97316" text-anchor="middle" style="font-size: 15px; font-weight: 600">加上負的 c：往外推</text>
</svg>

<!--
前面說 c 的權重是負的，是為了把新點往外推。這頁用一張側面的圖解釋為什麼一定要這樣。

（按一下）先確認權重加起來是 1。用 w 等於 0 算：兩個 a 各二分之一，加起來 1；兩個 b 各八分之一，加起來四分之一；四個 c 各負十六分之一，加起來負四分之一。1 加四分之一減四分之一，剛好是 1。

（按一下）如果權重全部是正的會怎樣？新的點就是周圍幾個點的平均，一定落在那幾個點的「中間」。看右圖，這是從側面看曲面的剖面。藍色的兩個 a 是要切的邊的兩端，紅色的兩個 c 在更外面。如果只用 a，新的點就是灰色的中點，剛好在直線上，還是平的。這樣切再多次，形狀都不會變圓。

（按一下）Approximating 的方法可以接受，因為舊的點也會一起往內移。但 Butterfly 是 interpolating，舊的點不能動。要變圓，新的點必須比中點再凸出去一點。負的權重就是在做這件事：c 的權重是負的，等於把新的點往「遠離 c」的方向推，就是綠色箭頭，推到橘色的位置。橘色虛線就是變圓之後的樣子。

這跟前面曲線的 4-point scheme 是一模一樣的道理，那裡兩端的權重也是負的十六分之一。
-->

---
layout: two-cols
---

# 怎麼找到 a、b、c、d？

每個 vertex 把連出去的 edges <span class="key">照順序</span>存成 list（逆時針 0～5）

要切的 edge（<b style="color:#f97316">橘色</b>）放在位置 0：

- 位置 1、5 → <b style="color:#16a34a">b</b>
- 位置 2、4 → <b style="color:#dc2626">c</b>
- 位置 3 → <b style="color:#9333ea">d</b>

<div class="small mt-2">

另一端 $a_2$ 也照做一次，找到另外兩個 c 和一個 d。
Regular vertex 一定是 6 條 edge，所以位置是固定的。

</div>

::right::

<svg viewBox="35 60 280 195" width="100%" class="mx-auto">
<polygon points="135,150 207,150 171.0,87.6" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="135,150 207,150 171.0,212.4" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="135,150 171.0,87.6 99.0,87.6" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="135,150 171.0,212.4 99.0,212.4" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="207,150 171.0,87.6 243.0,87.6" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="207,150 171.0,212.4 243.0,212.4" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="135,150 99.0,87.6 63,150" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="135,150 99.0,212.4 63,150" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="207,150 243.0,87.6 279,150" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="207,150 243.0,212.4 279,150" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<line x1="135" y1="150" x2="207" y2="150" stroke="#f97316" stroke-width="5" />
<circle cx="179.6" cy="150.0" r="10" fill="currentColor" opacity="0.85" />
<text x="179.6" y="155.0" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">0</text>
<line x1="135" y1="150" x2="171.0" y2="87.6" stroke="#64748b" stroke-width="3" />
<circle cx="157.3" cy="111.3" r="10" fill="currentColor" opacity="0.85" />
<text x="157.3" y="116.3" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">1</text>
<line x1="135" y1="150" x2="99.0" y2="87.6" stroke="#64748b" stroke-width="3" />
<circle cx="112.7" cy="111.3" r="10" fill="currentColor" opacity="0.85" />
<text x="112.7" y="116.3" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">2</text>
<line x1="135" y1="150" x2="63" y2="150" stroke="#64748b" stroke-width="3" />
<circle cx="90.4" cy="150.0" r="10" fill="currentColor" opacity="0.85" />
<text x="90.4" y="155.0" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">3</text>
<line x1="135" y1="150" x2="99.0" y2="212.4" stroke="#64748b" stroke-width="3" />
<circle cx="112.7" cy="188.7" r="10" fill="currentColor" opacity="0.85" />
<text x="112.7" y="193.7" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">4</text>
<line x1="135" y1="150" x2="171.0" y2="212.4" stroke="#64748b" stroke-width="3" />
<circle cx="157.3" cy="188.7" r="10" fill="currentColor" opacity="0.85" />
<text x="157.3" y="193.7" text-anchor="middle" style="font-size: 13px; font-weight: 700; fill: var(--slidev-theme-background, #fff)">5</text>
<circle cx="135" cy="150" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="207" cy="150" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="171.0" cy="87.6" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="171.0" cy="212.4" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="99.0" cy="87.6" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="99.0" cy="212.4" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="243.0" cy="87.6" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="243.0" cy="212.4" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="63" cy="150" r="7" fill="#9333ea" stroke="#fff" stroke-width="2" />
<circle cx="279" cy="150" r="7" fill="#9333ea" stroke="#fff" stroke-width="2" />
<text x="135" y="188" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">a₁</text>
<text x="213" y="180" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">a₂</text>
<text x="171.0" y="71.6" fill="#16a34a" text-anchor="middle" style="font-size: 16px; font-weight: 600">b</text>
<text x="171.0" y="240.4" fill="#16a34a" text-anchor="middle" style="font-size: 16px; font-weight: 600">b</text>
<text x="99.0" y="71.6" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">c</text>
<text x="99.0" y="240.4" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">c</text>
<text x="243.0" y="71.6" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">c</text>
<text x="243.0" y="240.4" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">c</text>
<text x="43" y="156" fill="#9333ea" text-anchor="middle" style="font-size: 16px; font-weight: 600">d</text>
<text x="299" y="156" fill="#9333ea" text-anchor="middle" style="font-size: 16px; font-weight: 600">d</text>
</svg>

<!--
老師的投影片有一頁問：給一條邊，程式要怎麼找到 a、b、c、d？

答案是：每個頂點把它連出去的邊，照逆時針的順序存成一個 list。

看右圖。橘色是我們要切的邊，從 a1 到 a2。a1 連了六條邊，照逆時針編號 0 到 5，把要切的這條放在位置 0。

位置 1 和位置 5，就是緊鄰橘色邊的兩條，連到的是兩個綠色的 b。
位置 2 和位置 4，再往外一格，連到的是紅色的 c。
位置 3，正對面那條，連到的是紫色的 d。

這樣 a1 這一側的點都找到了。另一端 a2 也用同樣的方法做一次，就能找到右邊的兩個 c 和一個 d。

為什麼可以這樣數？因為 regular 的頂點一定剛好六條邊，所以每種點在 list 裡的位置是固定的。如果不是六條，這個方法就不行，那就是下一頁 Modified Butterfly 要處理的情況。
-->

---

# 問題：蝴蝶不是到處都能用

蝴蝶的 10 個點，要 edge <span class="key">兩端都連 6 條 edge</span>（regular）才排得出來。

<div class="grid grid-cols-2 gap-8 mt-2">
<div>

<svg viewBox="-5 20 270 180" width="100%" class="mx-auto">
<polygon points="90,110 170,110 130,45" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 170,110 130,175" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 130,45 210,45" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 130,175 210,175" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 210,45 250,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 210,175 250,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 130,45 50,45" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 130,175 50,175" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 50,45 10,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 50,175 10,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<line x1="90" y1="110" x2="170" y2="110" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
<circle cx="170" cy="110" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="45" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="175" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="45" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="175" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="250" cy="110" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="90" cy="110" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="50" cy="45" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="50" cy="175" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="10" cy="110" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="130.0" cy="110.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small text-center">兩端都連 6 條：每個點都找得到 <b style="color:#16a34a">✓</b></div>
</div>
<div>

<svg viewBox="-5 20 270 180" width="100%" class="mx-auto">
<polygon points="90,110 170,110 130,45" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 170,110 130,175" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 130,45 210,45" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 130,175 210,175" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 210,45 250,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="170,110 210,175 250,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 130,45 15,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="90,110 130,175 15,110" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<line x1="90" y1="110" x2="170" y2="110" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
<circle cx="170" cy="110" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="45" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="175" r="7" fill="#16a34a" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="45" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="175" r="7" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="250" cy="110" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="15" cy="110" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="90" cy="110" r="11" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="50" cy="45" r="11" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3" />
<text x="50" y="51" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">?</text>
<circle cx="50" cy="175" r="11" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3" />
<text x="50" y="181" fill="#dc2626" text-anchor="middle" style="font-size: 17px; font-weight: 600">?</text>
<circle cx="130.0" cy="110.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small text-center">左端只連 4 條：<b style="color:#dc2626">c 的位置沒有點 ✗</b></div>
</div>
</div>

<div class="mt-2">

→ 奇異點那一端要換一套規則，這就是 <span class="key">Modified</span> Butterfly。

</div>

<!--
剛剛的蝴蝶有一個前提：這條邊的兩個端點，都要剛好連六條邊，也就是都要是 regular。

看左邊。橘色是要切的邊，兩個藍色的端點都連六條邊。周圍的綠色 b、紅色 c、紫色 d 都排得整整齊齊，十個點每一個都找得到。

看右邊。右端一樣是 regular，但是左端紅色的點是奇異點，它只連四條邊。照蝴蝶的排法，左上和左下應該各有一個 c，但那裡根本沒有對應的點，圖上打問號的地方。蝴蝶湊不出來。

如果硬套，隨便抓附近的點來當 c，切出來的曲面在這個奇異點附近會不平滑。

所以奇異點那一端要換一套規則。加上這套規則之後的方法就叫 Modified Butterfly。下一頁看這套規則是什麼。
-->

---
layout: two-cols
---

# Modified 的特殊規則

Edge 的一端 $v$ 是 extraordinary（degree $N$）→ 蝴蝶湊不出來

改成只用 <span class="key">$v$ 和它的一圈鄰居</span>：

- $v$ 自己：永遠 $\tfrac34$
- $e_0$ = 這條 edge 的另一端，其他照順序繞一圈

<v-click>

例：$N = 4$

$\tfrac34 + \tfrac38 + 0 - \tfrac18 + 0 = 1$

</v-click>

::right::

<svg viewBox="20 15 300 285" width="100%" class="mx-auto">
<polygon points="165,150 250.0,150.0 165.0,65.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="165,150 165.0,65.0 80.0,150.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="165,150 80.0,150.0 165.0,235.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="165,150 165.0,235.0 250.0,150.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<line x1="165" y1="150" x2="250.0" y2="150.0" stroke="#f97316" stroke-width="5" />
<circle cx="211.5" cy="142" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<circle cx="250.0" cy="150.0" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="280.0" y="146.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">e₀</text>
<text x="280.0" y="164.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">3/8</text>
<circle cx="165.0" cy="65.0" r="9" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<text x="165.0" y="31.0" fill="#94a3b8" text-anchor="middle" style="font-size: 15px; font-weight: 600">e₁</text>
<text x="165.0" y="49.0" fill="#94a3b8" text-anchor="middle" style="font-size: 15px; font-weight: 600">0</text>
<circle cx="80.0" cy="150.0" r="9" fill="#dc2626" stroke="#fff" stroke-width="2" />
<text x="50.0" y="146.0" fill="#dc2626" text-anchor="middle" style="font-size: 15px; font-weight: 600">e₂</text>
<text x="50.0" y="164.0" fill="#dc2626" text-anchor="middle" style="font-size: 15px; font-weight: 600">−1/8</text>
<circle cx="165.0" cy="235.0" r="9" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<text x="165.0" y="261.0" fill="#94a3b8" text-anchor="middle" style="font-size: 15px; font-weight: 600">e₃</text>
<text x="165.0" y="279.0" fill="#94a3b8" text-anchor="middle" style="font-size: 15px; font-weight: 600">0</text>
<circle cx="165" cy="150" r="11" fill="#64748b" stroke="#fff" stroke-width="2" />
<text x="125" y="196" fill="currentColor" text-anchor="middle" style="font-size: 15px; font-weight: 600">v：3/4</text>
<text x="213.5" y="128" fill="#f97316" text-anchor="middle" style="font-size: 14px; font-weight: 600">新的點</text>
</svg>

<!--
奇異點那一端換成什麼規則？

Modified Butterfly 的做法是：不用蝴蝶了，改成只看奇異點那一端。用奇異點 v 本身，加上它周圍一圈的鄰居來算新的點。

看右圖。中間黑色的 v 是 degree 4 的奇異點，周圍四個鄰居。橘色是要切的邊，它的另一端叫 e0，然後逆時針繞一圈，叫 e1、e2、e3。

v 自己的權重永遠是四分之三，不管 N 是多少。

（按一下）N 等於 4 的時候，鄰居的權重是：e0 八分之三，對面的 e2 負的八分之一，旁邊的 e1、e3 都是 0。加起來：四分之三加八分之三減八分之一，剛好是 1。

注意對面的 e2 又是負的，道理跟剛剛一樣，要把新的點往外推。

其他 N 的權重在下一頁的表裡。
-->

---

# Modified Butterfly：三種情況

看 edge 的兩個端點是不是奇異點（<b style="color:#dc2626">紅色</b>）：

<div class="grid grid-cols-3 gap-6 mt-2">
<div>

<svg viewBox="-5 15 270 190" width="100%" class="mx-auto">
<line x1="90" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="50" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="50" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="10" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="50" y1="45" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="50" y1="175" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="50" y1="45" x2="10" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="50" y1="175" x2="10" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="210" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="210" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="45" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="175" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="45" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="175" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="170" y2="110" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
<circle cx="50" cy="45" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="50" cy="175" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="10" cy="110" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="45" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="175" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="250" cy="110" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="45" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="175" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="90" cy="110" r="10" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="170" cy="110" r="10" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="130.0" cy="110.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small"><b>兩端都 regular</b><br>用原本的蝴蝶</div>
</div>
<div>

<svg viewBox="-5 15 270 190" width="100%" class="mx-auto">
<circle cx="90" cy="110" r="86" fill="#dc2626" opacity="0.10" />
<line x1="90" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="22" y2="62" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="22" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="62" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="158" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="62" x2="22" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="210" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="210" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="45" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="175" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="45" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="210" y1="175" x2="250" y2="110" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="170" y2="110" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
<circle cx="22" cy="62" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="22" cy="158" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="45" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="175" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="250" cy="110" r="7" fill="#94a3b8" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="45" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="175" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="90" cy="110" r="10" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="170" cy="110" r="10" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="130.0" cy="110.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small"><b>一端是奇異點</b><br>只用那一端和它的一圈鄰居（上一頁）</div>
</div>
<div>

<svg viewBox="-5 15 270 190" width="100%" class="mx-auto">
<circle cx="90" cy="110" r="86" fill="#dc2626" opacity="0.10" />
<circle cx="170" cy="110" r="86" fill="#dc2626" opacity="0.10" />
<line x1="90" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="22" y2="62" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="22" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="62" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="158" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="22" y1="62" x2="22" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="238" y2="62" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="170" y1="110" x2="238" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="238" y1="62" x2="130" y2="45" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="238" y1="158" x2="130" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="238" y1="62" x2="238" y2="158" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" />
<line x1="90" y1="110" x2="170" y2="110" stroke="#f97316" stroke-width="5" stroke-linecap="round" />
<circle cx="22" cy="62" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="22" cy="158" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="238" cy="62" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="238" cy="158" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="45" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="130" cy="175" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="90" cy="110" r="10" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="170" cy="110" r="10" fill="#dc2626" stroke="#fff" stroke-width="2" />
<circle cx="130.0" cy="110.0" r="7" fill="#f97316" stroke="#fff" stroke-width="2" />
</svg>

<div class="small"><b>兩端都是奇異點</b><br>兩端各算一次，再<span class="key">平均</span></div>
</div>
</div>

<div class="small mt-2">藍色的點是算新點時會用到的。第三種只會在第 1 輪出現，因為之後新的點都是 regular。</div>

<!--
把規則整理一下。要切一條邊的時候，先看它的兩個端點是不是奇異點。圖上紅色的端點是奇異點，黑色的是 regular。藍色的點是算新點的時候會用到的點。

第一種，左邊：兩端都是 regular。這是最常見的情況，用原本的蝴蝶，周圍的點都用到。

第二種，中間：有一端是奇異點。就用上一頁的規則，只看奇異點那一端。紅色圓圈圈起來的範圍就是會用到的點：奇異點自己，加上它周圍一圈的鄰居。另一端旁邊那些灰色的點完全不用。

第三種，右邊：兩端都是奇異點。那就左邊這一圈算一次，得到一個位置；右邊這一圈也算一次，得到另一個位置；兩個位置平均，就是新的點。

第三種情況只會在第一輪出現。因為前面講過，切一次之後新加的點全部是 regular，所以之後任何一條邊，最多只有一端是原本的奇異點。
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
layout: two-cols
---

# Modified Butterfly 的結果

- Regular 的地方：用蝴蝶
- 奇異點附近：用特殊規則
- 舊的點從頭到尾都沒有動

<v-click>

<b style="color:#ef4444">●</b> 原本的 control points 都還在 surface 上 → <span class="key">interpolating</span>

</v-click>

::right::

<MeshSubdivision
  shape="icosahedron" :shapes="['icosahedron', 'octahedron', 'tshape']" scheme="butterfly"
  :level="1" :max-level="4" marks color="#34d399" :width="400" :height="290"
/>

<!--
把規則都放進去，實際切切看。

右邊是正二十面體。它的十二個頂點每個都只連五條邊，全部是奇異點。所以第一輪每條邊的兩端都是奇異點，用的是「兩端各算一次再平均」。第二輪開始，新的點都是 regular，大部分的邊就用原本的蝴蝶，只有碰到那十二個點的邊用特殊規則。

可以把 level 往上拉，越切越圓。

（按一下）紅色的點是原本的十二個控制點。不管切幾次，紅點都還在曲面上，因為舊的點從頭到尾都沒有移動過。這就是 interpolating。
-->

---
layout: two-cols
---

# Boundary 怎麼辦？

Boundary 外面沒有鄰居 → 蝴蝶的 10 個點湊不齊

- Boundary 上的 edge：新點直接放在 <span class="key">中點</span>，不移動
- Boundary 上的 vertex 幾乎都是 extraordinary（少了一側）
- Sharp corner 需要另外的規則（這裡不細講）

::right::

<svg viewBox="0 95 330 230" width="100%" class="mx-auto">
<polygon points="10,200 110,200 60,113" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="110,200 210,200 160,113" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="210,200 310,200 260,113" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="60,113 160,113 110,200" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="160,113 260,113 210,200" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<rect x="0" y="200" width="330" height="100" fill="#94a3b8" opacity="0.08" />
<line x1="0" y1="200" x2="330" y2="200" stroke="#64748b" stroke-width="4" />
<line x1="110" y1="200" x2="210" y2="200" stroke="#f97316" stroke-width="5" />
<circle cx="160.0" cy="287" r="9" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3" />
<text x="160.0" y="292" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">×</text>
<circle cx="60" cy="287" r="9" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3" />
<text x="60" y="292" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">×</text>
<circle cx="260" cy="287" r="9" fill="none" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 3" />
<text x="260" y="292" fill="#dc2626" text-anchor="middle" style="font-size: 16px; font-weight: 600">×</text>
<circle cx="110" cy="200" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="210" cy="200" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="160.0" cy="200" r="8" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="110" y="186" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">1/2</text>
<text x="210" y="186" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">1/2</text>
<text x="160.0" y="186" fill="#f97316" text-anchor="middle" style="font-size: 15px; font-weight: 600">中點</text>
<text x="318" y="222" fill="#64748b" text-anchor="end" style="font-size: 14px; font-weight: 600">boundary</text>
<text x="165" y="319" fill="#dc2626" text-anchor="middle" style="font-size: 14px; font-weight: 600">外面沒有點，蝴蝶湊不齊</text>
</svg>

<!--
前面的 mesh 都是封閉的，像球。如果 mesh 有邊界，例如一張紙，就會遇到問題。

看右圖。粗黑線是邊界，下面灰色的區域是 mesh 外面，什麼都沒有。橘色是我們要切的邊，剛好在邊界上。蝴蝶需要的點，下面那三個紅色虛線的點是在外面的，根本不存在，所以湊不齊。

處理的方法很簡單：邊界上的邊，新的點直接放在中點，兩個端點各二分之一，不用其他點。

另外，邊界上的頂點少了一側的鄰居，連的邊數通常不是六，所以幾乎都是奇異點。

如果邊界上有尖角，例如一張正方形紙的四個角，需要再另外的規則。那個超出這堂課的範圍，這裡不細講。
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

# Loop：每一輪做兩件事

Loop 是 <span class="key">approximating</span>（以 Charles Loop 命名）：

1. 每條 edge 上<b>加新的點</b>
2. <b>舊的點也要移動</b>（Butterfly 沒有這一步）

<div class="small mt-4">

舊的點被鄰居往內拉 → surface 會比 control mesh 小一圈。

</div>

::right::

<svg viewBox="0 10 445 190" width="100%" class="mx-auto">
<polygon points="25,165 185,165 105,30" fill="#94a3b81a" stroke="#64748b" stroke-width="2" stroke-linejoin="round" />
<line x1="198" y1="105" x2="242.2" y2="105.0" stroke="#64748b" stroke-width="3" stroke-linecap="round" /><polygon points="250,105 241.9,108.9 241.9,101.1" fill="#64748b" />
<circle cx="25" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="185" cy="165" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<circle cx="105" cy="30" r="7" fill="#334155" stroke="#fff" stroke-width="2" />
<polygon points="276.0,156.0 340.0,162.3 302.4,98.8" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="404.0,156.0 377.6,98.8 340.0,162.3" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="340.0,48.0 302.4,98.8 377.6,98.8" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<polygon points="340.0,162.3 377.6,98.8 302.4,98.8" fill="#94a3b81a" stroke="#64748b" stroke-width="1.8" stroke-linejoin="round" />
<circle cx="260" cy="165" r="7" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" />
<line x1="260" y1="165" x2="273.6" y2="157.3" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" /><polygon points="276.0,156.0 271.4,162.6 268.0,156.5" fill="#7c3aed" />
<circle cx="420" cy="165" r="7" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" />
<line x1="420" y1="165" x2="406.4" y2="157.3" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" /><polygon points="404.0,156.0 412.0,156.5 408.6,162.6" fill="#7c3aed" />
<circle cx="340" cy="30" r="7" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" />
<line x1="340" y1="30" x2="340.0" y2="45.3" stroke="#7c3aed" stroke-width="2.5" stroke-linecap="round" /><polygon points="340.0,48.0 336.5,40.8 343.5,40.8" fill="#7c3aed" />
<circle cx="276.0" cy="156.0" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="404.0" cy="156.0" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="340.0" cy="48.0" r="7" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<circle cx="340.0" cy="162.3" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="377.6" cy="98.8" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="302.4" cy="98.8" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="105" y="192" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 500">切之前</text>
<text x="340" y="192" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 500">切之後</text>
</svg>

<div class="small text-center mt-2">虛線圓：舊的點原本的位置。<b style="color:#7c3aed">紫色</b>：移動之後。<b style="color:#2563eb">藍色</b>：新的點。</div>

<!--
接下來是 Loop。Loop 是人名，Charles Loop，不是因為規則裡有迴圈。

它的切法跟 Butterfly 一樣，一個三角形切成四個。不一樣的是，它是 approximating，所以舊的點也會動。

看右圖，跟 Butterfly 那張對照。左邊是切之前。右邊是切之後：虛線的圓圈是舊的點原本的位置，紫色是它們移動之後的位置，三個角都往裡面縮了一點。藍色是每條邊上新加的點。

所以 Loop 每一輪做兩件事。第一，每條邊上加一個新的點，這個跟 Butterfly 一樣要算位置。第二，舊的點也要移動，這是 Butterfly 沒有的。

因為舊的點每一輪都被往裡面拉，所以最後的曲面會比原本的 control mesh 小一圈，不會通過原本的控制點。

接下來兩頁，分別講這兩件事怎麼算。
-->

---
layout: two-cols
---

# Loop ①：edge 上的新點

一條 edge 兩邊各有一個 triangle，附近有 4 個點：

- Edge 的兩個端點：各 $\tfrac38$
- 兩個對角：各 $\tfrac18$

$$e = \tfrac38 (v_1 + v_2) + \tfrac18 (v_3 + v_4)$$

<v-click>

<div class="small">

例：端點 $(0,0)$、$(4,0)$，對角 $(2,4)$、$(2,-2)$

$\tfrac38 (4,0) + \tfrac18 (4,2) = (2,\ 0.25)$

中點是 $(2,0)$；新點被比較遠的那個對角往上拉了一點。

</div>

</v-click>

::right::

<Stencil kind="loop-edge" />

<!--
第一件事，邊上的新點。

看右圖。中間橘色的是要算的新點，它在一條邊上。這條邊的上面和下面各有一個三角形，所以附近總共有四個點：藍色的是這條邊的兩個端點，綠色的是兩個三角形的另一個角。

權重是：兩個端點各八分之三，兩個對角各八分之一。兩個八分之三加兩個八分之一，剛好是 1。端點離新點比較近，所以權重比較大。

跟 Butterfly 比，這裡只用四個點，而且全部是正的，沒有負的權重。

（按一下）用數字算一次。假設兩個端點是 (0,0) 和 (4,0)，兩個對角是 (2,4) 和 (2,負2)。端點加起來是 (4,0)，乘八分之三，是 (1.5, 0)。對角加起來是 (4,2)，乘八分之一，是 (0.5, 0.25)。兩個相加是 (2, 0.25)。

這條邊的中點是 (2,0)。新的點在 (2, 0.25)，比中點高一點點，因為上面那個對角比較遠，把它稍微往上拉了。
-->

---
layout: two-cols
---

# Loop ②：移動舊的點

Regular 的點有 6 個鄰居。新的位置：

- 自己留 $\tfrac{10}{16}$
- 6 個鄰居各 $\tfrac{1}{16}$（合計 $\tfrac{6}{16}$）

<v-click>

寫成公式（$n$ 個鄰居，每個權重 $\beta$）：

$$v_{new} = (1 - n\beta)\, v_{old} + \beta \sum_{j=1}^{n} v_j$$

<div class="small">

$n = 6$ 時 $\beta = \tfrac{1}{16}$。例：自己比鄰居高 1，移動後只比鄰居高 $\tfrac{10}{16} \approx 0.63$ → 被拉低了。

</div>

</v-click>

::right::

<svg viewBox="0 0 260 232" width="100%" class="mx-auto">
<polygon points="130,112 130.0,30.0 59.0,71.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130,112 59.0,71.0 59.0,153.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130,112 59.0,153.0 130.0,194.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130,112 130.0,194.0 201.0,153.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130,112 201.0,153.0 201.0,71.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<polygon points="130,112 201.0,71.0 130.0,30.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round" />
<line x1="130.0" y1="44.8" x2="130.0" y2="74.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="130.0,79.2 126.5,72.0 133.5,72.0" fill="#2563eb" />
<circle cx="130.0" cy="30.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="130.0" y="11.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<line x1="71.8" y1="78.4" x2="97.1" y2="93.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="101.6,95.6 93.6,95.0 97.1,89.0" fill="#2563eb" />
<circle cx="59.0" cy="71.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="38.2" y="64.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<line x1="71.8" y1="145.6" x2="97.1" y2="131.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="101.6,128.4 97.1,135.0 93.6,129.0" fill="#2563eb" />
<circle cx="59.0" cy="153.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="38.2" y="170.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<line x1="130.0" y1="179.2" x2="130.0" y2="150.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="130.0,144.8 133.5,152.0 126.5,152.0" fill="#2563eb" />
<circle cx="130.0" cy="194.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="130.0" y="223.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<line x1="188.2" y1="145.6" x2="162.9" y2="131.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="158.4,128.4 166.4,129.0 162.9,135.0" fill="#2563eb" />
<circle cx="201.0" cy="153.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="221.8" y="170.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<line x1="188.2" y1="78.4" x2="162.9" y2="93.0" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" /><polygon points="158.4,95.6 162.9,89.0 166.4,95.0" fill="#2563eb" />
<circle cx="201.0" cy="71.0" r="8" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="221.8" y="64.0" fill="#2563eb" text-anchor="middle" style="font-size: 15px; font-weight: 600">1/16</text>
<circle cx="130" cy="112" r="13" fill="#7c3aed" stroke="#fff" stroke-width="2" />
<text x="149" y="118" fill="#7c3aed" text-anchor="start" style="font-size: 16px; font-weight: 600">10/16</text>
</svg>

<div class="small text-center"><b style="color:#7c3aed">紫色</b>：要移動的舊點。<b style="color:#2563eb">藍色</b>：它的 6 個鄰居。</div>

<!--
第二件事，移動舊的點。

看右圖。中間紫色的是一個舊的點，它是 regular，所以周圍有六個鄰居，藍色的。箭頭的意思是：每個鄰居都把它往自己的方向拉一點。

新的位置是一個加權平均：自己留十六分之十，六個鄰居各十六分之一。六個十六分之一是十六分之六，加上自己的十六分之十，剛好是 1。

（按一下）寫成公式就是這樣。n 是鄰居的數量，每個鄰居的權重叫 beta。鄰居總共拿走 n 乘 beta，自己拿剩下的 1 減 n beta。這裡的鄰居指的是舊的鄰居，不是剛剛新加的點。n 等於 6 的時候 beta 是十六分之一，代進去就是上面的十六分之十和十六分之一。

舉個例子感受一下。假設六個鄰居都在同一個高度，中間這個點比它們高 1，像一個小山頂。移動之後，它只比鄰居高十六分之十，大約 0.63。山頂被拉低了。每切一輪都這樣拉一次，凸出來的地方就越來越平、越來越圓，整個曲面也就縮小一圈。

如果這個點不是六個鄰居呢？下一頁。
-->

---

# Loop：鄰居不是 6 個的時候

每個鄰居拿 $\beta$，自己拿剩下的 $1 - n\beta$。$\beta$ 看鄰居有幾個（$n$）：

<div class="grid grid-cols-2 gap-6 items-center">
<div>

| $n$ | 每個鄰居 $\beta$ | 自己 $1 - n\beta$ |
|---|---|---|
| 3 | $\tfrac{3}{16}$ | $\tfrac{7}{16}$ |
| 6（regular） | $\tfrac{1}{16}$ | $\tfrac{10}{16}$ |
| 其他 | $\tfrac{3}{8n}$ | $\tfrac{5}{8}$ |

</div>
<div class="grid grid-cols-2 gap-2">
<svg viewBox="0 0 200 222" width="100%" class="mx-auto">
<polygon points="100,92 100.0,30.0 46.3,61.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 46.3,61.0 46.3,123.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 46.3,123.0 100.0,154.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 100.0,154.0 153.7,123.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 153.7,123.0 153.7,61.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 153.7,61.0 100.0,30.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<circle cx="100.0" cy="30.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="100.0" y="15.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="46.3" cy="61.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="29.0" y="56.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="46.3" cy="123.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="29.0" y="138.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="100.0" cy="154.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="100.0" y="179.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="153.7" cy="123.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="171.0" y="138.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="153.7" cy="61.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="171.0" y="56.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">1/16</text>
<circle cx="100" cy="92" r="10" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="100" y="122" fill="#f97316" text-anchor="middle" style="font-size: 14px; font-weight: 600">10/16</text>
<text x="100" y="212" fill="currentColor" text-anchor="middle" style="font-size: 15px; font-weight: 600">n = 6</text>
</svg>
<svg viewBox="0 0 200 222" width="100%" class="mx-auto">
<polygon points="100,92 100.0,30.0 46.3,123.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 46.3,123.0 153.7,123.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="100,92 153.7,123.0 100.0,30.0" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<circle cx="100.0" cy="30.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="100.0" y="15.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">3/16</text>
<circle cx="46.3" cy="123.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="29.0" y="138.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">3/16</text>
<circle cx="153.7" cy="123.0" r="7" fill="#2563eb" stroke="#fff" stroke-width="2" />
<text x="171.0" y="138.0" fill="#2563eb" text-anchor="middle" style="font-size: 13px; font-weight: 600">3/16</text>
<circle cx="100" cy="92" r="10" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="100" y="122" fill="#f97316" text-anchor="middle" style="font-size: 14px; font-weight: 600">7/16</text>
<text x="100" y="212" fill="currentColor" text-anchor="middle" style="font-size: 15px; font-weight: 600">n = 3</text>
</svg>
</div>
</div>

<div class="small mt-2">

這是常用的簡化版。Loop 原本的公式是 $\beta = \tfrac1n\left[\tfrac58 - \left(\tfrac38 + \tfrac14\cos\tfrac{2\pi}{n}\right)^2\right]$，$n = 6$ 時一樣是 $\tfrac{1}{16}$。

</div>

<!--
Loop 移動舊頂點的公式裡，每個鄰居的權重是 beta，自己拿剩下的。beta 是多少，看這個頂點連了幾條邊。

最重要的是 regular 的情況，看右邊第一張圖，n 等於 6。橘色的中心是要移動的舊頂點，藍色是它的六個鄰居。每個鄰居十六分之一，六個加起來十六分之六，中心自己是剩下的十六分之十。這組數字請記起來。

第二張圖是 n 等於 3。三個鄰居各十六分之三，加起來十六分之九，中心自己十六分之七。鄰居少，每個鄰居分到的就比較多。

其他的 n，beta 用 8n 分之 3。這時候鄰居加起來剛好是八分之三，所以中心自己永遠是八分之五。n 等於 6 代進去也是八分之五，就是十六分之十，是一致的。

下面小字：這張表是常用的簡化版，比較好算。Loop 自己原本的公式比較複雜，裡面有 cosine。兩個版本在 n 等於 6 的時候都是十六分之一，其他的 n 數字會差一點點，但切出來的曲面看起來幾乎一樣。
-->

---
layout: two-cols
---

# Loop：實際切切看

- 每個 triangle → 4 個 triangles
- 舊的 vertex 也會被往內拉
  → surface 會比 control mesh <span class="key">小一圈</span>
- Regular 的地方 $C^2$，extraordinary vertex 是 $C^1$

- Regular vertex：自己 $\tfrac{10}{16}$，6 個鄰居各 $\tfrac{1}{16}$

::right::

<MeshSubdivision
  shape="icosahedron" :shapes="['icosahedron', 'octahedron', 'tetrahedron', 'tshape', 'ring']" scheme="loop"
  :level="1" :max-level="4" color="#a78bfa" :width="400" :height="290"
/>

<!--
右邊實際切切看。正二十面體切幾次就很像一顆球。

幾個特性。每個三角形變四個，所以每切一次面數變四倍。舊的頂點每一輪都會被鄰居往內拉，所以最後的曲面比原本的 control mesh 小一圈，這跟 Catmull-Clark 一樣。

連續性也跟 Catmull-Clark 一樣：規則的地方 C2，奇異點上 C1。

regular 的舊頂點記一組數字：自己十六分之十，六個鄰居各十六分之一。

如果 mesh 有邊界，還要用特別的規則，下一頁講。
-->

---
layout: two-cols
---

# Loop 的 boundary

不特別處理的話，boundary 會被裡面的點往內拉、縮起來。

- Boundary 上的 edge：新點放在 <span class="key">中點</span>
- Boundary 上的舊點：只看 boundary 上的左右兩個鄰居
  $\tfrac18,\ \tfrac34,\ \tfrac18$
- 這就是 <span class="key">cubic B-spline 曲線</span>的規則
  → boundary 自己變成一條平滑的曲線

<div class="small mt-2">想保留的銳利 edge（crease）也用同一套規則。</div>

::right::

<svg viewBox="0 70 340 160" width="100%" class="mx-auto">
<polygon points="10,95 115,95 60,190" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="115,95 225,95 170,190" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="225,95 330,95 280,190" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="60,190 170,190 115,95" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="170,190 280,190 225,95" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="0,190 60,190 10,95" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<polygon points="280,190 340,190 330,95" fill="#94a3b81a" stroke="#94a3b8" stroke-width="1.5" />
<line x1="0" y1="190" x2="340" y2="190" stroke="#64748b" stroke-width="4" />
<line x1="170" y1="190" x2="115" y2="95" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4" />
<circle cx="115" cy="95" r="7" fill="#94a3b8" />
<text x="115" y="81" fill="#94a3b8" text-anchor="middle" style="font-size: 13px; font-weight: 600">不看</text>
<line x1="170" y1="190" x2="225" y2="95" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 4" />
<circle cx="225" cy="95" r="7" fill="#94a3b8" />
<text x="225" y="81" fill="#94a3b8" text-anchor="middle" style="font-size: 13px; font-weight: 600">不看</text>
<line x1="60" y1="190" x2="170" y2="190" stroke="#2563eb" stroke-width="4" />
<line x1="170" y1="190" x2="280" y2="190" stroke="#2563eb" stroke-width="4" />
<circle cx="60" cy="190" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="280" cy="190" r="9" fill="#2563eb" stroke="#fff" stroke-width="2" />
<circle cx="170" cy="190" r="11" fill="#f97316" stroke="#fff" stroke-width="2" />
<text x="60" y="220" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">1/8</text>
<text x="280" y="220" fill="#2563eb" text-anchor="middle" style="font-size: 16px; font-weight: 600">1/8</text>
<text x="170" y="220" fill="#f97316" text-anchor="middle" style="font-size: 16px; font-weight: 600">3/4</text>
<text x="115" y="220" fill="#64748b" text-anchor="middle" style="font-size: 14px; font-weight: 600">boundary</text>
</svg>

<!--
Loop 遇到邊界怎麼辦？如果照一般的規則，邊界上的點會被裡面的點往內拉，整個邊界縮進去，形狀就跑掉了。

所以邊界用特別的規則，有兩條。

第一條，邊界上的邊，新的點就放在中點。

第二條，邊界上的舊頂點，看右圖。粗黑線是邊界，橘色是要移動的舊頂點。它上面還連著兩個裡面的點，灰色虛線，這些「不看」。只看邊界上左右兩個藍色的鄰居。權重是：自己四分之三，左右各八分之一。

這組數字前面看過，就是三次 B-spline 曲線的切法。意思是邊界那條線，自己會照曲線的規則變成一條平滑的三次 B-spline 曲線，完全不受裡面的面影響。

想保留的銳利邊，也就是 crease，用的也是同一套規則，所以那條邊不會被磨掉。這個在第 7 段 Making Creases 還會再講。
-->

---

# Loop vs. Butterfly

<div class="flex gap-4 items-start">
<div class="flex-1">

| | Butterfly | Loop |
|---|---|---|
| 類型 | Interp. | Approx. |
| 舊的 vertex | 不動 | 會移動 |
| 通過紅點 | ✓ | ✗（小一圈） |
| 平滑度 | $C^1$ | $C^2$ |
| 缺點 | Wiggles | 會縮小 |

</div>
<MeshSubdivision shape="octahedron" scheme="butterfly" :level="3" marks color="#34d399" :width="250" :height="230" title="Modified Butterfly" />
<MeshSubdivision shape="octahedron" scheme="loop" :level="3" marks color="#a78bfa" :width="250" :height="230" title="Loop" />
</div>

<div class="small mt-2">切法一樣：每個 triangle 切成 4 個。差別只在點放哪裡。</div>

<!--
三角形的兩個方法講完了，放在一起比。右邊兩個都是從同一個正八面體開始，切三次。紅點是原本的六個頂點。

先講一樣的地方：切法完全一樣，每條邊中間加一個點，一個三角形變四個。差別全部在點放哪裡。

第一列，Butterfly 是 interpolating，Loop 是 approximating。

第二列，Butterfly 的舊點不動，所以每一輪只算邊上的新點。Loop 的舊點會移動，每一輪要算兩種點。

第三列，看圖：左邊 Butterfly 紅點都還在表面上。右邊 Loop 紅點都在表面外面，因為整個曲面縮小了一圈。

第四列，Butterfly 只有 C1，Loop 是 C2，奇異點上是 C1。

第五列，Butterfly 的缺點是表面容易有小波浪，可以把左邊轉一轉看紅點附近；Loop 的缺點是會縮小，沒辦法精確控制曲面通過哪裡。

結論：除非一定要通過控制點，不然用 Loop。
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

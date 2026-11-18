# Subdivision slides

Computer Graphics 課堂報告：用 [Slidev](https://sli.dev/) 做的 Subdivision 教學投影片，以動畫和可互動的 demo 取代大量公式。

## 開始使用

需要 Node.js 22.12 以上。

- `npm install`
- `npm run dev`，然後開啟 <http://localhost:3030>
- `npm run build` 產生可部署的靜態網站（`dist/`）

## 線上版

每次 `main` 更新，GitHub Actions 會自動重新建置並部署到 GitHub Pages：<https://yichieh-chen.github.io/subdivision-slides/>

第一次使用前，需要在 repo 的 Settings → Pages → Build and deployment → Source 選擇「GitHub Actions」。

## 結構

- `slides.md`：封面、目錄，並依序載入 `pages/` 下的七個段落
- `pages/`：每個段落一個 Markdown 檔
- `components/`：互動元件
  - `CurveSubdivision`：可拖曳控制點的曲線 subdivision（Chaikin、cubic B-spline、4-point）
  - `MeshSubdivision`：可旋轉的 3D mesh subdivision（Catmull-Clark、Doo-Sabin、Loop、Modified Butterfly、球面）
  - `Terrain`：fractal terrain
  - `WeightedAverage`：拉動權重，看新的點落在 A、B 之間的哪裡
  - `RefineCompare`：同一個 cube 切同樣次數，比較「只切」和「切完再移」
  - `DegreeFan`：調整一個 vertex 的 degree，看周圍的三角形怎麼變細
  - `PoleTexture`：把棋盤格貼到經緯度球上，看圖案在極點被擠壓
  - `SphereStep`：把 sphere subdivision 的一輪拆成三步，搭配切面圖
  - `TerrainStep`：把 fractal terrain 的一輪拆成三步，再看下一輪幅度怎麼縮小
  - `ControlPull`：拉動一個 control point，看 surface 怎麼跟著變、哪些地方有動
  - `CornerCut`、`SplitDemo`、`SampleCompare`、`CatmullClarkSteps`：跟著投影片 click 逐步播放的動畫
  - `Stencil`：Butterfly 與 Loop 的權重圖
  - `Mesh3D`：上面 3D 元件共用的 canvas renderer
- `lib/`：subdivision 演算法本身（`curves.ts`、`mesh.ts`）

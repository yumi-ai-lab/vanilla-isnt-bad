# 空と公園、中央のカップと流れる雲（現在の詳細画面）

2026-09-18。ユーザーが選んだ公園の画像を基に、内蔵 `image_gen` で空を抜いた前景と透過の雲を生成しました。CLI / API生成や別ツールによる画像加工は行っていません。採用PNGはそのまま保存し、CSSで合成しています。

- `assets/terrace-open-park-v8.png` — 1536×1024、2,130,511 bytes。ユーザー添付 `C:/Users/funadapd/Downloads/Codex 画像 2026年9月18日 20_56_09.png` をそのままコピー。静止画の完全なフォールバックであり、前景としても同じ写真の画素を表示します。
- `assets/terrace-park-foreground-v1.png` — 1536×1024、2,298,869 bytes、RGBA。空と雲の部分が透明な前景抽出。生成でRGBの細部に差が出たため、アルファだけをCSSマスクとして使い、ユーザーが選んだ公園・店・天板の色やぼけを保ちます。空の中央のalpha=0、天板の代表点alpha=253を確認。
- `assets/terrace-clouds-v1.png` — 1536×1024、1,147,566 bytes、RGBA。自然な積雲と薄い雲の透過素材。左右の余白と下半分が透明な一枚を二回表示します。外側の代表点alpha=0を確認。

前景の生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-d1c3f93b-ece6-436e-a24b-f452b5d5ec11.png`
雲の生成元: 同ディレクトリの `exec-eb3c26e6-ebe4-4a64-9983-86b18b91589f.png`

青空の下地、横へ動く二枚の雲、前景のアルファで抜いた採用写真、カップの順に重ねています。雲は240秒で一画面分を左へ流れ、次の周期へ連続します。前景と雲を低優先度で読み込み、すべてデコード済みの時だけ650msで空を切り替えます。追加素材の失敗時は元の写真のまま表示。画面外・タブ非表示では停止し、動き軽減時は雲も静止します。元写真の静止した雲と二重に重ねません。

カップの要素幅は51%から43%、左右中央、要素の下端は4%に調整。透過余白を除いた見える高さはシーンの約48%、カップ底は下から約12〜13%です。既存の接地影をカップと一体で縮尺変更し、天板の手前に置きます。写真の下はアプリ名・用途、起動ボタン、仕様、画面イメージ、こだわりの順。承認済みメイン画面は維持しています。

## 空を抜くプロンプト

入力: ユーザー添付の公園画像。

```text
Use case: background-extraction.
Asset: exact full-frame foreground plate with a TRANSPARENT SKY for a website scene, 1536 x 1024.
The attached image is the extraction target. Remove ONLY the blue sky and ALL clouds, making those pixels genuinely transparent alpha. Keep everything else at exactly the same position and size: both framing trees including fine branches and leaves, distant park trees, the left ivory/yellow ice cream shop, bench, lawn, paths and the entire white foreground table.
This is a sky-removal matte, not a new composition. The whole park and tabletop remain opaque. Every small opening of sky between leaves and branches must also be transparent with soft natural photographic alpha edges. Preserve the original photo's gentle optical defocus, colors, grain, light, object silhouettes and framing. Do not rebuild, move, relight or enlarge objects. Do not leave blue/white sky fringe around leaves. No painted checkerboard, black background, opaque color replacement or new elements. True RGBA transparency in ALL sky areas is essential. The table stays completely empty. Return the full original 3:2 canvas.
```

## 雲のプロンプト

新規生成、参照画像なし。

```text
Use case: photorealistic-natural.
Asset: a tile of real fair-weather clouds on a genuinely transparent background for a slowly drifting photographic website sky. 1536 x 1024 landscape.
Create a few beautifully natural sunlit small cumulus clouds with delicate wispy edges, subtly varied density and soft very pale blue-grey undersides, as photographed on a calm clear warm afternoon. Light is soft from upper left. Real vapor volume, irregular asymmetrical forms, not cartoon cotton balls, not painted or dramatic.
Composition: 3 sparse loose groups across the upper 40% of the full canvas, at slightly different heights between 10% and 34%. A medium airy cluster near x30%, smaller thin wisps near x65%, and a small soft cluster near x82%. Leave lots of transparent air between them. Keep left and right 8% margins fully transparent so the tile can repeat horizontally without a hard seam. Bottom 55% must be fully transparent. No isolated clouds touching canvas borders.
True transparent alpha including gradual semi-transparency at all feathery edges, no blue sky or opaque backdrop, no checkerboard graphic, no glow outline. No ground, scenery, birds, text or objects. Clouds should look gently optically soft but retain natural fine vapor structure. Return only the white clouds on actual transparent background.
```

# 中庭の素材感と独立した枝（以前の詳細画面）

2026-09-18。内蔵 `image_gen` で背景の編集と透過の枝を制作しました。CLI / API生成や別ツールによる画像加工は使用していません。生成PNGを加工せず公開用の場所へコピーしています。

- `assets/terrace-courtyard-material-v6.png` — 1536×1024、1,851,097 bytes。ユーザー指定のv5中庭を基に、ベンチの斜め方向・座面の奥行き、白い粉体塗装の細かな肌と柔らかい反射を調整。右上の手前の枝を取り除き、空を補いました。二度目の編集でベンチの向きを追加調整しています。
- `assets/terrace-branch-v1.png` — 1536×1024、977,621 bytes、RGBA。v5右上の枝を独立した透明背景に抽出。背景と葉の隙間のアルファを確認しました。生成結果では枝の占有面積が大きくなったため、CSSで全キャンバス幅をシーンの60%にして配置しています。

背景の最終生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-ff146254-7557-4e63-8c8a-3aca971aeb17.png`
背景の初稿: 同ディレクトリの `exec-fa173c1e-c825-4d66-9637-5b080b3c30dd.png`
枝の生成元: 同ディレクトリの `exec-74112377-e086-4df6-85f0-56123a49df97.png`

枝元を画面右上に置き、9秒周期で−1.8〜2.4度回転させます。少量の位置変化を添え、スマホで葉先が数px動く程度にしています。背景に同じ枝がないため、葉の間から空が見えます。遠景の木・ひさし・ベンチ・天板・カップは静止。動き軽減、画面外停止、デコード待ちを維持し、枝の読み込み失敗ではカップを隠しません。

カップの素材・大きさ・接地影と、承認済みのメイン画面は維持しています。旧v5も比較用に残しています。

## 背景の編集プロンプト

入力: `assets/terrace-airy-courtyard-v5.png`

```text
Use case: precise-object-edit.
Asset: photographic background plate for the existing VANILLA ISN'T BAD. app detail screen, 1536 x 1024, 3:2.

The attached image is the EDIT TARGET. Preserve the composition and airy ivory / pale-blue / sage palette: the striped awning at upper left, sky, low plaster wall, small distant trees at left and right, paving, and empty foreground white table. Keep the tabletop's rear edge at approximately 73% image height, with its right rounded corner. Do not move or enlarge the table or change the camera framing.

Make these specific changes:
1. The ivory metal bench at the left should have a believable subtle three-quarter orientation toward the open center of the terrace, about 15–20 degrees from its present frontal orientation. Keep it about the same size and in the same place. Make the depth of its seat, back, armrests and legs physically consistent with the ground plane and seated camera viewpoint. Natural grounded contact shadows under the feet, no stretched proportions or extra legs. The bench remains simple slim powder-coated metal.
2. Refine the FOREGROUND TABLE material into real satin white powder-coated metal: very fine delicate orange-peel paint microtexture, a broad soft directional light reflection, and a barely visible thin rolled edge / soft highlight at the far rim. Crisp material texture at the future cup contact point near x52%, y88%, gradually less crisp farther away. Do not make it grainy, dirty, scratched, concrete, marble, plastic, shiny mirror or heavily textured. Preserve the white clean appearance, with modest realistic tonal variation and no dramatic shadows or dapple pattern on the tabletop. It should look tactile when viewed closely, not noisy.
3. REMOVE ONLY the nearby overhanging foreground branch and leaves entering from the upper-right corner. Restore the sky naturally behind them. This branch will be supplied as a SEPARATE transparent animated layer, so it must not remain baked into the background. Keep the softly defocused small distant tree beyond the wall at the right. Keep the distant tree at the left as well.

Preserve the existing soft background dapple on the paving. Keep the frame airy, understated and photorealistic, matching the main kiosk's quiet material quality. No food, ice cream, cup, tray, dishes, people, lettering or UI. Do not invent furniture or scenery. Return just the refined empty scene.
```

## ベンチの追加編集プロンプト

入力: 初稿 `exec-fa173c1e-c825-4d66-9637-5b080b3c30dd.png`

```text
Use case: precise-object-edit.
Edit ONLY the ivory metal bench in the left middle ground of the attached photograph. All other pixels and composition should remain as faithful as possible, including the refined white tabletop texture and the clean upper-right sky.

The bench is still too front-on and parallel to the wall. Turn the entire bench visibly on the ground plane to a natural three-quarter view, approximately 30 degrees from the image plane: its LEFT END is closer to the camera, its RIGHT END recedes toward the low wall. Its long backrest and front seat edge therefore visibly recede diagonally to the right. Show clear believable depth in the nearer left armrest, the seat slats and the rear legs. This must be a real change of the furniture's 3D orientation, not a tilted or skewed flat cutout. Keep the bench's approximate overall position, understated scale and cream-white powder-coated slim metal construction. Ground each foot naturally with subtle contact shadows; no extra legs or warped slats.

Preserve the pale blue sky, peripheral distant trees, original awning, wall, pavement and foreground table exactly in their existing positions and quiet colors. Keep the foreground table empty and sharply tactile. Do NOT reintroduce the foreground leaves at upper right, which will be an independently animated layer. No people, ice cream, text or added props. 1536 x 1024, 3:2 full image.
```

## 独立した枝の抽出プロンプト

入力: `assets/terrace-airy-courtyard-v5.png`

```text
Use case: background-extraction.
Asset: genuine transparent PNG layer for a gently animated foreground branch in a website photograph.

The attached photograph is the EDIT / EXTRACTION SOURCE. Extract ONLY the nearby foreground leafy branch that enters from the UPPER-RIGHT CORNER. Preserve its slender branches, muted olive/sage leaves, warm daylight, natural leaf detail and its recognizable original shape.

Return a 1536 x 1024 transparent PNG. Keep the extracted branch in the SAME UPPER-RIGHT POSITION and approximately the same footprint it has in the original source: primarily x=73–100% and y=0–29%. All the rest of the canvas must have real alpha transparency, including the gaps between individual leaves and slender twigs. The attached photograph's awning, sky, clouds, distant trees, wall, bench, floor and table must be completely absent.

This is a foreground leafy branch CUTOUT, not a new scene and not a screenshot with a checkerboard. The small blurred tree beyond the wall on the right is background and must NOT be included. Include only the sharper nearby overhanging leaves along the upper-right border. Leaf and twig edges should be clean photographic alpha without white fringes or cast shadows. Preserve the reference's soft sunlight and restrained leaf color so it can be placed back over a matching sky seamlessly. No new leaves elsewhere, no rectangular opaque patch, no painted background, no text, no frame. True transparent alpha background is essential.
```

# 白い中庭と空（以前のv5）

2026-09-18。ユーザー指定の画像を `assets/terrace-airy-courtyard-v5.png`（1536×1024、1,916,924 bytes）として加工せず採用しました。入力は添付の `codex-clipboard-89fcb9ac-374c-411b-b1ae-876ecf2646ca.png`。既に出力済みの背景比較案2「白い中庭」と同じ画像です。今回のサイト反映では画像生成・色調補正・切り抜きは行っていません。

左上の淡い黄色のひさし、左奥の白いベンチ、低い壁と広い空を背景にします。画像下の約27%が天板で、カップの幅51%・bottom 1.5%・既存の接地影を維持。画像の端まで表示する3:2の構図をスマホ・PCで共有します。

葉のCSSマスクを左端の木（中心3% / 30%、半径6.5% / 10%）と右上の枝（中心88% / 0%、半径12% / 14%）へ合わせました。同じ画像を同じ縮尺で重ね、従来どおり1〜2px、18秒・15.5秒でわずかに揺らします。ひさし・壁・ベンチ・天板・カップは動かしません。動き軽減・画面外停止・画像デコード待ちを維持し、メイン画面は変更していません。

# アイス越しに景色を見る構図（以前のv4構図）

2026-09-18。保存先: `assets/terrace-open-view-v4.png`（1536×1024、約1.85MB）。内蔵 `image_gen` で編集し、生成されたPNGを加工せずコピーしました。CLI/API生成は使用していません。入力1は `assets/terrace-nearby-v3.png`（構図の編集対象）、入力2は `assets/storefront-blank-placards-v6.png`（場所と素材の参照）です。

天板を下の約3分の1に抑え、少し低い視点から店・ベンチ・舗装・奥の景色を見渡す構図へ変更しました。テーブル全体・脚・手前の縁は見せず、柔らかな木漏れ日は奥の舗装にだけ残しています。カップ素材と幅51%は維持し、表示位置を bottom 6% から1.5%へ下げました。接地影は同じカップ要素に属するため一緒に移動します。

葉先のCSSマスクは新しい写真の上端30%・90%付近に合わせました。1〜2pxの揺れ、18秒・15.5秒の周期、動き軽減と画面外停止は維持。店・ベンチ・天板は静止します。メイン画面は承認済みの状態を維持し、以前のv3背景も比較用に保存しています。

生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-d57770a5-294a-4363-ab2e-53dd8c0eb7c1.png`

最終プロンプト（内蔵 `image_gen`）:

```text
Use case: precise-object-edit.
Asset type: responsive photographic background plate for an ice-cream app detail hero, 1536x1024 landscape 3:2. This is scenery for a website, not a mockup. Output the empty scene only.

Image 1 is the EDIT TARGET: the current nearby-kiosk rest area with too much white tabletop.
Image 2 is the approved main kiosk, a MATERIAL AND PLACE REFERENCE only.

Primary correction: CHANGE THE CAMERA COMPOSITION so someone seated in light shade is looking out across a comfortable open space, past a future ice-cream cup. The current tabletop occupies more than half the image and compresses the view. The NEW table must occupy ONLY THE BOTTOM THIRD. This is the most important instruction.

Composition:
- Put the far edge of the clean white satin metal tabletop at y=67 percent of the whole image (about 685 px in a 1024 px-tall image). From that line to the bottom, the table extends beyond the left, right and lower frame. Do not show its near rim, thickness, legs, whole circular shape or an emphasized corner. Its far edge is a very quiet nearly horizontal, gently curved line, not an object of attention. Do NOT retain the old table edge at y44%.
- Use a slightly lower seated viewpoint and look more level into the scenery. Keep enough natural downward angle to read the clean tabletop surface in the bottom third. Its texture is subtly photographic and crisp near x52%, y88%, where a cup will touch.
- Leave the foreground COMPLETELY EMPTY. The existing ice-cream cup will be composited separately around x52%, with its bottom at y89%, its scoop top near y34%, and about the same apparent size as before. Do not draw a cup, food, spoon or a product shadow.
- The upper two-thirds is a real view with depth, not a close tabletop photograph and not a blank studio backdrop. Keep uncluttered visual breathing room above and around the future cup.

Spatial layers:
Near: only a cropped part of the SAME warm-white kiosk from image 2 at the far LEFT EDGE, with a modest fragment of butter-yellow striped awning and satin silver trim. No full storefront, no signs or readable logo. It should feel beside the seat, peripheral and softly out of focus, no more than about 20 percent of frame width.
Middle distance: a small understated warm-white bench with fine silver supports at the far RIGHT edge, several metres behind the table, separated from it by an open patch of pale cream stone paving. Show enough bench to recognize seating, but do not fill the view with furniture. Restrained soft dappled light on a small part of this distant paving only.
Beyond: a quiet walk or open clearing receding between very sparse, low, softly blurred sage planting at the side edges, toward pale blue sky and a softly defined distant horizon. Distinct near/middle/far distances, natural atmospheric perspective, no bright artificial fog. More room to look through, not more objects. No dense belt of green shrubs, no forest, large dark trunk, black fence, urban buildings, pots or extra chairs.
A few real soft-focus leaf tips along the very top-left and top-right edges suggest overhead shade and can be animated later in code. Keep them away from the kiosk structure so leaf movement can be masked independently.

Lighting and mood: the same bright warm-neutral daylight, ivory paint, pale paving, soft butter yellow and restrained sage accents as the approved main image. Comfortable, airy, quiet, clean, naturally photographic. The white tabletop and future product area have stable soft diffuse light, NO leaf shadows or moving sunlight patches baked onto the table. Background sunlight is gentle. Keep real photographic detail and believable physical proportions.

Avoid: full table, large tabletop area, camera aimed down at the table, dramatic depth distortion, wide-angle stretched furniture, huge kiosk in center, dense park scenery, desolate wasteland, an enormous empty sky, dark outlines, haze, sunbeams, lens flare, harsh shadows, people, hands, plates, cups, ice cream, trays, spoons, text, UI or watermarks. Keep the scene continuous with the reference shop. Produce one finished clean background plate.
```

# お店の脇の小さな休憩スペース（以前のv3構図）

2026-09-18。保存先: `assets/terrace-nearby-v3.png`（1536×1024、約1.8MB）。内蔵 `image_gen` で編集し、生成結果のPNGを加工せずコピーしています。CLIやAPIでの生成は使用していません。

編集対象は `assets/terrace-foreground-v2.png`、場所・素材の参照は承認済みメインの `assets/storefront-blank-placards-v6.png`。天板の位置・曲線・明るさを参照し、背景を近くの店の一部、淡い舗装、小さな白いベンチへ変更しました。一度目の結果には中央の植栽が多く残ったため、二度目の編集で緑の帯を除き、周辺の葉先と少量の植栽に整理しました。メインの画像、カップPNG、カップの表示サイズ・位置・接地影のコードは変更していません。

風は同じ背景の葉先をCSSマスク内で再利用します。左の領域を画像上端33.2%、右を91%付近へ合わせ、店やベンチに揺れがかからないようにしました。移動量1〜2px、18秒・15.5秒周期と動き軽減・画面外停止は維持しています。天板・カップ上に動く葉影や光条は足していません。

最終プロンプト一式（内蔵 `image_gen`）:

背景の編集:

```text
Use case: precise-object-edit.
Asset type: production photographic background plate for an ice-cream app product-detail hero, landscape 3:2, 1536x1024. Output only the photographic plate, no website UI.

Image 1 is the EDIT TARGET: the existing empty white table and distant park.
Image 2 is a DESIGN AND LOCATION REFERENCE ONLY: the approved main-page vanilla-white kiosk, pale butter-yellow striped awning, slender satin silver trim, light warm stone paving and restrained greenery.

Primary request: redesign ONLY the scenery BEHIND the table so it feels like a small, carefully kept rest spot immediately beside the kiosk in image 2. The current background is too much like a densely planted public park; the new scene should feel quiet, minimal, clean and part of the same little shop. A customer has just bought an ice cream and sat nearby, not walked to another park.

PRESERVE from image 1: the entire empty white satin powder-coated metal tabletop, its precise perspective, scale, texture, brightness, far curved edge and position (middle of far edge around 43 percent of image height and ends around 50 percent). Keep the foreground extending beyond both sides and the bottom, no near rim and no table legs. Keep the focus plane sharp around x52% y83%, where an existing transparent ice-cream cup will be added in code. Leave all the table empty. Keep the 3:2 canvas and camera position.

REPLACE the current scenery above the table's far edge. Remove the black fence/railings, massive tree trunk, dense green shrubs, terracotta pots, distant buildings and the small complete kiosk far away. Bring the SAME kiosk from image 2 close to the LEFT EDGE: show only a cropped modest portion of its warm-white rounded side/corner and a little pale-yellow-and-ivory striped awning, softly out of focus. This partial architecture should occupy no more than the left 20-25 percent of the background and visibly continue beyond the left frame, suggesting the table is about one or two metres to its side. Do not make a second full storefront or show any text.
Behind the table is a quiet expanse of the SAME light cream stone paving as image 2, with soft natural depth. At the far RIGHT edge, include only a small cropped end of a simple warm-white bench with slender satin-silver supports, naturally out of focus; it is a subtle seating cue, not furniture filling the scene. The middle background is airy, light, uncluttered and softly defocused. Keep a small sense of pale open sky and a little muted sage greenery at the upper edges. A few soft real leaf tips enter the top-right corner; a second tiny cluster may enter the very top-left edge. Leaves and plants are peripheral accents, not a forest or a green wall. No prominent trunks.

Light: broad, soft warm-neutral daylight consistent with image 2. Keep the tabletop and future product area steadily and cleanly lit, NO dappled leaf shadows or sunlight patches on the table, NO cup/contact shadow baked into the image. A faint suggestion of soft broken light may fall on the distant paving near the bench only. No dramatic shafts, fog, bloom, hot spots, diagonal streaks or artificial bokeh circles. Photographic realism and natural depth, with finely textured focused table and restrained blurred background. White, ivory, pale stone, small muted sage accents and a hint of soft butter yellow.

Avoid: ice cream, cups, scoops, plates, trays, spoons, people, hands, cars, extra chairs, extensive furniture, black lines, black railings, dark hedges, dense park scenery, wood-brown furniture, legible signs or logos, typography, UI, frames, vignettes. Do not crop, resize, reposition or re-light the foreground table. Produce the revised single clean plate.
```

中央の植栽を減らす最終調整:

```text
Use case: precise-object-edit.
Image 1 is the edit target, a 1536x1024 photographic background plate for a clean ice-cream product detail.
One focused correction: drastically reduce the vegetation in the background. The current continuous horizontal band of dense shrubs and upright trees behind the open paving STILL LOOKS TOO MUCH LIKE A PUBLIC PARK.

Keep the near kiosk fragment on the LEFT exactly as is, the small cropped white bench end on the RIGHT, the pale paving, the gently curved far table edge and ALL foreground tabletop pixels, texture, framing, perspective, light and sharpness unchanged. Keep the same 3:2 canvas. Keep the little leaf tips at the upper-right corner. No cup or product.

REMOVE the dense green belt, all the multiple upright trees across the center, and the conspicuous potted bush immediately beside the kiosk. The background should now be a minimal, airy rest area next to the shop, with a generous pale limestone paved clearing receding gently away. Let the central background be quiet light cream and soft pale sky, with only a very faint far-away hint of muted sage, no readable trunks, no large tree silhouettes, no dense hedge or border of repeated shrubs. Keep only two or three soft peripheral patches of greenery right at the edges. Aim for roughly 75 percent LESS green area than the current image. The small white bench and kiosk fragment provide all the place cues needed. Natural believable photographic perspective and bright open-air daylight, not a studio infinity wall or empty desert. Match the existing gentle lens defocus in the background.

Do not add architecture, people, ornaments, more furniture, flowers, pots, fences, railings, signage, text, harsh shadows, haze, lens flare or sunlight streaks. The tabletop stays clean and steady with NO leaf shadows. Output only the revised production background plate.
```

生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-1e113280-b93f-444d-b1ab-76ca88ab52a9.png`。一度目の生成は同ディレクトリの `exec-75327d7e-7f46-48b2-95cd-5ae6fa544c4c.png`。旧v2は比較用に保持しています。

# 清潔な天板と葉先の風（v2背景での表示）

2026-09-18。商品を明瞭に見せるため、天板の三層の葉影・五つの光の溜まり・カップの葉影を外しました。背景画像、カップPNG、カップの大きさと位置、接地影は変更していません。

風は terrace-foreground-v2.png 内の上端の葉を二箇所だけCSSで切り分け、同じ写真・同じ縮尺を再利用して表します。固定したフェザー付きマスク内で最大1〜2px動き、左18秒・右15.5秒の周期に静止する間を含みます。背景の店・幹・天板やカップには動きがかかりません。写真を生成し直したり、画像ファイル自体を編集したりしていません。動きなしでは元の画素と重なる位置に戻します。

# 天板の遠近に沿う葉影と光（以前の表示・現在は不使用）

2026-09-18。ユーザー提供の `dapple-table-mask.css`、`sun-pools.css` と比較画像をもとに、詳細画面へ固定マスク・三つの深度帯・五つの光の溜まりを採用しました。楕円マスクと倍率・濃度は見た目を合わせるためのパラメータとして扱い、太陽角度や物理的な測定結果としては使用していません。

`assets/terrace-canopy-v2.svg` はコードで作ったv1の図形をそのまま使い、ルートに `preserveAspectRatio="none"` を追加したものです。縦横の倍率を別々に指定したCSS background-sizeに図形を合わせ、天板上の前縮みを表します。元のv1も保持しています。

天板のマスクと奥・中・手前の帯マスクは固定し、その内側の模様だけが動きます。カップも固定したPNGのアルファマスクで切り、内側の模様を動かす構造にしました。五つの光の溜まりは個別に動かさず、手前の葉影と同じ全景サイズの層でまとめて動かします。カップ内も全景座標にそろえるため、同じ21秒周期に加えて移動距離と回転中心が一致します。背景写真・アイスPNG・接地影は維持しています。

# 手元のカップを主役にする背景（以前のv2・現在はv3の参照用）

保存先: `assets/terrace-foreground-v2.png`。内蔵 `image_gen` で生成し、加工せずコピーしました。1536×1024。旧 `assets/terrace-background-v1.png` を、公園・店・白い金属テーブルの参照として使用しています。

手前のカップに視線を集めるため、テーブルの脚と手前の縁を画角から外し、奥の店はぼかしています。天板には木漏れ日を焼き込んでいません。現在はそのまま表示し、動く葉影や光の溜まりは重ねません。既存のカップPNGは維持し、画像全体の高さの約57%を占める表示へ変更しています。

生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-c2d5adec-43f6-4495-8a0a-378aa06294e8.png`

最終プロンプト:

```text
Use case: photorealistic-natural.
Asset type: clean background plate for a responsive product-detail hero, landscape 3:2, preferably 1536x1024 or larger. This is a production website image, not a UI mockup.
Input image 1: reference for the existing park, white ice-cream kiosk with pale yellow striped awning, white metal terrace table, calm warm-white palette. Recompose the camera rather than preserving the old wide view.
Primary request: the view from a nearby terrace seat, ready for one large ice-cream cup to be composited in the immediate foreground. The foreground product will occupy roughly 55-60 percent of the image height, centered at x52%, with its bottom at y84%. LEAVE THIS SPACE EMPTY. Do not render a cup or any product.
Composition: low, intimate, slightly downward product-photography viewpoint, looking down about 18-22 degrees, a 65-85 mm lens feel. The white satin powder-coated metal tabletop fills the lower 60 percent of the frame and continues beyond left, right and bottom edges; the table's far edge may show gently around y43%, but do not show a complete circle, table legs, or large foreground rim. Sharp plane of focus at the middle-foreground tabletop around y82%, where the cup will touch; the far table edge softens naturally.
Distance: the same small white kiosk is 5-8 metres away in the upper-left background, reduced to about 20 percent of the image width. Recognizable rounded roof and pale yellow striped awning, but naturally out of focus, quiet and unobtrusive. A softly blurred green park surrounds it, a little pale blue sky. No chairs intruding into foreground. The scene feels spacious and real, not a miniature diorama.
Lighting: gentle, broad open-shade daylight, warm neutral upper-left light and soft white bounce from the tabletop. The table is evenly and softly lit. IMPORTANT: NO baked-in dappled sunlight, leaf-shadow silhouettes, sharp sun patches, or striped shadows anywhere on the foreground table. These will be animated in code later. Keep natural depth and subtle satin highlights; do not flatten into plain white. No ghost cup shadow or prepainted circular contact shadow.
Materials: believable fine white metal finish, subtle real texture, satin not mirror, not marble. Soft distant photographic bokeh, foreground high-resolution clear texture, no artificial blur on the focus plane.
Avoid: cups, ice cream, dishes, trays, spoons, people, hands, text overlays, UI, graphic design, bloom, glare, lens flare, fog, heavy vignette, grain, strong greens, a full round table, visible table legs. Output only the clean photographic background plate.
```

# 真上から見たアイスのメニュー素材（現在使用）

保存先: `assets/flavor-scoops-top-v2.png`。内蔵 `image_gen` で生成し、PNGを加工せずコピーしました。CLI / API生成・画像の縮小や切り抜き加工は使用していません。1536×1024、RGBA、3列×2行の各区画は512×512。透明な背景を保持しています。

参照画像 `assets/flavor-scoops-v1.png` は、フレーバー・色・素材感の参照のみです。構図を真上から見下ろす視点へ変更しました。アイスの占有幅はCSSでカード幅の約7割にし、画像内の輪郭位置に合わせて中央へ補正します。詳細のカップ素材は既存のまま、表示側のぼかし・色調抑制フィルターを外しています。

生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-ef980a90-579d-4574-8e38-94d872ea693f.png`

最終プロンプト:

```text
Use case: product-mockup.
Asset type: production-ready transparent ice-cream atlas for the square app menu of VANILLA ISN'T BAD.
Input image 1: material, flavor and restrained color reference only. Replace the camera angle completely; do not retain its three-quarter/front view.
Primary request: SIX single bare scoops of realistic ice cream, photographed from directly overhead, camera looking straight down at exactly 90 degrees to the supporting plane. This is a true top-down flat lay. See only each scoop's rounded top surface and irregular circular perimeter, with no front-facing base, no visible side wall, no horizon, no change of perspective between scoops.
Composition: landscape 3:2 canvas, preferably 1536 by 1024 pixels. EXACTLY three equal columns and two equal rows of square cells, no gutters or visible grid. Cell centers at x=1/6, 1/2, 5/6 of the canvas and y=1/4, 3/4. One scoop centered in every cell. Every scoop roughly 70 percent of its cell's width and equal visual size. Generous clear transparent margins. Entire scoop and its tiny contact shadow remain inside its own cell.
Flavors in order: upper row vanilla bean ivory, soft strawberry pink with tiny berry flecks, pale pistachio green with a few small nut flecks. Lower row milk chocolate brown, ivory vanilla with two restrained fine caramel ribbons, very pale mint green with small chocolate flecks. Preserve these identities and their order.
Style: premium natural food photography. Clearly resolved fine scooping ridges and delicate creamy folds; appetizing, believable dairy texture. Natural slightly irregular edges, not mathematically perfect spheres or flat disks. Keep each top sharply in focus without crunchy oversharpening, fuzzy blur, noise, plastic shine or excessive cracks. The shadow and soft upper-left daylight should suggest gentle dome volume even from directly overhead. Restrained colors, cohesive illumination, no harsh specular reflections.
Background: genuine transparent alpha PNG everywhere outside the six scoops, including all empty space. Only a tiny faint semitransparent contact shadow close to each perimeter, consistent direction; no solid background, photographic backdrop, checkerboard, white matte or opaque gray rectangle.
Avoid: cups, cones, bowls, plates, trays, pedestals, utensils, hands, stray toppings, extra objects, drawn circles, labels, lettering, logos, frames, divider lines, UI. Output only the six-scoop production atlas. Do not output a webpage mockup.
```

# 斜め構図のアイス単体メニュー素材（旧版）

保存先: `assets/flavor-scoops-v1.png`。内蔵 image_gen で生成し、生成PNGを加工せずコピー。CLI / API生成や画像加工は使用していません。既存の `assets/flavor-cutouts-v2.png` は質感とフレーバーの参照のみ。3列×2行の各正方形をCSS背景位置で表示します。カップは一覧に表示せず、詳細では元のカップ素材を維持し、接地影と色調はCSSで調整します。

生成元: `C:/Users/funadapd/.codex/generated_images/01a09d8d-5b5f-7c02-971c-8ea1daf97c73/exec-0a566dd5-c30d-4158-a3db-33ac228f9348.png`

最終プロンプト:

```text
Use case: product-mockup.
Asset type: one transparent ice-cream flavor atlas for a calm, premium website menu.
Input image 1 is a flavor, material and color reference only. Create a new atlas of the same SIX flavors as single bare scoops WITHOUT cups.
Composition: landscape 3:2 canvas, exactly three columns and two rows of equal square cells, no gutters or drawn grid. One complete scoop centered in every cell, each about 64 percent of the cell width, all the same size, camera angle and lighting. Clear empty transparent margins on every side. Top row left to right: ivory vanilla bean, soft strawberry pink, pale pistachio green with tiny nut pieces. Bottom row: milk chocolate brown, ivory caramel with two fine caramel ribbons, very pale mint with small chocolate flecks.
Each scoop is naturally rounded with delicate scooping ridges and a subtly flattened irregular lower edge resting on an invisible level surface. Show the complete believable bottom of each scoop, never a cropped hemisphere. Soft photographic detail with quiet, restrained pastel color, no harsh sharpening. Slightly elevated three-quarter product view, soft daylight from upper left, gentle cool reflected fill. A tiny soft semitransparent contact shadow immediately beneath each scoop only.
Genuine transparent alpha PNG background everywhere else. NO cups, cones, bowls, dishes, plates, trays, pedestals, packaging, hands, lettering, labels, logos, grid lines, borders, solid background or checkerboard drawn into the image. Six individual bare scoops only. Keep every scoop and its short shadow completely inside its own square cell. Output the production atlas itself, preferably 1536 by 1024 pixels.

```

# 自然光とケースの画像制作記録

## カップを選べるテラス（現在使用）

承認済みの `assets/terrace-scene-v1.png` を参照し、内蔵 `image_gen` で背景を二種類制作しました。生成PNGを加工せずコピーしています。CLI / API生成や別ツールによる画像加工は行っていません。

- `assets/terrace-background-v1.png` — 1536×1024。元の構図・金属のテーブル・公園・奥の店舗を保持し、三つのカップとUI文字を除去。
- `assets/terrace-background-mobile-v1.png` — 1024×1536。同じ場所をスマホ向けの縦構図で制作。テーブル中央は空に保持。
- カップは既存の `assets/flavor-cutouts-v2.png` をそのまま再使用。配置・名前・用途・操作はHTML/CSS/JavaScriptです。

生成元は `C:\Users\funadapd\.codex\generated_images\01a09d8d-5b5f-7c02-971c-8ea1daf97c73\` 内の `exec-659f5669-434c-4384-83db-64a7c8719c28.png`（PC）と `exec-164893ae-f01f-4b10-9953-3dbdaf1160a2.png`（スマホ）。

最終プロンプト全文は作業フォルダーの `assets/terrace-backgrounds-v1.prompt.txt` に保存しています。プロンプトはGit管理とサイト配信から除外します。

## テラス案のスマホ共有（承認された元の静止画）

`assets/terrace-scene-v1.png`（1536×1024）は、前のターンで内蔵 image_gen により制作した `output/imagegen/terrace-scene-v1.png` を、そのまま公開用の場所へコピーしたものです。今回の共有対応では再生成・加工を行っていません。

`terrace-preview.html` から静止画として確認できます。画面内の文字やボタンは画像の一部です。カップは `flavor-collection-v1.png`、奥の店舗は `storefront-blank-placards-v6.png` を参照して生成しています。プロンプトと参照の記録は作業フォルダーの `output/imagegen/terrace-scene-v1.prompt.md` に保存しています。

生成元: `C:\Users\funadapd\.codex\generated_images\01a09d8d-5b5f-7c02-971c-8ea1daf97c73\exec-db19bdd4-f9d0-40c1-bdbd-b080b38a88d3.png`

## 一つにつながるショーケース（旧配置・透過カップは再使用）

保存先: `assets/flavor-cutouts-v2.png`（1536×1024、透過PNG）。内蔵 `image_gen` で `assets/flavor-collection-v1.png` を編集し、背景を透過しました。CLI / API生成、別ツールによる画像加工は使用していません。採用画像は生成元からそのままコピーし、アルファチャンネルと周囲の透明度を確認しました。

生成元: `C:\Users\funadapd\.codex\generated_images\01a09d8d-5b5f-7c02-971c-8ea1daf97c73\exec-c7a3c124-a22e-4124-bb47-5caf6a8e85e7.png`

PC三列、スマホ二列の配置と札はHTML/CSSです。棚全体を一つの白い筐体で囲み、ガラスの反射と銀の棚板を共有します。PNGの六つの区画をCSSの背景位置で表示し、各画像の白い四角や縁を重ねません。日よけはメインの `storefront-blank-placards-v6.png` をCSS背景で部分表示、周囲の公園は既存 `park-atmosphere.png` を再使用しています。これらのファイルは加工していません。

最終プロンプト:

```text
Use case: precise-object-edit. Image 1 is the edit target, a 1536 x 1024 contact sheet of six ice cream cups in an exact 3-column by 2-row grid. Remove ONLY the plain ivory photographic background and replace it with genuine fully transparent alpha. Retain the six existing cups and scoops, their original positions, dimensions, detailed textures, flavor colors, perspective, lighting, complete bottom edges and equal grid cell boundaries exactly. Do not redesign, crop, move, resize, recolor, add outlines or omit any of the ice creams. Keep a very soft tiny semitransparent contact shadow immediately beneath each cup only; all empty areas between and around the cups must be transparent. The output is a 3:2 landscape PNG with real transparency, an atlas for placing the six cutout cups on a shared shelf background. No white/cream background, no checkerboard drawn into the image, no other objects, no text, no border. Top row vanilla, strawberry, pistachio; bottom row chocolate, caramel, mint chip, unchanged.
```

## 店頭の交換できる札（現在使用・v6）と旧展示用カップ

今回も内蔵 `image_gen` を使用し、CLI / API生成は使用していません。採用PNGをそのまま以下へコピーしています。

- `assets/storefront-blank-placards-v6.png` — v5を編集し、下の三枚の透明な札にある文字だけを除去。札の形、社名、APPS、店の全景を維持。HTMLで名前と用途を重ねます。
- `assets/flavor-collection-v1.png` — 六種類のカップを3列×2行で新規生成。CSSの背景位置だけで各区画を表示します。画像を切り出したり、色を加工したりしていません。

店頭は同じ三つのバニラのトレーです。データの flavor は別画面のカップに対応し、店のトレーそのものの色は変えません。新作・おすすめ・季節の表示、アプリ名・説明・リンク・詳細画面はHTMLで管理します。

### 店の編集に使用した最終プロンプト

```text
Use case: precise-object-edit. Image 1 is the edit target. Remove ONLY the printed letters from the THREE small transparent glass placards INSIDE the lower ice-cream display. Erase 'Focus / Focus timer', 'Notes / Keep a note', and 'Trip / Plan a trip'. Leave the three glass plates themselves exactly in place, with their existing transparent material, thin edges, proportions, reflections and vanilla visible through them. They must be completely blank with no lettering or symbols; HTML will add replaceable words later. Preserve EVERY other pixel and design as closely as possible: exact square composition, whole shop and park, roof and VANILLA ISN’T BAD. wordmark, awning, APPS hanging sign, all equipment and cones/cups, vanilla trays, fixed glazing, feet, daylight, color and photographic realism. Do not crop, zoom, stretch, restyle, reposition, add anything or change any other text. Return the complete full-size edited square photograph.
```

### 展示用カップに使用した最終プロンプト

```text
Use case: product-mockup. Create a photographic contact sheet of SIX miniature artisanal ice creams for the VANILLA ISN'T BAD app showroom. The output is an exact 3-column by 2-row grid of SIX EQUAL SQUARE cells, overall landscape 3:2 aspect ratio. No gutters, frames, panels, dividers, text or labels. Every cell has the SAME perfectly plain warm-white background, same light, same object size and same straight-on slightly elevated camera. One realistic single scoop in a plain small matte ivory paper cup is centered in EACH cell. Entire cup and scoop visible with generous 18% breathing room on all four sides, soft small contact shadow, delicate tactile ice-cream ripples, premium quiet studio photography, tiny collectible feeling, not cartoon or glossy plastic. Color restrained, appetizing pastel rather than saturated. Top-left vanilla bean ivory. Top-center pale strawberry pink with tiny berry flecks. Top-right pale pistachio green with a few tiny nut flecks. Bottom-left light chocolate brown. Bottom-center cream vanilla with two very fine caramel ribbons. Bottom-right extremely pale mint green with tiny chocolate specks. Each cell is visually independent and exactly one-third of width and one-half of height; do not let cups or shadows cross cells. Consistent flat background so the six squares can be displayed separately as website thumbnails. No cones, spoons, extra props, decorative circles, pedestal, flowers, lettering, logos, watermarks or interface elements.
```

## 店の全景と距離感（旧v5）

保存先: `assets/storefront-complete-v5.png`（1254×1254）。承認済みの `output/imagegen/storefront-distance-study-v1.png` をバイト単位でそのままコピーしています。今回のサイト反映で再生成・画像加工は行っていません。

制作方法: 内蔵 `image_gen`。`assets/kiosk-warm.png` をシルエットの基準、`assets/vanilla-counter-interior.png` をアイスと金属の質感の基準として一枚に生成し、右奥の機器のみソフトクリーム機へ修正しました。CLI / API生成は使用していません。最終プロンプトセットは [storefront-complete-v5.prompt.txt](./assets/storefront-complete-v5.prompt.txt) に保存しています。

丸い屋根、布の日よけ、店内のコーン・カップ・スクープ・機械、共通のガラスケース、短い足元、公園を一つの視点と光でまとめた構図です。PCもスマホも幅100%・最大900pxで全体を表示し、画角を寄せません。CSSの薄いガラス、追加光、棚の冷気だけを重ね、背景と地面の外縁をページ色へなじませます。

ユーザーの「そのままサイトに反映」に合わせ、今回は画像内の社名・APPS看板・英語の三枚の札もそのまま使用します。構図制作時に記した「文字をSVG / HTMLへ分離」は今回行っていません。APPS看板にはHTMLリンク、画像の直下には三件の名前と用途をHTMLで添え、操作・日英切替・読み上げを補います。画像内の札は固定の構図確認用サンプルで、実アプリのデータとは連動しません。

## 横に広がる売り場（旧v4）

保存先: `assets/storefront-horizontal-v4.png`（1942×809）。内蔵 `image_gen` で `assets/storefront-balanced-v3.png` を編集し、生成PNGをそのまま保存しました。CLI / API生成は使用していません。旧画像は比較用に保持しています。

スマホ専用の縦長店舗を廃止し、PCとスマホで一枚の横長画像を共有します。横幅は最低760px・通常は表示幅の118%。画面の中央で左右を切り取り、店を縦長に作り替えません。窓の側壁と深い天井を除き、低い奥の作業台、カップとスクープで寸法感を補いました。手前の白い受け渡し台は一枚です。

棚は以前の横長画像 `assets/vanilla-counter-interior.png`（1586×992）を再使用し、7:4の区画へ幅112%で表示します。画像ファイルの加工はしていません。一区画は `min(82%, clamp(300px, 250px + 14vw, 520px))` で画面幅に応じて緩やかに広がり、スマホでは約1.22個が見えます。仕切りは下側66%だけの3px幅へ薄くし、上側のガラスを一続きに見せます。ガラス札の文字サイズは維持しています。

採用プロンプト:

```text
Use case: precise-object-edit.
Asset type: photorealistic storefront background for an app-company website. One landscape artwork will be used both on desktop and as a CENTRAL CROP on mobile. The mobile crop must feel like part of a long counter, never a single-person cubicle.

Image 1 is the edit target and material reference. Keep the same white painted storefront, muted vanilla-yellow / white woven awning, softly rounded scallops, natural daylight, thin brushed silver hardware and one ivory handover counter at the very bottom. Keep the blank fascia with NO text. Real photograph quality, understated and believable, subtle variation, no glossy CGI perfection.

Change the spatial proportions and interior:
Make a wide landscape image about 2.4:1. The white fascia is the top 22%, the fabric awning occupies about 22–46%, the serving opening runs across 6–94% of image width and from about 46–87% of its height. It is a very wide, relatively LOW service opening. The single foreground handover countertop occupies the final 13% and meets the exact bottom edge. Keep its straight horizontal edge continuous across the whole width, without a large empty band beneath it.
Eliminate the narrow-room feeling: remove the side windows, deep ceiling and vertical planked rear wall. Use a quiet matte ivory rear wall with a LOW continuous rear worktop extending left and right. Rear worktop has a slim stainless edge and is clearly farther back and a little higher in the image than the foreground handover counter; no duplicate front counter or stacked front rails.
At x40% place only a small believable stack of plain white paper ice-cream cups and a stainless ice-cream scoop resting on a small shallow utensil tray. These are modest physical scale cues, not focal decorations; leave the rest uncluttered. A tiny shallow ceiling soffit and soft diffuse task light, no spotlights or theatrical light cones.
The vertical outer jambs should sit near the far image edges at x6% and94% so they are outside the mobile central crop. Wide horizontal lines and believable shallow depth are the priority. Front-facing camera at customer height, straight verticals, no fisheye. No person, no booth-shaped recess, no tall empty cavity, no floor, no wheels, no storefront side edges, no separate framed little rooms.
NO glass panes or door handles baked into the picture: sliding glass and handles will be overlaid by the website. NO lettering, logo, sign, labels, UI, watermark or ice-cream cabinet below. Keep fascia empty for vector wordmark. Do not include the app shelf; it joins directly below this image.
The output is the finished landscape storefront artwork itself, not a mockup on a phone.
```

## 店舗と棚の比率を揃えた画像（v3・旧版）

保存先:

- `assets/storefront-balanced-v3.png`（1882×836、PC用）
- `assets/storefront-balanced-mobile-v3.png`（1173×1341、680px以下用）
- `assets/vanilla-counter-balanced-v2.png`（1484×1060、棚の一区画）

制作方法: 内蔵 `image_gen`。CLI / APIによる生成は使用していません。店舗v2のPC・スマホ画像をそれぞれ編集し、窓の後壁の高さを抑えました。各初稿をさらに編集し、カウンター下に残った余白を除去しています。棚は `assets/vanilla-counter-interior.png` を編集し、トレーを細めの7:5にして見下ろしを弱めました。採用PNGは生成結果をそのまま保存しています。旧素材は保持しています。

店舗は一枚の画像として自然な比率で表示し、縦方向に押しつぶしません。棚の幅は20%狭め、7:4から7:5に変えることで区画の高さを維持しました。札の左右余白を調整し、札そのものの幅と文字サイズを保っています。画像は固定の窓枠・天板・素材の陰影を担当し、ガラスの開閉・札・反応する光・横移動はHTML/CSS/JavaScriptで実装しています。

最終プロンプトセット（スマホ・PCそれぞれ初稿の後に接続部分を修正）:

### 1. スマホの受付窓を低くする

```text
Use case: precise-object-edit.
Asset type: revised mobile storefront base for a website.
Image 1 is the edit target. Preserve the same ivory shop, muted butter-yellow and white woven awning, blank fascia, permanent silver side jambs, subtle twin ceiling lights, and single ivory handover countertop. Same front-facing level camera, colour, lighting and fine material detail. No new objects.

Fix only the vertical proportions: the serving opening is much too tall and looks like an empty room. SHORTEN THE OPEN WINDOW BY 30 PERCENT by removing a broad horizontal portion of the featureless vertical-panelled rear wall. Keep the opening's exact WIDTH and jamb x positions. Keep the blank fascia, fabric awning, ceiling depth and countertop at their original physical sizes relative to the image width. Move the countertop and bottom window track UP to meet the shortened side jambs. Do not add blank wall below the counter. The canvas itself becomes shorter, about 7:8 width-to-height rather than the reference's 3:4. Do not squash or stretch all the materials to fit.

Target composition in the NEW 7:8 canvas: fascia from 0 to 22%, awning from 22 to 45%, open serving aperture from 45 to 85%, thin rear track about 85%, single projecting white countertop from 87% to the bottom. At the same width, the open aperture is approximately 70% of its former height. The top of the image and the awning keep their original relative widths. Maintain both permanent jambs clearly inside the canvas, the quiet recessed ivory interior and its believable side reveals. The image ends immediately beneath the countertop's front edge and small shadow.

NO front glass, sliding doors, center divider, handles, lettering, logos, APPS sign, register, food, props, lower cabinets, ice cream shelf, wheels or feet. The movable glass and the separate shelf are added in HTML. Output only this corrected shorter 7:8 storefront image.
```

### 2. スマホの天板下の余白を除く

```text
Use case: precise-object-edit.
Image 1 is the edit target. Keep the exact same 7:8 canvas, width, blank fascia, awning, two ceiling lights, lighting, materials and fixed side jamb x positions.
Make ONE correction at the bottom: remove the empty ivory wall area below the projecting countertop. Move the existing countertop DOWN by about 55 pixels in this 1173 by 1341 image, so its front face ends near y=1323 and only its short natural underside shadow reaches the bottom at y=1341. Keep the countertop's existing thickness and depth exactly; do not stretch it.
Extend the window's quiet rear wall and both fixed side jambs DOWNWARD by that same 55 pixels so they meet the relocated track and countertop. The awning and the top of the open window remain exactly in place. This makes the opening slightly taller than this input, while still much shorter than a doorway. The finished picture must end immediately under the countertop's lip, with NO blank body panel below it. Keep the window completely open, no front glass, center dividers or handles. No text, objects, products, extra ledges or decorations. Output the complete refined image.
```

### 3. PCの受付窓を低くする

```text
Use case: precise-object-edit.
Asset type: revised wide storefront base for a website, landscape 9:4.
Image 1 is the edit target. Preserve the exact same warm ivory storefront, woven vanilla-yellow striped awning, blank fascia, two subtle ceiling lights, permanent narrow silver jambs and single white projecting handover counter. Same front-facing level camera, lighting, width, textures and palette. No new objects.

The serving window is too tall and the empty rear wall dominates. SHORTEN ONLY THE OPEN APERTURE BY ABOUT 25 PERCENT at the same image width. Remove a horizontal portion of the empty vertical-panelled rear wall. Shorten the side reveals and both permanent side jambs consistently. Bring the bottom track and single countertop upward to meet them. Keep the fascia height, awning height, ceiling depth and countertop thickness unchanged relative to the width. The overall canvas becomes shorter, approximately 9:4 rather than 2:1. Do NOT vertically squeeze the whole image, do NOT stretch the awning or thicken the countertop, and do NOT put a blank panel below the counter to fill the old height.

Target coordinates in the NEW 9:4 canvas: blank fascia 0–25%; striped awning 25–49%; clear open window 49–83%; one thin rear track at 83%; single countertop from 85% to the bottom. Keep the inner left/right jambs at roughly 16.6% and 83.4% of the canvas width. They must remain visible when the outermost 10% of each side of the image is cropped on the website. The rest of the facade and the countertop continue beyond the side edges. Preserve subtly shaded side reveals and quiet recessed ivory rear panels; keep the interior empty. The aperture should feel like a low serving hatch, not a room or doorway.

End the canvas directly below the countertop's front face and a narrow natural underside shadow: no blank wall or background band under it. No front glass, door handles, central mullions, text, logos, signs, props, register, food, ice cream cases, lower cabinet, wheels or feet. Glass and shelf will be added in HTML. Output only the corrected wide 9:4 storefront base.
```

### 4. PCの天板下の余白を除く

```text
Use case: precise-object-edit.
Image 1 is the edit target. Keep the exact same 9:4 canvas, width, blank fascia, awning, two ceiling lights, all materials, lighting and permanent side-jamb x positions.
Make ONE correction: remove the empty ivory wall band below the projecting countertop. Move the SAME countertop DOWN by about 52 pixels in this 1881 by 836 image, so its front face ends near y=820 and only a short natural underside shadow reaches y=836 at the bottom edge. Keep the countertop's exact existing thickness, depth and rounded edge; do not stretch it.
Extend the open window's quiet rear wall and its two fixed side jambs DOWNWARD by the same amount, to meet the relocated track and countertop. Keep the awning and the TOP of the opening completely unchanged. This increases the opening's current height a little, while keeping it a low serving window. There must be NO blank body panel or background band below the countertop. The finished picture ends immediately under its front lip. Do not add front glass, handles, center dividers, text, objects, food or extra ledges. Output the complete refined wide image.
```

### 5. 細めのトレーと控えめな見下ろし角度

```text
Use case: precise-object-edit.
Asset type: one narrower bay inside a continuous ice cream counter on a website, landscape 7:5.
Image 1 is the edit target. Preserve the creamy vanilla ice cream with natural fine spatula swirls, quiet ivory interior, satin stainless steel, soft daylight, restrained silver reflections and realistic photographic material quality. Recompose the SAME tray and cabinet for a narrower 7:5 bay. This is the interior of a continuous counter, not a separate appliance or an isolated product shot.

Correct scale and viewpoint: the reference looks like an enormous wide catering pan seen from high overhead. Make the tray a modest normal gelato pan, less wide, with believable depth. View the counter from a customer's standing position in front of the shop: a level, nearly frontal camera with only a GENTLE downward view of the ice cream surface, approximately 15–20 degrees, much shallower than the reference. Keep verticals vertical and the long horizontal rim straight. Show a naturally foreshortened ice cream surface and a low narrow silver front wall of the pan. Do not compensate by stretching the food or filling almost the whole image with the top surface.

Composition in 7:5: a quiet ivory rear wall occupies about the upper 35%; the tray and vanilla occupy the middle and lower 50%, with the actual cream surface about 35–40% of total image height; a small clean neutral foreground lip occupies the bottom 15% for a separate HTML glass label. Center the tray with slight breathing room at its left and right edges; no deep isolated cubicle walls. Upper trim, if visible, is just one thin satin silver edge. Do not create a stack of shiny horizontal bands or dark black gaskets. No full outer enclosure, no thick white frame, no rounded perimeter corners, no front glass reflections. Left and right canvas edges should join smoothly to neighboring repeated bays under shared thin HTML mullions. The upper and lower tones should match the attached source so this connects under the existing ivory handover counter.

Keep the ice cream appetising and tactile, pale neutral vanilla rather than orange/yellow. No scoop, cup, cone, label, text, logo, handles, props, people or decoration. No gold glow, broad glare or harsh black outlines. Output only this revised narrower bay interior, 7:5 ratio.
```

## 窓と一枚の受け渡し台を分けた旧ベース画像（v2）

保存先:

- `assets/storefront-counter-v2.png`（1774×887、PC用）
- `assets/storefront-counter-mobile-v2.png`（1086×1448、680px以下用）

制作方法: 内蔵 `image_gen` による画像編集。CLI / APIでの生成は使用していません。元の `assets/storefront-rich-open-v1.png` を編集し、PC版を一度修正。そのPC版を参照してスマホ専用の縦構図を生成し、下端を一度修正しました。採用したPNGは加工せずコピーし、旧画像を保持しています。

固定窓枠を画面内に残し、銀の段差を一枚の白い天板へ整理しました。天板の上面・前面・下の影を描き、棚はその直下につなぎます。画像内には正面ガラスや取っ手を描かず、HTMLで固定の側面ガラスと中央の引き戸を重ねます。左右の引き戸は固定ガラスに重なって停止し、天板の手前には出ません。スマホは横長画像の中央切り抜きではありません。

最終プロンプトセット（下記の順に編集）:

### 1. PC構図の構造整理

```text
Use case: precise-object-edit.
Asset type: photorealistic upper storefront base for a responsive website, landscape 2:1, high resolution.
Image 1 is the edit target. Preserve the recognizable warm white ice cream shop, pale butter-yellow and ivory woven scalloped awning, blank painted fascia, two subtle ceiling lights and front-facing level camera. Preserve the refined natural material texture and soft daylight.

Correct the ARCHITECTURE so the visitor immediately understands an open serving window, a single handover counter in front, and space for a separate ice cream display below. No text and no products.

Keep the outer facade extending off the left and right canvas edges. Place the LEFT and RIGHT fixed window jambs clearly INSIDE the image, at approximately 15% and 85% of image width. These two permanent narrow satin-silver frames must remain visible when the outer edges of this wide image are cropped by about 10%. Between them is one open serving aperture, with a quiet recessed ivory interior, subtly shaded side reveals, fine vertical painted wall panels and a simple ceiling. The fixed side jambs have realistic thickness and clear but soft contact shadows. No front glass, no center mullions, no handles: the separate glass mechanism will be added in HTML.

Composition proportions: blank white fascia upper 23%; striped cloth awning from 23% to 43%; open serving window roughly 44% to 86%; one handover counter occupies the bottom 14%. Keep the single counter's top below the open aperture.

Completely remove the confusing STACK of stainless horizontal ledges, backsplash bands, duplicate countertops and parallel chrome rails across the lower part of the reference. Replace them with ONE continuous warm ivory solid-surface handover countertop running edge to edge. The top plane is visibly horizontal and projects forward toward the viewer from the bottom of the window. Give it a softly rounded front edge, a clearly visible modest thickness, a quiet slightly darker ivory front face, and ONE natural soft shadow underneath. The top is a little brighter than the front face. This must read as a place to put and receive something, not a decorative metal stripe. At the back edge of this countertop, where the serving glass will meet it, include only ONE narrow satin silver sliding track. The fixed side jambs visibly terminate at this same track and countertop. The lower edge of the image ends immediately beneath the single countertop's front face and its shadow. The ice cream cases below are separate website elements and MUST NOT appear in this image.

Inside the shop keep the back wall quiet and subtly darker than the front, with minimal unobtrusive ivory surfaces. No tall silver backsplash, no shiny broad metal bands and no second strongly outlined worktop inside. Show restrained architectural depth through the side reveals and lighting, not a stack of horizontal lines.

No lower cabinet, feet, wheels, register, objects, food, cups, cones, signs, writing, logos, people, plants, exterior landscape, border or watermark. Fixed white paint, cloth and satin silver retain the reference's tactile realistic quality. Output only this corrected wide storefront base.
```

### 2. PC構図の固定枠を内側へ

```text
Use case: precise-object-edit.
Image 1 is the edit target. Make exactly one structural correction: move BOTH permanent silver side jambs of the serving window inward, so the left jamb is at 15% of the whole image width and the right jamb is at 85%. Currently they are near the canvas edges. The open window must be only 70% as wide as the canvas, not almost full width. Fill the widened left and right exterior piers with the SAME warm white painted material as the fascia. Each side pier should clearly occupy approximately one seventh of the canvas width.
Preserve EVERYTHING else from image 1: the 2:1 canvas, blank fascia, awning, its stripes and folds, two ceiling lights, quiet ivory panelled interior, the new single warm ivory countertop, its thickness and natural underside shadow, lighting, colour and photographic material detail. The countertop continues across the full canvas width. Do not add rail stacks, glass, doors, handles, text or objects. The framed opening remains entirely open and the side jambs end at the narrow rear track immediately above the single countertop. Output the complete revised 2:1 storefront.
```

### 3. スマホ専用の縦構図

```text
Use case: precise-object-edit.
Asset type: portrait 3:4 responsive website storefront artwork.
Image 1 is the corrected desktop storefront and is the design and material reference. Create its PORTRAIT MOBILE COMPOSITION, showing the same architecture and the same materials in a narrower storefront opening, not a center crop of the wide image. Straight-on level camera, no tilt.

Both permanent satin-silver window jambs MUST be visible inside the portrait composition, near 8% and 92% of canvas width. The outer facade and full-width countertop continue off both sides of the canvas. The two side jambs remain clearly readable and enclose one fully open serving window. The window is not blocked by any front glass, moving pane, central divider or handle; these will be added separately in HTML.

Composition: blank warm white painted fascia occupies the upper 19%; pale vanilla-yellow and ivory woven scalloped awning occupies the next 19% with about 6 or 7 broad stripes; the tall open serving aperture occupies approximately 39% to 88% of canvas height; ONE projecting warm ivory solid-surface countertop finishes the lower 12%. A quiet recessed ivory panelled interior with two faint ceiling lights, subtly darker back wall and visible side returns. No second worktop or stainless backsplash across the inside.

Maintain the reference's SINGLE countertop: a clearly readable bright horizontal top, modest softly rounded front thickness, slightly darker ivory front face and one soft underside shadow. Only one very thin silver glass track at the rear edge, where both fixed jambs terminate. No stacked ledges, repeated chrome bands or multiple front edges. End the image immediately beneath the countertop's underside shadow. No lower ice cream display in this image, no cabinets, feet, wheels, objects, register, cups, plants, words, logo, APPS sign, people or scenery.
Preserve fine painted texture, real woven fabric and satin silver details under soft neutral daylight. Airy premium white, restrained butter yellow, physically legible depth. Output only the portrait 3:4 storefront base, high resolution.
```

### 4. スマホ構図の天板下の余分な壁を除去

```text
Use case: precise-object-edit.
Image 1 is the edit target. Keep the 3:4 canvas and preserve the fascia, awning, widths, window jamb positions, lighting and all materials exactly.
One layout correction: REMOVE the large blank wall area BELOW the countertop. Move the same single countertop downward so its front edge and short underside shadow end at the very bottom of the canvas. Extend the open window and the two fixed side jambs downward to meet the relocated countertop. The top of the window and awning stay in exactly the same place. Extend the quiet ivory rear wall vertically, without new seams or objects.
The result has a taller open serving aperture and no empty body panel underneath the counter. Keep the countertop's existing thickness and horizontal top plane; do not stretch its thickness. Its top begins around 88% of canvas height, its front edge around 95%, and its underside shadow ends at 100%. No extra shelves, metal bands, products, glass, text or props. Output the revised full portrait 3:4 image.
```

## 店舗上部の質感を強化した旧ベース画像（v1）

保存先: `assets/storefront-rich-open-v1.png`（1774×887）。制作方法: 内蔵 `image_gen`。元の `assets/kiosk-warm.png` を編集対象、`assets/vanilla-counter-interior.png` を素材と照明の参照にして生成した、ユーザー承認済みの画像です。生成結果をそのままコピーし、旧画像と確認用の `output/imagegen/storefront-rich-open-v1.png` は保持しています。

白い外装、織り目のある日よけ、固定の銀枠、奥行きのある店内、カウンターを一枚にまとめた旧版です。正面の可動ガラス、社名、APPS看板、アプリ棚は含めません。v1では独立した2枚のガラスが窓の外へ動き、棚へは5pxの継ぎ目で接続していました。現在は上記v2の構図と引き戸に置き換えています。

最終プロンプト:

```text
Use case: precise-object-edit.
Asset type: production website background artwork, one integrated upper storefront base, landscape 2:1 ratio, high resolution.
Input image 1 is the edit target: our current ivory ice cream kiosk. Input image 2 is a material and lighting reference only: the existing realistic ice cream counter that will be placed BELOW this new artwork in HTML. Do not reproduce the ice cream counter in this image.

Upgrade the physical richness of the SAME recognizable storefront: warm white painted fascia, muted vanilla-yellow and ivory striped scalloped fabric awning, a broad open serving window, and a slender continuous satin stainless steel service counter. Keep the understated, approachable modern character and the neutral palette. This is a close, perfectly front-facing architectural product photograph, square-on and level, symmetrical construction, no perspective tilt or camera rotation.

Composition: show only the upper storefront, from the white fascia at the top down to the silver service counter at the very bottom. Crop the building's far left and far right outer edges so the storefront fills the entire width and continues beyond the canvas. Preserve a generous clean blank white fascia above the awning for a separately overlaid wordmark. The fascia occupies roughly the upper 25 percent, the fabric awning the next 22 percent, the open serving aperture and its recessed interior the next 45 percent, and the silver counter the bottom 8 percent. The bottom edge ends exactly at the continuous front counter lip, suitable for connecting to a separate horizontally scrolling display shelf below. No lower cabinet, no ice cream bays, no plinth, feet, wheels, ground, exterior scenery, or website layout.

Materials: subtly textured warm-white painted enamel with a fine real paint surface and softly rounded highlights, never plastic or rough plaster. The striped awning has fine woven canvas, restrained natural sag, slight variation in the folds, believable thickness and delicate stitched hems. Its yellow is lightly desaturated butter yellow. Window trim and counter are finely brushed satin stainless steel with consistent silver tone, gentle linear highlights, real beveled edges and restrained reflections, no chrome glare and no thick black outlines. Match the softly photographic detail of image 2, without its yellow spotlight intensity.

The serving window is FULLY OPEN across the opening. The transparent sliding glass doors will be added later in code. Do not render any front glass pane, front reflection, sliding door, central divider, center seam, door handle or moving glass frame across the opening. Keep only the fixed perimeter trim and shallow top/bottom tracks. Behind it is a quiet, empty, recessed ivory interior with a ceiling, softly visible side returns, a back wall of finely joined vertical painted panels and an empty worktop. Make the depth feel physically convincing with small contact shadows and a slightly darker rear wall, while keeping it airy and welcoming. Remove the existing folded cloth. No additional props.

Lighting: broad soft natural daylight from slightly above and in front, very gentle recessed ceiling fill. Delicate shadows beneath the canvas awning, along the frame joints, and under the counter lip. Rich material detail within a light palette, no dramatic spotlight pools, gold glow, harsh shadows, heavy vignette, artificial bloom or exaggerated ambient occlusion.
No words, letters, logos, signs, APPS plaque, UI, people, food, cups, cones, plants, decorations, or watermark. Output only this integrated upper storefront base image, with all its fixed parts sharing the same lighting.
```


内蔵 image_gen を使用。CLI / API での生成は使用していません。

## 採用素材

- `assets/vanilla-tray-daylight.png` — `assets/vanilla-tray-preview.jpg` を編集。黒い縁を細い銀の継ぎ目へ変更し、昼光に馴染む白と控えめな暖色照明に調整。元画像は保持。
- `assets/park-atmosphere.png` — 淡い緑と地面を含む、遠景用の新規生成画像。サイトでは不透明度とマスクでさらに弱め、店の背景にだけ表示。

いずれも生成結果のPNGをそのまま保存しています。窓のガラス、札、接地影はHTML/CSSで実装しています。

スマホ用背景: `assets/park-atmosphere-mobile.png`。内蔵 `image_gen` で、横長の公園をスタイル参考に縦3:4の別構図を生成しました。元の横長画像は保持しています。スマホではこの縦画像を全幅で使い、PCでは横画像を使います。CSSの透過はPC88%・スマホ82%。画像の高さは画面幅から決まり、棚の段数には依存しません。

## スマホ用背景の最終プロンプト

```text
Use case: photorealistic-natural.
Asset type: portrait responsive background for a warm minimal app company's ice cream kiosk website.
Input image: the supplied park image is a style and lighting reference only.
Create a separate 3:4 portrait composition of this quiet sunlit park. No kiosk, no product, no text. Preserve the reference's ivory and muted sage palette, pale stone paving and soft photographic depth of field, but make the muted greenery visibly present along both side edges of the portrait composition. Large uncluttered bright open center for a website kiosk overlay. Soft distant trees on the left and right from about 15% to 70% of image height, a quiet low horizon at 70%, pale warm limestone paving across the bottom 30%. Upper 15% fades naturally into very pale cream sky. Green leaves should be recognisable as foliage shapes but out of focus, with moderate gentle contrast, not almost entirely white. Realistic diffuse daylight and contact-free empty ground. Calm premium material photography. No people, buildings, benches, signs, pots, ice cream, letters, logo, watermark or decorations. Portrait 3:4 ratio.
```

## 横一段の棚の内装画像

保存先: `assets/vanilla-counter-interior.png`。制作方法: 内蔵 `image_gen`。入力は `assets/vanilla-tray-daylight.png`。厚い白い外枠を外した8:5の内装画像を生成し、元画像は保持しました。Web上では7:4の区画に少し寄って表示し、画像両端の重複する金具を避けて、共通の6pxの銀の仕切りをHTML/CSSで重ねています。文字・ガラス札・操作ボタンは画像に含めていません。

最終プロンプト:

```text
Use case: precise-object-edit.
Asset type: one interior bay of a continuous ice cream display counter for a website, landscape 8:5 composition.
Image 1 is the edit target and material reference. Keep the vanilla ice cream, its fine natural swirls, satin stainless steel tray and realistic softly lit cream interior, seen straight on at the same slightly elevated camera angle.
Remove the entire thick rounded white outer housing and its black gasket. Extend the interior to all four edges of the image. This is an edge-to-edge close-up INSIDE a long shop display counter, NOT a separate white appliance or a standalone framed box. There must be no enclosing perimeter frame, no rounded corners and no visible exterior background.
One broad tray of vanilla fills the lower 60 percent. The upper 40 percent is quiet warm ivory back wall with soft daylight illumination, a very slim continuous satin-silver horizontal shelf rail at the top. The left and right edges should be straight, subtle and suitable for placing several identical bays next to each other with thin HTML silver mullions over the joins. Avoid deep side walls that create isolated cubicles. Keep realistic restrained silver reflections and pale creamy vanilla; no heavy black lines, no amber spotlight circles. Delicate physical texture, premium photographic realism.
No cup, cone, scoop, words, logos, placards, knobs, handles, thick borders or objects. Empty foreground lip available for a separately overlaid glass nameplate. Output only the edited bay interior in landscape 8:5 ratio, high resolution.
```

## ケースの最終プロンプト

```text
Use case: precise-object-edit. Asset type: a 5:4 website ice cream display case background, viewed absolutely straight on. Image 1 is the edit target. Preserve its exact front-facing composition, outer rounded white housing, interior perspective, single stainless tray filled with vanilla ice cream, empty upper interior, relative dimensions and 5:4 framing. Remove the strong black rubber-looking outline all the way around the inner opening; replace it with a very thin softly reflective satin silver seam and light warm-gray occlusion, with no continuous near-black border. Keep the metal tray realistic but soften overly dark outlines. Make the lighting consistent with soft natural daylight on warm matte white paint; interior lights are only faintly warm, not amber/golden. Retain detailed natural ice cream texture, subtle material grain, delicate silver reflections and grounded shadows. Clean, believable, understated premium product photography, not shiny plastic. Do not add objects, scoops, cups, cones, plaques, text, logos or graphics. Keep all structural edges and the generous frame in their existing locations. Output only the edited image.
```

## 背景の最終プロンプト

```text
Use case: photorealistic-natural. Asset type: a very subtle wide photographic backdrop behind an existing white ice cream kiosk on a minimalist website. Generate only an empty sunlit park setting, no kiosk and no objects in the foreground. Wide 16:9 composition. Bright neutral ivory light, faint desaturated sage-green foliage at the far left and far right in the distance, a pale warm-gray fine stone ground occupying the bottom quarter, and a barely perceptible soft ground horizon. The entire distant background is strongly optically defocused, like a product photograph at a wide aperture, while the ground is softly detailed. Large luminous empty central and upper area for a separately composited storefront; blend toward near-white warm ivory at the outer edges. Subtle diffuse dappled daylight, calm natural atmosphere. Very low contrast and low saturation; not a forest, no visible dark trunks, no distinct leaves, no people, furniture, buildings, signs, ice cream, text or logos. Avoid dramatic bokeh circles, obvious lens flare, artificial gradients or a colorful scenic landscape. It should suggest an airy park without competing with a sharply focused white product in front.
```

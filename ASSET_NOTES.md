# 自然光とケースの画像制作記録

## 窓と一枚の受け渡し台を分けたベース画像（現在使用）

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

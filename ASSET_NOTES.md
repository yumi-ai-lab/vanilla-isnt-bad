# 自然光とケースの画像制作記録

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

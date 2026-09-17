# VANILLA ISN'T BAD.

VANILLA ISN'T BAD. のレスポンシブな紹介サイトです。空と短い哲学から、一つにつながった店とアプリの棚へ進む構成です。

今後の更新の基準は [デザインの基本ルール（仮）](./DESIGN_RULES.md) にまとめています。文字サイズ・余白・棚の形に加え、店から選択、詳細へ進む順序と動きを記録しています。

メイン画面は `a50c0c2` の状態で一旦完成。以後の変更はテラスとメニュー側を中心に行い、メインのお店・文章・配置・演出は維持します。

## GitHub Pages

GitHubリポジトリ: https://github.com/yumi-ai-lab/vanilla-isnt-bad

公開先: https://yumi-ai-lab.github.io/vanilla-isnt-bad/?lang=ja

カップを選べるテラス: https://yumi-ai-lab.github.io/vanilla-isnt-bad/apps.html?lang=ja

元のテラス案の画像確認: https://yumi-ai-lab.github.io/vanilla-isnt-bad/terrace-preview.html

画像確認ページは静止画のデザイン案です。スマホからも開けるHTTPSのURLで共有し、画像そのものを大きく開くリンクを添えています。

main ブランチを更新すると、GitHub Actions が構文チェック・テスト・ビルドを実行し、成功した場合に dist/ を GitHub Pages に公開します。プルリクエストではチェックだけを実行します。実行状況はリポジトリの Actions タブで確認できます。

GitHub Pages 上のサイトは、PCを起動していなくても、別のWi-Fiや携帯回線から確認できます。ローカルで編集しただけでは公開サイトは変わりません。変更をコミットし、GitHubへpushしてmainに反映する必要があります。

新しいリポジトリに再設置する場合は、Settings → Pages → Build and deployment → Source を GitHub Actions に設定してください。ワークフローは .github/workflows/pages.yml です。独自ドメインは設定していません。

## 起動

Node.js 22 以降で、次を実行してください。外部パッケージのインストールは不要です。

    npm start

http://127.0.0.1:4173 を開きます。別のポートを使う場合:

    npm start -- --port 4174

英語版は ?lang=en、日本語版は ?lang=ja で表示できます。画面右上の EN / JA ボタンでも切り替えられます。

## スマホで確認する

スマホとこのPCを同じWi-Fiにつなぎ、次を実行します。

    npm run preview:phone

表示された「Phone preview」のURLをスマホのSafariまたはChromeで開きます。127.0.0.1 や localhost は、URLを開いている端末自身を指すため、スマホからPCを見るためには使えません。

確認中はPCを起動したままにし、スリープさせないでください。ターミナルで起動した場合は、ターミナルも開いたままにします。Ctrl+Cで終了します。別のWi-Fiや携帯回線からはアクセスできません。ゲストWi-Fiで端末同士の通信が禁止されている場合は、通常の同じWi-Fiに接続してください。

複数のネットワークが検出された場合は、表示された候補からWi-FiのIPv4を選びます。

    npm run preview:phone -- --host 192.168.x.x

スマホ用プレビューは、選択したLANアドレスで dist/ のサイトファイルだけを配信します。ファイアウォールやルーターの設定は変更しません。URLのIPアドレスは、Wi-Fi接続を変えた際などに変わることがあります。

## 現在の内容

- トップは空の短い哲学から、公園のアイス屋の全景へ進みます。屋根・左右の端・短い足元を保ち、PCもスマホも幅100%・最大900pxで表示します。
- 店頭には最大三つのアプリ。新作・おすすめ・季節のひとつを優先し、指定が足りなければ登録順で補います。重複や空のカテゴリーへの扉は作りません。
- 店の画像内の札の文字を外し、実際のHTML文字を重ねています。アイスケースと、その下の読みやすい名前は同じ一つのボタンです。キーボードの操作対象もアプリごとに一つです。
- 「すべてのアプリ」とAPPS看板から apps.html のテラスへ進みます。店頭の三品は、そのアプリを選択したテラスへ直接つながります。
- テラスは白い金属の丸テーブルと木漏れ日、奥に見える同じ店。背景写真と透過カップ、実際の文字を重ねます。PCは三つ、680px以下は一つずつ大きく表示。前後の矢印・左右キー・横スワイプで切り替え、自動では回転しません。「すべてのアプリ」の名前と用途から直接選べます。
- メニューは名前・用途・説明・機能を日英両方で検索できます。全角・半角、ひらがな・カタカナを揃えて検索し、用途別の分類と組み合わせます。分類は登録のあるものだけ表示。検索中に入力欄を作り直しません。
- メニューは12件ずつ追加表示し、該当なしでは絞り込みを解除できます。選択後は一つのカップをテーブルの中央へ置き、その下に説明を表示。「メニューへ戻る」で検索語・分類・追加件数・読んでいた位置を保持します（同じページ内）。読み込み直した際には初期状態に戻ります。
- カップを選ぶと少し手前へ移動し、テラスの下に用途・できること・画面イメージを表示します。「テーブルへ戻る」、Escape、ブラウザーの戻るで閉じ、カップへフォーカスとスクロール位置を戻します。説明は通常のページ内にあり、画面を覆いません。古いトップページの詳細URLは従来のダイアログで引き続き開けます。
- 詳細は #app-focus のようなURLでも開けます。「店へ戻る」は、店から出た位置とリンクのフォーカスを復元します。画面幅が大きく変わった場合は元のリンクを画面内に戻します。
- Focus・Notes・Trip・Tasks・Budget・Journalは確認用のサンプル。画面も機能説明も仮の構成です。サンプルには外部起動リンクを付けず、その旨を一覧と詳細に表示します。
- サンプルは content.js の previewApps、実アプリは apps で管理します。実アプリを一件以上登録すると、サンプル全件を実アプリに切り替えます。名前・用途・説明・機能・札は日英切替と読み上げに対応します。
- 英字Inter、日本語Noto Sans JP、温かい白・墨色・バニラ色を維持。冒頭の英文と和文、会社紹介の原稿は変更していません。
- 冒頭の浮上とぼけ、窓の開閉、空からクリームへの変化、ケースの薄い冷気を維持。テラスの登場は420ms。テーブルの端に薄い陰影がゆっくり動き、画面外・タブ非表示で停止します。端末とサイトの動きを減らす設定を尊重します。

## アプリを追加する

content.js の apps 配列へ実際のアプリを登録します。画像とスクリーンショットは assets/apps/ に保存してください。

    {
      id: "your-app",
      name: { en: "App name", ja: "アプリ名" },
      tagline: { en: "One short purpose", ja: "用途を一言で" },
      description: { en: "A short description.", ja: "短い説明文。" },
      featured: "new",
      categories: ["record"],
      flavor: 0,
      icon: "./assets/apps/your-app.png",
      screenshots: [{ src: "./assets/apps/screen.png", alt: { en: "Main screen", ja: "メイン画面" } }],
      features: [{ en: "One useful thing", ja: "できること" }],
      url: "https://your-actual-app-url.example",
      platforms: ["iOS", "Android"]
    }

url は実際の公開先へ置き換えます。未指定なら準備中の表示となり、起動リンクは出ません。サンプルURLを実データとして公開しないでください。

featured は new / picked / seasonal、または未指定。人気ランキングは実装していません。flavor は0〜5（バニラ、いちご、ピスタチオ、チョコ、キャラメル、ミント）の見た目を選びます。実アプリの画面は screenshots、アイコンは icon に登録します。画面画像がなければ詳細にもアイスのビジュアルを表示します。実アプリにサンプル用の画面イメージを流用しません。

categories は用途のIDを配列で指定します。現在は focus（集中する）、record（書く・記録する）、organize（暮らしを整える）。複数指定もでき、未指定・未登録の分類は「そのほか」に入ります。分類の追加や名称変更は catalog.js で管理します。

店頭の名前と用途はデータに連動します。店の画像内のアイス自体は三つともバニラのままで、flavor の変更は別画面の展示へ反映されます。

### 数が増えた場合

店頭は最大三件。テラスはPC三件・スマホ一件ごとに切り替え、選択時には一つを中央へ置きます。「すべてのアプリ」の検索結果は登録順に12件ずつ表示し、最後のアプリまで追加できます。端末幅が変わっても選んだカップを保ちます。確認用の41件で、検索・分類・追加表示・末尾への到達を検証しました。確認用データは公開しません。

## 確認とビルド

    npm run check
    npm test
    npm run build

dist/ に index.html / apps.html と共有コード・画像を書き出します。GitHub Pagesも同じビルドです。CSSと共有モジュールの内容から読み込みURLのバージョンを計算し、データ変更を両ページへ反映します。

自動テストは、実データの正規化、URLの安全性、三つの重複しない選出、サンプルの起動リンク不在、画面画像、日英の原稿、静的配信、共有コードのキャッシュ更新に加え、件数が増えた際の全件到達・末尾・端末幅変更時の選択維持を検証します。

ブラウザーの320・390・700・1280px幅で表示を確認しました。店のケースからの詳細、別画面へのリンク、詳細の開閉、Escape、ブラウザーの戻る、店への復帰、日英切替、動きなし、文字のはみ出しを検証しています。確認用画面は実際に公開されたアプリのスクリーンショットではありません。スマホサイズのブラウザー確認と、実機のiOS Safari・タッチ操作の確認は区別します。

## 画像

- assets/storefront-blank-placards-v6.png — 承認された店舗全景から、三枚の札の文字だけを除いた画像。HTMLの文字と操作領域を重ねます。
- assets/flavor-cutouts-v2.png — 六つのカップを3列×2行で並べた透過PNG。CSSの背景位置で一つずつ表示し、テーブルに直接置いています。旧 flavor-collection-v1.png から内蔵 image_gen で背景だけを透過し、元画像も保持しています。
- assets/terrace-background-v1.png / terrace-background-mobile-v1.png — 承認されたテラス案からカップとUI文字を除いた背景。PCは1536×1024、スマホは1024×1536。画像の再加工はせず、画面幅で写真を切り替えます。

いずれも内蔵 image_gen で生成しました。採用画像・入力・最終プロンプトは [画像制作記録](./ASSET_NOTES.md) に保存しています。旧画像は比較用に保持し、画像制作のプロンプトファイルはサイト配信から除外します。

## 書体

assets/fonts/ に Fontsource Variable 5.3.0 配布の Inter と Noto Sans JP の通常体を、WOFF2 のまま同梱しています。サイト閲覧時に外部のフォント配信サービスへ接続しません。文字範囲ごとに分割したファイルを使用するため、表示する文字に必要なファイルだけが読み込まれます。英字の基本ファイルは先読みします。

読み込み中や通信失敗時は代替書体で文字を表示します。読み込み後は同じフォントデータを使いますが、OSごとの文字描画の差は残ります。日本語・英字とも配布元の文字範囲を保持しているため、現在の原稿だけに限定したフォントではありません。

配布元とバージョンは assets/fonts/sources.json、同梱ライセンスは assets/fonts/LICENSE-inter.txt と assets/fonts/LICENSE-noto-sans-jp.txt に記録しています。フォントのバイナリは変更していません。

原作者の資料: [Inter](https://github.com/rsms/inter)、[Noto CJK](https://github.com/notofonts/noto-cjk)。

### ロゴの再生成

`assets/wordmark-display.svg` と `assets/wordmark-small.svg` は同梱の Inter から生成したアウトラインです。ブラウザーでフォントを待たずに同じ形を表示します。元のフォントファイルは変更していません。

任意のデザイン作業として `scripts/build-wordmark.py` を実行すると再生成できます。Python、fonttools 4.65.0、brotli 1.2.0、Pillow を使用します。通常のNode.jsによるビルドと公開にはPythonや追加パッケージは不要です。使用した軸、文字間、個別の補正値はスクリプトに保存しています。

## 最後に必要な実データ

- アプリ名、用途、アイコン、公開URL
- 補足説明と会社紹介の確定原稿
- 独自ドメイン（必要な場合）

## 参照

動き軽減設定:
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

Intersection Observer:
https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

ネイティブ dialog:
https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog

# VANILLA ISN'T BAD.

VANILLA ISN'T BAD. のレスポンシブな紹介サイトです。空、短い哲学、屋台、アプリの棚という順に構成しています。

今後の更新の基準は [デザインの基本ルール（仮）](./DESIGN_RULES.md) にまとめています。ユーザーと合意した7項目と、現在の文字サイズ・余白・棚の形の出発点を記録しています。

## GitHub Pages

GitHubリポジトリ: https://github.com/yumi-ai-lab/vanilla-isnt-bad

公開先: https://yumi-ai-lab.github.io/vanilla-isnt-bad/?lang=ja

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

- 温かい白 #F7F3ED、ミルク色 #FCF9F4、墨色 #282826、淡いバニラ色 #E9DDB8。
- 屋台はマットな白い塗装と布の質感、控えめな銀の金具、柔らかい自然光で仕上げています。空の棚は細めの白い縁、銀色の内縁、内壁と底面、淡い接地影で表しています。
- 英字は Inter、日本語は Noto Sans JP をサイト内から配信します。本文400、冒頭とアプリ一覧の見出し500、社名600を基準にしています。会社紹介の日本語見出しは補足として400にしています。社名の文字間を調整したSVGを共通のロゴとして使い、小さな表示には別の光学補正を用意しています。
- 屋台の社名はマットな墨色の印刷をイメージし、屋根の明暗となじませています。APPS、空の見出し、本文は単色で輪郭の明瞭な文字です。文字の影は付けていません。
- 冒頭の日本語はスマホで「そのままで、」「ちゃんといい。」の2行。補足は14〜16px、説明文は15〜16px。ヘッダーと棚・会社説明・フッターの左右の基準を揃えています。
- 「まず、使い心地から。」はスマホ22px、PCで最大26px、太さ400、標準の字間で控えめに組み、スマホでは本文との間を28px取っています。
- 空と短い哲学、独立した屋台、アプリの棚、短い会社の考え。
- PC は3列、スマホは1列。未登録時はPCで6枠、スマホで3枠の空の棚を表示。
- 社名は文字の輪郭を保持したSVG。右の APPS 看板は一覧へのリンク。
- 看板は最初に見えたときだけ600ms、最大1.5度の小さな揺れ。
- 通常の縦スクロール。スクロールの固定、常時動作、演出の待ち時間はなし。
- アプリ詳細はネイティブのダイアログ。Escape、閉じるボタン、外側のクリックで閉じます。
- キーボード操作、端末の動き軽減設定、フッターの動き切り替えに対応。
- アプリ未提供のため公開アプリは登録していません。偽のアプリやリンクは表示しません。
- 思想の中心は「そのままで、ちゃんといい。」。基本の使い心地を磨くことを先に伝え、「必要な分だけ、自分好みに。」が支える構成です。機能の少なさや、ほかの好みとの比較を主張の中心にはしません。文章は content.js で変更できます。

## アプリを追加する

content.js の apps 配列に、実際のアプリだけを追加してください。アイコンを assets/apps/ に保存し、以下の形で登録します。

    {
      id: "your-app",
      name: { en: "App name", ja: "アプリ名" },
      tagline: { en: "What it does, in one line.", ja: "用途を一言で。" },
      description: { en: "A short description.", ja: "短い説明文。" },
      icon: "./assets/apps/your-app.png",
      url: "https://your-actual-app-url.example",
      platforms: ["iOS", "Android"]
    }

url は実際の公開URLに置き換えてください。サンプルURLは説明専用です。アイコンを未指定にすると名前の頭文字を表示します。登録数に合わせて棚が増えます。

## 確認とビルド

    npm run check
    npm test
    npm run build

dist/ に静的配信に使えるファイルが出力されます。GitHub Pagesでも同じビルドを使用します。

## 画像

assets/kiosk-warm.png は、ユーザーの参考画像にあるマットな白い器と柔らかな光をもとに、内蔵 image_gen で屋台の素材を整えた画像です。屋台の構図と外形を保ち、ケースの縁に白い厚みと丸みを加えています。以前の画像は assets/kiosk.png と assets/kiosk-refined.png に残しています。実ファイルは不透明のマット背景です。HTML の SVG クリップで輪郭を切り抜いて表示しているため、空や看板は独立して扱えます。透過PNGであるとは扱っていません。

ローカルの参考画像 assets/art-direction.png と生成時のプロンプトは、GitHubリポジトリと公開サイトの両方から除外しています。

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

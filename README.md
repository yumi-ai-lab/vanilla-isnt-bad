# VANILLA ISN'T BAD.

VANILLA ISN'T BAD. のレスポンシブな紹介サイトです。空、短い哲学、屋台、アプリの棚という順に構成しています。

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

- ほぼ白 #F8F8F4、チャコール #1E2022、淡いバニラ色 #E9DDA6、シルバー #AAB3B5。
- 白い塗装・銀の枠・ガラスをそれぞれの陰影で描き分け、黒い社名と見出しで引き締めています。空の棚にも細い金属の縁、ガラスの反射、奥の面と底面を設けています。
- 空と短い哲学、独立した屋台、アプリの棚、短い会社の考え。
- PC は3列、スマホは1列。未登録時はPCで6枠、スマホで3枠の空の棚を表示。
- 屋台上の社名は画像ではなくテキスト。右の APPS 看板は一覧へのリンク。
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

assets/kiosk-refined.png は、承認された屋台の形を保ったまま、内蔵 image_gen で塗装・金属・ガラスの質感を整えた画像です。元画像は assets/kiosk.png に残しています。実ファイルは不透明のマット背景です。HTML の SVG クリップで輪郭を切り抜いて表示しているため、空や看板は独立して扱えます。透過PNGであるとは扱っていません。

ローカルの参考画像 assets/art-direction.png と生成時のプロンプトは、GitHubリポジトリと公開サイトの両方から除外しています。

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

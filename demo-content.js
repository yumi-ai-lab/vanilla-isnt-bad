// All specifications and maker notes below are illustrative demo content.
// Do not use them as verified claims about released apps.
export const demoNotes = {
  focus: {
    specs: [{icon:"timer",label:{ja:"集中タイマー",en:"Focus timer"}},{icon:"pause",label:{ja:"休憩の区切り",en:"Breaks"}},{icon:"adjust",label:{ja:"時間を調整",en:"Your duration"}}],
    lead:{ja:"始めるときに迷わないよう、いま使う操作だけを手元に。",en:"Only the controls you need now, so starting feels effortless."},
    points:[{ja:"残り時間を、ひと目で読める大きさに。",en:"Time remaining is easy to read at a glance."},{ja:"休憩も作業も、自分のペースで区切れるように。",en:"Set the pace for both work and rest."}]
  },
  notes: {
    specs: [{icon:"write",label:{ja:"すぐに入力",en:"Write right away"}},{icon:"search",label:{ja:"メモを検索",en:"Find a note"}},{icon:"export",label:{ja:"テキスト出力",en:"Text export"}}],
    lead:{ja:"思いつきを逃さないよう、最初の画面から書ける構成に。",en:"Start writing on the first screen, before the thought slips away."},
    points:[{ja:"整理はあとで。まずは一行だけでも残せるように。",en:"Organize later. A single line is enough to begin."},{ja:"書いた言葉を、ほかの場所へ持ち出せるように。",en:"Take your words with you when you need to."}]
  },
  trip: {
    specs: [{icon:"pin",label:{ja:"場所を保存",en:"Save places"}},{icon:"calendar",label:{ja:"一日の予定",en:"A day's plan"}},{icon:"reorder",label:{ja:"順番を変更",en:"Reorder stops"}}],
    lead:{ja:"予定を埋めすぎず、寄り道できる余白を残しました。",en:"A plan with a little space left for a detour."},
    points:[{ja:"気になる場所は、日程を決める前でも保存。",en:"Save a place before deciding when to visit."},{ja:"予定の順番を、思いついたときに入れ替えられるように。",en:"Change the order whenever a new idea comes along."}]
  },
  tasks: {
    specs: [{icon:"list",label:{ja:"今日のリスト",en:"Today's list"}},{icon:"check",label:{ja:"完了を記録",en:"Mark complete"}},{icon:"reorder",label:{ja:"優先順に整理",en:"Your priorities"}}],
    lead:{ja:"全部を一度に抱えず、次のひとつが分かる並びに。",en:"A clear next step, without having to hold everything at once."},
    points:[{ja:"終わったことは、小さな印で静かに残す。",en:"A small mark is enough to acknowledge a finished task."},{ja:"今日できなかったことも、無理なく並べ直せるように。",en:"Leave room to rearrange what did not fit into today."}]
  },
  budget: {
    specs: [{icon:"receipt",label:{ja:"支出を入力",en:"Log spending"}},{icon:"chart",label:{ja:"月ごとに確認",en:"Monthly view"}},{icon:"tag",label:{ja:"用途で分類",en:"Categories"}}],
    lead:{ja:"細かく管理する前に、お金の流れをつかめるように。",en:"Understand the flow before worrying about every small detail."},
    points:[{ja:"買い物のあと、短い入力で残せる構成に。",en:"A short entry after each purchase."},{ja:"ひと月を見返すときは、大きな流れから。",en:"Start with the bigger picture when reviewing a month."}]
  },
  journal: {
    specs: [{icon:"write",label:{ja:"一行の日記",en:"A daily line"}},{icon:"calendar",label:{ja:"日付で振り返る",en:"Look back by date"}},{icon:"search",label:{ja:"言葉で探す",en:"Find a memory"}}],
    lead:{ja:"長く書けない日も、その日の一行を大切に。",en:"A little room for one line, even on the busiest days."},
    points:[{ja:"空白の日があっても、続きから自然に書けるように。",en:"Pick up where you are, even after a few blank days."},{ja:"残した言葉から、過去の日を探せるように。",en:"Find a past day through the words you kept."}]
  }
};

export const demoCopy = {
  ja: {
    skip:"メニューへ",shop:"店へ戻る",back:"メニューへ",intro:"名前や、できることから。",
    searchLabel:"アプリ名・できることで探す",placeholder:"メモ、旅、集中…",clear:"検索を消去",categories:"用途で絞り込む",all:"すべて",
    reset:"絞り込みを解除",empty:"見つかりませんでした。別の言葉で探すか、絞り込みを解除してください。",more:"もっと見る",
    sample:"アプリ名・仕様・説明は、確認用のサンプルです。",sampleBadge:"サンプル",open:"アプリを開く",unavailable:"サンプルのため、アプリは起動しません。",soon:"公開準備中です。",
    specs:"主な仕様",craft:"つくり手のひとこと",craftMore:"ほかのこだわり",browse:"メニューでほかも見る",motionOn:"動き あり",motionOff:"動き なし"
  },
  en: {
    skip:"Skip to the menu",shop:"Shop",back:"Menu",intro:"Find a little something for your day.",
    searchLabel:"Find an app by name or purpose",placeholder:"Notes, travel, focus…",clear:"Clear search",categories:"Choose a purpose",all:"All",
    reset:"Clear filters",empty:"No apps found. Try another word, or clear the filters.",more:"Show more",
    sample:"App names, specifications and notes are illustrative samples.",sampleBadge:"Sample",open:"Open app",unavailable:"This sample does not launch an app.",soon:"Coming soon.",
    specs:"At a glance",craft:"A note from the maker",craftMore:"A little more care",browse:"Browse the menu",motionOn:"Motion on",motionOff:"Motion off"
  }
};

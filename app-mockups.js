import { localized } from "./model.js";

// Review concepts only. Real app records must use their own screenshots.
const concepts = {
  focus: {
    accent: "#647554", tint: "#edf0e6",
    ja: { title:"いま、ひとつだけ。", eyebrow:"YOUR TIME", task:"企画書をまとめる", hint:"集中する時間", action:"はじめる", tabs:["集中","休憩"], footer:"自分のペースで。", alt:"Focusの起動画面案。取り組むことと25分のタイマー、開始ボタンを一画面に表示。" },
    en: { title:"One thing at a time.", eyebrow:"YOUR TIME", task:"Work on the first draft", hint:"Time to focus", action:"Begin", tabs:["Focus","Break"], footer:"At your own pace.", alt:"Focus start screen concept with one task, a 25-minute timer and a Begin control." }
  },
  notes: {
    accent: "#8c6666", tint: "#f4eae7",
    ja: { title:"まず、ひとこと。", eyebrow:"YOUR NOTES", search:"メモを探す", draft:"ここから書きはじめる…", label:"最近のメモ", rows:[["帰り道のアイデア","小さな道具ほど、使い心地を大切に。"],["週末の買いもの","パン、コーヒー、季節の果物"]], action:"新しいメモ", footer:"思いついた、そのときに。", alt:"Notesの起動画面案。すぐ書ける入力欄、メモの検索と最近のメモを表示。" },
    en: { title:"A thought worth keeping.", eyebrow:"YOUR NOTES", search:"Find a note", draft:"Start with a line…", label:"Recent notes", rows:[["An idea on the way home","Small tools. A little more care."],["For the weekend","Bread, coffee, something in season."]], action:"New note", footer:"Whenever a thought arrives.", alt:"Notes start screen concept with a writing area, search and recent notes." }
  },
  trip: {
    accent: "#6d7c58", tint: "#edf0e4",
    ja: { title:"寄り道のある一日。", eyebrow:"YOUR NEXT TRIP", label:"週末の小さな旅", day:"1日目", rows:[["10:00","駅前のベーカリー"],["11:30","川沿いを散歩"],["14:00","気になっていた美術館"]], action:"場所を追加", footer:"予定の間にも、余白を。", alt:"Tripの起動画面案。三つの行き先を結ぶ地図イメージと一日の予定、場所の追加を表示。" },
    en: { title:"Leave room to wander.", eyebrow:"YOUR NEXT TRIP", label:"A little weekend away", day:"Day one", rows:[["10:00","The corner bakery"],["11:30","A walk by the river"],["14:00","That little art museum"]], action:"Add a place", footer:"A little space between plans.", alt:"Trip start screen concept with an illustrative route map, three stops and an Add a place control." }
  },
  tasks: {
    accent: "#826753", tint: "#f1ebe3",
    ja: { title:"今日の、ひとつずつ。", eyebrow:"YOUR TODAY", label:"3つのうち、1つ完了", rows:[["企画の下書きをつくる","まずはここから"],["本を10ページ読む","時間ができたら"],["植物に水をあげる","完了"]], action:"タスクを追加", footer:"ひとつ終えたら、次のひとつ。", alt:"Tasksの起動画面案。優先するタスクと完了したタスクを含む今日の三件のリスト。" },
    en: { title:"A little less to hold.", eyebrow:"YOUR TODAY", label:"1 of 3 things done", rows:[["Draft the first idea","Start here"],["Read ten pages","When there is a moment"],["Water the plants","Done"]], action:"Add a task", footer:"One thing, then the next.", alt:"Tasks start screen concept with a prioritized three-item list and one completed task." }
  },
  budget: {
    accent: "#927343", tint: "#f5eee1",
    ja: { title:"暮らしのお金を、少し。", eyebrow:"YOUR MONTH", label:"9月の支出", total:"¥24,800", breakdown:[["食費","¥12,400"],["暮らし","¥7,440"],["そのほか","¥4,960"]], recent:"最近の記録", rows:[["コーヒー","¥480"],["日々の買いもの","¥2,360"]], action:"支出を記録", footer:"流れが見えると、少し安心。", alt:"Budgetの起動画面案。月の支出24,800円を三つの用途に分け、最近の記録を表示。金額はサンプル。" },
    en: { title:"A little more in view.", eyebrow:"YOUR MONTH", label:"September spending", total:"¥24,800", breakdown:[["Food","¥12,400"],["Everyday","¥7,440"],["Other","¥4,960"]], recent:"Recent spending", rows:[["Coffee","¥480"],["Everyday groceries","¥2,360"]], action:"Log spending", footer:"A clearer picture of everyday.", alt:"Budget start screen concept with sample monthly spending of 24,800 yen, three categories and recent entries." }
  },
  journal: {
    accent: "#61796c", tint: "#eaf0e9",
    ja: { title:"今日を、少しだけ。", eyebrow:"YOUR DAYS", label:"9月17日 木曜日", weekdays:["月","火","水","木","金","土","日"], prompt:"今日は、どんな一日？", entry:"いつもの道で、少し遠回り。\n風が気持ちよかった。", recent:"ひとつ前の記録", memory:"9月16日　おいしいコーヒーに出会った。", action:"今日を残す", footer:"一行でも、今日のしるし。", alt:"Journalの起動画面案。一週間の日付、今日の一行とひとつ前の日記を表示。" },
    en: { title:"A little of today.", eyebrow:"YOUR DAYS", label:"Thursday, September 17", weekdays:["M","T","W","T","F","S","S"], prompt:"How was your day?", entry:"Took the longer way home.\nThe breeze felt good.", recent:"A day before", memory:"Sep 16 · Found a lovely cup of coffee.", action:"Keep this day", footer:"One line can hold a day.", alt:"Journal start screen concept with a week of dates, a short daily entry and the previous day's memory." }
  }
};

export function appMockup(app, language = "ja") {
  if (!app?.sample || app.screenshots?.length || !Object.hasOwn(concepts, app.id)) return null;
  const concept = concepts[app.id];
  return { id:app.id, name:localized(app.name,language), accent:concept.accent, tint:concept.tint, ...concept[language === "en" ? "en" : "ja"] };
}

const element = (tag, className, text) => {
  const item = document.createElement(tag);
  item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
};
const block = (className, text) => element("div", className, text);

function routeMap() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 300 128");
  svg.setAttribute("class", "mock-route");
  const shape = (tag, attributes) => {
    const item = document.createElementNS(svg.namespaceURI, tag);
    for (const [name, value] of Object.entries(attributes)) item.setAttribute(name, value);
    svg.append(item);
  };
  shape("rect", {width:300,height:128,rx:8,fill:"#edf0e6"});
  shape("path", {class:"mock-river",d:"M-10 117 Q80 45 144 108 T310 23",fill:"none"});
  shape("path", {class:"mock-streets",d:"M-10 22H305 M35-10V140 M125-10V140 M222-10V140 M-10 72H305",fill:"none"});
  shape("path", {class:"mock-walk",d:"M53 91V42H154V74H253",fill:"none","stroke-dasharray":"4 5"});
  for (const [x,y] of [[53,91],[154,42],[253,74]]) {
    shape("circle", {cx:x,cy:y,r:7,fill:"#6d7c58",stroke:"#fffdf6","stroke-width":3});
  }
  return svg;
}

// The whole preview is one labeled illustration. Its drawn controls are not
// interactive or focusable, and are never confused with the actual launcher.
export function renderAppMockup(host, model) {
  host.replaceChildren();
  if (!model) return;
  const device = block("mock-device");
  device.style.setProperty("--mock-accent", model.accent);
  device.style.setProperty("--mock-tint", model.tint);
  device.setAttribute("role", "img");
  device.setAttribute("aria-label", model.alt);
  const screen = block(`mock-ui mock-${model.id}`);
  screen.setAttribute("aria-hidden", "true");
  const top = block("mock-top");
  top.append(block("mock-app-name", model.name),block("mock-ellipsis", "···"));
  const heading = block("mock-heading");
  heading.append(block("mock-eyebrow", model.eyebrow),block("mock-title", model.title));
  screen.append(top,heading);

  if (model.id === "focus") {
    screen.append(block("mock-task", model.task));
    const timer = block("mock-timer");
    timer.append(block("mock-time", "25:00"),block("mock-small", model.hint));
    screen.append(timer);
    const segments = block("mock-segments");
    model.tabs.forEach((text,index) => segments.append(block(index ? "" : "is-active",`${text}  ${index ? "05" : "25"}`)));
    screen.append(segments);
  } else if (model.id === "notes") {
    screen.append(block("mock-search", `⌕  ${model.search}`));
    const draft = block("mock-draft");
    draft.append(block("mock-small", model.draft),block("mock-caret", "|"));
    screen.append(draft,block("mock-label", model.label));
    model.rows.forEach(([title, detail]) => {
      const row = block("mock-note-row");
      row.append(block("mock-row-title", title),block("mock-small", detail));
      screen.append(row);
    });
  } else if (model.id === "trip") {
    screen.append(block("mock-trip-label", model.label),routeMap(),block("mock-label", model.day));
    model.rows.forEach(([time,title]) => {
      const row = block("mock-itinerary");
      row.append(block("mock-small", time),block("mock-row-title", title));
      screen.append(row);
    });
  } else if (model.id === "tasks") {
    screen.append(block("mock-small", model.label),block("mock-progress"));
    model.rows.forEach(([title,detail],index) => {
      const row = block(`mock-task-row${index === 2 ? " is-done" : ""}`);
      const words = block("mock-row-words");
      words.append(block("mock-row-title", title),block("mock-small", detail));
      row.append(block("mock-checkbox", index === 2 ? "✓" : ""),words);
      screen.append(row);
    });
  } else if (model.id === "budget") {
    screen.append(block("mock-small", model.label),block("mock-total", model.total),block("mock-budget-bar"));
    const legend = block("mock-budget-legend");
    model.breakdown.forEach(([label,amount]) => {
      const row = block("mock-budget-category");
      row.append(block("mock-small", label),block("mock-row-title", amount));
      legend.append(row);
    });
    screen.append(legend,block("mock-label", model.recent));
    model.rows.forEach(([label,amount]) => {
      const row = block("mock-spending");
      row.append(block("mock-row-title", label),block("mock-small", amount));
      screen.append(row);
    });
  } else if (model.id === "journal") {
    screen.append(block("mock-small", model.label));
    const week = block("mock-week");
    model.weekdays.forEach((label,index) => {
      const day = block(`mock-day${index === 3 ? " is-current" : ""}`);
      day.append(block("mock-weekday", label),block("mock-date", String(14+index)));
      week.append(day);
    });
    const entry = block("mock-entry");
    entry.append(block("mock-small", model.prompt),block("mock-entry-text", model.entry));
    screen.append(week,entry,block("mock-label", model.recent),block("mock-small mock-memory", model.memory));
  }
  const bottom = block("mock-bottom");
  bottom.append(block("mock-action", model.action),block("mock-footer", model.footer));
  screen.append(bottom);
  device.append(screen);
  host.append(device);
}

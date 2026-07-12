// ==========================================================
//  WSJ English Study — iOS 홈화면 위젯 (Scriptable용)
//  매일 WSJ 핵심 단어 1개를 한국어 뜻과 함께 보여줍니다.
//  탭하면 학습 앱이 열립니다.
//
//  사용법:
//   1) App Store에서 무료 앱 "Scriptable" 설치
//   2) Scriptable 열기 → 우측 상단 (+) → 이 코드 전체 붙여넣기 → 이름 저장
//   3) 홈화면 길게 누르기 → (+) → Scriptable → 위젯 크기 선택 → 추가
//   4) 추가된 위젯 길게 누르기 → "위젯 편집" → Script를 이 스크립트로 선택
// ==========================================================

const APP_URL  = "https://gywn000929-bot.github.io/WSJ/";
const DATA_URL = "https://gywn000929-bot.github.io/WSJ/widget-data.json";

// ---- 데이터 로드 (실패 시 캐시 사용 → 오프라인 대비) ----
const fm = FileManager.local();
const cachePath = fm.joinPath(fm.cacheDirectory(), "wsj_widget_cache.json");
let words = [];
try {
  const req = new Request(DATA_URL);
  req.timeoutInterval = 8;
  words = await req.loadJSON();
  fm.writeString(cachePath, JSON.stringify(words));
} catch (e) {
  if (fm.fileExists(cachePath)) {
    try { words = JSON.parse(fm.readString(cachePath)); } catch (_) {}
  }
}
if (!words || !words.length) {
  words = [{ w: "journal", ko: "신문·저널", src: "The Wall Street Journal" }];
}

// ---- 오늘의 단어 (매일 회전) ----
function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
const today = new Date();
const idx = dayOfYear(today) % words.length;
const item = words[idx];
const item2 = words[(idx + 1) % words.length]; // 중간 크기용 두 번째 단어

// ---- 색상 (라이트/다크) ----
const dark = Device.isUsingDarkAppearance();
const C = {
  bg:    dark ? new Color("#14171c") : new Color("#faf9f6"),
  card:  dark ? new Color("#1b1f26") : new Color("#ffffff"),
  ink:   dark ? new Color("#e9e6df") : new Color("#16130f"),
  sub:   dark ? new Color("#9aa0a8") : new Color("#6a655d"),
  accent:dark ? new Color("#7fb0ff") : new Color("#0a3d62"),
  line:  dark ? new Color("#2b313a") : new Color("#e7e3da"),
};

const size = config.widgetFamily || "medium";
const w = new ListWidget();
w.backgroundColor = C.bg;
w.url = APP_URL;
w.setPadding(14, 15, 14, 15);

// 헤더
const head = w.addStack();
const kicker = head.addText("WSJ · 오늘의 단어");
kicker.font = Font.semiboldSystemFont(10);
kicker.textColor = C.accent;
head.addSpacer();
const dstr = `${today.getMonth() + 1}.${today.getDate()}`;
const dt = head.addText(dstr);
dt.font = Font.systemFont(10);
dt.textColor = C.sub;

w.addSpacer(size === "small" ? 6 : 10);

// 단어 카드 렌더 함수
function renderWord(container, it, big) {
  const word = container.addText(it.w);
  word.font = big ? Font.boldSystemFont(26) : Font.semiboldSystemFont(17);
  word.textColor = C.ink;
  word.lineLimit = 1;
  word.minimumScaleFactor = 0.6;
  container.addSpacer(3);
  const meaning = container.addText(it.ko);
  meaning.font = big ? Font.mediumSystemFont(16) : Font.systemFont(13);
  meaning.textColor = C.accent;
  meaning.lineLimit = 2;
  if (big && it.src) {
    container.addSpacer(6);
    const src = container.addText("📰 " + it.src);
    src.font = Font.systemFont(10);
    src.textColor = C.sub;
    src.lineLimit = 2;
  }
}

if (size === "large") {
  renderWord(w, item, true);
  w.addSpacer(12);
  const div = w.addStack(); div.backgroundColor = C.line; div.size = new Size(0, 1); w.addSpacer(10);
  const t = w.addText("다음 단어");
  t.font = Font.semiboldSystemFont(11); t.textColor = C.sub; w.addSpacer(4);
  renderWord(w, item2, false);
  w.addSpacer();
  const foot = w.addText("탭하여 학습 →");
  foot.font = Font.systemFont(11); foot.textColor = C.accent;
} else if (size === "medium") {
  const row = w.addStack(); row.spacing = 12;
  const left = row.addStack(); left.layoutVertically(); left.size = new Size(150, 0);
  renderWord(left, item, true);
  row.addSpacer();
  const right = row.addStack(); right.layoutVertically();
  const t = right.addText("복습"); t.font = Font.semiboldSystemFont(10); t.textColor = C.sub;
  right.addSpacer(4);
  renderWord(right, item2, false);
  w.addSpacer(8);
  const foot = w.addText("탭하여 학습 →");
  foot.font = Font.systemFont(10); foot.textColor = C.accent;
} else {
  // small
  renderWord(w, item, true);
  w.addSpacer();
  const foot = w.addText("탭 →");
  foot.font = Font.systemFont(10); foot.textColor = C.accent;
}

// 매일 아침 갱신 유도
const next = new Date(today); next.setHours(24, 5, 0, 0);
w.refreshAfterDate = next;

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.presentMedium();
}
Script.complete();

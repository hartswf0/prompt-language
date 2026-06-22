// src/bidi.ts
var baseTypes = [
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "S",
  "B",
  "S",
  "WS",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "B",
  "B",
  "S",
  "WS",
  "ON",
  "ON",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "CS",
  "ON",
  "CS",
  "ON",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "EN",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "B",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "BN",
  "CS",
  "ON",
  "ET",
  "ET",
  "ET",
  "ET",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "ET",
  "ET",
  "EN",
  "EN",
  "ON",
  "L",
  "ON",
  "ON",
  "ON",
  "EN",
  "L",
  "ON",
  "ON",
  "ON",
  "ON",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "ON",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L",
  "L"
];
var arabicTypes = [
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "CS",
  "AL",
  "ON",
  "ON",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "AN",
  "ET",
  "AN",
  "AN",
  "AL",
  "AL",
  "AL",
  "NSM",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "ON",
  "NSM",
  "NSM",
  "NSM",
  "NSM",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL",
  "AL"
];
function classifyChar(charCode) {
  if (charCode <= 255)
    return baseTypes[charCode];
  if (1424 <= charCode && charCode <= 1524)
    return "R";
  if (1536 <= charCode && charCode <= 1791)
    return arabicTypes[charCode & 255];
  if (1792 <= charCode && charCode <= 2220)
    return "AL";
  return "L";
}
function computeBidiLevels(str) {
  const len = str.length;
  if (len === 0)
    return null;
  const types = new Array(len);
  let numBidi = 0;
  for (let i = 0;i < len; i++) {
    const t = classifyChar(str.charCodeAt(i));
    if (t === "R" || t === "AL" || t === "AN")
      numBidi++;
    types[i] = t;
  }
  if (numBidi === 0)
    return null;
  const startLevel = len / numBidi < 0.3 ? 0 : 1;
  const levels = new Int8Array(len);
  for (let i = 0;i < len; i++)
    levels[i] = startLevel;
  const e = startLevel & 1 ? "R" : "L";
  const sor = e;
  let lastType = sor;
  for (let i = 0;i < len; i++) {
    if (types[i] === "NSM")
      types[i] = lastType;
    else
      lastType = types[i];
  }
  lastType = sor;
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "EN")
      types[i] = lastType === "AL" ? "AN" : "EN";
    else if (t === "R" || t === "L" || t === "AL")
      lastType = t;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] === "AL")
      types[i] = "R";
  }
  for (let i = 1;i < len - 1; i++) {
    if (types[i] === "ES" && types[i - 1] === "EN" && types[i + 1] === "EN") {
      types[i] = "EN";
    }
    if (types[i] === "CS" && (types[i - 1] === "EN" || types[i - 1] === "AN") && types[i + 1] === types[i - 1]) {
      types[i] = types[i - 1];
    }
  }
  for (let i = 0;i < len; i++) {
    if (types[i] !== "EN")
      continue;
    let j;
    for (j = i - 1;j >= 0 && types[j] === "ET"; j--)
      types[j] = "EN";
    for (j = i + 1;j < len && types[j] === "ET"; j++)
      types[j] = "EN";
  }
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "WS" || t === "ES" || t === "ET" || t === "CS")
      types[i] = "ON";
  }
  lastType = sor;
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if (t === "EN")
      types[i] = lastType === "L" ? "L" : "EN";
    else if (t === "R" || t === "L")
      lastType = t;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] !== "ON")
      continue;
    let end = i + 1;
    while (end < len && types[end] === "ON")
      end++;
    const before = i > 0 ? types[i - 1] : sor;
    const after = end < len ? types[end] : sor;
    const bDir = before !== "L" ? "R" : "L";
    const aDir = after !== "L" ? "R" : "L";
    if (bDir === aDir) {
      for (let j = i;j < end; j++)
        types[j] = bDir;
    }
    i = end - 1;
  }
  for (let i = 0;i < len; i++) {
    if (types[i] === "ON")
      types[i] = e;
  }
  for (let i = 0;i < len; i++) {
    const t = types[i];
    if ((levels[i] & 1) === 0) {
      if (t === "R")
        levels[i]++;
      else if (t === "AN" || t === "EN")
        levels[i] += 2;
    } else if (t === "L" || t === "AN" || t === "EN") {
      levels[i]++;
    }
  }
  return levels;
}
function computeSegmentLevels(normalized, segStarts) {
  const bidiLevels = computeBidiLevels(normalized);
  if (bidiLevels === null)
    return null;
  const segLevels = new Int8Array(segStarts.length);
  for (let i = 0;i < segStarts.length; i++) {
    segLevels[i] = bidiLevels[segStarts[i]];
  }
  return segLevels;
}

// src/analysis.ts
var collapsibleWhitespaceRunRe = /[ \t\n\r\f]+/g;
var needsWhitespaceNormalizationRe = /[\t\n\r\f]| {2,}|^ | $/;
function getWhiteSpaceProfile(whiteSpace) {
  const mode = whiteSpace ?? "normal";
  return mode === "pre-wrap" ? { mode, preserveOrdinarySpaces: true, preserveHardBreaks: true } : { mode, preserveOrdinarySpaces: false, preserveHardBreaks: false };
}
function normalizeWhitespaceNormal(text) {
  if (!needsWhitespaceNormalizationRe.test(text))
    return text;
  let normalized = text.replace(collapsibleWhitespaceRunRe, " ");
  if (normalized.charCodeAt(0) === 32) {
    normalized = normalized.slice(1);
  }
  if (normalized.length > 0 && normalized.charCodeAt(normalized.length - 1) === 32) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}
function normalizeWhitespacePreWrap(text) {
  if (!/[\r\f]/.test(text))
    return text.replace(/\r\n/g, `
`);
  return text.replace(/\r\n/g, `
`).replace(/[\r\f]/g, `
`);
}
var sharedWordSegmenter = null;
var segmenterLocale;
function getSharedWordSegmenter() {
  if (sharedWordSegmenter === null) {
    sharedWordSegmenter = new Intl.Segmenter(segmenterLocale, { granularity: "word" });
  }
  return sharedWordSegmenter;
}
function clearAnalysisCaches() {
  sharedWordSegmenter = null;
}
var arabicScriptRe = /\p{Script=Arabic}/u;
var combiningMarkRe = /\p{M}/u;
var decimalDigitRe = /\p{Nd}/u;
function containsArabicScript(text) {
  return arabicScriptRe.test(text);
}
function isCJK(s) {
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 19968 && c <= 40959 || c >= 13312 && c <= 19903 || c >= 131072 && c <= 173791 || c >= 173824 && c <= 177983 || c >= 177984 && c <= 178207 || c >= 178208 && c <= 183983 || c >= 183984 && c <= 191471 || c >= 196608 && c <= 201551 || c >= 63744 && c <= 64255 || c >= 194560 && c <= 195103 || c >= 12288 && c <= 12351 || c >= 12352 && c <= 12447 || c >= 12448 && c <= 12543 || c >= 44032 && c <= 55215 || c >= 65280 && c <= 65519) {
      return true;
    }
  }
  return false;
}
var kinsokuStart = new Set([
  "，",
  "．",
  "！",
  "：",
  "；",
  "？",
  "、",
  "。",
  "・",
  "）",
  "〕",
  "〉",
  "》",
  "」",
  "』",
  "】",
  "〗",
  "〙",
  "〛",
  "ー",
  "々",
  "〻",
  "ゝ",
  "ゞ",
  "ヽ",
  "ヾ"
]);
var kinsokuEnd = new Set([
  '"',
  "(",
  "[",
  "{",
  "“",
  "‘",
  "«",
  "‹",
  "（",
  "〔",
  "〈",
  "《",
  "「",
  "『",
  "【",
  "〖",
  "〘",
  "〚"
]);
var forwardStickyGlue = new Set([
  "'",
  "’"
]);
var leftStickyPunctuation = new Set([
  ".",
  ",",
  "!",
  "?",
  ":",
  ";",
  "،",
  "؛",
  "؟",
  "।",
  "॥",
  "၊",
  "။",
  "၌",
  "၍",
  "၏",
  ")",
  "]",
  "}",
  "%",
  '"',
  "”",
  "’",
  "»",
  "›",
  "…"
]);
var arabicNoSpaceTrailingPunctuation = new Set([
  ":",
  ".",
  "،",
  "؛"
]);
var myanmarMedialGlue = new Set([
  "၏"
]);
var closingQuoteChars = new Set([
  "”",
  "’",
  "»",
  "›",
  "」",
  "』",
  "】",
  "》",
  "〉",
  "〕",
  "）"
]);
function isLeftStickyPunctuationSegment(segment) {
  if (isEscapedQuoteClusterSegment(segment))
    return true;
  let sawPunctuation = false;
  for (const ch of segment) {
    if (leftStickyPunctuation.has(ch)) {
      sawPunctuation = true;
      continue;
    }
    if (sawPunctuation && combiningMarkRe.test(ch))
      continue;
    return false;
  }
  return sawPunctuation;
}
function isCJKLineStartProhibitedSegment(segment) {
  for (const ch of segment) {
    if (!kinsokuStart.has(ch) && !leftStickyPunctuation.has(ch))
      return false;
  }
  return segment.length > 0;
}
function isForwardStickyClusterSegment(segment) {
  if (isEscapedQuoteClusterSegment(segment))
    return true;
  for (const ch of segment) {
    if (!kinsokuEnd.has(ch) && !forwardStickyGlue.has(ch) && !combiningMarkRe.test(ch))
      return false;
  }
  return segment.length > 0;
}
function isEscapedQuoteClusterSegment(segment) {
  let sawQuote = false;
  for (const ch of segment) {
    if (ch === "\\" || combiningMarkRe.test(ch))
      continue;
    if (kinsokuEnd.has(ch) || leftStickyPunctuation.has(ch) || forwardStickyGlue.has(ch)) {
      sawQuote = true;
      continue;
    }
    return false;
  }
  return sawQuote;
}
function splitTrailingForwardStickyCluster(text) {
  const chars = Array.from(text);
  let splitIndex = chars.length;
  while (splitIndex > 0) {
    const ch = chars[splitIndex - 1];
    if (combiningMarkRe.test(ch)) {
      splitIndex--;
      continue;
    }
    if (kinsokuEnd.has(ch) || forwardStickyGlue.has(ch)) {
      splitIndex--;
      continue;
    }
    break;
  }
  if (splitIndex <= 0 || splitIndex === chars.length)
    return null;
  return {
    head: chars.slice(0, splitIndex).join(""),
    tail: chars.slice(splitIndex).join("")
  };
}
function isRepeatedSingleCharRun(segment, ch) {
  if (segment.length === 0)
    return false;
  for (const part of segment) {
    if (part !== ch)
      return false;
  }
  return true;
}
function endsWithArabicNoSpacePunctuation(segment) {
  if (!containsArabicScript(segment) || segment.length === 0)
    return false;
  return arabicNoSpaceTrailingPunctuation.has(segment[segment.length - 1]);
}
function endsWithMyanmarMedialGlue(segment) {
  if (segment.length === 0)
    return false;
  return myanmarMedialGlue.has(segment[segment.length - 1]);
}
function splitLeadingSpaceAndMarks(segment) {
  if (segment.length < 2 || segment[0] !== " ")
    return null;
  const marks = segment.slice(1);
  if (/^\p{M}+$/u.test(marks)) {
    return { space: " ", marks };
  }
  return null;
}
function endsWithClosingQuote(text) {
  for (let i = text.length - 1;i >= 0; i--) {
    const ch = text[i];
    if (closingQuoteChars.has(ch))
      return true;
    if (!leftStickyPunctuation.has(ch))
      return false;
  }
  return false;
}
function classifySegmentBreakChar(ch, whiteSpaceProfile) {
  if (whiteSpaceProfile.preserveOrdinarySpaces || whiteSpaceProfile.preserveHardBreaks) {
    if (ch === " ")
      return "preserved-space";
    if (ch === "\t")
      return "tab";
    if (whiteSpaceProfile.preserveHardBreaks && ch === `
`)
      return "hard-break";
  }
  if (ch === " ")
    return "space";
  if (ch === " " || ch === " " || ch === "⁠" || ch === "\uFEFF") {
    return "glue";
  }
  if (ch === "​")
    return "zero-width-break";
  if (ch === "­")
    return "soft-hyphen";
  return "text";
}
function joinTextParts(parts) {
  return parts.length === 1 ? parts[0] : parts.join("");
}
function splitSegmentByBreakKind(segment, isWordLike, start, whiteSpaceProfile) {
  const pieces = [];
  let currentKind = null;
  let currentTextParts = [];
  let currentStart = start;
  let currentWordLike = false;
  let offset = 0;
  for (const ch of segment) {
    const kind = classifySegmentBreakChar(ch, whiteSpaceProfile);
    const wordLike = kind === "text" && isWordLike;
    if (currentKind !== null && kind === currentKind && wordLike === currentWordLike) {
      currentTextParts.push(ch);
      offset += ch.length;
      continue;
    }
    if (currentKind !== null) {
      pieces.push({
        text: joinTextParts(currentTextParts),
        isWordLike: currentWordLike,
        kind: currentKind,
        start: currentStart
      });
    }
    currentKind = kind;
    currentTextParts = [ch];
    currentStart = start + offset;
    currentWordLike = wordLike;
    offset += ch.length;
  }
  if (currentKind !== null) {
    pieces.push({
      text: joinTextParts(currentTextParts),
      isWordLike: currentWordLike,
      kind: currentKind,
      start: currentStart
    });
  }
  return pieces;
}
function isTextRunBoundary(kind) {
  return kind === "space" || kind === "preserved-space" || kind === "zero-width-break" || kind === "hard-break";
}
var urlSchemeSegmentRe = /^[A-Za-z][A-Za-z0-9+.-]*:$/;
function isUrlLikeRunStart(segmentation, index) {
  const text = segmentation.texts[index];
  if (text.startsWith("www."))
    return true;
  return urlSchemeSegmentRe.test(text) && index + 1 < segmentation.len && segmentation.kinds[index + 1] === "text" && segmentation.texts[index + 1] === "//";
}
function isUrlQueryBoundarySegment(text) {
  return text.includes("?") && (text.includes("://") || text.startsWith("www."));
}
function mergeUrlLikeRuns(segmentation) {
  const texts = segmentation.texts.slice();
  const isWordLike = segmentation.isWordLike.slice();
  const kinds = segmentation.kinds.slice();
  const starts = segmentation.starts.slice();
  for (let i = 0;i < segmentation.len; i++) {
    if (kinds[i] !== "text" || !isUrlLikeRunStart(segmentation, i))
      continue;
    const mergedParts = [texts[i]];
    let j = i + 1;
    while (j < segmentation.len && !isTextRunBoundary(kinds[j])) {
      mergedParts.push(texts[j]);
      isWordLike[i] = true;
      const endsQueryPrefix = texts[j].includes("?");
      kinds[j] = "text";
      texts[j] = "";
      j++;
      if (endsQueryPrefix)
        break;
    }
    texts[i] = joinTextParts(mergedParts);
  }
  let compactLen = 0;
  for (let read = 0;read < texts.length; read++) {
    const text = texts[read];
    if (text.length === 0)
      continue;
    if (compactLen !== read) {
      texts[compactLen] = text;
      isWordLike[compactLen] = isWordLike[read];
      kinds[compactLen] = kinds[read];
      starts[compactLen] = starts[read];
    }
    compactLen++;
  }
  texts.length = compactLen;
  isWordLike.length = compactLen;
  kinds.length = compactLen;
  starts.length = compactLen;
  return {
    len: compactLen,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeUrlQueryRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(segmentation.kinds[i]);
    starts.push(segmentation.starts[i]);
    if (!isUrlQueryBoundarySegment(text))
      continue;
    const nextIndex = i + 1;
    if (nextIndex >= segmentation.len || isTextRunBoundary(segmentation.kinds[nextIndex])) {
      continue;
    }
    const queryParts = [];
    const queryStart = segmentation.starts[nextIndex];
    let j = nextIndex;
    while (j < segmentation.len && !isTextRunBoundary(segmentation.kinds[j])) {
      queryParts.push(segmentation.texts[j]);
      j++;
    }
    if (queryParts.length > 0) {
      texts.push(joinTextParts(queryParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(queryStart);
      i = j - 1;
    }
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
var numericJoinerChars = new Set([
  ":",
  "-",
  "/",
  "×",
  ",",
  ".",
  "+",
  "–",
  "—"
]);
var asciiPunctuationChainSegmentRe = /^[A-Za-z0-9_]+[,:;]*$/;
var asciiPunctuationChainTrailingJoinersRe = /[,:;]+$/;
function segmentContainsDecimalDigit(text) {
  for (const ch of text) {
    if (decimalDigitRe.test(ch))
      return true;
  }
  return false;
}
function isNumericRunSegment(text) {
  if (text.length === 0)
    return false;
  for (const ch of text) {
    if (decimalDigitRe.test(ch) || numericJoinerChars.has(ch))
      continue;
    return false;
  }
  return true;
}
function mergeNumericRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    const kind = segmentation.kinds[i];
    if (kind === "text" && isNumericRunSegment(text) && segmentContainsDecimalDigit(text)) {
      const mergedParts = [text];
      let j = i + 1;
      while (j < segmentation.len && segmentation.kinds[j] === "text" && isNumericRunSegment(segmentation.texts[j])) {
        mergedParts.push(segmentation.texts[j]);
        j++;
      }
      texts.push(joinTextParts(mergedParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(segmentation.starts[i]);
      i = j - 1;
      continue;
    }
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(kind);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeAsciiPunctuationChains(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    const kind = segmentation.kinds[i];
    const wordLike = segmentation.isWordLike[i];
    if (kind === "text" && wordLike && asciiPunctuationChainSegmentRe.test(text)) {
      const mergedParts = [text];
      let endsWithJoiners = asciiPunctuationChainTrailingJoinersRe.test(text);
      let j = i + 1;
      while (endsWithJoiners && j < segmentation.len && segmentation.kinds[j] === "text" && segmentation.isWordLike[j] && asciiPunctuationChainSegmentRe.test(segmentation.texts[j])) {
        const nextText = segmentation.texts[j];
        mergedParts.push(nextText);
        endsWithJoiners = asciiPunctuationChainTrailingJoinersRe.test(nextText);
        j++;
      }
      texts.push(joinTextParts(mergedParts));
      isWordLike.push(true);
      kinds.push("text");
      starts.push(segmentation.starts[i]);
      i = j - 1;
      continue;
    }
    texts.push(text);
    isWordLike.push(wordLike);
    kinds.push(kind);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function splitHyphenatedNumericRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  for (let i = 0;i < segmentation.len; i++) {
    const text = segmentation.texts[i];
    if (segmentation.kinds[i] === "text" && text.includes("-")) {
      const parts = text.split("-");
      let shouldSplit = parts.length > 1;
      for (let j = 0;j < parts.length; j++) {
        const part = parts[j];
        if (!shouldSplit)
          break;
        if (part.length === 0 || !segmentContainsDecimalDigit(part) || !isNumericRunSegment(part)) {
          shouldSplit = false;
        }
      }
      if (shouldSplit) {
        let offset = 0;
        for (let j = 0;j < parts.length; j++) {
          const part = parts[j];
          const splitText = j < parts.length - 1 ? `${part}-` : part;
          texts.push(splitText);
          isWordLike.push(true);
          kinds.push("text");
          starts.push(segmentation.starts[i] + offset);
          offset += splitText.length;
        }
        continue;
      }
    }
    texts.push(text);
    isWordLike.push(segmentation.isWordLike[i]);
    kinds.push(segmentation.kinds[i]);
    starts.push(segmentation.starts[i]);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function mergeGlueConnectedTextRuns(segmentation) {
  const texts = [];
  const isWordLike = [];
  const kinds = [];
  const starts = [];
  let read = 0;
  while (read < segmentation.len) {
    const textParts = [segmentation.texts[read]];
    let wordLike = segmentation.isWordLike[read];
    let kind = segmentation.kinds[read];
    let start = segmentation.starts[read];
    if (kind === "glue") {
      const glueParts = [textParts[0]];
      const glueStart = start;
      read++;
      while (read < segmentation.len && segmentation.kinds[read] === "glue") {
        glueParts.push(segmentation.texts[read]);
        read++;
      }
      const glueText = joinTextParts(glueParts);
      if (read < segmentation.len && segmentation.kinds[read] === "text") {
        textParts[0] = glueText;
        textParts.push(segmentation.texts[read]);
        wordLike = segmentation.isWordLike[read];
        kind = "text";
        start = glueStart;
        read++;
      } else {
        texts.push(glueText);
        isWordLike.push(false);
        kinds.push("glue");
        starts.push(glueStart);
        continue;
      }
    } else {
      read++;
    }
    if (kind === "text") {
      while (read < segmentation.len && segmentation.kinds[read] === "glue") {
        const glueParts = [];
        while (read < segmentation.len && segmentation.kinds[read] === "glue") {
          glueParts.push(segmentation.texts[read]);
          read++;
        }
        const glueText = joinTextParts(glueParts);
        if (read < segmentation.len && segmentation.kinds[read] === "text") {
          textParts.push(glueText, segmentation.texts[read]);
          wordLike = wordLike || segmentation.isWordLike[read];
          read++;
          continue;
        }
        textParts.push(glueText);
      }
    }
    texts.push(joinTextParts(textParts));
    isWordLike.push(wordLike);
    kinds.push(kind);
    starts.push(start);
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function carryTrailingForwardStickyAcrossCJKBoundary(segmentation) {
  const texts = segmentation.texts.slice();
  const isWordLike = segmentation.isWordLike.slice();
  const kinds = segmentation.kinds.slice();
  const starts = segmentation.starts.slice();
  for (let i = 0;i < texts.length - 1; i++) {
    if (kinds[i] !== "text" || kinds[i + 1] !== "text")
      continue;
    if (!isCJK(texts[i]) || !isCJK(texts[i + 1]))
      continue;
    const split = splitTrailingForwardStickyCluster(texts[i]);
    if (split === null)
      continue;
    texts[i] = split.head;
    texts[i + 1] = split.tail + texts[i + 1];
    starts[i + 1] = starts[i] + split.head.length;
  }
  return {
    len: texts.length,
    texts,
    isWordLike,
    kinds,
    starts
  };
}
function buildMergedSegmentation(normalized, profile, whiteSpaceProfile) {
  const wordSegmenter = getSharedWordSegmenter();
  let mergedLen = 0;
  const mergedTexts = [];
  const mergedWordLike = [];
  const mergedKinds = [];
  const mergedStarts = [];
  for (const s of wordSegmenter.segment(normalized)) {
    for (const piece of splitSegmentByBreakKind(s.segment, s.isWordLike ?? false, s.index, whiteSpaceProfile)) {
      const isText = piece.kind === "text";
      if (profile.carryCJKAfterClosingQuote && isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && isCJK(piece.text) && isCJK(mergedTexts[mergedLen - 1]) && endsWithClosingQuote(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && isCJKLineStartProhibitedSegment(piece.text) && isCJK(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && endsWithMyanmarMedialGlue(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = mergedWordLike[mergedLen - 1] || piece.isWordLike;
      } else if (isText && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && piece.isWordLike && containsArabicScript(piece.text) && endsWithArabicNoSpacePunctuation(mergedTexts[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
        mergedWordLike[mergedLen - 1] = true;
      } else if (isText && !piece.isWordLike && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && piece.text.length === 1 && piece.text !== "-" && piece.text !== "—" && isRepeatedSingleCharRun(mergedTexts[mergedLen - 1], piece.text)) {
        mergedTexts[mergedLen - 1] += piece.text;
      } else if (isText && !piece.isWordLike && mergedLen > 0 && mergedKinds[mergedLen - 1] === "text" && (isLeftStickyPunctuationSegment(piece.text) || piece.text === "-" && mergedWordLike[mergedLen - 1])) {
        mergedTexts[mergedLen - 1] += piece.text;
      } else {
        mergedTexts[mergedLen] = piece.text;
        mergedWordLike[mergedLen] = piece.isWordLike;
        mergedKinds[mergedLen] = piece.kind;
        mergedStarts[mergedLen] = piece.start;
        mergedLen++;
      }
    }
  }
  for (let i = 1;i < mergedLen; i++) {
    if (mergedKinds[i] === "text" && !mergedWordLike[i] && isEscapedQuoteClusterSegment(mergedTexts[i]) && mergedKinds[i - 1] === "text") {
      mergedTexts[i - 1] += mergedTexts[i];
      mergedWordLike[i - 1] = mergedWordLike[i - 1] || mergedWordLike[i];
      mergedTexts[i] = "";
    }
  }
  for (let i = mergedLen - 2;i >= 0; i--) {
    if (mergedKinds[i] === "text" && !mergedWordLike[i] && isForwardStickyClusterSegment(mergedTexts[i])) {
      let j = i + 1;
      while (j < mergedLen && mergedTexts[j] === "")
        j++;
      if (j < mergedLen && mergedKinds[j] === "text") {
        mergedTexts[j] = mergedTexts[i] + mergedTexts[j];
        mergedStarts[j] = mergedStarts[i];
        mergedTexts[i] = "";
      }
    }
  }
  let compactLen = 0;
  for (let read = 0;read < mergedLen; read++) {
    const text = mergedTexts[read];
    if (text.length === 0)
      continue;
    if (compactLen !== read) {
      mergedTexts[compactLen] = text;
      mergedWordLike[compactLen] = mergedWordLike[read];
      mergedKinds[compactLen] = mergedKinds[read];
      mergedStarts[compactLen] = mergedStarts[read];
    }
    compactLen++;
  }
  mergedTexts.length = compactLen;
  mergedWordLike.length = compactLen;
  mergedKinds.length = compactLen;
  mergedStarts.length = compactLen;
  const compacted = mergeGlueConnectedTextRuns({
    len: compactLen,
    texts: mergedTexts,
    isWordLike: mergedWordLike,
    kinds: mergedKinds,
    starts: mergedStarts
  });
  const withMergedUrls = carryTrailingForwardStickyAcrossCJKBoundary(mergeAsciiPunctuationChains(splitHyphenatedNumericRuns(mergeNumericRuns(mergeUrlQueryRuns(mergeUrlLikeRuns(compacted))))));
  for (let i = 0;i < withMergedUrls.len - 1; i++) {
    const split = splitLeadingSpaceAndMarks(withMergedUrls.texts[i]);
    if (split === null)
      continue;
    if (withMergedUrls.kinds[i] !== "space" && withMergedUrls.kinds[i] !== "preserved-space" || withMergedUrls.kinds[i + 1] !== "text" || !containsArabicScript(withMergedUrls.texts[i + 1])) {
      continue;
    }
    withMergedUrls.texts[i] = split.space;
    withMergedUrls.isWordLike[i] = false;
    withMergedUrls.kinds[i] = withMergedUrls.kinds[i] === "preserved-space" ? "preserved-space" : "space";
    withMergedUrls.texts[i + 1] = split.marks + withMergedUrls.texts[i + 1];
    withMergedUrls.starts[i + 1] = withMergedUrls.starts[i] + split.space.length;
  }
  return withMergedUrls;
}
function compileAnalysisChunks(segmentation, whiteSpaceProfile) {
  if (segmentation.len === 0)
    return [];
  if (!whiteSpaceProfile.preserveHardBreaks) {
    return [{
      startSegmentIndex: 0,
      endSegmentIndex: segmentation.len,
      consumedEndSegmentIndex: segmentation.len
    }];
  }
  const chunks = [];
  let startSegmentIndex = 0;
  for (let i = 0;i < segmentation.len; i++) {
    if (segmentation.kinds[i] !== "hard-break")
      continue;
    chunks.push({
      startSegmentIndex,
      endSegmentIndex: i,
      consumedEndSegmentIndex: i + 1
    });
    startSegmentIndex = i + 1;
  }
  if (startSegmentIndex < segmentation.len) {
    chunks.push({
      startSegmentIndex,
      endSegmentIndex: segmentation.len,
      consumedEndSegmentIndex: segmentation.len
    });
  }
  return chunks;
}
function analyzeText(text, profile, whiteSpace = "normal") {
  const whiteSpaceProfile = getWhiteSpaceProfile(whiteSpace);
  const normalized = whiteSpaceProfile.mode === "pre-wrap" ? normalizeWhitespacePreWrap(text) : normalizeWhitespaceNormal(text);
  if (normalized.length === 0) {
    return {
      normalized,
      chunks: [],
      len: 0,
      texts: [],
      isWordLike: [],
      kinds: [],
      starts: []
    };
  }
  const segmentation = buildMergedSegmentation(normalized, profile, whiteSpaceProfile);
  return {
    normalized,
    chunks: compileAnalysisChunks(segmentation, whiteSpaceProfile),
    ...segmentation
  };
}

// src/measurement.ts
var measureContext = null;
var segmentMetricCaches = new Map;
var cachedEngineProfile = null;
var emojiPresentationRe = /\p{Emoji_Presentation}/u;
var maybeEmojiRe = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F\u20E3]/u;
var sharedGraphemeSegmenter = null;
var emojiCorrectionCache = new Map;
function getMeasureContext() {
  if (measureContext !== null)
    return measureContext;
  if (typeof OffscreenCanvas !== "undefined") {
    measureContext = new OffscreenCanvas(1, 1).getContext("2d");
    return measureContext;
  }
  if (typeof document !== "undefined") {
    measureContext = document.createElement("canvas").getContext("2d");
    return measureContext;
  }
  throw new Error("Text measurement requires OffscreenCanvas or a DOM canvas context.");
}
function getSegmentMetricCache(font) {
  let cache = segmentMetricCaches.get(font);
  if (!cache) {
    cache = new Map;
    segmentMetricCaches.set(font, cache);
  }
  return cache;
}
function getSegmentMetrics(seg, cache) {
  let metrics = cache.get(seg);
  if (metrics === undefined) {
    const ctx = getMeasureContext();
    metrics = {
      width: ctx.measureText(seg).width,
      containsCJK: isCJK(seg)
    };
    cache.set(seg, metrics);
  }
  return metrics;
}
function getEngineProfile() {
  if (cachedEngineProfile !== null)
    return cachedEngineProfile;
  if (typeof navigator === "undefined") {
    cachedEngineProfile = {
      lineFitEpsilon: 0.005,
      carryCJKAfterClosingQuote: false,
      preferPrefixWidthsForBreakableRuns: false,
      preferEarlySoftHyphenBreak: false
    };
    return cachedEngineProfile;
  }
  const ua = navigator.userAgent;
  const vendor = navigator.vendor;
  const isSafari = vendor === "Apple Computer, Inc." && ua.includes("Safari/") && !ua.includes("Chrome/") && !ua.includes("Chromium/") && !ua.includes("CriOS/") && !ua.includes("FxiOS/") && !ua.includes("EdgiOS/");
  const isChromium = ua.includes("Chrome/") || ua.includes("Chromium/") || ua.includes("CriOS/") || ua.includes("Edg/");
  cachedEngineProfile = {
    lineFitEpsilon: isSafari ? 1 / 64 : 0.005,
    carryCJKAfterClosingQuote: isChromium,
    preferPrefixWidthsForBreakableRuns: isSafari,
    preferEarlySoftHyphenBreak: isSafari
  };
  return cachedEngineProfile;
}
function parseFontSize(font) {
  const m = font.match(/(\d+(?:\.\d+)?)\s*px/);
  return m ? parseFloat(m[1]) : 16;
}
function getSharedGraphemeSegmenter() {
  if (sharedGraphemeSegmenter === null) {
    sharedGraphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  }
  return sharedGraphemeSegmenter;
}
function isEmojiGrapheme(g) {
  return emojiPresentationRe.test(g) || g.includes("️");
}
function textMayContainEmoji(text) {
  return maybeEmojiRe.test(text);
}
function getEmojiCorrection(font, fontSize) {
  let correction = emojiCorrectionCache.get(font);
  if (correction !== undefined)
    return correction;
  const ctx = getMeasureContext();
  ctx.font = font;
  const canvasW = ctx.measureText("\uD83D\uDE00").width;
  correction = 0;
  if (canvasW > fontSize + 0.5 && typeof document !== "undefined" && document.body !== null) {
    const span = document.createElement("span");
    span.style.font = font;
    span.style.display = "inline-block";
    span.style.visibility = "hidden";
    span.style.position = "absolute";
    span.textContent = "\uD83D\uDE00";
    document.body.appendChild(span);
    const domW = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    if (canvasW - domW > 0.5) {
      correction = canvasW - domW;
    }
  }
  emojiCorrectionCache.set(font, correction);
  return correction;
}
function countEmojiGraphemes(text) {
  let count = 0;
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  for (const g of graphemeSegmenter.segment(text)) {
    if (isEmojiGrapheme(g.segment))
      count++;
  }
  return count;
}
function getEmojiCount(seg, metrics) {
  if (metrics.emojiCount === undefined) {
    metrics.emojiCount = countEmojiGraphemes(seg);
  }
  return metrics.emojiCount;
}
function getCorrectedSegmentWidth(seg, metrics, emojiCorrection) {
  if (emojiCorrection === 0)
    return metrics.width;
  return metrics.width - getEmojiCount(seg, metrics) * emojiCorrection;
}
function getSegmentGraphemeWidths(seg, metrics, cache, emojiCorrection) {
  if (metrics.graphemeWidths !== undefined)
    return metrics.graphemeWidths;
  const widths = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  for (const gs of graphemeSegmenter.segment(seg)) {
    const graphemeMetrics = getSegmentMetrics(gs.segment, cache);
    widths.push(getCorrectedSegmentWidth(gs.segment, graphemeMetrics, emojiCorrection));
  }
  metrics.graphemeWidths = widths.length > 1 ? widths : null;
  return metrics.graphemeWidths;
}
function getSegmentGraphemePrefixWidths(seg, metrics, cache, emojiCorrection) {
  if (metrics.graphemePrefixWidths !== undefined)
    return metrics.graphemePrefixWidths;
  const prefixWidths = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter();
  let prefix = "";
  for (const gs of graphemeSegmenter.segment(seg)) {
    prefix += gs.segment;
    const prefixMetrics = getSegmentMetrics(prefix, cache);
    prefixWidths.push(getCorrectedSegmentWidth(prefix, prefixMetrics, emojiCorrection));
  }
  metrics.graphemePrefixWidths = prefixWidths.length > 1 ? prefixWidths : null;
  return metrics.graphemePrefixWidths;
}
function getFontMeasurementState(font, needsEmojiCorrection) {
  const ctx = getMeasureContext();
  ctx.font = font;
  const cache = getSegmentMetricCache(font);
  const fontSize = parseFontSize(font);
  const emojiCorrection = needsEmojiCorrection ? getEmojiCorrection(font, fontSize) : 0;
  return { cache, fontSize, emojiCorrection };
}
function clearMeasurementCaches() {
  segmentMetricCaches.clear();
  emojiCorrectionCache.clear();
  sharedGraphemeSegmenter = null;
}

// src/line-break.ts
function canBreakAfter(kind) {
  return kind === "space" || kind === "preserved-space" || kind === "tab" || kind === "zero-width-break" || kind === "soft-hyphen";
}
function isSimpleCollapsibleSpace(kind) {
  return kind === "space";
}
function getTabAdvance(lineWidth, tabStopAdvance) {
  if (tabStopAdvance <= 0)
    return 0;
  const remainder = lineWidth % tabStopAdvance;
  if (Math.abs(remainder) <= 0.000001)
    return tabStopAdvance;
  return tabStopAdvance - remainder;
}
function getBreakableAdvance(graphemeWidths, graphemePrefixWidths, graphemeIndex, preferPrefixWidths) {
  if (!preferPrefixWidths || graphemePrefixWidths === null) {
    return graphemeWidths[graphemeIndex];
  }
  return graphemePrefixWidths[graphemeIndex] - (graphemeIndex > 0 ? graphemePrefixWidths[graphemeIndex - 1] : 0);
}
function fitSoftHyphenBreak(graphemeWidths, initialWidth, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, cumulativeWidths) {
  let fitCount = 0;
  let fittedWidth = initialWidth;
  while (fitCount < graphemeWidths.length) {
    const nextWidth = cumulativeWidths ? initialWidth + graphemeWidths[fitCount] : fittedWidth + graphemeWidths[fitCount];
    const nextLineWidth = fitCount + 1 < graphemeWidths.length ? nextWidth + discretionaryHyphenWidth : nextWidth;
    if (nextLineWidth > maxWidth + lineFitEpsilon)
      break;
    fittedWidth = nextWidth;
    fitCount++;
  }
  return { fitCount, fittedWidth };
}
function findChunkIndexForStart(prepared, segmentIndex) {
  let lo = 0;
  let hi = prepared.chunks.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (segmentIndex < prepared.chunks[mid].consumedEndSegmentIndex) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo < prepared.chunks.length ? lo : -1;
}
function normalizeLineStartWithChunk(prepared, start) {
  let segmentIndex = start.segmentIndex;
  const graphemeIndex = start.graphemeIndex;
  if (segmentIndex >= prepared.widths.length)
    return null;
  const chunkIndex = findChunkIndexForStart(prepared, segmentIndex);
  if (chunkIndex < 0)
    return null;
  if (graphemeIndex > 0) {
    return { cursor: start, chunkIndex };
  }
  const chunk = prepared.chunks[chunkIndex];
  if (chunk.startSegmentIndex === chunk.endSegmentIndex && segmentIndex === chunk.startSegmentIndex) {
    return { cursor: { segmentIndex, graphemeIndex: 0 }, chunkIndex };
  }
  if (segmentIndex < chunk.startSegmentIndex)
    segmentIndex = chunk.startSegmentIndex;
  while (segmentIndex < chunk.endSegmentIndex) {
    const kind = prepared.kinds[segmentIndex];
    if (kind !== "space" && kind !== "zero-width-break" && kind !== "soft-hyphen") {
      return { cursor: { segmentIndex, graphemeIndex: 0 }, chunkIndex };
    }
    segmentIndex++;
  }
  if (chunk.consumedEndSegmentIndex >= prepared.widths.length)
    return null;
  return {
    cursor: { segmentIndex: chunk.consumedEndSegmentIndex, graphemeIndex: 0 },
    chunkIndex: chunkIndex + 1
  };
}
function countPreparedLines(prepared, maxWidth) {
  if (prepared.simpleLineWalkFastPath) {
    return countPreparedLinesSimple(prepared, maxWidth);
  }
  return walkPreparedLines(prepared, maxWidth);
}
function countPreparedLinesSimple(prepared, maxWidth) {
  const { widths, kinds, breakableWidths, breakablePrefixWidths } = prepared;
  if (widths.length === 0)
    return 0;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  let lineCount = 0;
  let lineW = 0;
  let hasContent = false;
  function placeOnFreshLine(segmentIndex) {
    const w = widths[segmentIndex];
    if (w > maxWidth && breakableWidths[segmentIndex] !== null) {
      const gWidths = breakableWidths[segmentIndex];
      const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
      lineW = 0;
      for (let g = 0;g < gWidths.length; g++) {
        const gw = getBreakableAdvance(gWidths, gPrefixWidths, g, engineProfile.preferPrefixWidthsForBreakableRuns);
        if (lineW > 0 && lineW + gw > maxWidth + lineFitEpsilon) {
          lineCount++;
          lineW = gw;
        } else {
          if (lineW === 0)
            lineCount++;
          lineW += gw;
        }
      }
    } else {
      lineW = w;
      lineCount++;
    }
    hasContent = true;
  }
  for (let i = 0;i < widths.length; i++) {
    const w = widths[i];
    const kind = kinds[i];
    if (!hasContent) {
      placeOnFreshLine(i);
      continue;
    }
    const newW = lineW + w;
    if (newW > maxWidth + lineFitEpsilon) {
      if (isSimpleCollapsibleSpace(kind))
        continue;
      lineW = 0;
      hasContent = false;
      placeOnFreshLine(i);
      continue;
    }
    lineW = newW;
  }
  if (!hasContent)
    return lineCount + 1;
  return lineCount;
}
function walkPreparedLinesSimple(prepared, maxWidth, onLine) {
  const { widths, kinds, breakableWidths, breakablePrefixWidths } = prepared;
  if (widths.length === 0)
    return 0;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  let lineCount = 0;
  let lineW = 0;
  let hasContent = false;
  let lineStartSegmentIndex = 0;
  let lineStartGraphemeIndex = 0;
  let lineEndSegmentIndex = 0;
  let lineEndGraphemeIndex = 0;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakPaintWidth = 0;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakPaintWidth = 0;
  }
  function emitCurrentLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    lineCount++;
    onLine?.({
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    });
    lineW = 0;
    hasContent = false;
    clearPendingBreak();
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = graphemeIndex;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreak(segmentIndex, segmentWidth) {
    if (!canBreakAfter(kinds[segmentIndex]))
      return;
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakPaintWidth = lineW - segmentWidth;
  }
  function appendBreakableSegment(segmentIndex) {
    appendBreakableSegmentFrom(segmentIndex, 0);
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    for (let g = startGraphemeIndex;g < gWidths.length; g++) {
      const gw = getBreakableAdvance(gWidths, gPrefixWidths, g, engineProfile.preferPrefixWidthsForBreakableRuns);
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g, gw);
        continue;
      }
      if (lineW + gw > maxWidth + lineFitEpsilon) {
        emitCurrentLine();
        startLineAtGrapheme(segmentIndex, g, gw);
      } else {
        lineW += gw;
        lineEndSegmentIndex = segmentIndex;
        lineEndGraphemeIndex = g + 1;
      }
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
  }
  let i = 0;
  while (i < widths.length) {
    const w = widths[i];
    const kind = kinds[i];
    if (!hasContent) {
      if (w > maxWidth && breakableWidths[i] !== null) {
        appendBreakableSegment(i);
      } else {
        startLineAtSegment(i, w);
      }
      updatePendingBreak(i, w);
      i++;
      continue;
    }
    const newW = lineW + w;
    if (newW > maxWidth + lineFitEpsilon) {
      if (canBreakAfter(kind)) {
        appendWholeSegment(i, w);
        emitCurrentLine(i + 1, 0, lineW - w);
        i++;
        continue;
      }
      if (pendingBreakSegmentIndex >= 0) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          emitCurrentLine();
          continue;
        }
        emitCurrentLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
        continue;
      }
      if (w > maxWidth && breakableWidths[i] !== null) {
        emitCurrentLine();
        appendBreakableSegment(i);
        i++;
        continue;
      }
      emitCurrentLine();
      continue;
    }
    appendWholeSegment(i, w);
    updatePendingBreak(i, w);
    i++;
  }
  if (hasContent)
    emitCurrentLine();
  return lineCount;
}
function walkPreparedLines(prepared, maxWidth, onLine) {
  if (prepared.simpleLineWalkFastPath) {
    return walkPreparedLinesSimple(prepared, maxWidth, onLine);
  }
  const {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance,
    chunks
  } = prepared;
  if (widths.length === 0 || chunks.length === 0)
    return 0;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  let lineCount = 0;
  let lineW = 0;
  let hasContent = false;
  let lineStartSegmentIndex = 0;
  let lineStartGraphemeIndex = 0;
  let lineEndSegmentIndex = 0;
  let lineEndGraphemeIndex = 0;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakFitWidth = 0;
  let pendingBreakPaintWidth = 0;
  let pendingBreakKind = null;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakFitWidth = 0;
    pendingBreakPaintWidth = 0;
    pendingBreakKind = null;
  }
  function emitCurrentLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    lineCount++;
    onLine?.({
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    });
    lineW = 0;
    hasContent = false;
    clearPendingBreak();
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineStartSegmentIndex = segmentIndex;
    lineStartGraphemeIndex = graphemeIndex;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreakForWholeSegment(segmentIndex, segmentWidth) {
    if (!canBreakAfter(kinds[segmentIndex]))
      return;
    const fitAdvance = kinds[segmentIndex] === "tab" ? 0 : lineEndFitAdvances[segmentIndex];
    const paintAdvance = kinds[segmentIndex] === "tab" ? segmentWidth : lineEndPaintAdvances[segmentIndex];
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakFitWidth = lineW - segmentWidth + fitAdvance;
    pendingBreakPaintWidth = lineW - segmentWidth + paintAdvance;
    pendingBreakKind = kinds[segmentIndex];
  }
  function appendBreakableSegment(segmentIndex) {
    appendBreakableSegmentFrom(segmentIndex, 0);
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    for (let g = startGraphemeIndex;g < gWidths.length; g++) {
      const gw = getBreakableAdvance(gWidths, gPrefixWidths, g, engineProfile.preferPrefixWidthsForBreakableRuns);
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g, gw);
        continue;
      }
      if (lineW + gw > maxWidth + lineFitEpsilon) {
        emitCurrentLine();
        startLineAtGrapheme(segmentIndex, g, gw);
      } else {
        lineW += gw;
        lineEndSegmentIndex = segmentIndex;
        lineEndGraphemeIndex = g + 1;
      }
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
  }
  function continueSoftHyphenBreakableSegment(segmentIndex) {
    if (pendingBreakKind !== "soft-hyphen")
      return false;
    const gWidths = breakableWidths[segmentIndex];
    if (gWidths === null)
      return false;
    const fitWidths = engineProfile.preferPrefixWidthsForBreakableRuns ? breakablePrefixWidths[segmentIndex] ?? gWidths : gWidths;
    const usesPrefixWidths = fitWidths !== gWidths;
    const { fitCount, fittedWidth } = fitSoftHyphenBreak(fitWidths, lineW, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, usesPrefixWidths);
    if (fitCount === 0)
      return false;
    lineW = fittedWidth;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = fitCount;
    clearPendingBreak();
    if (fitCount === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
      return true;
    }
    emitCurrentLine(segmentIndex, fitCount, fittedWidth + discretionaryHyphenWidth);
    appendBreakableSegmentFrom(segmentIndex, fitCount);
    return true;
  }
  function emitEmptyChunk(chunk) {
    lineCount++;
    onLine?.({
      startSegmentIndex: chunk.startSegmentIndex,
      startGraphemeIndex: 0,
      endSegmentIndex: chunk.consumedEndSegmentIndex,
      endGraphemeIndex: 0,
      width: 0
    });
    clearPendingBreak();
  }
  for (let chunkIndex = 0;chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    if (chunk.startSegmentIndex === chunk.endSegmentIndex) {
      emitEmptyChunk(chunk);
      continue;
    }
    hasContent = false;
    lineW = 0;
    lineStartSegmentIndex = chunk.startSegmentIndex;
    lineStartGraphemeIndex = 0;
    lineEndSegmentIndex = chunk.startSegmentIndex;
    lineEndGraphemeIndex = 0;
    clearPendingBreak();
    let i = chunk.startSegmentIndex;
    while (i < chunk.endSegmentIndex) {
      const kind = kinds[i];
      const w = kind === "tab" ? getTabAdvance(lineW, tabStopAdvance) : widths[i];
      if (kind === "soft-hyphen") {
        if (hasContent) {
          lineEndSegmentIndex = i + 1;
          lineEndGraphemeIndex = 0;
          pendingBreakSegmentIndex = i + 1;
          pendingBreakFitWidth = lineW + discretionaryHyphenWidth;
          pendingBreakPaintWidth = lineW + discretionaryHyphenWidth;
          pendingBreakKind = kind;
        }
        i++;
        continue;
      }
      if (!hasContent) {
        if (w > maxWidth && breakableWidths[i] !== null) {
          appendBreakableSegment(i);
        } else {
          startLineAtSegment(i, w);
        }
        updatePendingBreakForWholeSegment(i, w);
        i++;
        continue;
      }
      const newW = lineW + w;
      if (newW > maxWidth + lineFitEpsilon) {
        const currentBreakFitWidth = lineW + (kind === "tab" ? 0 : lineEndFitAdvances[i]);
        const currentBreakPaintWidth = lineW + (kind === "tab" ? w : lineEndPaintAdvances[i]);
        if (pendingBreakKind === "soft-hyphen" && engineProfile.preferEarlySoftHyphenBreak && pendingBreakFitWidth <= maxWidth + lineFitEpsilon) {
          emitCurrentLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
          continue;
        }
        if (pendingBreakKind === "soft-hyphen" && continueSoftHyphenBreakableSegment(i)) {
          i++;
          continue;
        }
        if (canBreakAfter(kind) && currentBreakFitWidth <= maxWidth + lineFitEpsilon) {
          appendWholeSegment(i, w);
          emitCurrentLine(i + 1, 0, currentBreakPaintWidth);
          i++;
          continue;
        }
        if (pendingBreakSegmentIndex >= 0 && pendingBreakFitWidth <= maxWidth + lineFitEpsilon) {
          if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
            emitCurrentLine();
            continue;
          }
          const nextSegmentIndex = pendingBreakSegmentIndex;
          emitCurrentLine(nextSegmentIndex, 0, pendingBreakPaintWidth);
          i = nextSegmentIndex;
          continue;
        }
        if (w > maxWidth && breakableWidths[i] !== null) {
          emitCurrentLine();
          appendBreakableSegment(i);
          i++;
          continue;
        }
        emitCurrentLine();
        continue;
      }
      appendWholeSegment(i, w);
      updatePendingBreakForWholeSegment(i, w);
      i++;
    }
    if (hasContent) {
      const finalPaintWidth = pendingBreakSegmentIndex === chunk.consumedEndSegmentIndex ? pendingBreakPaintWidth : lineW;
      emitCurrentLine(chunk.consumedEndSegmentIndex, 0, finalPaintWidth);
    }
  }
  return lineCount;
}
function layoutNextLineRange(prepared, start, maxWidth) {
  const normalized = normalizeLineStartWithChunk(prepared, start);
  if (normalized === null)
    return null;
  if (prepared.simpleLineWalkFastPath) {
    return layoutNextLineRangeSimple(prepared, normalized.cursor, maxWidth);
  }
  const chunk = prepared.chunks[normalized.chunkIndex];
  if (chunk.startSegmentIndex === chunk.endSegmentIndex) {
    return {
      startSegmentIndex: chunk.startSegmentIndex,
      startGraphemeIndex: 0,
      endSegmentIndex: chunk.consumedEndSegmentIndex,
      endGraphemeIndex: 0,
      width: 0
    };
  }
  const {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance
  } = prepared;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  let lineW = 0;
  let hasContent = false;
  const lineStartSegmentIndex = normalized.cursor.segmentIndex;
  const lineStartGraphemeIndex = normalized.cursor.graphemeIndex;
  let lineEndSegmentIndex = lineStartSegmentIndex;
  let lineEndGraphemeIndex = lineStartGraphemeIndex;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakFitWidth = 0;
  let pendingBreakPaintWidth = 0;
  let pendingBreakKind = null;
  function clearPendingBreak() {
    pendingBreakSegmentIndex = -1;
    pendingBreakFitWidth = 0;
    pendingBreakPaintWidth = 0;
    pendingBreakKind = null;
  }
  function finishLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    if (!hasContent)
      return null;
    return {
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    };
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreakForWholeSegment(segmentIndex, segmentWidth) {
    if (!canBreakAfter(kinds[segmentIndex]))
      return;
    const fitAdvance = kinds[segmentIndex] === "tab" ? 0 : lineEndFitAdvances[segmentIndex];
    const paintAdvance = kinds[segmentIndex] === "tab" ? segmentWidth : lineEndPaintAdvances[segmentIndex];
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakFitWidth = lineW - segmentWidth + fitAdvance;
    pendingBreakPaintWidth = lineW - segmentWidth + paintAdvance;
    pendingBreakKind = kinds[segmentIndex];
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    for (let g = startGraphemeIndex;g < gWidths.length; g++) {
      const gw = getBreakableAdvance(gWidths, gPrefixWidths, g, engineProfile.preferPrefixWidthsForBreakableRuns);
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g, gw);
        continue;
      }
      if (lineW + gw > maxWidth + lineFitEpsilon) {
        return finishLine();
      }
      lineW += gw;
      lineEndSegmentIndex = segmentIndex;
      lineEndGraphemeIndex = g + 1;
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
    return null;
  }
  function maybeFinishAtSoftHyphen(segmentIndex) {
    if (pendingBreakKind !== "soft-hyphen" || pendingBreakSegmentIndex < 0)
      return null;
    const gWidths = breakableWidths[segmentIndex] ?? null;
    if (gWidths !== null) {
      const fitWidths = engineProfile.preferPrefixWidthsForBreakableRuns ? breakablePrefixWidths[segmentIndex] ?? gWidths : gWidths;
      const usesPrefixWidths = fitWidths !== gWidths;
      const { fitCount, fittedWidth } = fitSoftHyphenBreak(fitWidths, lineW, maxWidth, lineFitEpsilon, discretionaryHyphenWidth, usesPrefixWidths);
      if (fitCount === gWidths.length) {
        lineW = fittedWidth;
        lineEndSegmentIndex = segmentIndex + 1;
        lineEndGraphemeIndex = 0;
        clearPendingBreak();
        return null;
      }
      if (fitCount > 0) {
        return finishLine(segmentIndex, fitCount, fittedWidth + discretionaryHyphenWidth);
      }
    }
    if (pendingBreakFitWidth <= maxWidth + lineFitEpsilon) {
      return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
    }
    return null;
  }
  for (let i = normalized.cursor.segmentIndex;i < chunk.endSegmentIndex; i++) {
    const kind = kinds[i];
    const startGraphemeIndex = i === normalized.cursor.segmentIndex ? normalized.cursor.graphemeIndex : 0;
    const w = kind === "tab" ? getTabAdvance(lineW, tabStopAdvance) : widths[i];
    if (kind === "soft-hyphen" && startGraphemeIndex === 0) {
      if (hasContent) {
        lineEndSegmentIndex = i + 1;
        lineEndGraphemeIndex = 0;
        pendingBreakSegmentIndex = i + 1;
        pendingBreakFitWidth = lineW + discretionaryHyphenWidth;
        pendingBreakPaintWidth = lineW + discretionaryHyphenWidth;
        pendingBreakKind = kind;
      }
      continue;
    }
    if (!hasContent) {
      if (startGraphemeIndex > 0) {
        const line = appendBreakableSegmentFrom(i, startGraphemeIndex);
        if (line !== null)
          return line;
      } else if (w > maxWidth && breakableWidths[i] !== null) {
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      } else {
        startLineAtSegment(i, w);
      }
      updatePendingBreakForWholeSegment(i, w);
      continue;
    }
    const newW = lineW + w;
    if (newW > maxWidth + lineFitEpsilon) {
      const currentBreakFitWidth = lineW + (kind === "tab" ? 0 : lineEndFitAdvances[i]);
      const currentBreakPaintWidth = lineW + (kind === "tab" ? w : lineEndPaintAdvances[i]);
      if (pendingBreakKind === "soft-hyphen" && engineProfile.preferEarlySoftHyphenBreak && pendingBreakFitWidth <= maxWidth + lineFitEpsilon) {
        return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
      }
      const softBreakLine = maybeFinishAtSoftHyphen(i);
      if (softBreakLine !== null)
        return softBreakLine;
      if (canBreakAfter(kind) && currentBreakFitWidth <= maxWidth + lineFitEpsilon) {
        appendWholeSegment(i, w);
        return finishLine(i + 1, 0, currentBreakPaintWidth);
      }
      if (pendingBreakSegmentIndex >= 0 && pendingBreakFitWidth <= maxWidth + lineFitEpsilon) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          return finishLine();
        }
        return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
      }
      if (w > maxWidth && breakableWidths[i] !== null) {
        const currentLine = finishLine();
        if (currentLine !== null)
          return currentLine;
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      }
      return finishLine();
    }
    appendWholeSegment(i, w);
    updatePendingBreakForWholeSegment(i, w);
  }
  if (pendingBreakSegmentIndex === chunk.consumedEndSegmentIndex && lineEndGraphemeIndex === 0) {
    return finishLine(chunk.consumedEndSegmentIndex, 0, pendingBreakPaintWidth);
  }
  return finishLine(chunk.consumedEndSegmentIndex, 0, lineW);
}
function layoutNextLineRangeSimple(prepared, normalizedStart, maxWidth) {
  const { widths, kinds, breakableWidths, breakablePrefixWidths } = prepared;
  const engineProfile = getEngineProfile();
  const lineFitEpsilon = engineProfile.lineFitEpsilon;
  let lineW = 0;
  let hasContent = false;
  const lineStartSegmentIndex = normalizedStart.segmentIndex;
  const lineStartGraphemeIndex = normalizedStart.graphemeIndex;
  let lineEndSegmentIndex = lineStartSegmentIndex;
  let lineEndGraphemeIndex = lineStartGraphemeIndex;
  let pendingBreakSegmentIndex = -1;
  let pendingBreakPaintWidth = 0;
  function finishLine(endSegmentIndex = lineEndSegmentIndex, endGraphemeIndex = lineEndGraphemeIndex, width = lineW) {
    if (!hasContent)
      return null;
    return {
      startSegmentIndex: lineStartSegmentIndex,
      startGraphemeIndex: lineStartGraphemeIndex,
      endSegmentIndex,
      endGraphemeIndex,
      width
    };
  }
  function startLineAtSegment(segmentIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
    lineW = width;
  }
  function startLineAtGrapheme(segmentIndex, graphemeIndex, width) {
    hasContent = true;
    lineEndSegmentIndex = segmentIndex;
    lineEndGraphemeIndex = graphemeIndex + 1;
    lineW = width;
  }
  function appendWholeSegment(segmentIndex, width) {
    if (!hasContent) {
      startLineAtSegment(segmentIndex, width);
      return;
    }
    lineW += width;
    lineEndSegmentIndex = segmentIndex + 1;
    lineEndGraphemeIndex = 0;
  }
  function updatePendingBreak(segmentIndex, segmentWidth) {
    if (!canBreakAfter(kinds[segmentIndex]))
      return;
    pendingBreakSegmentIndex = segmentIndex + 1;
    pendingBreakPaintWidth = lineW - segmentWidth;
  }
  function appendBreakableSegmentFrom(segmentIndex, startGraphemeIndex) {
    const gWidths = breakableWidths[segmentIndex];
    const gPrefixWidths = breakablePrefixWidths[segmentIndex] ?? null;
    for (let g = startGraphemeIndex;g < gWidths.length; g++) {
      const gw = getBreakableAdvance(gWidths, gPrefixWidths, g, engineProfile.preferPrefixWidthsForBreakableRuns);
      if (!hasContent) {
        startLineAtGrapheme(segmentIndex, g, gw);
        continue;
      }
      if (lineW + gw > maxWidth + lineFitEpsilon) {
        return finishLine();
      }
      lineW += gw;
      lineEndSegmentIndex = segmentIndex;
      lineEndGraphemeIndex = g + 1;
    }
    if (hasContent && lineEndSegmentIndex === segmentIndex && lineEndGraphemeIndex === gWidths.length) {
      lineEndSegmentIndex = segmentIndex + 1;
      lineEndGraphemeIndex = 0;
    }
    return null;
  }
  for (let i = normalizedStart.segmentIndex;i < widths.length; i++) {
    const w = widths[i];
    const kind = kinds[i];
    const startGraphemeIndex = i === normalizedStart.segmentIndex ? normalizedStart.graphemeIndex : 0;
    if (!hasContent) {
      if (startGraphemeIndex > 0) {
        const line = appendBreakableSegmentFrom(i, startGraphemeIndex);
        if (line !== null)
          return line;
      } else if (w > maxWidth && breakableWidths[i] !== null) {
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      } else {
        startLineAtSegment(i, w);
      }
      updatePendingBreak(i, w);
      continue;
    }
    const newW = lineW + w;
    if (newW > maxWidth + lineFitEpsilon) {
      if (canBreakAfter(kind)) {
        appendWholeSegment(i, w);
        return finishLine(i + 1, 0, lineW - w);
      }
      if (pendingBreakSegmentIndex >= 0) {
        if (lineEndSegmentIndex > pendingBreakSegmentIndex || lineEndSegmentIndex === pendingBreakSegmentIndex && lineEndGraphemeIndex > 0) {
          return finishLine();
        }
        return finishLine(pendingBreakSegmentIndex, 0, pendingBreakPaintWidth);
      }
      if (w > maxWidth && breakableWidths[i] !== null) {
        const currentLine = finishLine();
        if (currentLine !== null)
          return currentLine;
        const line = appendBreakableSegmentFrom(i, 0);
        if (line !== null)
          return line;
      }
      return finishLine();
    }
    appendWholeSegment(i, w);
    updatePendingBreak(i, w);
  }
  return finishLine();
}

// src/layout.ts
var sharedGraphemeSegmenter2 = null;
var sharedLineTextCaches = new WeakMap;
function getSharedGraphemeSegmenter2() {
  if (sharedGraphemeSegmenter2 === null) {
    sharedGraphemeSegmenter2 = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  }
  return sharedGraphemeSegmenter2;
}
function createEmptyPrepared(includeSegments) {
  if (includeSegments) {
    return {
      widths: [],
      lineEndFitAdvances: [],
      lineEndPaintAdvances: [],
      kinds: [],
      simpleLineWalkFastPath: true,
      segLevels: null,
      breakableWidths: [],
      breakablePrefixWidths: [],
      discretionaryHyphenWidth: 0,
      tabStopAdvance: 0,
      chunks: [],
      segments: []
    };
  }
  return {
    widths: [],
    lineEndFitAdvances: [],
    lineEndPaintAdvances: [],
    kinds: [],
    simpleLineWalkFastPath: true,
    segLevels: null,
    breakableWidths: [],
    breakablePrefixWidths: [],
    discretionaryHyphenWidth: 0,
    tabStopAdvance: 0,
    chunks: []
  };
}
function measureAnalysis(analysis, font, includeSegments) {
  const graphemeSegmenter = getSharedGraphemeSegmenter2();
  const engineProfile = getEngineProfile();
  const { cache, emojiCorrection } = getFontMeasurementState(font, textMayContainEmoji(analysis.normalized));
  const discretionaryHyphenWidth = getCorrectedSegmentWidth("-", getSegmentMetrics("-", cache), emojiCorrection);
  const spaceWidth = getCorrectedSegmentWidth(" ", getSegmentMetrics(" ", cache), emojiCorrection);
  const tabStopAdvance = spaceWidth * 8;
  if (analysis.len === 0)
    return createEmptyPrepared(includeSegments);
  const widths = [];
  const lineEndFitAdvances = [];
  const lineEndPaintAdvances = [];
  const kinds = [];
  let simpleLineWalkFastPath = analysis.chunks.length <= 1;
  const segStarts = includeSegments ? [] : null;
  const breakableWidths = [];
  const breakablePrefixWidths = [];
  const segments = includeSegments ? [] : null;
  const preparedStartByAnalysisIndex = Array.from({ length: analysis.len });
  const preparedEndByAnalysisIndex = Array.from({ length: analysis.len });
  function pushMeasuredSegment(text, width, lineEndFitAdvance, lineEndPaintAdvance, kind, start, breakable, breakablePrefix) {
    if (kind !== "text" && kind !== "space" && kind !== "zero-width-break") {
      simpleLineWalkFastPath = false;
    }
    widths.push(width);
    lineEndFitAdvances.push(lineEndFitAdvance);
    lineEndPaintAdvances.push(lineEndPaintAdvance);
    kinds.push(kind);
    segStarts?.push(start);
    breakableWidths.push(breakable);
    breakablePrefixWidths.push(breakablePrefix);
    if (segments !== null)
      segments.push(text);
  }
  for (let mi = 0;mi < analysis.len; mi++) {
    preparedStartByAnalysisIndex[mi] = widths.length;
    const segText = analysis.texts[mi];
    const segWordLike = analysis.isWordLike[mi];
    const segKind = analysis.kinds[mi];
    const segStart = analysis.starts[mi];
    if (segKind === "soft-hyphen") {
      pushMeasuredSegment(segText, 0, discretionaryHyphenWidth, discretionaryHyphenWidth, segKind, segStart, null, null);
      preparedEndByAnalysisIndex[mi] = widths.length;
      continue;
    }
    if (segKind === "hard-break") {
      pushMeasuredSegment(segText, 0, 0, 0, segKind, segStart, null, null);
      preparedEndByAnalysisIndex[mi] = widths.length;
      continue;
    }
    if (segKind === "tab") {
      pushMeasuredSegment(segText, 0, 0, 0, segKind, segStart, null, null);
      preparedEndByAnalysisIndex[mi] = widths.length;
      continue;
    }
    const segMetrics = getSegmentMetrics(segText, cache);
    if (segKind === "text" && segMetrics.containsCJK) {
      let unitText = "";
      let unitStart = 0;
      for (const gs of graphemeSegmenter.segment(segText)) {
        const grapheme = gs.segment;
        if (unitText.length === 0) {
          unitText = grapheme;
          unitStart = gs.index;
          continue;
        }
        if (kinsokuEnd.has(unitText) || kinsokuStart.has(grapheme) || leftStickyPunctuation.has(grapheme) || engineProfile.carryCJKAfterClosingQuote && isCJK(grapheme) && endsWithClosingQuote(unitText)) {
          unitText += grapheme;
          continue;
        }
        const unitMetrics = getSegmentMetrics(unitText, cache);
        const w2 = getCorrectedSegmentWidth(unitText, unitMetrics, emojiCorrection);
        pushMeasuredSegment(unitText, w2, w2, w2, "text", segStart + unitStart, null, null);
        unitText = grapheme;
        unitStart = gs.index;
      }
      if (unitText.length > 0) {
        const unitMetrics = getSegmentMetrics(unitText, cache);
        const w2 = getCorrectedSegmentWidth(unitText, unitMetrics, emojiCorrection);
        pushMeasuredSegment(unitText, w2, w2, w2, "text", segStart + unitStart, null, null);
      }
      preparedEndByAnalysisIndex[mi] = widths.length;
      continue;
    }
    const w = getCorrectedSegmentWidth(segText, segMetrics, emojiCorrection);
    const lineEndFitAdvance = segKind === "space" || segKind === "preserved-space" || segKind === "zero-width-break" ? 0 : w;
    const lineEndPaintAdvance = segKind === "space" || segKind === "zero-width-break" ? 0 : w;
    if (segWordLike && segText.length > 1) {
      const graphemeWidths = getSegmentGraphemeWidths(segText, segMetrics, cache, emojiCorrection);
      const graphemePrefixWidths = engineProfile.preferPrefixWidthsForBreakableRuns ? getSegmentGraphemePrefixWidths(segText, segMetrics, cache, emojiCorrection) : null;
      pushMeasuredSegment(segText, w, lineEndFitAdvance, lineEndPaintAdvance, segKind, segStart, graphemeWidths, graphemePrefixWidths);
    } else {
      pushMeasuredSegment(segText, w, lineEndFitAdvance, lineEndPaintAdvance, segKind, segStart, null, null);
    }
    preparedEndByAnalysisIndex[mi] = widths.length;
  }
  const chunks = mapAnalysisChunksToPreparedChunks(analysis.chunks, preparedStartByAnalysisIndex, preparedEndByAnalysisIndex);
  const segLevels = segStarts === null ? null : computeSegmentLevels(analysis.normalized, segStarts);
  if (segments !== null) {
    return {
      widths,
      lineEndFitAdvances,
      lineEndPaintAdvances,
      kinds,
      simpleLineWalkFastPath,
      segLevels,
      breakableWidths,
      breakablePrefixWidths,
      discretionaryHyphenWidth,
      tabStopAdvance,
      chunks,
      segments
    };
  }
  return {
    widths,
    lineEndFitAdvances,
    lineEndPaintAdvances,
    kinds,
    simpleLineWalkFastPath,
    segLevels,
    breakableWidths,
    breakablePrefixWidths,
    discretionaryHyphenWidth,
    tabStopAdvance,
    chunks
  };
}
function mapAnalysisChunksToPreparedChunks(chunks, preparedStartByAnalysisIndex, preparedEndByAnalysisIndex) {
  const preparedChunks = [];
  for (let i = 0;i < chunks.length; i++) {
    const chunk = chunks[i];
    const startSegmentIndex = chunk.startSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.startSegmentIndex] : preparedEndByAnalysisIndex[preparedEndByAnalysisIndex.length - 1] ?? 0;
    const endSegmentIndex = chunk.endSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.endSegmentIndex] : preparedEndByAnalysisIndex[preparedEndByAnalysisIndex.length - 1] ?? 0;
    const consumedEndSegmentIndex = chunk.consumedEndSegmentIndex < preparedStartByAnalysisIndex.length ? preparedStartByAnalysisIndex[chunk.consumedEndSegmentIndex] : preparedEndByAnalysisIndex[preparedEndByAnalysisIndex.length - 1] ?? 0;
    preparedChunks.push({
      startSegmentIndex,
      endSegmentIndex,
      consumedEndSegmentIndex
    });
  }
  return preparedChunks;
}
function prepareInternal(text, font, includeSegments, options) {
  const analysis = analyzeText(text, getEngineProfile(), options?.whiteSpace);
  return measureAnalysis(analysis, font, includeSegments);
}
function profilePrepare(text, font, options) {
  const t0 = performance.now();
  const analysis = analyzeText(text, getEngineProfile(), options?.whiteSpace);
  const t1 = performance.now();
  const prepared = measureAnalysis(analysis, font, false);
  const t2 = performance.now();
  let breakableSegments = 0;
  for (const widths of prepared.breakableWidths) {
    if (widths !== null)
      breakableSegments++;
  }
  return {
    analysisMs: t1 - t0,
    measureMs: t2 - t1,
    totalMs: t2 - t0,
    analysisSegments: analysis.len,
    preparedSegments: prepared.widths.length,
    breakableSegments
  };
}
function prepare(text, font, options) {
  return prepareInternal(text, font, false, options);
}
function prepareWithSegments(text, font, options) {
  return prepareInternal(text, font, true, options);
}
function getInternalPrepared(prepared) {
  return prepared;
}
function layout(prepared, maxWidth, lineHeight) {
  const lineCount = countPreparedLines(getInternalPrepared(prepared), maxWidth);
  return { lineCount, height: lineCount * lineHeight };
}
function getSegmentGraphemes(segmentIndex, segments, cache) {
  let graphemes = cache.get(segmentIndex);
  if (graphemes !== undefined)
    return graphemes;
  graphemes = [];
  const graphemeSegmenter = getSharedGraphemeSegmenter2();
  for (const gs of graphemeSegmenter.segment(segments[segmentIndex])) {
    graphemes.push(gs.segment);
  }
  cache.set(segmentIndex, graphemes);
  return graphemes;
}
function getLineTextCache(prepared) {
  let cache = sharedLineTextCaches.get(prepared);
  if (cache !== undefined)
    return cache;
  cache = new Map;
  sharedLineTextCaches.set(prepared, cache);
  return cache;
}
function lineHasDiscretionaryHyphen(kinds, startSegmentIndex, startGraphemeIndex, endSegmentIndex) {
  return endSegmentIndex > 0 && kinds[endSegmentIndex - 1] === "soft-hyphen" && !(startSegmentIndex === endSegmentIndex && startGraphemeIndex > 0);
}
function buildLineTextFromRange(segments, kinds, cache, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex) {
  let text = "";
  const endsWithDiscretionaryHyphen = lineHasDiscretionaryHyphen(kinds, startSegmentIndex, startGraphemeIndex, endSegmentIndex);
  for (let i = startSegmentIndex;i < endSegmentIndex; i++) {
    if (kinds[i] === "soft-hyphen" || kinds[i] === "hard-break")
      continue;
    if (i === startSegmentIndex && startGraphemeIndex > 0) {
      text += getSegmentGraphemes(i, segments, cache).slice(startGraphemeIndex).join("");
    } else {
      text += segments[i];
    }
  }
  if (endGraphemeIndex > 0) {
    if (endsWithDiscretionaryHyphen)
      text += "-";
    text += getSegmentGraphemes(endSegmentIndex, segments, cache).slice(startSegmentIndex === endSegmentIndex ? startGraphemeIndex : 0, endGraphemeIndex).join("");
  } else if (endsWithDiscretionaryHyphen) {
    text += "-";
  }
  return text;
}
function createLayoutLine(prepared, cache, width, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex) {
  return {
    text: buildLineTextFromRange(prepared.segments, prepared.kinds, cache, startSegmentIndex, startGraphemeIndex, endSegmentIndex, endGraphemeIndex),
    width,
    start: {
      segmentIndex: startSegmentIndex,
      graphemeIndex: startGraphemeIndex
    },
    end: {
      segmentIndex: endSegmentIndex,
      graphemeIndex: endGraphemeIndex
    }
  };
}
function materializeLayoutLine(prepared, cache, line) {
  return createLayoutLine(prepared, cache, line.width, line.startSegmentIndex, line.startGraphemeIndex, line.endSegmentIndex, line.endGraphemeIndex);
}
function toLayoutLineRange(line) {
  return {
    width: line.width,
    start: {
      segmentIndex: line.startSegmentIndex,
      graphemeIndex: line.startGraphemeIndex
    },
    end: {
      segmentIndex: line.endSegmentIndex,
      graphemeIndex: line.endGraphemeIndex
    }
  };
}
function stepLineRange(prepared, start, maxWidth) {
  const line = layoutNextLineRange(prepared, start, maxWidth);
  if (line === null)
    return null;
  return toLayoutLineRange(line);
}
function materializeLine(prepared, line) {
  return createLayoutLine(prepared, getLineTextCache(prepared), line.width, line.start.segmentIndex, line.start.graphemeIndex, line.end.segmentIndex, line.end.graphemeIndex);
}
function walkLineRanges(prepared, maxWidth, onLine) {
  if (prepared.widths.length === 0)
    return 0;
  return walkPreparedLines(getInternalPrepared(prepared), maxWidth, (line) => {
    onLine(toLayoutLineRange(line));
  });
}
function layoutNextLine(prepared, start, maxWidth) {
  const line = stepLineRange(prepared, start, maxWidth);
  if (line === null)
    return null;
  return materializeLine(prepared, line);
}
function layoutWithLines(prepared, maxWidth, lineHeight) {
  const lines = [];
  if (prepared.widths.length === 0)
    return { lineCount: 0, height: 0, lines };
  const graphemeCache = getLineTextCache(prepared);
  const lineCount = walkPreparedLines(getInternalPrepared(prepared), maxWidth, (line) => {
    lines.push(materializeLayoutLine(prepared, graphemeCache, line));
  });
  return { lineCount, height: lineCount * lineHeight, lines };
}
function clearCache() {
  clearAnalysisCaches();
  sharedGraphemeSegmenter2 = null;
  sharedLineTextCaches = new WeakMap;
  clearMeasurementCaches();
}

// pages/demos/icaro-quine.ts
var W = 640;
var H = 480;
var G_ROWS = 96;
var G_COLS = 128;
var B_SZ = 5;
var BASE_FPS = 12;
var INKS = [
  { id: 0, hex: "#ffffff", rgb: [0, 0, 0, 0] },
  { id: 1, hex: "#dddddd", rgb: [0, 0, 0, 40] },
  { id: 2, hex: "#bbbbbb", rgb: [0, 0, 0, 80] },
  { id: 3, hex: "#999999", rgb: [0, 0, 0, 120] },
  { id: 4, hex: "#777777", rgb: [0, 0, 0, 160] },
  { id: 5, hex: "#555555", rgb: [0, 0, 0, 200] },
  { id: 6, hex: "#333333", rgb: [0, 0, 0, 230] },
  { id: 7, hex: "#000000", rgb: [0, 0, 0, 255] }
];
var DOT_STAMPS = [];
function buildDotStamps() {
  const maxR = B_SZ * 0.45;
  for (let v = 0;v < 8; v++) {
    const c = document.createElement("canvas");
    c.width = B_SZ;
    c.height = B_SZ;
    if (v > 0) {
      const dc = c.getContext("2d");
      dc.fillStyle = "#000000";
      dc.beginPath();
      dc.arc(B_SZ / 2, B_SZ / 2, Math.max(0.4, maxR * (v / 7)), 0, Math.PI * 2);
      dc.fill();
    }
    DOT_STAMPS[v] = c;
  }
}
function alphaToLevel(a) {
  if (a < 16)
    return 0;
  if (a < 55)
    return 1;
  if (a < 95)
    return 2;
  if (a < 135)
    return 3;
  if (a < 175)
    return 4;
  if (a < 210)
    return 5;
  if (a < 240)
    return 6;
  return 7;
}
var state = {
  frames: [],
  cur: 0,
  playing: false,
  tool: "pen",
  color: 7,
  size: 5,
  grid: false,
  renderMode: "dot",
  dragging: false,
  p0: [0, 0],
  p1: [0, 0],
  activeNav: null,
  obstacleFlow: false,
  liveCam: false,
  audioSourceBlob: null
};
var cvs = document.getElementById("primary-buffer");
var ctx = cvs.getContext("2d", { willReadFrequently: true });
var compBuf = document.createElement("canvas");
compBuf.width = W;
compBuf.height = H;
var compCtx = compBuf.getContext("2d", { willReadFrequently: true });
var sharedValGrid = new Uint8Array(G_ROWS * G_COLS);
var _fitCanvas = document.createElement("canvas");
_fitCanvas.width = W;
_fitCanvas.height = H;
var _fitCtx = _fitCanvas.getContext("2d");
var _posterCanvas = document.createElement("canvas");
_posterCanvas.width = G_COLS;
_posterCanvas.height = G_ROWS;
var _posterCtx = _posterCanvas.getContext("2d");
var _srcGridCanvas = document.createElement("canvas");
_srcGridCanvas.width = G_COLS;
_srcGridCanvas.height = G_ROWS;
var _srcGridCtx = _srcGridCanvas.getContext("2d");
var _reuseSrcGrid = new Uint8Array(G_ROWS * G_COLS);
var playRAF = 0;
var lastT = 0;
var preparedText = null;
var preparedFont = "";
var lastPrepareMs = 0;
var lastLayoutMs = 0;
var quineDensity = 1.5;
function prepareQuineText(text, font) {
  const t0 = performance.now();
  preparedText = prepareWithSegments(text, font);
  preparedFont = font;
  lastPrepareMs = performance.now() - t0;
}
var _cachedQuineText = "";
var _lastQuineRawLen = -1;
var _fullScriptText = "";
var TEXTAREA_CHAR_LIMIT = 200000;
function getFullScript() {
  const el = document.getElementById("b-script");
  if (_fullScriptText)
    return _fullScriptText;
  return el ? el.value : "";
}
function setScriptText(text) {
  _fullScriptText = text;
  const el = document.getElementById("b-script");
  if (!el)
    return;
  const lineCount = text.split(`
`).length;
  if (text.length > TEXTAREA_CHAR_LIMIT) {
    el.value = text.substring(0, TEXTAREA_CHAR_LIMIT) + `

... [TRUNCATED]`;
  } else {
    el.value = text;
  }
  updateScriptInfo(lineCount, text.length);
}
function getQuineText() {
  const raw = _fullScriptText || getFullScript();
  if (_cachedQuineText && raw.length === _lastQuineRawLen)
    return _cachedQuineText;
  _lastQuineRawLen = raw.length;
  _cachedQuineText = raw.replace(/\s+/g, " ").trim();
  if (!_cachedQuineText)
    _cachedQuineText = "ABC FLIX 128 BEFLIX PROCESSOR ";
  if (_cachedQuineText.length > 20000) {
    _cachedQuineText = _cachedQuineText.substring(0, 20000);
  }
  while (_cachedQuineText.length < 20000)
    _cachedQuineText += " " + _cachedQuineText;
  return _cachedQuineText;
}
function updateScriptInfo(lineCount, charCount) {
  const linesEl = document.getElementById("b-script-lines");
  if (linesEl)
    linesEl.textContent = lineCount.toLocaleString() + " LINES · " + (charCount / 1024).toFixed(1) + "KB";
}
function computeRowOffsets() {
  const offsets = new Array(G_ROWS).fill(0);
  if (!state.obstacleFlow)
    return offsets;
  for (let gy = 0;gy < G_ROWS; gy++) {
    let massSum = 0, posSum = 0;
    for (let gx = 0;gx < G_COLS; gx++) {
      const v = sharedValGrid[gy * G_COLS + gx];
      if (v >= 2) {
        massSum += v;
        posSum += gx * v;
      }
    }
    if (massSum > 0) {
      const centerOfMass = posSum / massSum;
      const canvasCenter = G_COLS / 2;
      offsets[gy] = Math.round((canvasCenter - centerOfMass) * B_SZ * 0.3);
    }
  }
  return offsets;
}
function renderTextFrame(tc) {
  tc.clearRect(0, 0, W, H);
  const qText = getQuineText();
  const fontSize = B_SZ * quineDensity;
  const lh = B_SZ;
  const fontStr = `900 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  if (!preparedText || preparedFont !== fontStr) {
    prepareQuineText(qText, fontStr);
  }
  if (!preparedText)
    return;
  const t0 = performance.now();
  tc.textAlign = "left";
  tc.textBaseline = "top";
  tc.font = fontStr;
  tc.fillStyle = "#000000";
  const rowOffsets = state.obstacleFlow ? computeRowOffsets() : null;
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  for (let row = 0;row < G_ROWS; row++) {
    const y = row * lh;
    if (y > H)
      break;
    const line = layoutNextLine(preparedText, cursor, W);
    if (line === null) {
      cursor = { segmentIndex: 0, graphemeIndex: 0 };
      const retry = layoutNextLine(preparedText, cursor, W);
      if (retry === null)
        break;
      const xOff = rowOffsets ? rowOffsets[row] : 0;
      tc.fillText(retry.text, xOff, y);
      cursor = retry.end;
    } else {
      const xOff = rowOffsets ? rowOffsets[row] : 0;
      tc.fillText(line.text, xOff, y);
      cursor = line.end;
      if (cursor.segmentIndex >= preparedText.segments.length) {
        cursor = { segmentIndex: 0, graphemeIndex: 0 };
      }
    }
  }
  lastLayoutMs = performance.now() - t0;
  tc.globalCompositeOperation = "source-atop";
  for (let v = 0;v <= 7; v++) {
    tc.fillStyle = v > 0 ? INKS[v].hex : "#FFFFFF";
    tc.beginPath();
    for (let gy = 0;gy < G_ROWS; gy++) {
      for (let gx = 0;gx < G_COLS; gx++) {
        if (sharedValGrid[gy * G_COLS + gx] === v) {
          tc.rect(gx * B_SZ, gy * B_SZ, B_SZ, B_SZ);
        }
      }
    }
    tc.fill();
  }
  tc.globalCompositeOperation = "destination-over";
  tc.fillStyle = "#FFFFFF";
  tc.fillRect(0, 0, W, H);
  tc.globalCompositeOperation = "source-over";
}
function renderDotFrame(f, targetCanvas, live = null) {
  const tc = targetCanvas.getContext("2d");
  let srcGrid = null;
  if (f.src) {
    _srcGridCtx.imageSmoothingEnabled = true;
    _srcGridCtx.clearRect(0, 0, G_COLS, G_ROWS);
    _srcGridCtx.drawImage(f.src, 0, 0, G_COLS, G_ROWS);
    const srcPx = _srcGridCtx.getImageData(0, 0, G_COLS, G_ROWS).data;
    srcGrid = _reuseSrcGrid;
    for (let i = 0;i < G_ROWS * G_COLS; i++) {
      const pi = i * 4;
      const lum = srcPx[pi] * 0.299 + srcPx[pi + 1] * 0.587 + srcPx[pi + 2] * 0.114;
      srcGrid[i] = Math.round((255 - lum) / 255 * 7);
    }
  }
  for (let gy = 0;gy < G_ROWS; gy++) {
    for (let gx = 0;gx < G_COLS; gx++) {
      const sX = gx * B_SZ + Math.floor(B_SZ / 2);
      const sY = gy * B_SZ + Math.floor(B_SZ / 2);
      const sIdx = (sY * W + sX) * 4;
      let val = 0;
      if (live && live[sIdx + 3] >= 16) {
        val = alphaToLevel(live[sIdx + 3]);
      } else if (f.handLayer[sIdx + 3] >= 16) {
        val = alphaToLevel(f.handLayer[sIdx + 3]);
      } else if (f.scriptLayer[sIdx + 3] >= 16) {
        val = alphaToLevel(f.scriptLayer[sIdx + 3]);
      } else if (srcGrid) {
        val = srcGrid[gy * G_COLS + gx];
      }
      sharedValGrid[gy * G_COLS + gx] = val;
    }
  }
  if (state.renderMode === "text") {
    renderTextFrame(tc);
  } else {
    tc.fillStyle = "#FFFFFF";
    tc.fillRect(0, 0, W, H);
    tc.strokeStyle = "rgba(0,0,0,0.06)";
    tc.lineWidth = 0.5;
    for (let gy = 0;gy < G_ROWS; gy++) {
      const py = gy * B_SZ + B_SZ * 0.5;
      tc.beginPath();
      tc.moveTo(0, py);
      tc.lineTo(W, py);
      tc.stroke();
    }
    for (let gy = 0;gy < G_ROWS; gy++) {
      for (let gx = 0;gx < G_COLS; gx++) {
        const val = sharedValGrid[gy * G_COLS + gx];
        if (val > 0 && DOT_STAMPS[val]) {
          tc.drawImage(DOT_STAMPS[val], gx * B_SZ, gy * B_SZ);
        }
      }
    }
  }
}
function renderOutput() {
  const f = state.frames[state.cur];
  if (!f)
    return;
  let live = null;
  if (state.dragging && state.tool === "rect") {
    live = getBlankMatrix();
    plotRect(live, state.p0[0], state.p0[1], state.p1[0], state.p1[1], INKS[state.color].rgb, state.size);
  }
  renderDotFrame(f, compBuf, live);
  ctx.drawImage(compBuf, 0, 0);
  updatePretextHUD();
}
function updatePretextHUD() {
  const hud = document.getElementById("pretext-hud");
  if (state.renderMode === "text" && preparedText) {
    hud.style.display = "block";
    const segs = preparedText.segments.length;
    const flow = state.obstacleFlow ? " · FLOW" : "";
    hud.textContent = `PRETEXT: ${segs} segs · prep ${lastPrepareMs.toFixed(1)}ms · layout ${lastLayoutMs.toFixed(3)}ms${flow}`;
  } else {
    hud.style.display = "none";
  }
}
function getBlankMatrix() {
  return new Uint8ClampedArray(W * H * 4);
}
function injectFrame(init = false) {
  state.frames.push({ src: null, scriptLayer: getBlankMatrix(), handLayer: getBlankMatrix() });
  if (!init) {
    state.cur = state.frames.length - 1;
    rebuildTrack();
    renderOutput();
    updateStatusBar();
  }
}
function duplicateFrame() {
  if (!state.frames.length)
    return;
  const ref = state.frames[state.cur];
  state.frames.splice(state.cur + 1, 0, {
    src: ref.src,
    scriptLayer: new Uint8ClampedArray(ref.scriptLayer),
    handLayer: new Uint8ClampedArray(ref.handLayer)
  });
  state.cur++;
  rebuildTrack();
  renderOutput();
  updateStatusBar();
  fireToast("COPIED");
}
function stepSequence(dir) {
  if (state.playing || !state.frames.length)
    return;
  state.cur = (state.cur + dir + state.frames.length) % state.frames.length;
  rebuildTrack();
  renderOutput();
  updateStatusBar();
}
function renderDotFrameForThumb(f, targetCanvas) {
  const savedMode = state.renderMode;
  state.renderMode = "dot";
  renderDotFrame(f, targetCanvas);
  state.renderMode = savedMode;
}
function rebuildTrack() {
  const trk = document.getElementById("tl-strip");
  trk.innerHTML = "";
  state.frames.forEach((f, i) => {
    const w = document.createElement("div");
    w.className = "tl-frame" + (i === state.cur ? " on" : "");
    w.onclick = () => {
      if (state.playing)
        return;
      state.cur = i;
      rebuildTrack();
      renderOutput();
      updateStatusBar();
    };
    const c = document.createElement("canvas");
    c.className = "tl-thumb";
    c.width = W;
    c.height = H;
    renderDotFrameForThumb(f, c);
    w.appendChild(c);
    const n = document.createElement("div");
    n.className = "tl-num";
    n.textContent = String(i + 1);
    w.appendChild(n);
    trk.appendChild(w);
    if (i === state.cur)
      w.scrollIntoView({ inline: "center", block: "nearest" });
  });
  updateStatusBar();
}
function engageSequence() {
  state.playing = !state.playing;
  updatePlayOverlay();
  if (state.playing) {
    lastT = performance.now();
    playRAF = requestAnimationFrame(playStep);
  } else {
    cancelAnimationFrame(playRAF);
    renderOutput();
    rebuildTrack();
  }
}
function playStep(now) {
  if (!state.playing)
    return;
  playRAF = requestAnimationFrame(playStep);
  const el = now - lastT, dur = 1000 / BASE_FPS;
  if (el >= dur) {
    lastT = now - el % dur;
    state.cur = (state.cur + 1) % state.frames.length;
    renderOutput();
    document.querySelectorAll(".tl-frame").forEach((el2, i) => i === state.cur ? el2.classList.add("on") : el2.classList.remove("on"));
    const fb = document.getElementById("sb-frame");
    if (fb)
      fb.textContent = `${String(state.cur + 1).padStart(2, "0")}/${String(state.frames.length).padStart(2, "0")}`;
  }
}
function updatePlayOverlay() {
  const hasFrames = state.frames.length > 0;
  const isDrawMode = state.activeNav === "C";
  const overlay = document.getElementById("play-overlay");
  const tapZone = document.getElementById("canvas-tap-zone");
  if (overlay)
    overlay.classList.toggle("visible", hasFrames && !state.playing && !isDrawMode);
  if (tapZone)
    tapZone.classList.toggle("on", hasFrames && !isDrawMode);
  const btn = document.getElementById("sb-play-btn");
  const lbl = document.getElementById("play-label");
  const icon = document.getElementById("play-icon");
  if (btn)
    btn.classList.toggle("playing", state.playing);
  if (lbl)
    lbl.textContent = state.playing ? "STOP" : "PLAY";
  if (icon)
    icon.innerHTML = state.playing ? '<rect x="0" y="0" width="5" height="16"/><rect x="9" y="0" width="5" height="16"/>' : '<polygon points="0,0 14,8 0,16"/>';
}
function updateStatusBar() {
  const ink = INKS[state.color];
  const sb = document.getElementById("sb-frame");
  if (sb)
    sb.textContent = state.frames.length ? `${String(state.cur + 1).padStart(2, "0")}/${String(state.frames.length).padStart(2, "0")}` : "00/00";
  const st = document.getElementById("sb-tool");
  if (st)
    st.textContent = state.tool.toUpperCase();
  const dot = document.getElementById("sb-color");
  if (dot && ink)
    dot.style.background = ink.hex;
  const fpsEl = document.getElementById("sb-fps-val");
  if (fpsEl)
    fpsEl.textContent = String(BASE_FPS);
  const badge = document.getElementById("tab-c-badge");
  if (badge && ink)
    badge.style.background = ink.hex;
  updatePlayOverlay();
}
function bindPixel(arr, x, y, c) {
  if (x < 0 || x >= W || y < 0 || y >= H)
    return;
  const i = (y * W + x) * 4;
  arr[i] = c[0];
  arr[i + 1] = c[1];
  arr[i + 2] = c[2];
  arr[i + 3] = c[3];
}
function plotBlock(arr, x, y, c, r) {
  const rad = r / 2;
  for (let iy = -Math.ceil(rad);iy <= Math.ceil(rad); iy++)
    for (let ix = -Math.ceil(rad);ix <= Math.ceil(rad); ix++)
      if (ix * ix + iy * iy <= rad * rad)
        bindPixel(arr, Math.round(x + ix), Math.round(y + iy), c);
}
function plotVector(arr, x0, y0, x1, y1, c, w) {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, lim = 3000;
  while (lim-- > 0) {
    plotBlock(arr, x0, y0, c, w);
    if (x0 === x1 && y0 === y1)
      break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}
function plotRect(arr, x0, y0, x1, y1, c, w) {
  plotVector(arr, x0, y0, x1, y0, c, w);
  plotVector(arr, x1, y0, x1, y1, c, w);
  plotVector(arr, x1, y1, x0, y1, c, w);
  plotVector(arr, x0, y1, x0, y0, c, w);
}
function mapCoord(e) {
  const r = cvs.getBoundingClientRect();
  if (!r.width)
    return [0, 0];
  return [
    Math.max(0, Math.min(W - 1, Math.floor((e.clientX - r.left) / r.width * W))),
    Math.max(0, Math.min(H - 1, Math.floor((e.clientY - r.top) / r.height * H)))
  ];
}
function commitStroke(p0, p1, final = false) {
  const f = state.frames[state.cur];
  const col = state.tool === "erase" ? INKS[0].rgb : INKS[state.color].rgb;
  if (state.tool === "pen" || state.tool === "erase")
    plotVector(f.handLayer, p0[0], p0[1], p1[0], p1[1], col, state.size);
  else if (state.tool === "rect" && final)
    plotRect(f.handLayer, p0[0], p0[1], p1[0], p1[1], col, state.size);
  renderOutput();
}
cvs.addEventListener("pointerdown", (e) => {
  const drawActive = state.activeNav === "C" || document.getElementById("draw-toolbar").classList.contains("on");
  if (!drawActive)
    return;
  cvs.setPointerCapture(e.pointerId);
  state.dragging = true;
  state.p0 = mapCoord(e);
  state.p1 = state.p0;
  commitStroke(state.p0, state.p0);
});
cvs.addEventListener("pointermove", (e) => {
  if (!state.dragging)
    return;
  const prev = state.p1;
  state.p1 = mapCoord(e);
  if (state.tool === "rect")
    renderOutput();
  else
    commitStroke(prev, state.p1);
});
cvs.addEventListener("pointerup", () => {
  if (!state.dragging)
    return;
  if (state.tool === "rect")
    commitStroke(state.p0, state.p1, true);
  state.dragging = false;
  renderOutput();
  rebuildTrack();
});
var SCRIPT_CHUNK_SIZE = 500;
async function executeMacro() {
  const runBtn = document.getElementById("btn-run-script");
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = "RUNNING...";
  }
  const fullCode = getFullScript().toUpperCase().split(`
`);
  const totalLines = fullCode.length;
  if (totalLines === 0) {
    fireToast("NO SCRIPT");
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = "RUN SCRIPT";
    }
    return;
  }
  lockSystem("COMPILING SCRIPT...", "0");
  await new Promise((r) => setTimeout(r, 50));
  const res = [];
  let mat = Array.from({ length: G_ROWS }, () => Array(G_COLS).fill(0));
  try {
    for (let chunk = 0;chunk < totalLines; chunk += SCRIPT_CHUNK_SIZE) {
      const end = Math.min(chunk + SCRIPT_CHUNK_SIZE, totalLines);
      for (let li = chunk;li < end; li++) {
        const l = fullCode[li].trim();
        if (!l || l.startsWith("C"))
          continue;
        const p = l.split(/\s+/), cmd = p[0], a = p.slice(1).map(Number);
        if (cmd === "CLR") {
          for (let y = 0;y < G_ROWS; y++)
            for (let x = 0;x < G_COLS; x++)
              mat[y][x] = a[0];
        } else if (cmd === "PNT") {
          for (let y = a[1];y < a[1] + a[3]; y++)
            for (let x = a[0];x < a[0] + a[2]; x++)
              if (y >= 0 && y < G_ROWS && x >= 0 && x < G_COLS)
                mat[y][x] = a[4];
        } else if (cmd === "LIN") {
          const lv = a[4];
          let lx = a[0], ly = a[1];
          const lx2 = a[2], ly2 = a[3];
          let dx = Math.abs(lx2 - lx), sx = lx < lx2 ? 1 : -1;
          let dy = -Math.abs(ly2 - ly), sy = ly < ly2 ? 1 : -1;
          let err = dx + dy, lim = 2000;
          while (lim-- > 0) {
            if (lx >= 0 && lx < G_COLS && ly >= 0 && ly < G_ROWS)
              mat[ly][lx] = lv;
            if (lx === lx2 && ly === ly2)
              break;
            const e2 = 2 * err;
            if (e2 >= dy) {
              err += dy;
              lx += sx;
            }
            if (e2 <= dx) {
              err += dx;
              ly += sy;
            }
          }
        } else if (cmd === "REC") {
          for (let i = 0;i < Math.min(a[0], 5000); i++)
            res.push(mat.map((r) => [...r]));
        } else if (cmd === "SHF") {
          for (let f = 0;f < Math.min(a[2], 5000); f++) {
            const n = Array.from({ length: G_ROWS }, () => Array(G_COLS).fill(0));
            for (let y = 0;y < G_ROWS; y++)
              for (let x = 0;x < G_COLS; x++) {
                const nx = x - a[0], ny = y - a[1];
                if (nx >= 0 && nx < G_COLS && ny >= 0 && ny < G_ROWS)
                  n[y][x] = mat[ny][nx];
              }
            mat = n;
            res.push(mat.map((r) => [...r]));
          }
        }
      }
      if (chunk + SCRIPT_CHUNK_SIZE < totalLines) {
        const pct = Math.round(end / totalLines * 100);
        document.getElementById("lock-counter").textContent = "LINE " + end.toLocaleString() + "/" + totalLines.toLocaleString() + " (" + pct + "%)";
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    if (!res.length)
      res.push(mat);
    document.getElementById("lock-counter").textContent = "BUILDING " + res.length + " FRAMES...";
    await new Promise((r) => setTimeout(r, 0));
    while (state.frames.length < res.length)
      injectFrame(true);
    if (state.frames.length > res.length)
      state.frames.length = res.length;
    for (let i = 0;i < state.frames.length; i++) {
      const f = state.frames[i], sm = res[i % res.length];
      f.scriptLayer.fill(0);
      for (let y = 0;y < G_ROWS; y++)
        for (let x = 0;x < G_COLS; x++) {
          if (!sm[y][x])
            continue;
          const col = INKS[sm[y][x]].rgb;
          for (let by = 0;by < B_SZ; by++)
            for (let bx = 0;bx < B_SZ; bx++)
              bindPixel(f.scriptLayer, x * B_SZ + bx, y * B_SZ + by, col);
        }
      if (state.frames.length > 20 && i % 20 === 19) {
        document.getElementById("lock-counter").textContent = "FRAME " + (i + 1) + "/" + state.frames.length;
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    _cachedQuineText = "";
    _lastQuineRawLen = -1;
    const fontSize = B_SZ * quineDensity;
    const fontStr = `900 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    prepareQuineText(getQuineText(), fontStr);
    fireToast(state.frames.length + " FRAMES · " + (preparedText?.segments.length || 0) + " PRETEXT SEGS");
    state.cur = 0;
    renderOutput();
    rebuildTrack();
    updateStatusBar();
  } catch (e) {
    console.error("MACRO ERROR:", e);
    fireToast("SYNTAX HALT: " + (e.message || "PARSE ERROR"));
  } finally {
    releaseSystem();
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = "RUN SCRIPT";
    }
  }
}
function decompileFrames() {
  let fullCode = "";
  for (let fIdx = 0;fIdx < state.frames.length; fIdx++) {
    fullCode += "C FRAME " + (fIdx + 1) + `
`;
    const f = state.frames[fIdx];
    const grid = Array.from({ length: G_ROWS }, () => Array(G_COLS).fill(0));
    let srcGrid = null;
    if (f.src) {
      const tmpC = document.createElement("canvas");
      tmpC.width = G_COLS;
      tmpC.height = G_ROWS;
      const tmpX = tmpC.getContext("2d");
      tmpX.imageSmoothingEnabled = true;
      tmpX.drawImage(f.src, 0, 0, G_COLS, G_ROWS);
      const srcPx = tmpX.getImageData(0, 0, G_COLS, G_ROWS).data;
      srcGrid = new Uint8Array(G_ROWS * G_COLS);
      for (let si = 0;si < G_ROWS * G_COLS; si++) {
        const pi = si * 4;
        srcGrid[si] = Math.round((255 - (srcPx[pi] * 0.299 + srcPx[pi + 1] * 0.587 + srcPx[pi + 2] * 0.114)) / 255 * 7);
      }
    }
    for (let gy = 0;gy < G_ROWS; gy++) {
      for (let gx = 0;gx < G_COLS; gx++) {
        const px = gx * B_SZ + Math.floor(B_SZ / 2), py = gy * B_SZ + Math.floor(B_SZ / 2);
        const idx = (py * W + px) * 4;
        const a = f.handLayer[idx + 3];
        if (a >= 16) {
          grid[gy][gx] = alphaToLevel(a);
        } else {
          const sa = f.scriptLayer[idx + 3];
          if (sa >= 16) {
            grid[gy][gx] = alphaToLevel(sa);
          } else if (srcGrid) {
            grid[gy][gx] = srcGrid[gy * G_COLS + gx];
          }
        }
      }
    }
    const counts = new Uint32Array(8);
    for (let gy = 0;gy < G_ROWS; gy++)
      for (let gx = 0;gx < G_COLS; gx++)
        counts[grid[gy][gx]]++;
    let bgInk = 0, maxCount = 0;
    for (let i = 0;i < 8; i++) {
      if (counts[i] > maxCount) {
        maxCount = counts[i];
        bgInk = i;
      }
    }
    fullCode += "CLR " + bgInk + `
`;
    for (let gy = 0;gy < G_ROWS; gy++) {
      let gx = 0;
      while (gx < G_COLS) {
        const ink = grid[gy][gx];
        if (ink !== bgInk) {
          const startX = gx;
          while (gx < G_COLS && grid[gy][gx] === ink)
            gx++;
          fullCode += "PNT " + startX + " " + gy + " " + (gx - startX) + " 1 " + ink + `
`;
        } else {
          gx++;
        }
      }
    }
    fullCode += `REC 1
`;
  }
  return fullCode;
}
function fitSource(src, sw, sh) {
  _fitCtx.fillStyle = "#000";
  _fitCtx.fillRect(0, 0, W, H);
  const a = sw / sh;
  let dw = W, dh = H, dx = 0, dy = 0;
  if (a > W / H) {
    dh = W / a;
    dy = (H - dh) / 2;
  } else {
    dw = H * a;
    dx = (W - dw) / 2;
  }
  _fitCtx.drawImage(src, 0, 0, sw, sh, dx, dy, dw, dh);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  c.getContext("2d").drawImage(_fitCanvas, 0, 0);
  return c;
}
function nearestInk(r, g, b) {
  const lum = r * 0.299 + g * 0.587 + b * 0.114;
  return Math.max(0, Math.min(7, Math.round((255 - lum) / 255 * 7)));
}
function applyBeflixProcess(frame) {
  if (!frame.src)
    return;
  _posterCtx.imageSmoothingEnabled = true;
  _posterCtx.clearRect(0, 0, G_COLS, G_ROWS);
  _posterCtx.drawImage(frame.src, 0, 0, G_COLS, G_ROWS);
  const srcData = _posterCtx.getImageData(0, 0, G_COLS, G_ROWS).data;
  const grid = Array.from({ length: G_ROWS }, () => Array(G_COLS).fill(0));
  for (let gy = 0;gy < G_ROWS; gy++)
    for (let gx = 0;gx < G_COLS; gx++) {
      const i = (gy * G_COLS + gx) * 4;
      grid[gy][gx] = nearestInk(srcData[i], srcData[i + 1], srcData[i + 2]);
    }
  frame.scriptLayer.fill(0);
  for (let gy = 0;gy < G_ROWS; gy++)
    for (let gx = 0;gx < G_COLS; gx++) {
      if (grid[gy][gx]) {
        const rgbArray = INKS[grid[gy][gx]].rgb;
        for (let by = 0;by < B_SZ; by++)
          for (let bx = 0;bx < B_SZ; bx++) {
            const idx = ((gy * B_SZ + by) * W + (gx * B_SZ + bx)) * 4;
            frame.scriptLayer[idx] = rgbArray[0];
            frame.scriptLayer[idx + 1] = rgbArray[1];
            frame.scriptLayer[idx + 2] = rgbArray[2];
            frame.scriptLayer[idx + 3] = rgbArray[3];
          }
      }
    }
}
function fireToast(msg) {
  const t = document.getElementById("hud-toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("on"), 1500);
}
function lockSystem(msg, count) {
  const l = document.getElementById("lock-screen");
  l.classList.add("on");
  document.getElementById("lock-msg").textContent = msg;
  document.getElementById("lock-counter").textContent = String(count);
}
function releaseSystem() {
  document.getElementById("lock-screen").classList.remove("on");
}
function rescaleWorkspace() {
  const zone = document.getElementById("canvas-zone");
  const wrap = document.getElementById("canvas-wrapper");
  if (!zone || zone.clientWidth === 0)
    return;
  const padding = 12;
  const sc = Math.min((zone.clientWidth - padding) / W, (zone.clientHeight - padding) / H);
  cvs.style.width = W * sc + "px";
  cvs.style.height = H * sc + "px";
  cvs.width = W;
  cvs.height = H;
  wrap.style.width = W * sc + "px";
  wrap.style.height = H * sc + "px";
  renderOutput();
}
function drawCoordGrid() {
  const net = document.getElementById("net");
  if (!net)
    return;
  net.width = W;
  net.height = H;
  const gc = net.getContext("2d");
  gc.clearRect(0, 0, W, H);
  gc.strokeStyle = "rgba(0,0,0,0.08)";
  gc.lineWidth = 0.5;
  for (let gx = 0;gx <= G_COLS; gx++) {
    gc.beginPath();
    gc.moveTo(gx * B_SZ, 0);
    gc.lineTo(gx * B_SZ, H);
    gc.stroke();
  }
  for (let gy = 0;gy <= G_ROWS; gy++) {
    gc.beginPath();
    gc.moveTo(0, gy * B_SZ);
    gc.lineTo(W, gy * B_SZ);
    gc.stroke();
  }
}
function closeAllSheets() {
  ["a", "b", "c", "d"].forEach((id) => {
    document.getElementById("sheet-" + id)?.classList.remove("on");
    const t = document.getElementById("tab-" + id);
    if (t)
      t.className = "tab-btn";
  });
  document.getElementById("sheet-backdrop").classList.remove("on");
  if (state.activeNav !== "C")
    document.getElementById("draw-toolbar").classList.remove("on");
  state.activeNav = null;
  updatePlayOverlay();
}
function execNav(id) {
  const wasActive = state.activeNav === id;
  closeAllSheets();
  if (!wasActive) {
    state.activeNav = id;
    ["a", "b", "c", "d"].forEach((c) => {
      const t = document.getElementById("tab-" + c);
      if (t)
        t.className = "tab-btn";
    });
    document.getElementById("tab-" + id.toLowerCase()).classList.add("on-" + id.toLowerCase());
    document.getElementById("sheet-" + id.toLowerCase()).classList.add("on");
    document.getElementById("sheet-backdrop").classList.add("on");
    if (id === "C")
      document.getElementById("draw-toolbar").classList.add("on");
  }
  updatePlayOverlay();
  requestAnimationFrame(rescaleWorkspace);
}
function bindTool(id) {
  state.tool = id;
  ["pen", "rect", "erase"].forEach((t) => {
    document.getElementById("tool-" + t)?.classList.toggle("on", t === id);
    document.getElementById("dtt-" + t)?.classList.toggle("on", t === id);
  });
  updateStatusBar();
}
function buildInkReservoir() {
  ["c-ink-swatches", "dt-swatches"].forEach((boxId) => {
    const box = document.getElementById(boxId);
    if (!box)
      return;
    box.innerHTML = "";
    INKS.slice(1).forEach((c) => {
      const s = document.createElement("div");
      s.className = (boxId === "c-ink-swatches" ? "ink-swatch" : "dt-swatch") + (c.id === state.color ? " on" : "");
      s.style.background = c.hex;
      s.onclick = () => {
        state.color = c.id;
        document.querySelectorAll(".ink-swatch, .dt-swatch").forEach((el) => el.classList.remove("on"));
        document.querySelectorAll(".ink-swatch, .dt-swatch").forEach((el) => {
          if (el.style.background === c.hex || el.style.backgroundColor === c.hex)
            el.classList.add("on");
        });
        if (state.tool === "erase")
          bindTool("pen");
        updateStatusBar();
      };
      box.appendChild(s);
    });
  });
}
var EXPORT_SCALE = 2;
var EW = W * EXPORT_SCALE;
var EH = H * EXPORT_SCALE;
var GIF_WORKER_URL = "https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.worker.js";
function renderCompositeFrame(frame, target) {
  renderDotFrame(frame, target);
}
function pickMimeType(fmt) {
  const webm = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  const mp4 = ["video/mp4;codecs=h264", "video/mp4"];
  const list = fmt === "mp4" ? mp4 : webm;
  for (const mt of list) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mt))
      return mt;
  }
  return "";
}
function exportCurrentPNG() {
  if (!state.frames.length)
    return;
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  renderCompositeFrame(state.frames[state.cur], tmp);
  const ec = document.createElement("canvas");
  ec.width = EW;
  ec.height = EH;
  ec.getContext("2d").drawImage(tmp, 0, 0, EW, EH);
  const l = document.createElement("a");
  l.download = "ICARO_QUINE_" + String(state.cur + 1).padStart(3, "0") + ".png";
  l.href = ec.toDataURL("image/png");
  l.click();
  fireToast("PNG EXPORTED");
}
async function compileOutput(format = "webm") {
  if (!state.frames.length)
    return;
  if (state.playing)
    engageSequence();
  if (typeof MediaRecorder === "undefined") {
    fireToast("NO ENCODER");
    return;
  }
  const mimeType = pickMimeType(format);
  if (!mimeType) {
    fireToast(format.toUpperCase() + " UNSUPPORTED");
    return;
  }
  lockSystem("ENCODING " + format.toUpperCase(), "0");
  const ec = document.createElement("canvas");
  ec.width = EW;
  ec.height = EH;
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  const stream = ec.captureStream(BASE_FPS);
  let audioSourceNode = null;
  let exportAudioCtx = null;
  if (state.audioSourceBlob) {
    try {
      exportAudioCtx = new AudioContext;
      const arrayBuf = await state.audioSourceBlob.arrayBuffer();
      const audioBuffer = await exportAudioCtx.decodeAudioData(arrayBuf);
      const audioDest = exportAudioCtx.createMediaStreamDestination();
      audioSourceNode = exportAudioCtx.createBufferSource();
      audioSourceNode.buffer = audioBuffer;
      const outputDur = state.frames.length / BASE_FPS;
      const audioDur = audioBuffer.duration;
      if (audioDur > 0 && outputDur > 0) {
        audioSourceNode.playbackRate.value = Math.max(0.25, Math.min(4, audioDur / outputDur));
      }
      audioSourceNode.connect(audioDest);
      const audioTracks = audioDest.stream.getAudioTracks();
      if (audioTracks.length > 0)
        stream.addTrack(audioTracks[0]);
      fireToast("AUDIO SYNCED · " + audioDur.toFixed(1) + "s → " + outputDur.toFixed(1) + "s");
    } catch (audioErr) {
      console.warn("Audio decode failed:", audioErr);
    }
  }
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size)
      chunks.push(e.data);
  };
  const stopP = new Promise((res) => {
    recorder.onstop = () => res();
  });
  if (audioSourceNode) {
    try {
      audioSourceNode.start(0);
    } catch (_) {}
  }
  recorder.start();
  for (let i = 0;i < state.frames.length; i++) {
    renderCompositeFrame(state.frames[i], tmp);
    ec.getContext("2d").drawImage(tmp, 0, 0, EW, EH);
    document.getElementById("lock-counter").textContent = String(i + 1);
    await new Promise((rs) => setTimeout(rs, 1000 / BASE_FPS));
  }
  await new Promise((rs) => setTimeout(rs, 1000 / BASE_FPS));
  recorder.stop();
  if (audioSourceNode) {
    try {
      audioSourceNode.stop();
    } catch (_) {}
  }
  if (exportAudioCtx) {
    try {
      exportAudioCtx.close();
    } catch (_) {}
  }
  await stopP;
  stream.getTracks().forEach((t) => t.stop());
  const ext = mimeType.indexOf("mp4") >= 0 ? "mp4" : "webm";
  const bl = new Blob(chunks, { type: mimeType });
  const l = document.createElement("a");
  l.download = "ICARO_QUINE_" + Date.now() + "." + ext;
  l.href = URL.createObjectURL(bl);
  l.click();
  setTimeout(() => URL.revokeObjectURL(l.href), 2000);
  releaseSystem();
  fireToast(ext.toUpperCase() + " EXPORTED");
}
function compileGIF() {
  if (!state.frames.length)
    return;
  if (typeof window.GIF === "undefined") {
    fireToast("GIF UNAVAILABLE");
    return;
  }
  lockSystem("ENCODING GIF", "0");
  const gif = new window.GIF({
    workers: 1,
    quality: 12,
    width: EW,
    height: EH,
    workerScript: GIF_WORKER_URL
  });
  const tmp = document.createElement("canvas");
  tmp.width = W;
  tmp.height = H;
  for (let i = 0;i < state.frames.length; i++) {
    renderCompositeFrame(state.frames[i], tmp);
    const fc = document.createElement("canvas");
    fc.width = EW;
    fc.height = EH;
    fc.getContext("2d").drawImage(tmp, 0, 0, EW, EH);
    gif.addFrame(fc, { delay: 1000 / BASE_FPS, copy: true });
  }
  gif.on("progress", (p) => {
    document.getElementById("lock-counter").textContent = Math.round(p * 100) + "%";
  });
  gif.on("finished", (blob) => {
    const l = document.createElement("a");
    l.download = "ICARO_QUINE_" + Date.now() + ".gif";
    l.href = URL.createObjectURL(blob);
    l.click();
    setTimeout(() => URL.revokeObjectURL(l.href), 2000);
    releaseSystem();
    fireToast("GIF EXPORTED");
  });
  gif.render();
}
function compileContactSheet() {
  if (!state.frames.length)
    return;
  lockSystem("PRINTING SHEET", "0");
  setTimeout(() => {
    const cols = Math.min(5, state.frames.length);
    const rows = Math.ceil(state.frames.length / cols);
    const sc = document.createElement("canvas");
    sc.width = cols * W;
    sc.height = rows * H;
    const sctx = sc.getContext("2d");
    for (let i = 0;i < state.frames.length; i++) {
      const tc = document.createElement("canvas");
      tc.width = W;
      tc.height = H;
      renderCompositeFrame(state.frames[i], tc);
      sctx.drawImage(tc, i % cols * W, Math.floor(i / cols) * H);
    }
    const l = document.createElement("a");
    l.download = "ICARO_SHEET_" + state.frames.length + "f.png";
    l.href = sc.toDataURL("image/png");
    l.click();
    releaseSystem();
    fireToast("SHEET EXPORTED");
  }, 50);
}
async function ripFrames(source) {
  lockSystem("RIPPING FRAMES...", "0");
  const url = URL.createObjectURL(source);
  const vid = document.createElement("video");
  vid.muted = true;
  vid.playsInline = true;
  vid.preload = "auto";
  vid.src = url;
  await new Promise((res, rej) => {
    vid.onloadedmetadata = () => res();
    vid.onerror = () => rej();
    setTimeout(res, 5000);
  });
  const dur = vid.duration || 10;
  const maxF = 120;
  const interval = Math.max(1 / BASE_FPS, dur / maxF);
  const frames = [];
  let lastCap = -Infinity;
  if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
    await new Promise((res) => {
      function onFrame(_now, meta) {
        if (frames.length >= maxF || vid.ended) {
          res();
          return;
        }
        const t = meta.mediaTime;
        if (t - lastCap >= interval - 0.001) {
          lastCap = t;
          if (vid.videoWidth)
            frames.push(fitSource(vid, vid.videoWidth, vid.videoHeight));
          document.getElementById("lock-counter").textContent = String(frames.length);
        }
        vid.requestVideoFrameCallback(onFrame);
      }
      vid.requestVideoFrameCallback(onFrame);
      vid.play().catch(() => {});
      setTimeout(res, (dur + 3) * 1000);
    });
  } else {
    await new Promise((res) => {
      function onRAF() {
        if (frames.length >= maxF || vid.ended) {
          res();
          return;
        }
        if (vid.videoWidth && vid.currentTime - lastCap >= interval - 0.001) {
          lastCap = vid.currentTime;
          frames.push(fitSource(vid, vid.videoWidth, vid.videoHeight));
          document.getElementById("lock-counter").textContent = String(frames.length);
        }
        requestAnimationFrame(onRAF);
      }
      requestAnimationFrame(onRAF);
      vid.play().catch(() => {});
      setTimeout(res, (dur + 3) * 1000);
    });
  }
  vid.pause();
  vid.src = "";
  URL.revokeObjectURL(url);
  if (!frames.length) {
    releaseSystem();
    fireToast("NO FRAMES CAPTURED");
    return;
  }
  state.frames = [];
  for (let i = 0;i < frames.length; i++) {
    const f = { src: frames[i], scriptLayer: getBlankMatrix(), handLayer: getBlankMatrix() };
    applyBeflixProcess(f);
    state.frames.push(f);
  }
  state.cur = 0;
  _cachedQuineText = "";
  _lastQuineRawLen = -1;
  renderOutput();
  rebuildTrack();
  updateStatusBar();
  releaseSystem();
  fireToast(frames.length + " FRAMES RIPPED");
}
var camStream = null;
var camRecorder = null;
var camChunks = [];
var camCapturing = false;
async function toggleCamera() {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
    const camVid = document.getElementById("cam-vid");
    camVid.srcObject = camStream;
    await camVid.play();
    document.getElementById("cam-feed").style.display = "flex";
    state.liveCam = true;
    updatePlayOverlay();
    fireToast("MIRROR LIVE");
    lastCamT = 0;
    requestAnimationFrame(liveCamLoop);
  } catch (err) {
    console.warn("Camera error:", err);
    fireToast("CAMERA DENIED");
  }
}
function killCamera() {
  stopCamCapture();
  if (camStream)
    camStream.getTracks().forEach((t) => t.stop());
  camStream = null;
  const camVid = document.getElementById("cam-vid");
  camVid.srcObject = null;
  document.getElementById("cam-feed").style.display = "none";
  state.liveCam = false;
  updatePlayOverlay();
  renderOutput();
}
var lastCamT = 0;
function liveCamLoop(now) {
  if (!state.liveCam || !camStream)
    return;
  requestAnimationFrame(liveCamLoop);
  const camVid = document.getElementById("cam-vid");
  if (!camVid.videoWidth || camVid.readyState < 2)
    return;
  const interval = 1000 / BASE_FPS;
  if (now - lastCamT < interval)
    return;
  lastCamT = now;
  _fitCtx.fillStyle = "#000";
  _fitCtx.fillRect(0, 0, W, H);
  const { videoWidth: sw, videoHeight: sh } = camVid;
  const a = sw / sh;
  let dw = W, dh = H, dx = 0, dy = 0;
  if (a > W / H) {
    dh = W / a;
    dy = (H - dh) / 2;
  } else {
    dw = H * a;
    dx = (W - dw) / 2;
  }
  _fitCtx.drawImage(camVid, 0, 0, sw, sh, dx, dy, dw, dh);
  state.frames[state.cur].src = _fitCanvas;
  applyBeflixProcess(state.frames[state.cur]);
  renderOutput();
}
function camSnap() {
  if (!state.liveCam)
    return;
  const camVid = document.getElementById("cam-vid");
  if (!camVid.videoWidth || camVid.readyState < 2) {
    fireToast("NO FEED");
    return;
  }
  const snap = fitSource(camVid, camVid.videoWidth, camVid.videoHeight);
  const f = { src: snap, scriptLayer: getBlankMatrix(), handLayer: getBlankMatrix() };
  applyBeflixProcess(f);
  state.frames.push(f);
  state.cur = state.frames.length - 1;
  renderOutput();
  rebuildTrack();
  updateStatusBar();
  fireToast("SNAP " + state.frames.length);
}
function toggleCamCapture() {
  if (!state.liveCam)
    return;
  if (camCapturing) {
    stopCamCapture();
  } else {
    startCamCapture();
  }
}
function startCamCapture() {
  const cvs2 = document.getElementById("primary-buffer");
  const stream = cvs2.captureStream(BASE_FPS);
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4;codecs=h264",
    "video/mp4"
  ];
  let mime = "";
  for (const mt of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mt)) {
      mime = mt;
      break;
    }
  }
  if (!mime) {
    fireToast("NO ENCODER");
    return;
  }
  camChunks = [];
  camRecorder = new MediaRecorder(stream, { mimeType: mime });
  camRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size)
      camChunks.push(e.data);
  };
  camRecorder.onstop = () => {
    if (!camChunks.length)
      return;
    const blob = new Blob(camChunks, { type: mime });
    const ext = mime.indexOf("mp4") >= 0 ? "mp4" : "webm";
    const l = document.createElement("a");
    l.download = "ICARO_LIVE_" + Date.now() + "." + ext;
    l.href = URL.createObjectURL(blob);
    l.click();
    setTimeout(() => URL.revokeObjectURL(l.href), 2000);
    fireToast(ext.toUpperCase() + " SAVED");
  };
  camRecorder.start();
  camCapturing = true;
  const btn = document.getElementById("btn-cam-capture");
  btn.textContent = "● STOP";
  btn.style.background = "var(--act-c)";
  btn.style.color = "var(--white)";
  fireToast("CAPTURING...");
}
function stopCamCapture() {
  if (camRecorder && camRecorder.state !== "inactive") {
    camRecorder.stop();
  }
  camRecorder = null;
  camCapturing = false;
  const btn = document.getElementById("btn-cam-capture");
  if (btn) {
    btn.textContent = "CAPTURE";
    btn.style.background = "var(--white)";
    btn.style.color = "var(--black)";
  }
}
function camDumpCode() {
  if (!state.liveCam || !state.frames.length) {
    fireToast("NO FEED");
    return;
  }
  const code = decompileFrames();
  setScriptText(code);
  execNav("B");
  fireToast("LIVE CODE CAPTURED");
}
function loadScriptFile(e) {
  const f = e.target.files?.[0];
  if (!f)
    return;
  e.target.value = "";
  lockSystem("LOADING SCRIPT...", "0");
  const reader = new FileReader;
  reader.onload = (ev) => {
    const text = ev.target.result;
    setScriptText(text);
    releaseSystem();
    closeAllSheets();
    fireToast(text.split(`
`).length.toLocaleString() + " LINES LOADED");
  };
  reader.onerror = () => {
    releaseSystem();
    fireToast("FILE READ FAILED");
  };
  reader.readAsText(f);
}
async function ingestMedia(e) {
  const f = e.target.files?.[0];
  if (!f)
    return;
  e.target.value = "";
  if (f.type.startsWith("video/")) {
    state.audioSourceBlob = f;
    await ripFrames(f);
  } else if (f.type.startsWith("image/")) {
    lockSystem("MOUNTING...", "0");
    const u = URL.createObjectURL(f), img = new Image;
    img.src = u;
    img.onload = () => {
      state.frames[state.cur].src = fitSource(img, img.naturalWidth, img.naturalHeight);
      applyBeflixProcess(state.frames[state.cur]);
      releaseSystem();
      renderOutput();
      rebuildTrack();
      URL.revokeObjectURL(u);
    };
    img.onerror = () => {
      releaseSystem();
      fireToast("IMAGE FAILED");
      URL.revokeObjectURL(u);
    };
  }
}
document.getElementById("tab-a").addEventListener("click", () => execNav("A"));
document.getElementById("tab-b").addEventListener("click", () => execNav("B"));
document.getElementById("tab-c").addEventListener("click", () => execNav("C"));
document.getElementById("tab-d").addEventListener("click", () => execNav("D"));
document.getElementById("sheet-backdrop").addEventListener("click", closeAllSheets);
document.getElementById("close-a").addEventListener("click", closeAllSheets);
document.getElementById("close-b").addEventListener("click", closeAllSheets);
document.getElementById("close-c").addEventListener("click", closeAllSheets);
document.getElementById("close-d").addEventListener("click", closeAllSheets);
document.getElementById("sb-play-btn").addEventListener("click", engageSequence);
document.getElementById("play-overlay-btn").addEventListener("click", engageSequence);
document.getElementById("canvas-tap-zone").addEventListener("click", () => {
  if (state.frames.length > 0)
    engageSequence();
});
document.getElementById("fps-down").addEventListener("click", () => {
  BASE_FPS = Math.max(1, BASE_FPS - 1);
  updateStatusBar();
});
document.getElementById("fps-up").addEventListener("click", () => {
  BASE_FPS = Math.min(30, BASE_FPS + 1);
  updateStatusBar();
});
document.getElementById("btn-step-back").addEventListener("click", () => stepSequence(-1));
document.getElementById("btn-step-fwd").addEventListener("click", () => stepSequence(1));
document.getElementById("btn-add-blank").addEventListener("click", () => injectFrame());
document.getElementById("btn-dup-frame").addEventListener("click", duplicateFrame);
document.getElementById("speed-slider").addEventListener("input", (e) => {
  BASE_FPS = parseInt(e.target.value);
  document.getElementById("speed-label").textContent = "SPD · " + BASE_FPS;
  updateStatusBar();
});
document.getElementById("lbl-mode").addEventListener("click", () => {
  state.renderMode = state.renderMode === "text" ? "dot" : "text";
  const el = document.getElementById("lbl-mode");
  el.textContent = "MODE: " + (state.renderMode === "text" ? "QUINE" : "DOTS");
  el.classList.toggle("on", state.renderMode === "text");
  document.getElementById("quine-density-wrap").style.display = state.renderMode === "text" ? "flex" : "none";
  document.getElementById("lbl-obstacle").style.display = state.renderMode === "text" ? "block" : "none";
  if (state.renderMode === "text" && !preparedText) {
    const fontSize = B_SZ * quineDensity;
    const fontStr = `900 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    _cachedQuineText = "";
    prepareQuineText(getQuineText(), fontStr);
  }
  renderOutput();
  rebuildTrack();
});
document.getElementById("lbl-obstacle").addEventListener("click", () => {
  state.obstacleFlow = !state.obstacleFlow;
  const el = document.getElementById("lbl-obstacle");
  el.textContent = "FLOW: " + (state.obstacleFlow ? "ON" : "OFF");
  el.classList.toggle("on", state.obstacleFlow);
  renderOutput();
});
document.getElementById("quine-density").addEventListener("input", (e) => {
  quineDensity = parseFloat(e.target.value);
  const fontSize = B_SZ * quineDensity;
  const fontStr = `900 ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  _cachedQuineText = "";
  prepareQuineText(getQuineText(), fontStr);
  if (!state.playing)
    renderOutput();
});
document.getElementById("lbl-grid").addEventListener("click", () => {
  state.grid = !state.grid;
  document.getElementById("lbl-grid").classList.toggle("on", state.grid);
  document.getElementById("net").classList.toggle("on", state.grid);
  if (state.grid)
    drawCoordGrid();
});
document.getElementById("tool-pen").addEventListener("click", () => bindTool("pen"));
document.getElementById("tool-rect").addEventListener("click", () => bindTool("rect"));
document.getElementById("tool-erase").addEventListener("click", () => bindTool("erase"));
document.getElementById("dtt-pen").addEventListener("click", () => bindTool("pen"));
document.getElementById("dtt-rect").addEventListener("click", () => bindTool("rect"));
document.getElementById("dtt-erase").addEventListener("click", () => bindTool("erase"));
document.getElementById("btn-wipe").addEventListener("click", () => {
  if (!state.frames.length)
    return;
  state.frames[state.cur].handLayer.fill(0);
  renderOutput();
  rebuildTrack();
  fireToast("INK WIPED");
});
document.getElementById("brush-size").addEventListener("input", (e) => {
  state.size = parseInt(e.target.value);
});
document.getElementById("btn-local-file").addEventListener("click", () => {
  document.getElementById("file-input").click();
  closeAllSheets();
});
document.getElementById("btn-load-script-file").addEventListener("click", () => {
  document.getElementById("script-input").click();
  closeAllSheets();
});
document.getElementById("file-input").addEventListener("change", (e) => ingestMedia(e));
document.getElementById("script-input").addEventListener("change", loadScriptFile);
document.getElementById("btn-run-script").addEventListener("click", () => executeMacro());
document.getElementById("btn-export-png").addEventListener("click", exportCurrentPNG);
document.getElementById("btn-export-webm").addEventListener("click", () => {
  closeAllSheets();
  compileOutput("webm");
});
document.getElementById("btn-export-gif").addEventListener("click", () => {
  closeAllSheets();
  compileGIF();
});
document.getElementById("btn-export-sheet").addEventListener("click", () => {
  closeAllSheets();
  compileContactSheet();
});
document.getElementById("btn-camera").addEventListener("click", () => {
  closeAllSheets();
  toggleCamera();
});
document.getElementById("btn-cam-capture").addEventListener("click", toggleCamCapture);
document.getElementById("btn-snap").addEventListener("click", camSnap);
document.getElementById("btn-cam-code").addEventListener("click", camDumpCode);
document.getElementById("btn-cam-close").addEventListener("click", killCamera);
document.getElementById("btn-view-code").addEventListener("click", () => {
  if (!state.frames.length) {
    fireToast("NO FRAMES");
    return;
  }
  lockSystem("GENERATING CODE...", "0");
  setTimeout(() => {
    setScriptText(decompileFrames());
    execNav("B");
    releaseSystem();
  }, 50);
});
document.getElementById("btn-download-code").addEventListener("click", () => {
  if (!state.frames.length) {
    fireToast("NO FRAMES");
    return;
  }
  const code = decompileFrames();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
  a.download = "icaro-quine-macro.txt";
  a.click();
  fireToast("CODE EXPORTED");
});
document.getElementById("btn-copy-prompt").addEventListener("click", () => {
  const idea = document.getElementById("b-idea").value.trim();
  const prompt = `You are a BEFLIX-128 animation composer. Generate frame-by-frame code for 128x96 grid.
` + `COMMANDS: CLR v, PNT x y w h v, LIN x1 y1 x2 y2 v, REC n, SHF dx dy n
` + `INTENSITY: 0=White 7=Black
` + (idea ? `
USER REQUEST: ` + idea : "");
  navigator.clipboard.writeText(prompt).then(() => fireToast("PROMPT COPIED")).catch(() => fireToast("COPY FAILED"));
});
var scriptEl = document.getElementById("b-script");
scriptEl.addEventListener("input", () => {
  _fullScriptText = "";
  _cachedQuineText = "";
  updateScriptInfo(scriptEl.value.split(`
`).length, scriptEl.value.length);
});
window.addEventListener("resize", rescaleWorkspace);
buildDotStamps();
buildInkReservoir();
injectFrame(true);
rescaleWorkspace();
updateStatusBar();

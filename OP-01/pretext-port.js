/**
 * pretext-port.js — the seam between OPERATOR and @chenglou/pretext.
 * ============================================================================
 * OPERATOR never calls the layout library directly. It calls this port. The
 * port exposes the SAME function signatures as @chenglou/pretext so that the
 * real engine can be dropped in with no caller changes.
 *
 * TWO BACKENDS:
 *   - REAL:  if window.Pretext (the vendored bundle) is present, the port
 *            forwards to it verbatim.
 *   - SHIM:  otherwise, a minimal, HONESTLY-LABELLED canvas-measuring fallback
 *            runs so the call works today. The shim is NOT a reimplementation
 *            of Pretext's full segmentation/bidi/glue logic — it is a
 *            placeholder that satisfies the contract for the monospace BEFLIX
 *            command text OPERATOR typesets. For Latin monospace command lines
 *            (which is all OPERATOR feeds it) the results are exact; it makes
 *            no claim of correctness for complex scripts.
 *
 * TO USE THE REAL ENGINE:
 *   1. Build @chenglou/pretext to a single browser bundle that assigns a global
 *      `window.Pretext = { prepareWithSegments, layoutWithLines, walkLineRanges,
 *      layoutNextLineRange, materializeLineRange, measureLineStats }`.
 *   2. Place it at  pretext-field/vendor/pretext.js
 *   3. Load it with a <script src="../../vendor/pretext.js"></script> BEFORE
 *      this port. The port auto-detects window.Pretext and uses it.
 *   No OPERATOR code changes.
 * ============================================================================
 */
(function (root) {
  'use strict';

  var REAL = (typeof root !== 'undefined' && root.Pretext) ? root.Pretext : null;

  // ---- shim measurement (canvas, monospace-accurate) ----
  var _ctx = null;
  function ctx() {
    if (!_ctx) {
      var c = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
      _ctx = c ? c.getContext('2d') : { measureText: function (s) { return { width: s.length * 7 }; }, font: '' };
    }
    return _ctx;
  }

  // Shim PreparedTextWithSegments: we keep the raw text + font + per-grapheme
  // widths. BEFLIX command text is ASCII, so grapheme = char here.
  function shimPrepareWithSegments(text, font /*, options */) {
    var c = ctx();
    c.font = font;
    // segment on spaces but keep them, so we can break at word boundaries
    var graphemes = Array.prototype.slice.call(text); // code-point split
    return { __shim: true, text: text, font: font, graphemes: graphemes };
  }

  // Walk line ranges at a fixed width. Calls onLine once per wrapped line with
  // {width, start, end} cursors (graphemeIndex into the flat grapheme list).
  function shimWalkLineRanges(prepared, maxWidth, onLine) {
    var c = ctx(); c.font = prepared.font;
    var g = prepared.graphemes, n = g.length;
    var lineCount = 0, i = 0, GUARD = 100000, guard = 0;
    while (i < n && guard++ < GUARD) {
      var start = i, lineW = 0, lastBreak = -1, lineWAtBreak = 0;
      while (i < n) {
        var ch = g[i];
        if (ch === '\n') { i++; break; } // hard break
        var w = c.measureText(ch).width;
        if (lineW + w > maxWidth && i > start) {
          // wrap: prefer last space break if any
          if (lastBreak >= 0) { i = lastBreak + 1; lineW = lineWAtBreak; }
          break;
        }
        lineW += w;
        if (ch === ' ') { lastBreak = i; lineWAtBreak = lineW; }
        i++;
      }
      onLine({ width: lineW, start: { segmentIndex: 0, graphemeIndex: start }, end: { segmentIndex: 0, graphemeIndex: i } });
      lineCount++;
    }
    return lineCount;
  }

  function shimMeasureLineStats(prepared, maxWidth) {
    var count = 0, maxW = 0;
    shimWalkLineRanges(prepared, maxWidth, function (ln) { count++; if (ln.width > maxW) maxW = ln.width; });
    return { lineCount: count, maxLineWidth: maxW };
  }

  function shimMaterializeLineRange(prepared, range) {
    var s = range.start.graphemeIndex, e = range.end.graphemeIndex;
    var text = prepared.graphemes.slice(s, e).join('');
    // strip a trailing hard-break newline from the visible text
    if (text.charAt(text.length - 1) === '\n') text = text.slice(0, -1);
    return { text: text, width: range.width, start: range.start, end: range.end };
  }

  function shimLayoutWithLines(prepared, maxWidth, lineHeight) {
    var lines = [];
    shimWalkLineRanges(prepared, maxWidth, function (r) { lines.push(shimMaterializeLineRange(prepared, r)); });
    return { height: lines.length * lineHeight, lineCount: lines.length, lines: lines };
  }

  function shimLayoutNextLineRange(prepared, start, maxWidth) {
    // single-line variant for variable-width flow; bounded by one pass
    var c = ctx(); c.font = prepared.font;
    var g = prepared.graphemes, n = g.length, i = start.graphemeIndex;
    if (i >= n) return null;
    var begin = i, lineW = 0, lastBreak = -1, lineWAtBreak = 0;
    while (i < n) {
      var ch = g[i];
      if (ch === '\n') { i++; break; }
      var w = c.measureText(ch).width;
      if (lineW + w > maxWidth && i > begin) {
        if (lastBreak >= 0) { i = lastBreak + 1; lineW = lineWAtBreak; }
        break;
      }
      lineW += w;
      if (ch === ' ') { lastBreak = i; lineWAtBreak = lineW; }
      i++;
    }
    return { width: lineW, start: { segmentIndex: 0, graphemeIndex: begin }, end: { segmentIndex: 0, graphemeIndex: i } };
  }

  // ---- the port: real engine if present, else shim ----
  var port = REAL ? {
    backend: 'real',
    prepareWithSegments: REAL.prepareWithSegments.bind(REAL),
    walkLineRanges: REAL.walkLineRanges.bind(REAL),
    measureLineStats: REAL.measureLineStats.bind(REAL),
    materializeLineRange: REAL.materializeLineRange.bind(REAL),
    layoutWithLines: REAL.layoutWithLines.bind(REAL),
    layoutNextLineRange: REAL.layoutNextLineRange.bind(REAL),
  } : {
    backend: 'shim',
    prepareWithSegments: shimPrepareWithSegments,
    walkLineRanges: shimWalkLineRanges,
    measureLineStats: shimMeasureLineStats,
    materializeLineRange: shimMaterializeLineRange,
    layoutWithLines: shimLayoutWithLines,
    layoutNextLineRange: shimLayoutNextLineRange,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = port;
  if (typeof root !== 'undefined') root.PretextPort = port;
})(typeof window !== 'undefined' ? window : this);

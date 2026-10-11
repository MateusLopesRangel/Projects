// F1 project page: Antonelli's gap to Russell by lap, Monza 2026 (FastF1 timing).
// Positive = Antonelli behind. Laps 3 to 5 are left out because of the red flag.
(function () {
  var chart = document.querySelector("[data-gap-chart]");
  if (!chart) return;

  var firstLap = 6;
  var gap = [4.55, 4.62, 4.82, 4.08, 4.12, 3.59, 1.96, 1.29, 0.56, 0.91, 0.78, 0.40, -0.53, -0.59, -0.62, -0.55,
    -0.51, 0.35, 0.70, 0.64, 0.54, 0.56, 3.53, 14.30, 13.23, 12.47, 11.81, 11.38, 10.63, 9.75, 9.22, 8.35,
    7.82, 7.53, 7.04, 6.29, 5.50, 4.72, 3.94, 2.79, 1.69, 0.95, 0.25, 0.85, -1.22, -1.22, -1.89, -3.87];
  var n = gap.length;
  var lastLap = firstLap + n - 1;
  var events = [{ lap: 28, text: "VSC stop, lap 28", short: "VSC L28" }, { lap: 50, text: "Pass, lap 50", short: "Pass L50" }];
  var gLo = -5, gHi = 15;

  function token(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function palette() {
    return { ink: token("--ink"), muted: token("--muted"), line: token("--line"), accent: token("--accent"),
      surface: token("--surface"), mono: token("--font-mono"), body: token("--font-body") };
  }
  function setupCanvas(canvas) {
    var r = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: r.width, h: r.height };
  }
  function fmt(v) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + " s"; }

  var hover = -1, geo = null;
  var tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.hidden = true;
  chart.parentNode.appendChild(tip);

  function draw() {
    var P = palette();
    var g = setupCanvas(chart);
    var c = g.ctx;
    var narrow = g.w < 520;
    var padL = narrow ? 58 : 72, padR = narrow ? 16 : 28, padT = 34, padB = 62;
    var W = g.w - padL - padR, H = g.h - padT - padB;
    var X = function (lap) { return padL + (lap - firstLap) / (lastLap - firstLap) * W; };
    var Y = function (v) { return padT + (1 - (v - gLo) / (gHi - gLo)) * H; };
    geo = { X: X, Y: Y, padL: padL, W: W, w: g.w };
    c.clearRect(0, 0, g.w, g.h);

    // Horizontal grid, zero line and y tick labels
    c.font = "12px " + P.mono;
    c.textAlign = "right"; c.textBaseline = "middle";
    for (var v = gLo; v <= gHi; v += 5) {
      var y = Math.round(Y(v)) + 0.5;
      c.strokeStyle = v === 0 ? P.muted : P.line; c.lineWidth = 1;
      c.beginPath(); c.moveTo(padL, y); c.lineTo(padL + W, y); c.stroke();
      c.fillStyle = P.muted;
      c.fillText(v > 0 ? "+" + v : v < 0 ? "−" + Math.abs(v) : "0", padL - 12, y);
    }
    // Bottom axis with lap ticks
    var yBase = Math.round(Y(gLo)) + 0.5;
    c.strokeStyle = P.muted;
    c.beginPath(); c.moveTo(padL, yBase); c.lineTo(padL + W, yBase); c.stroke();
    c.textAlign = "center"; c.textBaseline = "top";
    var step = narrow ? 10 : 5;
    for (var lap = 10; lap <= lastLap; lap += step) {
      var x = Math.round(X(lap)) + 0.5;
      c.beginPath(); c.moveTo(x, yBase); c.lineTo(x, yBase + 5); c.stroke();
      c.fillText(String(lap), x, yBase + 10);
    }
    // Axis titles
    c.font = "600 13px " + P.body;
    c.fillStyle = P.muted;
    c.textAlign = "center"; c.textBaseline = "bottom";
    c.fillText("Lap", padL + W / 2, g.h - 10);
    c.save();
    c.translate(narrow ? 14 : 20, padT + H / 2);
    c.rotate(-Math.PI / 2);
    c.textBaseline = "top";
    c.fillText(narrow ? "Gap [s]" : "Antonelli behind Russell [s]", 0, 0);
    c.restore();

    // Event markers
    c.font = "12px " + P.mono;
    events.forEach(function (e, k) {
      var ex = Math.round(X(e.lap)) + 0.5;
      c.strokeStyle = P.accent; c.lineWidth = 1.2; c.setLineDash([4, 3]);
      c.beginPath(); c.moveTo(ex, padT - 6); c.lineTo(ex, yBase); c.stroke();
      c.setLineDash([]);
      var label = narrow ? e.short : e.text;
      var tw = c.measureText(label).width;
      var tx = k === 0 ? ex + 6 : ex - 6 - tw; // first label to the right, last to the left
      tx = Math.min(Math.max(tx, padL), padL + W - tw);
      c.fillStyle = P.surface; c.fillRect(tx - 4, padT - 26, tw + 8, 18);
      c.fillStyle = P.accent; c.textAlign = "left"; c.textBaseline = "top";
      c.fillText(label, tx, padT - 24);
    });

    // Gap line
    c.strokeStyle = P.ink; c.lineWidth = 2; c.lineJoin = "round"; c.lineCap = "round";
    c.beginPath();
    for (var i = 0; i < n; i++) {
      var px = X(firstLap + i), py = Y(gap[i]);
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.stroke();

    // Direct label on the peak, after the VSC stop
    var iPeak = 29 - firstLap;
    var kx = X(29), ky = Y(gap[iPeak]);
    c.beginPath(); c.arc(kx, ky, 4.5, 0, Math.PI * 2);
    c.fillStyle = P.accent; c.fill(); c.lineWidth = 2; c.strokeStyle = P.surface; c.stroke();
    c.font = "12px " + P.mono; c.fillStyle = P.ink; c.textAlign = "left"; c.textBaseline = "middle";
    c.fillText(fmt(gap[iPeak]), kx + 10, ky + 2);

    // Hover crosshair
    if (hover >= 0) {
      var hx = X(firstLap + hover), hy = Y(gap[hover]);
      c.strokeStyle = P.muted; c.lineWidth = 1; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(Math.round(hx) + 0.5, padT); c.lineTo(Math.round(hx) + 0.5, yBase); c.stroke();
      c.setLineDash([]);
      c.beginPath(); c.arc(hx, hy, 5, 0, Math.PI * 2);
      c.fillStyle = P.ink; c.fill(); c.lineWidth = 2; c.strokeStyle = P.surface; c.stroke();
    }
  }

  function onMove(e) {
    if (!geo) return;
    var r = chart.getBoundingClientRect();
    var mx = e.clientX - r.left;
    if (mx < geo.padL - 8 || mx > geo.padL + geo.W + 8) { onLeave(); return; }
    hover = Math.min(Math.max(Math.round((mx - geo.padL) / geo.W * (n - 1)), 0), n - 1);
    draw();
    var g = gap[hover];
    tip.innerHTML = "Lap " + (firstLap + hover) + "<br><b>" + fmt(g) + "</b> <span>" +
      (g > 0 ? "Antonelli behind" : g < 0 ? "Antonelli ahead" : "level") + "</span>";
    tip.hidden = false;
    var hx = geo.X(firstLap + hover), hy = geo.Y(g);
    var tw = tip.offsetWidth, th = tip.offsetHeight;
    var left = hx + 14 + tw > geo.w ? hx - 14 - tw : hx + 14;
    var top = Math.max(4, hy - th - 10);
    tip.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  }
  function onLeave() {
    if (hover < 0) return;
    hover = -1; tip.hidden = true; draw();
  }
  chart.addEventListener("pointermove", onMove);
  chart.addEventListener("pointerdown", onMove);
  chart.addEventListener("pointerleave", onLeave);

  draw();
  if ("ResizeObserver" in window) new ResizeObserver(draw).observe(chart);
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  if (mq.addEventListener) mq.addEventListener("change", draw);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
})();

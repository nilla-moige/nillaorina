/* ============================================================
   Nilla Orina — site interactions
   1. Butterfly field (hero canvas — soft emergent silhouettes)
   2. Scroll reveal + active nav + sticky header
   3. Mobile menu
   4. Photography gallery + lightbox
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------
     PHOTOGRAPHY — single source of truth.
     To use real photos: set `src` to a file in /images, e.g.
       { src: "images/golden-hour.jpg", caption: "Golden hour", size: "tall" }
     With no `src`, an on-theme gradient placeholder is drawn.
     size: "" | "tall" | "wide"  (controls grid span)
     ----------------------------------------------------------- */
  var PHOTOS = [
    { src: "", caption: "Light & shadow",   grad: "linear-gradient(145deg,#4c1d95,#0c0c0f 55%,#1e3a5f)", size: "tall" },
    { src: "", caption: "Portrait",         grad: "linear-gradient(145deg,#6b21a8,#0c0c0f 60%,#312e81)", size: "" },
    { src: "", caption: "City, after rain", grad: "linear-gradient(145deg,#3730a3,#0c0c0f 55%,#0e7490)", size: "wide" },
    { src: "", caption: "Texture study",    grad: "linear-gradient(145deg,#581c87,#0c0c0f 60%,#1e1b4b)", size: "" },
    { src: "", caption: "Golden hour",      grad: "linear-gradient(145deg,#7c3aed,#0c0c0f 50%,#a855f7)", size: "" },
    { src: "", caption: "Long exposure",    grad: "linear-gradient(145deg,#1d4ed8,#0c0c0f 55%,#6d28d9)", size: "tall" },
    { src: "", caption: "Street",           grad: "linear-gradient(145deg,#5b21b6,#0c0c0f 60%,#164e63)", size: "" },
    { src: "", caption: "Quiet geometry",   grad: "linear-gradient(145deg,#4338ca,#0c0c0f 55%,#7e22ce)", size: "wide" }
  ];

  /* ===========================================================
     1. BUTTERFLIES — abstract silhouettes drifting behind the
        hero veil; slow flutter and pitch, low opacity.
     =========================================================== */
  function initButterflies() {
    var canvas = document.getElementById("hero-field");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1;
    var butterflies = [];
    var raf = null, running = false;

    var COLORS = [
      "192,132,252",
      "168,85,247",
      "56,189,248",
      "233,213,255"
    ];

    function wing(ctx, side, flap, alpha, rgb) {
      var s = side;
      var f = flap;
      ctx.fillStyle = "rgba(" + rgb + "," + alpha + ")";
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.bezierCurveTo(s * 14 * f, -12 * f, s * 24 * f, -6 * f, s * 18 * f, 4);
      ctx.bezierCurveTo(s * 12 * f, 10, s * 4, 5, 0, -1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(s * 10 * f, 4, s * 16 * f, 14, s * 10 * f, 16);
      ctx.bezierCurveTo(s * 5, 14, s * 2, 8, 0, 2);
      ctx.fill();
    }

    function drawOne(b, t) {
      var flap = reduceMotion
        ? 0.72
        : 0.58 + 0.42 * Math.sin(t * 0.0035 * b.flapSpeed + b.flapPhase);
      var pitch = reduceMotion ? 0 : 0.07 * Math.sin(t * 0.00055 + b.pitchPhase);
      var angle = b.angle + pitch;

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.scale(b.scale, b.scale);

      ctx.strokeStyle = "rgba(" + b.color + "," + (b.alpha * 0.85) + ")";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(0, 9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(-1.2, -12, -2.2, -13);
      ctx.moveTo(0, -9);
      ctx.quadraticCurveTo(1.2, -12, 2.2, -13);
      ctx.stroke();

      wing(ctx, -1, flap, b.alpha * 0.8, b.color);
      wing(ctx, 1, flap, b.alpha * 0.8, b.color);

      ctx.restore();
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      var count = reduceMotion ? 3 : Math.max(4, Math.min(6, Math.round(w / 220)));
      butterflies = [];
      var i, t, item;
      for (i = 0; i < count; i++) {
        t = reduceMotion ? i / Math.max(count - 1, 1) : Math.random();
        item = {
          x: reduceMotion ? w * (0.55 + t * 0.35) : w * (0.5 + Math.random() * 0.48),
          y: reduceMotion ? h * (0.25 + (i % 3) * 0.22) : h * (0.12 + Math.random() * 0.76),
          vx: reduceMotion ? 0 : (Math.random() - 0.5) * 0.1,
          vy: reduceMotion ? 0 : (Math.random() - 0.5) * 0.07,
          angle: reduceMotion ? -0.3 + t * 0.5 : (Math.random() - 0.5) * 0.8,
          scale: 0.65 + Math.random() * 0.75,
          alpha: 0.09 + Math.random() * 0.08,
          color: COLORS[i % COLORS.length],
          flapSpeed: 0.7 + Math.random() * 0.5,
          flapPhase: Math.random() * Math.PI * 2,
          pitchPhase: Math.random() * Math.PI * 2,
          wander: Math.random() * Math.PI * 2
        };
        butterflies.push(item);
      }
    }

    function tick(t) {
      var i, b, speed, target;
      if (!reduceMotion) {
        for (i = 0; i < butterflies.length; i++) {
          b = butterflies[i];
          b.wander += (Math.random() - 0.5) * 0.006;
          b.vx += Math.cos(b.wander) * 0.0018;
          b.vy += Math.sin(b.wander) * 0.0018;
          b.vx *= 0.997;
          b.vy *= 0.997;
          b.x += b.vx;
          b.y += b.vy;
          speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (speed > 0.015) {
            target = Math.atan2(b.vy, b.vx) + Math.PI / 2;
            b.angle += (target - b.angle) * 0.012;
          }
          if (b.x < -90) b.x = w + 90;
          else if (b.x > w + 90) b.x = -90;
          if (b.y < -70) b.y = h + 70;
          else if (b.y > h + 70) b.y = -70;
        }
      }
      ctx.clearRect(0, 0, w, h);
      for (i = 0; i < butterflies.length; i++) {
        drawOne(butterflies[i], t);
      }
    }

    function frame(t) {
      if (!running) return;
      tick(t);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduceMotion) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    size();
    tick(0);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); tick(0); }, 180);
    });

    var hero = document.getElementById("hero");
    if ("IntersectionObserver" in window && hero) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
      }, { threshold: 0 }).observe(hero);
    } else {
      start();
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });
  }

  /* ===========================================================
     2. STICKY HEADER + SCROLL REVEAL + ACTIVE NAV
     =========================================================== */
  function initScroll() {
    var header = document.querySelector(".site-header");
    function onScroll() {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var reveals = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // active nav link
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute("href").replace("#", "");
      if (id) map[id] = l;
    });
    var sections = document.querySelectorAll("main section[id]");
    if ("IntersectionObserver" in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            links.forEach(function (l) { l.classList.remove("is-active"); });
            map[e.target.id].classList.add("is-active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  /* ===========================================================
     3. MOBILE MENU
     =========================================================== */
  function initMenu() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav__toggle");
    if (!nav || !toggle) return;
    function close() { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__link").forEach(function (l) {
      l.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ===========================================================
     4. GALLERY + LIGHTBOX
     =========================================================== */
  function initGallery() {
    var grid = document.getElementById("gallery");
    if (!grid) return;

    PHOTOS.forEach(function (p, idx) {
      var btn = document.createElement("button");
      btn.className = "shot" + (p.size === "wide" ? " shot--wide" : "");
      btn.setAttribute("aria-label", "View photograph: " + p.caption);
      btn.dataset.index = idx;

      var imgWrap = document.createElement("span");
      imgWrap.className = "shot__img";
      if (p.src) {
        var img = document.createElement("img");
        img.src = p.src;
        img.alt = p.caption;
        img.loading = "lazy";
        imgWrap.appendChild(img);
      } else {
        var ph = document.createElement("span");
        ph.style.background = p.grad;
        imgWrap.appendChild(ph);
      }
      btn.appendChild(imgWrap);

      var cap = document.createElement("span");
      cap.className = "shot__cap";
      cap.textContent = p.caption;
      btn.appendChild(cap);

      btn.addEventListener("click", function () { openLightbox(idx); });
      grid.appendChild(btn);
    });

    var lb = document.getElementById("lightbox");
    var frame = document.getElementById("lb-frame");
    var capEl = document.getElementById("lb-cap");
    var countEl = document.getElementById("lb-count");
    var current = 0;
    var lastFocus = null;

    function render() {
      var p = PHOTOS[current];
      frame.innerHTML = "";
      if (p.src) {
        var img = document.createElement("img");
        img.src = p.src; img.alt = p.caption;
        frame.appendChild(img);
      } else {
        var span = document.createElement("span");
        span.style.background = p.grad;
        frame.appendChild(span);
      }
      capEl.textContent = p.caption;
      countEl.textContent = (current + 1) + " / " + PHOTOS.length;
    }
    function openLightbox(i) {
      current = i;
      lastFocus = document.activeElement;
      render();
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add("open"); });
      document.body.style.overflow = "hidden";
      document.getElementById("lb-close").focus();
    }
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(function () { lb.hidden = true; }, 350);
      if (lastFocus) lastFocus.focus();
    }
    function step(dir) {
      current = (current + dir + PHOTOS.length) % PHOTOS.length;
      render();
    }

    document.getElementById("lb-close").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function () { step(-1); });
    document.getElementById("lb-next").addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
  }

  /* ===========================================================
     INIT
     =========================================================== */
  function init() {
    initButterflies();
    initScroll();
    initMenu();
    initGallery();
    // stamp the live year in the footer
    var y = document.querySelector(".foot__year");
    if (y) y.textContent = "© " + new Date().getFullYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

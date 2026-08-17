(function () {
  "use strict";

  var WHATSAPP_NUMBER = "905332948653";

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal], [data-reveal-group]");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach(function (t) { io.observe(t); });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          var el = entry.target;
          var to = parseFloat(el.getAttribute("data-count-to"));
          var suffix = el.getAttribute("data-count-suffix") || "";
          var duration = 1400;
          var start = null;
          function step(ts) {
            if (start === null) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * to) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { io.observe(c); });
  }

  function initLeafField() {
    document.querySelectorAll(".leaf-field").forEach(function (field) {
      var count = parseInt(field.getAttribute("data-leaf-count") || "10", 10);
      for (var i = 0; i < count; i++) {
        var leaf = document.createElement("span");
        leaf.className = "leaf" + (i % 3 === 0 ? " gold" : "");
        leaf.style.left = Math.random() * 100 + "%";
        leaf.style.animationDelay = (Math.random() * 14).toFixed(2) + "s";
        leaf.style.animationDuration = (10 + Math.random() * 8).toFixed(2) + "s";
        leaf.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c5 1 8 5 8 10-6 1-11-2-12-8-.3-1 .2-2 1-2 1 1 2 2 3 0z"/><path d="M12 21V9"/></svg>';
        field.appendChild(leaf);
      }
    });
  }

  function BeforeAfter(el) {
    this.el = el;
    this.after = el.querySelector(".ba-after");
    this.handle = el.querySelector(".ba-handle");
    this.pos = 50;
    this.autoplayPaused = false;
    this.idleTimer = null;
    this.set(this.pos);
    this.bindEvents();
    if (el.getAttribute("data-autoplay") !== "false") {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
  BeforeAfter.prototype.set = function (pos) {
    this.pos = Math.min(94, Math.max(6, pos));
    if (this.after) this.after.style.clipPath = "inset(0 " + (100 - this.pos) + "% 0 0)";
    if (this.handle) this.handle.style.left = this.pos + "%";
  };
  BeforeAfter.prototype.moveFromClientX = function (clientX) {
    var rect = this.el.getBoundingClientRect();
    var pct = ((clientX - rect.left) / rect.width) * 100;
    this.set(pct);
    this.autoplayPaused = true;
    clearTimeout(this.idleTimer);
    var self = this;
    this.idleTimer = setTimeout(function () { self.autoplayPaused = false; }, 2800);
  };
  BeforeAfter.prototype.bindEvents = function () {
    var self = this;
    this.el.addEventListener("pointermove", function (e) { self.moveFromClientX(e.clientX); });
    this.el.addEventListener("pointerdown", function (e) { self.moveFromClientX(e.clientX); });
    this.el.addEventListener(
      "touchmove",
      function (e) {
        if (e.touches && e.touches[0]) self.moveFromClientX(e.touches[0].clientX);
      },
      { passive: true }
    );
  };
  BeforeAfter.prototype.loop = function (ts) {
    if (!this.autoplayPaused) {
      var t = (ts || 0) / 1900;
      this.set(50 + Math.sin(t) * 40);
    }
    requestAnimationFrame(this.loop.bind(this));
  };

  function initSliders() {
    document.querySelectorAll(".ba-slider").forEach(function (el) {
      new BeforeAfter(el);
    });
  }

  function initWhatsAppForm() {
    var form = document.querySelector("[data-wa-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var topic = (data.get("topic") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var lines = ["Merhaba Koru Tarabya, web sitesi üzerinden yazıyorum."];
      if (name) lines.push("Ad Soyad: " + name);
      if (phone) lines.push("Telefon: " + phone);
      if (topic) lines.push("Konu: " + topic);
      if (message) lines.push("Mesaj: " + message);

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      var note = form.querySelector(".form-success");
      if (note) note.classList.add("show");
      window.open(url, "_blank", "noopener");
    });
  }

  function setActiveNav() {
    var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (here === "") here = "index.html";
    document.querySelectorAll(".nav-links a[href]").forEach(function (a) {
      var href = a.getAttribute("href").toLowerCase();
      if (href === here) a.setAttribute("aria-current", "page");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    setActiveNav();
    initReveal();
    initCounters();
    initLeafField();
    initSliders();
    initWhatsAppForm();

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  });
})();

/* VMM — micro-runtime : entête, tiroir mobile, révélations au scroll.
   Aucune dépendance. Respecte prefers-reduced-motion. */
(function () {
  "use strict";
  var head = document.querySelector(".site-head");
  var solid = function () {
    if (!head) return;
    if (head.classList.contains("is-static")) return; // pages internes : toujours solide
    var overHero = document.querySelector(".hero");
    var trigger = overHero ? window.innerHeight * 0.72 : 10;
    head.classList.toggle("is-solid", window.scrollY > trigger);
  };
  solid();
  window.addEventListener("scroll", solid, { passive: true });

  // tiroir mobile
  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".drawer");
  var closeBtn = document.querySelector(".drawer__close");
  var toggle = function (open) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (burger) burger.addEventListener("click", function () { toggle(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { toggle(false); });
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { toggle(false); });
  });

  // révélations
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el) { io.observe(el); });
})();

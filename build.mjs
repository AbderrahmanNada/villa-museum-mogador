/* =========================================================================
   VILLA MUSÉE MOGADOR — générateur statique (sans dépendance)
   Sortie : dist/fr/*.html + dist/en/*.html + assets + sitemap + hreflang.
   Contenu = src/content.mjs · Images = src/media.mjs (WebP responsive).
   Aucun framework runtime → LCP rapide, hand-off simple, remplacement facile.
   ========================================================================= */
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { site, nav, ui, pages, LANGS } from "./src/content.mjs";
import { pic, alt, CREDIT, dims } from "./src/media.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dir, "dist");
// Domaine définitif, acheté le 18/08/2026 et servi par Caddy depuis la même racine
// le site déclarait l'adresse provisoire comme canonique — cf. R1 de VMM_AUDIT_TECHNIQUE.
// Surchargeable sans rebuild du fichier : VMM_ORIGIN=... node build.mjs
const ORIGIN = process.env.VMM_ORIGIN || "https://villamuseummogador.com";

const T = (o, lang) => (o && typeof o === "object" && !Array.isArray(o) ? o[lang] : o);
const href = (slug, lang) => `/${lang}/${slug ? slug + ".html" : "index.html"}`;
const other = (lang) => (lang === "fr" ? "en" : "fr");

/* ---------- éléments partagés ------------------------------------------ */
function header(lang, slug) {
  const links = nav.map((n) => {
    if (n.cta) return "";
    const cur = n.slug === slug ? ' aria-current="page"' : "";
    return `<a href="${href(n.slug, lang)}"${cur}>${T(n.label, lang)}</a>`;
  }).join("");
  const reserve = nav.find((n) => n.cta);
  const langSwitch = `<span class="lang">
      <a href="${href(slug, "fr")}" class="${lang === "fr" ? "on" : ""}" hreflang="fr">FR</a>
      <a href="${href(slug, "en")}" class="${lang === "en" ? "on" : ""}" hreflang="en">EN</a></span>`;
  return `<header class="site-head${slug === "" ? "" : " is-solid is-static"}">
    <a class="brand brand--badge" href="${href("", lang)}" aria-label="villa museum mogador — au delà du confort, l’émotion">
      <svg class="mark" viewBox="0 0 1000 414" aria-hidden="true" focusable="false"><path d="M 0.0 0.0 L 102.4 232.9 L 112.4 247.0 L 126.5 285.1 L 166.7 367.5 L 182.7 409.6 L 186.7 411.6 L 275.1 253.0 L 275.1 234.9 L 247.0 178.7 L 198.8 265.1 L 188.8 271.1 L 146.6 182.7 L 132.5 144.6 L 112.4 108.4 L 74.3 18.1 L 60.2 12.0 L 36.1 10.0 Z"/><path d="M 307.2 66.3 L 267.1 142.6 L 297.2 208.8 L 301.2 206.8 L 345.4 126.5 L 351.4 126.5 L 467.9 371.5 L 568.3 188.8 L 576.3 186.7 L 682.7 411.6 L 751.0 413.7 L 636.5 168.7 L 614.5 128.5 L 540.2 114.5 L 479.9 226.9 L 469.9 232.9 L 399.6 84.3 L 321.3 66.3 Z"/><path d="M 676.7 146.6 L 662.7 174.7 L 694.8 239.0 L 714.9 202.8 L 720.9 200.8 L 799.2 363.5 L 827.3 319.3 L 853.4 267.1 L 861.4 265.1 L 929.7 403.6 L 929.7 409.6 L 933.7 413.7 L 1000.0 411.6 L 893.6 186.7 L 837.3 174.7 L 809.2 222.9 L 803.2 224.9 L 771.1 160.6 L 720.9 152.6 L 684.7 142.6 Z"/><path d="M 602.4 285.1 L 598.4 287.1 L 530.1 411.6 L 598.4 413.7 L 632.5 353.4 Z"/></svg>
      <b>villa museum mogador</b><i class="brand__slogan" lang="fr"><span>au delà du confort ....</span><span>l’émotion</span></i></a>
    <nav class="nav">${links}</nav>
    <div class="head-right">${langSwitch}
      <a class="btn" href="${href(reserve.slug, lang)}">${T(reserve.label, lang)}</a>
      <button class="burger" aria-label="${T(ui.menu, lang)}"><span></span><span></span><span></span></button>
    </div>
  </header>
  <div class="drawer" aria-hidden="true">
    <button class="drawer__close">${T(ui.close, lang)}</button>
    ${nav.map((n) => `<a href="${href(n.slug, lang)}">${T(n.label, lang)}</a>`).join("")}
    ${langSwitch}
  </div>`;
}

function pager(lang, slug) {
  const order = nav.filter((n) => !n.cta);
  const i = order.findIndex((n) => n.slug === slug);
  const next = order[(i + 1) % order.length];
  return `<div class="container"><nav class="pager">
    <span></span>
    <a class="next" href="${href(next.slug, lang)}">
      <span class="pager__lbl">${T(ui.next, lang)}</span>${T(next.label, lang)} →</a>
  </nav></div>`;
}

function footer(lang) {
  const reserve = nav.find((n) => n.cta);
  const cols = nav.filter((n) => !n.cta).slice(1, 6);
  return `<footer class="site-foot"><div class="container">
    <div class="foot-grid">
      <div class="foot-brand">
        <svg class="mark mark--foot" viewBox="0 0 1000 414" aria-hidden="true" focusable="false"><path d="M 0.0 0.0 L 102.4 232.9 L 112.4 247.0 L 126.5 285.1 L 166.7 367.5 L 182.7 409.6 L 186.7 411.6 L 275.1 253.0 L 275.1 234.9 L 247.0 178.7 L 198.8 265.1 L 188.8 271.1 L 146.6 182.7 L 132.5 144.6 L 112.4 108.4 L 74.3 18.1 L 60.2 12.0 L 36.1 10.0 Z"/><path d="M 307.2 66.3 L 267.1 142.6 L 297.2 208.8 L 301.2 206.8 L 345.4 126.5 L 351.4 126.5 L 467.9 371.5 L 568.3 188.8 L 576.3 186.7 L 682.7 411.6 L 751.0 413.7 L 636.5 168.7 L 614.5 128.5 L 540.2 114.5 L 479.9 226.9 L 469.9 232.9 L 399.6 84.3 L 321.3 66.3 Z"/><path d="M 676.7 146.6 L 662.7 174.7 L 694.8 239.0 L 714.9 202.8 L 720.9 200.8 L 799.2 363.5 L 827.3 319.3 L 853.4 267.1 L 861.4 265.1 L 929.7 403.6 L 929.7 409.6 L 933.7 413.7 L 1000.0 411.6 L 893.6 186.7 L 837.3 174.7 L 809.2 222.9 L 803.2 224.9 L 771.1 160.6 L 720.9 152.6 L 684.7 142.6 Z"/><path d="M 602.4 285.1 L 598.4 287.1 L 530.1 411.6 L 598.4 413.7 L 632.5 353.4 Z"/></svg>
        <b>villa museum mogador</b>
        <span class="foot-slogan">${T(site.slogan, lang)}</span>
        <p class="foot-base">${T(site.longSig, lang)}</p>
      </div>
      <div class="foot-col"><h4>${lang === "fr" ? "La maison" : "The house"}</h4>
        ${cols.map((n) => `<a href="${href(n.slug, lang)}">${T(n.label, lang)}</a>`).join("")}</div>
      <div class="foot-col"><h4>${lang === "fr" ? "Séjour" : "Stay"}</h4>
        <a href="${href(reserve.slug, lang)}">${T(reserve.label, lang)}</a>
        <p>${site.address || site.city}</p>
        ${site.phone ? `<p><a href="${site.phoneHref}">${site.phone}</a></p>` : ""}
        ${site.whatsapp ? `<p><a href="${site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></p>` : ""}
        <p>${T(site.category, lang)}</p></div>
    </div>
    <div class="credit"><span>${T(ui.credit, lang)}</span>
      <span>© ${"2026"} villa museum mogador — Essaouira</span></div>
    <p class="foot-privacy">${lang === "fr"
      ? "Confidentialité : ce site mesure son audience avec Umami, hébergé sur nos propres serveurs, sans cookie ; votre adresse IP n’est pas conservée."
      : "Privacy: this site measures its audience with Umami, hosted on our own servers, without cookies; your IP address is not stored."}</p>
  </div></footer>`;
}

/* ---------- layout ----------------------------------------------------- */
/* première image de chaque page (chargée en priorité + préchargée) */
const HERO_IMG = {
  "": "villa-nuit", "la-villa": "villa-jour", "les-residences": "the-arrivee",
  "spa-hammam": "hammam-zellige", "rooftop": "baie-soir",
};

function preloadTag(slug) {
  const id = HERO_IMG[slug];
  if (!id) return "";
  const m = dims(id);
  const srcset = m.widths.map((w) => `/assets/img/${id}/${id}-${w}.webp ${w}w`).join(", ");
  return `<link rel="preload" as="image" type="image/webp" imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high">`;
}

function layout({ lang, slug, title, desc, body, ogId = "villa-nuit" }) {
  const canonical = ORIGIN + href(slug, lang);
  const altUrl = ORIGIN + href(slug, other(lang));
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc.replace(/"/g, "&quot;")}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${other(lang)}" href="${altUrl}">
<link rel="alternate" hreflang="x-default" href="${ORIGIN + href(slug, "fr")}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="villa museum mogador">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc.replace(/"/g, "&quot;")}">
<meta property="og:image" content="${ORIGIN}/assets/img/${ogId}/${ogId}-1200.webp">
<meta property="og:locale" content="${lang === "fr" ? "fr_FR" : "en_GB"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F5F2EC">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600&family=Open+Sans:wght@600&family=Parisienne&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
${preloadTag(slug)}
<script type="application/ld+json">${JSON.stringify(schema(lang))}</script>
<!-- Mesure d'audience Umami auto-hébergée (BC-010, 04/10/2026) : sans cookie, IP non conservée -->
<script defer src="https://stats.nadawis.tech/script.js" data-website-id="ab4e7bc1-35fc-43c2-b409-d57eb5aec82d" data-domains="villamuseummogador.com"></script>
</head>
<body>
<a class="skip" href="#top">${lang === "fr" ? "Aller au contenu" : "Skip to content"}</a>
${header(lang, slug)}
<main id="top">
${body}
</main>
${pager(lang, slug)}
${footer(lang)}
<script src="/assets/client.js" defer></script>
</body>
</html>`;
}

function schema(lang) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "villa museum mogador",
    description: T(pages.home.meta.desc, lang),
    address: { "@type": "PostalAddress", addressLocality: "Essaouira", addressCountry: "MA" },
    ...(site.phone ? { telephone: site.phoneHref.replace("tel:", "") } : {}),
    image: `${ORIGIN}/assets/img/villa-nuit/villa-nuit-1200.webp`,
    url: ORIGIN + href("", lang),
    slogan: T(pages.home.heroSig, lang),
  };
}

/* ---------- composants de section -------------------------------------- */
const reveal = (h, i = 0) => `<div data-reveal style="transition-delay:${i * 90}ms">${h}</div>`;
const soon = (txt) => `<p class="soon">${txt}</p>`;
/* Crédit photographique. Format cible : Titre — lieu — année — © Rachid Haloui.
   Lieu et année restent à collecter auprès de M. Haloui ; ils s'inséreront ici. */
function photoCredit(id, lang) {
  const d = dims(id);
  const parts = [alt(id, lang), d.place, d.year].filter(Boolean);
  return `${parts.join(" — ")} — © Rachid Haloui`;
}

/* Rend une chaîne OU un tableau de paragraphes (le contenu peut être scandé). */
function P(v, lang, cls = "") {
  const x = T(v, lang);
  const arr = Array.isArray(x) ? x : [x];
  const c = cls ? ` class="${cls}"` : "";
  return arr.map((t) => `<p${c}>${t}</p>`).join("\n");
}

function pageHead(p, lang) {
  const sub = p.subtitle
    ? `<p class="page-sub">${T(p.subtitle, lang)}</p>` : "";
  return `<section class="band band--tight"><div class="container">
    ${reveal(`<span class="kicker">${T(p.kicker, lang)}</span>
      <h1 class="sec-head" style="font-size:var(--step-4);font-weight:300;margin-top:.6rem">${T(p.title, lang)}</h1>
      ${sub}
      <div class="lead reading prose">${P(p.intro, lang)}</div>`)}
  </div></section>`;
}

/* ---------- pages ------------------------------------------------------- */
function home(lang) {
  const p = pages.home;
  const doors = [
    { slug: "la-villa", id: "villa-jour", n: "01" },
    { slug: "la-collection", id: "grille-portrait", n: "02" },
    { slug: "les-residences", id: "the-arrivee", n: "03" },
  ];
  return `
<section class="hero">
  <div class="hero__media">${pic("villa-nuit", { sizes: "100vw", eager: true }, lang)}</div>
  <div class="hero__in">
    <p class="hero__sub">${T(site.category, lang)}</p>
    <h1 class="hero__sig">${T(p.heroSig, lang)}</h1>
    <p class="hero__slogan">${T(site.slogan, lang)}</p>
  </div>
  <span class="scrollcue">${T(ui.scroll, lang)}</span>
</section>

<section class="band"><div class="container center">
  ${reveal(`<span class="kicker">${T(site.name, lang)}</span>
  <div class="statement" style="margin-inline:auto;margin-top:1.2rem">${P(p.concept, lang)}</div>`)}
</div></section>

<section class="band band--tight"><div class="container">
  ${reveal(`<span class="kicker">${T(p.doorsIntro, lang)}</span>`)}
  <div class="doors" style="margin-top:1.6rem">
    ${doors.map((d, i) => reveal(`<a class="door" href="${href(d.slug, lang)}">
      ${pic(d.id, { sizes: "(max-width:900px) 100vw, 33vw" }, lang)}
      <span class="door__cap"><span class="n">${d.n}</span>
        <h3>${T(nav.find((n) => n.slug === d.slug).label, lang)}</h3></span></a>`, i)).join("")}
  </div>
</div></section>

<section class="full full--pano">
  ${pic("couloir-memoires", { sizes: "100vw" }, lang)}
  <span class="full__cap">${alt("couloir-memoires", lang)} — ${T(ui.credit, lang)}</span>
</section>

<section class="band"><div class="container">
  <div class="duo">
    <div class="duo__txt">${reveal(`<span class="kicker">${T(p.museumTitle, lang)}</span>
      <h2 class="sec-head" style="font-size:var(--step-3);font-weight:300;margin:.5rem 0 1rem">${T(p.museumTitle, lang)}</h2>
      <div class="prose reading">${P(p.museumBody, lang)}</div>`)}</div>
    <div class="duo__img">${reveal(pic("miroir-coran", { sizes: "(max-width:900px) 100vw, 50vw" }, lang))}</div>
  </div>
</div></section>

<section class="band band--paper2"><div class="container">
  <div class="duo duo--rev">
    <div class="duo__txt">${reveal(`<span class="kicker">${T(p.aptTitle, lang)}</span>
      <h2 class="sec-head" style="font-size:var(--step-3);font-weight:300;margin:.5rem 0 1rem">${T(p.aptTitle, lang)}</h2>
      <div class="prose reading">${P(p.aptBody, lang)}</div>
      <a class="link-lg" href="${href("les-residences", lang)}">${T(nav.find((n) => n.slug === "les-residences").label, lang)} <span class="arw">→</span></a>`)}</div>
    <div class="duo__img duo__img--land">${reveal(pic("salon-galerie", { sizes: "(max-width:900px) 100vw, 50vw" }, lang))}</div>
  </div>
</div></section>

<section class="band"><div class="container">
  <div class="duo">
    <div class="duo__txt">${reveal(`<span class="kicker">Essaouira</span>
      <h2 class="sec-head" style="font-size:var(--step-3);font-weight:300;margin:.5rem 0 1rem">${T(p.essaouiraTitle, lang)}</h2>
      <div class="prose reading">${P(p.essaouiraBody, lang)}</div>
      <a class="link-lg" href="${href("essaouira", lang)}">Essaouira <span class="arw">→</span></a>`)}</div>
    <div class="duo__img duo__img--land">${reveal(pic("baie-soir", { sizes: "(max-width:900px) 100vw, 50vw" }, lang))}</div>
  </div>
</div></section>

<section class="band band--paper2"><div class="container invite">
  ${reveal(`<h2>${T(p.inviteTitle, lang)}</h2>
  <a class="link-lg" href="${href("reserver", lang)}">${T(ui.requestStay, lang)} <span class="arw">→</span></a>`)}
</div></section>`;
}

function villa(lang) {
  const p = pages["la-villa"];
  return `${pageHead(p, lang)}
<section class="full">${pic("villa-jour", { sizes: "100vw", eager: true }, lang)}
  <span class="full__cap">${alt("villa-jour", lang)} — ${T(ui.credit, lang)}</span></section>
<section class="band"><div class="container">
  <div class="duo">
    <div class="duo__img">${reveal(pic("villa-nuit", { sizes: "(max-width:900px) 100vw, 50vw" }, lang))}</div>
    <div class="duo__txt">${reveal(`<span class="kicker">${T(p.progTitle, lang)}</span>
      <h2 class="sec-head" style="font-size:var(--step-2);font-weight:300;margin:.5rem 0 1rem">${T(p.progTitle, lang)}</h2>
      <div class="prose reading">${P(p.prog, lang)}</div>`)}</div>
  </div>
</div></section>
<section class="band band--paper2"><div class="container">
  ${reveal(`<span class="kicker">${T(p.immersionTitle, lang)}</span>
    <h2 class="sec-head" style="font-size:var(--step-2);font-weight:300;margin:.5rem 0 1rem">${T(p.immersionTitle, lang)}</h2>
    <div class="prose reading">${P(p.immersion, lang)}</div>`)}
</div></section>
<section class="band band--tight"><div class="container">
  <div class="mosaic">
    ${["porte-vmm", "artisan-zellige", "zellige-etoile", "artisan-sol", "chambre-terre", "lanterne-bleue", "coussins-bleus", "hammam-zellige", "portraits-anciens"].map((id, i) => reveal(`<figure>${pic(id, { sizes: "(max-width:520px) 100vw, (max-width:900px) 50vw, 33vw" }, lang)}
      <figcaption class="figcap">${photoCredit(id, lang)}</figcaption></figure>`, i % 4)).join("")}
  </div>
</div></section>`;
}

function rachid(lang) {
  const p = pages["rachid-haloui"];
  const blk = (t, body, img, rev) => `<div class="duo${rev ? " duo--rev" : ""}">
    <div class="duo__img duo__img--land">${reveal(pic(img, { sizes: "(max-width:900px) 100vw, 50vw" }, lang))}</div>
    <div class="duo__txt">${reveal(`<span class="kicker">${T(t, lang)}</span>
      <h2 class="sec-head" style="font-size:var(--step-2);font-weight:300;margin:.5rem 0 1rem">${T(t, lang)}</h2>
      <div class="prose reading">${P(body, lang)}</div>`)}</div>
  </div>`;
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container">
  ${blk(p.factsTitle, p.facts, "salon-galerie", false)}
</div></section>
<section class="band band--paper2"><div class="container">
  ${blk(p.villaTitle, p.villa, "villa-jour", true)}
</div></section>
<section class="band"><div class="container">
  ${blk(p.signTitle, p.sign, "marqueterie-bronze", false)}
</div></section>`;
}

function collection(lang) {
  const p = pages["la-collection"];
  const ids = ["couloir-memoires", "grille-portrait", "miroir-coran", "mur-sepia", "porteuse-eau",
    "bestiaire-regule", "pots-epices", "images-anciennes", "marqueterie-bronze", "table-thuya",
    "moucharabieh", "ville-bleue", "tapis-berbere", "salon-galerie", "miroir-statue"];
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container">
  <div class="mosaic">
    ${ids.map((id, i) => reveal(`<figure>${pic(id, { sizes: "(max-width:520px) 100vw, (max-width:900px) 50vw, 33vw" }, lang)}
      <figcaption class="figcap">${photoCredit(id, lang)}</figcaption></figure>`, i % 4)).join("")}
  </div>
  <p class="soon" style="margin-top:1.5rem">${T(ui.soonSeptember, lang)}</p>
</div></section>`;
}

function residences(lang) {
  const p = pages["les-residences"];
  const imgs = ["the-arrivee", "salle-bain", "moucharabieh", "marqueterie-bronze"];
  return `${pageHead(p, lang)}
<section class="full">${pic("the-arrivee", { sizes: "100vw", eager: true }, lang)}
  <span class="full__cap">${alt("the-arrivee", lang)} — ${T(ui.credit, lang)}</span></section>
<section class="band"><div class="container">
  <div class="apts">
    ${p.apts.map((a, i) => reveal(`<article class="apt">
      <span class="lvl">${T(a.level, lang)}</span>
      <h3>${T(a.name, lang)}</h3>
      <div class="prose">${P(a.desc, lang)}</div>
      ${a.link ? `<p class="apt__link">${T(a.link, lang)}</p>` : ""}
      <div class="apt__prat">
        <span class="prat__lbl">${T(ui.practical, lang)}</span>
        <p class="prat__fact">${T(a.facts, lang)}</p>
        <p class="prat__fact">${T(p.equipment, lang)}</p>
        <p class="prat__fact">${T(p.onRequest, lang)}</p>
      </div></article>`, i % 2)).join("")}
  </div>
  <p class="soon" style="margin-top:2rem">${T(p.note, lang)}</p>
</div></section>`;
}

function experience(lang) {
  const p = pages["l-experience"];
  const imgs = ["the-arrivee", "hammam-zellige", "baie-soir"];
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container">
  <div class="feat">
    ${p.rituals.map((r, i) => reveal(`<article>
      <span class="kicker">${T(r.k, lang)}</span>
      <h3>${T(r.t, lang)}</h3>
      <p class="prose">${T(r.d, lang)}</p>
      <div class="duo__img" style="margin-top:1rem">${pic(imgs[i], { sizes: "(max-width:900px) 100vw, 33vw" }, lang)}</div>
    </article>`, i)).join("")}
  </div>
</div></section>
<section class="band band--paper2"><div class="container">
  ${reveal(`<span class="kicker">${T(ui.practical, lang)}</span>
    <h2 class="sec-head" style="font-size:var(--step-2);font-weight:300;margin:.5rem 0 1.4rem">${T(p.servicesTitle, lang)}</h2>
    <ul class="svc">${T(p.services, lang).map((x) => `<li>${x}</li>`).join("")}</ul>`)}
</div></section>`;
}

function spa(lang) {
  const p = pages["spa-hammam"];
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container center">
  <figure style="max-width:620px;margin-inline:auto">${pic("hammam-zellige", { sizes: "(max-width:700px) 100vw, 620px", eager: true }, lang)}
  <figcaption class="figcap">${photoCredit("hammam-zellige", lang)}</figcaption></figure>
</div></section>
<section class="band band--tight"><div class="container center">
  ${reveal(`<div class="pull" style="margin-inline:auto">${P(p.intro, lang)}</div>
  <div style="margin-top:1.6rem">${soon(T(p.note, lang))}</div>`)}
</div></section>`;
}

function rooftop(lang) {
  const p = pages["rooftop"];
  return `${pageHead(p, lang)}
<section class="full">${pic("baie-soir", { sizes: "100vw", eager: true }, lang)}
  <span class="full__cap">${alt("baie-soir", lang)} — ${T(ui.credit, lang)}</span></section>`;
}

function essaouira(lang) {
  const p = pages["essaouira"];
  const ids = ["port-barques", "medina-ficus", "gnaoua-1", "magana", "remparts-2010", "baie-soir", "gnaoua-2"];
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container">
  <div class="feat">
    ${p.entries.map((e, i) => reveal(`<article><span class="kicker">0${i + 1}</span>
      <h3>${T(e.t, lang)}</h3><p class="prose">${T(e.d, lang)}</p></article>`, i)).join("")}
  </div>
</div></section>
<section class="band band--tight"><div class="container">
  ${reveal(`<span class="kicker">${T(p.galleryTitle, lang)}</span>
    <h2 class="sec-head" style="font-size:var(--step-2);font-weight:300;margin:.5rem 0 1rem">${T(p.galleryTitle, lang)}</h2>
    <p class="prose reading">${T(p.galleryIntro, lang)}</p>`)}
  <div class="mosaic" style="margin-top:2.2rem">
    ${ids.map((id, i) => reveal(`<figure>${pic(id, { sizes: "(max-width:520px) 100vw, (max-width:900px) 50vw, 33vw" }, lang)}
      <figcaption class="figcap">${photoCredit(id, lang)}</figcaption></figure>`, i % 4)).join("")}
  </div>
</div></section>`;
}

function reserver(lang) {
  const p = pages["reserver"];
  const f = p.form;
  // Les 4 appartements viennent de content.mjs — jamais réécrits en dur ici.
  const aptOptions = pages["les-residences"].apts
    .map((a) => `<option>${T(a.name, lang)}</option>`).join("");
  // Honnêteté : tant qu'aucune adresse de réception n'est renseignée dans content.mjs,
  // le formulaire ne peut rien transmettre — on le désactive et on le dit,
  // plutôt que d'afficher un formulaire muet qui promet une réponse.
  const live = Boolean(site.email);
  const formAttrs = live
    ? `action="mailto:${site.email}" method="post" enctype="text/plain"`
    : `onsubmit="return false" aria-describedby="form-note"`;
  const disabled = live ? "" : " disabled";
  const notice = live ? "" :
    `<p class="soon" id="form-note" style="grid-column:1/-1">${T(p.formPending, lang)}</p>`;
  return `${pageHead(p, lang)}
<section class="band band--tight"><div class="container">
  <div class="duo">
    <div class="duo__txt">${reveal(`<form class="form" ${formAttrs} aria-label="${T(p.title, lang)}">
      ${notice}
      <div class="field"><label for="f-name">${T(f.name, lang)}</label><input id="f-name" type="text" name="name" autocomplete="name"${disabled}></div>
      <div class="field"><label for="f-email">${T(f.email, lang)}</label><input id="f-email" type="email" name="email" autocomplete="email"${disabled}></div>
      <div class="field"><label for="f-arr">${T(f.arrival, lang)}</label><input id="f-arr" type="date" name="arrival"${disabled}></div>
      <div class="field"><label for="f-dep">${T(f.departure, lang)}</label><input id="f-dep" type="date" name="departure"${disabled}></div>
      <div class="field"><label for="f-guests">${T(f.guests, lang)}</label><input id="f-guests" type="number" name="guests" min="1" max="12" value="2"${disabled}></div>
      <div class="field"><label for="f-apt">${T(f.apt, lang)}</label><select id="f-apt" name="apt"${disabled}>
        <option>${T(f.aptAny, lang)}</option>${aptOptions}</select></div>
      <div class="field field--full"><label for="f-msg">${T(f.message, lang)}</label><textarea id="f-msg" name="message"${disabled}></textarea></div>
      <button class="btn-submit" type="submit"${disabled}>${T(f.submit, lang)}</button>
    </form>`)}</div>
    <div class="duo__txt">${reveal(`<span class="kicker">${T(p.altTitle, lang)}</span>
      <div class="prose reading" style="margin-top:.8rem"><p>${T(p.alt, lang)}</p>
      <p class="dim">${site.city}</p></div>`)}</div>
  </div>
</div></section>`;
}

const RENDER = {
  "": home, "la-villa": villa, "rachid-haloui": rachid, "la-collection": collection,
  "les-residences": residences, "l-experience": experience, "spa-hammam": spa,
  "rooftop": rooftop, "essaouira": essaouira, "reserver": reserver,
};

/* ---------- génération -------------------------------------------------- */
function build() {
  cpSync(resolve(__dir, "src", "styles", "site.css"), resolve(DIST, "assets", "site.css"));
  cpSync(resolve(__dir, "src", "assets", "client.js"), resolve(DIST, "assets", "client.js"));
  writeFileSync(resolve(DIST, "assets", "favicon.svg"), FAVICON);

  const urls = [];
  for (const lang of LANGS) {
    mkdirSync(resolve(DIST, lang), { recursive: true });
    for (const n of nav) {
      const slug = n.slug;
      const meta = (pages[slug || "home"] || pages.home).meta;
      const html = layout({
        lang, slug,
        title: T(meta.title, lang),
        desc: T(meta.desc, lang),
        body: RENDER[slug](lang),
      });
      writeFileSync(resolve(DIST, lang, slug ? slug + ".html" : "index.html"), html);
      urls.push(ORIGIN + href(slug, lang));
    }
  }
  // racine → redirection élégante selon la langue du navigateur
  writeFileSync(resolve(DIST, "index.html"), ROOT_REDIRECT);
  writeFileSync(resolve(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
  writeFileSync(resolve(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`);

  console.log(`✓ ${urls.length} pages générées (${LANGS.join("/")}) → dist/`);
  console.log(`✓ sitemap.xml (${urls.length} URLs), robots.txt, favicon.svg, redirection racine`);
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#1B1714"/>
<g fill="none" stroke="#9A7B4F" stroke-width="1.4">
<circle cx="32" cy="32" r="17"/><circle cx="32" cy="32" r="9"/>
${Array.from({ length: 12 }).map((_, i) => { const a = (i * 30) * Math.PI / 180; return `<line x1="${32 + 9 * Math.cos(a)}" y1="${32 + 9 * Math.sin(a)}" x2="${32 + 17 * Math.cos(a)}" y2="${32 + 17 * Math.sin(a)}"/>`; }).join("")}
</g></svg>`;

const ROOT_REDIRECT = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>villa museum mogador</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<script>location.replace('/'+((navigator.language||'fr').slice(0,2)==='en'?'en':'fr')+'/');</script>
<meta http-equiv="refresh" content="0; url=/fr/"></head>
<body style="background:#F5F2EC;font-family:serif;color:#1B1714;display:grid;place-items:center;height:100vh;margin:0">
<a href="/fr/" style="color:#26485C">villa museum mogador →</a></body></html>`;

build();

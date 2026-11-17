/* Helper média : lit media.json + img-meta.json (généré par le pipeline Python)
   et produit des <picture> responsive (WebP + fallback JPEG), width/height posés
   (zéro CLS), alt bilingue. Source unique = src/media.json. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(__dir, "media.json"), "utf-8"));
let meta = {};
try {
  meta = JSON.parse(readFileSync(resolve(__dir, "..", "dist", "assets", "img", "img-meta.json"), "utf-8"));
} catch { console.warn("⚠ img-meta.json absent — lance `npm run images` d'abord."); }

const byId = Object.fromEntries(manifest.images.map((i) => [i.id, i]));
export const CREDIT = manifest.credit;
export const hasImage = (id) => Boolean(meta[id]);
export const alt = (id, lang) => (byId[id] ? byId[id][lang === "en" ? "altEN" : "altFR"] : "");
export const dims = (id) => meta[id] || { w: 1600, h: 1067, widths: [1200] };

/* base path relatif à la racine du site (assets partagés entre /fr et /en) */
const BASE = "/assets/img";

export function pic(id, { sizes = "100vw", className = "", eager = false, extraAlt } = {}, lang = "fr") {
  const m = meta[id];
  const a = (extraAlt || alt(id, lang)).replace(/"/g, "&quot;");
  if (!m) return `<img alt="${a}" width="1600" height="1067" class="${className}">`;
  const srcset = m.widths.map((w) => `${BASE}/${id}/${id}-${w}.webp ${w}w`).join(", ");
  const fallback = `${BASE}/${id}/${id}.jpg`;
  const loading = eager ? "" : ` loading="lazy"`;
  const fetchp = eager ? ` fetchpriority="high"` : "";
  return `<picture>
    <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
    <img src="${fallback}" alt="${a}" width="${m.w}" height="${m.h}" class="${className}" decoding="async"${loading}${fetchp}>
  </picture>`;
}

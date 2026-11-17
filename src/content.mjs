/* Contenu du site : lu depuis content/*.json (modifiable par l'interface d'édition).
   Ne pas écrire de texte ici. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "content");
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf-8"));
const ifc = read("interface.json");
export const LANGS = ifc.LANGS;
export const site = read("site.json").site;
export const nav = ifc.nav;
export const ui = ifc.ui;
const SLUGS = ["home", "la-villa", "rachid-haloui", "la-collection", "les-residences",
  "l-experience", "spa-hammam", "rooftop", "essaouira", "reserver"];
export const pages = Object.fromEntries(SLUGS.map((s) => [s, read(`pages/${s}.json`)]));

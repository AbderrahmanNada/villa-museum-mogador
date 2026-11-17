# villa museum mogador — site web

Site statique bilingue (FR/EN) de la villa museum mogador, Essaouira.

## Modifier le site (textes et photos)
Les modifications se font dans l'interface d'édition **Pages CMS** (https://app.pagescms.org) :
- **Page · …** : les textes de chaque page, en français et en anglais.
- **Photos du site** : remplacer une photo (bouton « Photo »), corriger sa légende.
  Le champ « Pages où la photo apparaît » indique où elle est affichée.
- **Coordonnées & slogan** : téléphone, e-mail, adresse, slogan.

Après « Enregistrer », le site se met à jour tout seul en 2 à 3 minutes.
Chaque enregistrement est conservé : une erreur se corrige en revenant à la version précédente.

## Technique
- Textes : `content/` (JSON). Photos : `photos/` + catalogue `src/media.json`.
- Construction : `python3 scripts/optimize_images.py && node build.mjs` → `dist/`.
- Publication automatique : `.github/workflows/publier.yml` (GitHub Pages).
- Interface d'édition : `.pages.yml`, générée par `scripts/gen_pages_cms.py`.

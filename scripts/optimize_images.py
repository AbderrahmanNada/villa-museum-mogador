#!/usr/bin/env python3
"""
VMM — Pipeline images NON DESTRUCTIF.
Lit src/media.json, applique la rotation EXIF, génère des WebP responsive
dans dist/assets/img/<id>/, sans jamais toucher aux originaux.
Écrit dist/assets/img/img-meta.json (dimensions réelles après rotation) pour
que le build pose width/height (zéro CLS) et les srcset corrects.

Remplacement de photo en septembre : déposer le nouveau fichier, garder l'id,
relancer ce script + le build. Rien d'autre à changer.
"""
import json, os, sys
from pathlib import Path
from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
SITE = HERE.parent
MEDIA = json.loads((SITE / "src" / "media.json").read_text(encoding="utf-8"))
SRC_DIR = (SITE / MEDIA["sourceDir"]).resolve()
OUT_DIR = SITE / "dist" / "assets" / "img"
WIDTHS = [400, 800, 1200, 1800, 2600]     # tailles servies au navigateur
PANO_WIDTHS = [800, 1400, 2200, 3200]      # panoramas: plus larges
QUALITY = 80

def process(entry):
    ident = entry["id"]
    src = SRC_DIR / Path(entry["file"]).name   # accepte "x.jpg" ou "photos/x.jpg" (interface d'édition)
    if not src.exists():
        print(f"  ✗ MANQUANT: {entry['file']} (id={ident})")
        return None
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)       # applique l'orientation EXIF réelle
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    w0, h0 = im.size
    dest = OUT_DIR / ident
    dest.mkdir(parents=True, exist_ok=True)
    widths = PANO_WIDTHS if entry.get("panorama") else WIDTHS
    made = []
    for w in widths:
        if w > w0 and made:                # ne pas upscaler (garder au moins 1 taille)
            continue
        h = round(h0 * (w / w0))
        rim = im.resize((w, h), Image.LANCZOS)
        outp = dest / f"{ident}-{w}.webp"
        rim.save(outp, "WEBP", quality=QUALITY, method=6)
        made.append(w)
    # fallback JPEG (compat maximale, une seule taille moyenne)
    fw = 1200 if 1200 <= w0 else w0
    fh = round(h0 * (fw / w0))
    im.resize((fw, fh), Image.LANCZOS).save(dest / f"{ident}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(f"  ✓ {ident:18s} {w0}x{h0}  → {len(made)} webp {made}")
    return {"w": w0, "h": h0, "widths": made, "lowres": bool(entry.get("lowres")), "panorama": bool(entry.get("panorama"))}

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Source : {SRC_DIR}")
    print(f"Sortie : {OUT_DIR}\n")
    meta = {}
    for e in MEDIA["images"]:
        r = process(e)
        if r:
            meta[e["id"]] = r
    (OUT_DIR / "img-meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{len(meta)}/{len(MEDIA['images'])} images traitées. Meta → {OUT_DIR/'img-meta.json'}")
    print("Originaux : INTACTS (lecture seule).")

if __name__ == "__main__":
    main()

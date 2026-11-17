#!/usr/bin/env python3
"""Génère .pages.yml (configuration de l'interface d'édition Pages CMS) à partir des JSON de contenu.
Relancer après tout changement de STRUCTURE des fichiers content/ (pas après un simple changement de texte)."""
import json, re
from pathlib import Path
R = Path(__file__).resolve().parent.parent
LAB = {"meta": "Référencement (titre et description Google)", "title": "Titre", "desc": "Description",
       "kicker": "Surtitre", "h1": "Titre principal", "lead": "Chapeau", "intro": "Introduction",
       "note": "Note", "fr": "Français", "en": "English", "t": "Titre", "d": "Texte", "k": "Surtitre"}
def label(k):
    if k in LAB: return LAB[k]
    s = re.sub(r"([a-z])([A-Z])", r"\1 \2", k).replace("-", " ").replace("_", " ")
    return s[:1].upper() + s[1:]
def is_lang(v): return isinstance(v, dict) and set(v) == {"fr", "en"}
def field(k, v):
    f = {"name": k, "label": label(k)}
    if is_lang(v):
        a, b = v["fr"], v["en"]
        if isinstance(a, list):
            f.update(type="object", fields=[{"name": "fr", "label": "Français", "type": "text", "list": True},
                                            {"name": "en", "label": "English", "type": "text", "list": True}])
        else:
            long_ = max(len(str(a)), len(str(b))) > 90
            t = "text" if long_ else "string"
            f.update(type="object", fields=[{"name": "fr", "label": "Français", "type": t},
                                            {"name": "en", "label": "English", "type": t}])
    elif isinstance(v, dict):
        f.update(type="object", fields=[field(kk, vv) for kk, vv in v.items()])
    elif isinstance(v, list):
        if v and isinstance(v[0], dict):
            keys = {}
            for it in v:
                for kk, vv in it.items(): keys.setdefault(kk, vv)
            f.update(type="object", list=True, fields=[field(kk, vv) for kk, vv in keys.items()])
        else:
            f.update(type="text" if any(len(str(x)) > 90 for x in v) else "string", list=True)
    elif isinstance(v, bool): f["type"] = "boolean"
    elif isinstance(v, (int, float)): f["type"] = "number"
    else: f["type"] = "text" if len(str(v)) > 90 else "string"
    return f
PAGES = [("home", "Accueil"), ("la-villa", "La Villa"), ("les-residences", "Les Résidences"),
         ("la-collection", "Les Collections"), ("l-experience", "L'Expérience"),
         ("spa-hammam", "Hammam & Bien-être"), ("rooftop", "Rooftop"), ("essaouira", "Essaouira"),
         ("rachid-haloui", "Rachid Haloui"), ("reserver", "Réserver")]
content = []
for slug, lab in PAGES:
    d = json.loads((R / f"content/pages/{slug}.json").read_text())
    content.append({"name": f"page-{slug}", "label": f"Page · {lab}", "type": "file",
                    "path": f"content/pages/{slug}.json", "format": "json",
                    "fields": [field(k, v) for k, v in d.items()]})
s = json.loads((R / "content/site.json").read_text())
content.append({"name": "site", "label": "Coordonnées & slogan", "type": "file", "path": "content/site.json",
                "format": "json", "fields": [field("site", s["site"])]})
N = len(json.loads((R / "src/media.json").read_text())["images"])
content.append({"name": "photos", "label": "Photos du site", "type": "file", "path": "src/media.json", "format": "json",
  "fields": [
    {"name": "sourceDir", "label": "Dossier (ne pas modifier)", "type": "string", "hidden": True},
    {"name": "credit", "label": "Crédit photo", "type": "string"},
    {"name": "images", "label": "Photos", "type": "object", "list": {"min": N, "max": N}, "fields": [
        {"name": "id", "label": "Identifiant", "type": "string", "required": True, "readonly": True},
        {"name": "emplacement", "label": "Pages où la photo apparaît", "type": "string", "readonly": True},
        {"name": "file", "label": "Photo", "type": "image"},
        {"name": "altFR", "label": "Légende (français)", "type": "string"},
        {"name": "altEN", "label": "Légende (anglais)", "type": "string"},
        {"name": "panorama", "label": "Panorama", "type": "boolean", "hidden": True},
        {"name": "lowres", "label": "Basse définition", "type": "boolean", "hidden": True},
        {"name": "provisional", "label": "Provisoire", "type": "boolean", "hidden": True}]}]})
cfg = {"media": {"input": "photos", "output": "photos", "extensions": ["jpg", "jpeg", "png", "webp", "heic", "heif"]}, "content": content}
(R / ".pages.yml").write_text(json.dumps(cfg, ensure_ascii=False, indent=2))  # JSON est du YAML valide
print("ok", len(content), "entrées")

#!/usr/bin/env python3
"""Guide·Achat - laboratoire d'extraction.

Référence indépendante du backend Node :
1) HTTP public + HTML
2) JSON-LD / meta / texte
3) Playwright optionnel pour DOM rendu et observation XHR/fetch
4) sortie JSON normalisée pour créer des fixtures de non-régression.

Ce script ne contourne pas les CAPTCHA, authentifications ou contrôles d'accès.
"""
import argparse, json, re, sys, time
from pathlib import Path
from html import unescape
from urllib.request import Request, urlopen
from urllib.parse import urlparse

UA = "GuideAchat-Lab/1.0 (+public product extraction)"


def fetch_http(url, timeout=12):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    with urlopen(req, timeout=timeout) as r:
        return {"status": r.status, "url": r.geturl(), "html": r.read(2_000_000).decode(r.headers.get_content_charset() or "utf-8", "replace")}


def strip_html(html):
    html = re.sub(r"<script\b[\s\S]*?</script>", " ", html, flags=re.I)
    html = re.sub(r"<style\b[\s\S]*?</style>", " ", html, flags=re.I)
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", html))).strip()


def meta(html):
    out = {}
    for tag in re.findall(r"<meta\b[^>]*>", html, flags=re.I):
        n = re.search(r'(?:name|property)=["\']([^"\']+)', tag, flags=re.I)
        c = re.search(r'content=["\']([^"\']*)', tag, flags=re.I)
        if n and c: out[n.group(1).lower()] = unescape(c.group(1)).strip()
    return out


def jsonld(html):
    out = []
    for raw in re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>([\s\S]*?)</script>', html, flags=re.I):
        try:
            value = json.loads(unescape(raw.strip()))
            out.extend(value if isinstance(value, list) else [value])
        except Exception:
            pass
    return out


def product_hint(html):
    m = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", html, flags=re.I)
    h1 = strip_html(m.group(1)) if m else ""
    md = meta(html)
    product = next((x for x in jsonld(html) if isinstance(x, dict) and str(x.get("@type", "")).lower() == "product"), {})
    name = product.get("name") or md.get("og:title") or h1
    brand = product.get("brand")
    brand = brand.get("name") if isinstance(brand, dict) else brand
    return {"name": name, "brand": brand, "ean": product.get("gtin13") or product.get("gtin"), "text": strip_html(html), "jsonld": product}


def rendered(url, timeout=15):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError("Playwright optionnel non installé : pip install playwright && playwright install chromium")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        requests = []
        page = context.new_page()
        page.on("request", lambda r: requests.append({"url": r.url, "method": r.method, "resource": r.resource_type}) if r.resource_type in {"xhr", "fetch"} else None)
        page.goto(url, wait_until="domcontentloaded", timeout=timeout * 1000)
        page.wait_for_timeout(1200)
        html = page.content()
        result = {"status": 200, "url": page.url, "html": html, "network": requests[:100]}
        browser.close()
        return result


def save_fixture(directory, url, data, mode):
    """Enregistre la page lue et un descripteur JSON : le test `npm run fixtures:test` rejoue ensuite l'extraction
    du serveur sur cette page, sans réseau. Renseigner `expected_name` dans le JSON pour activer la vérification."""
    out = Path(directory); out.mkdir(parents=True, exist_ok=True)
    u = urlparse(url)
    slug = re.sub(r"[^a-z0-9]+", "-", (u.netloc + u.path).lower()).strip("-")[:80] or "page"
    (out / (slug + ".html")).write_text(data["html"], encoding="utf-8")
    (out / (slug + ".json")).write_text(json.dumps({
        "url": url, "final_url": data.get("url"), "status": data.get("status"), "mode": mode,
        "html_file": slug + ".html", "expected_name": None,
        "captured_at": time.strftime("%Y-%m-%d"),
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return str(out / slug)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--browser", action="store_true")
    ap.add_argument("--save", metavar="DOSSIER", help="enregistre la page et un descripteur de fixture (ex. tests/fixtures)")
    args = ap.parse_args()
    if urlparse(args.url).scheme not in {"http", "https"}:
        raise SystemExit("URL HTTP/HTTPS uniquement")
    data = rendered(args.url) if args.browser else fetch_http(args.url)
    hint = product_hint(data["html"])
    result = {"fetch": {k: v for k, v in data.items() if k != "html"}, "product": hint}
    if args.save:
        result["fixture"] = save_fixture(args.save, args.url, data, "browser" if args.browser else "http")
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()

# Outils de développement (non déployés)

## scraper_lab.py — laboratoire d'extraction

Référence expérimentale **avant** toute modification du backend Node/Vercel. Il montre ce qu'une page expose réellement
(meta, JSON-LD, H1, requêtes XHR/fetch publiques) en HTTP simple ou avec un vrai navigateur.

```bash
python3 tools/scraper_lab.py "https://www.fnac.com/…"                       # HTML brut
python3 tools/scraper_lab.py "https://www.fnac.com/…" --browser             # DOM rendu + XHR (Playwright)
python3 tools/scraper_lab.py "https://…" --save tests/fixtures              # + enregistre une fixture
```

Installation facultative pour `--browser` : `python3 -m pip install playwright && python3 -m playwright install chromium`.
Il ne contourne ni CAPTCHA, ni authentification, ni contrôle d'accès.

## Boucle de non-régression sur pages réelles

1. Depuis votre poste (avec accès réseau), lancer le laboratoire avec `--save tests/fixtures` sur quelques liens qui posent problème.
2. Ouvrir le `.json` créé et renseigner `expected_name` (ex. `"Apple iPhone 17 Pro Max"`).
3. `npm run fixtures:test` rejoue l'extraction du serveur sur ces pages enregistrées, hors ligne, et signale tout écart.

Les fixtures de `tests/fixtures/` dont le nom commence par `synthetique-` sont des exemples construits à la main, pas des pages réelles.

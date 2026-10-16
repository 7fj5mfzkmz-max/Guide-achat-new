(function (root) {
  "use strict";
  function apiBase() {
    if (typeof window === "undefined") return "";
    if (window.GUIDE_API_BASE) return window.GUIDE_API_BASE.replace(/\/$/, "");
    /* GitHub Pages ne fournit pas d'API Node : utiliser le backend Vercel explicitement.
       Sans cela, /api/resolve pointe vers GitHub Pages et l'analyseur bascule toujours en local. */
    if (/\.github\.io$/i.test(window.location.hostname)) return "https://guide-achat-new.vercel.app";
    return "";
  }
  function resolveProduct(url, options) {
    options = options || {};
    var base = apiBase();
    var endpoint = options.endpoint || (base ? base + "/api/resolve" : "/api/resolve");
    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutMs = typeof options.timeout === "number" ? options.timeout : 28000;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;
    function staticFallback() {
      if (root.PhoneAnalyzerStaticResolver && typeof root.PhoneAnalyzerStaticResolver.resolve === "function") {
        return root.PhoneAnalyzerStaticResolver.resolve(url);
      }
      return Promise.reject(new Error("Résolveur statique indisponible."));
    }
    /* GitHub Pages ne peut pas exécuter /api/resolve. Si aucun backend n'est configuré,
       ou si le backend est inaccessible, on passe automatiquement au résolveur statique. */
    var configured = !!base;
    if (!configured && typeof window !== "undefined" && /\.github\.io$/i.test(window.location.hostname)) {
      if (timer) clearTimeout(timer);
      return staticFallback();
    }
    return fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url }), signal: controller ? controller.signal : undefined })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok && !(data && data.clues)) throw new Error(data.error || ("HTTP " + response.status));
          return data;
        });
      }).then(function (data) {
        if (timer) clearTimeout(timer);
        /* Marchand bloquant (Amazon, Fnac, Cdiscount…) : le serveur n'a rien pu lire et n'a pas retrouvé le modèle ailleurs.
           On tente alors le nom contenu dans l'adresse + le catalogue local. Jamais en cas de conflit d'identité (le serveur a
           vu une autre variante) ni pour une page qui n'est pas une fiche produit. Seule une correspondance CATALOGUE est
           retenue : un simple nom tiré de l'adresse ne remplace pas la capture manuelle. */
        if (data && data.ok === false && data.needsCapture && data.kind !== "page" && data.reason !== "identity-conflict") {
          return staticFallback().then(function (local) {
            if (local && local.ok && local.strategy === "static-catalogue") {
              local.warning = "La page du marchand n’a pas pu être lue : le modèle est reconnu d’après l’adresse et le catalogue. Prix et variante non vérifiés.";
              local.fallbackFrom = data.reason || "unreadable";
              return local;
            }
            return data;
          }, function () { return data; });
        }
        return data;
      }, function (err) {
        if (timer) clearTimeout(timer);
        return staticFallback().catch(function () {
          if (err && err.name === "AbortError") throw new Error("Le serveur n’a pas répondu dans les 28 secondes.");
          throw err;
        });
      });
  }
  function resolveModel(model) {
    var base = apiBase();
    /* Sur GitHub Pages sans backend configuré, on utilise le résolveur statique local.
       Partout ailleurs (Vercel même-origine inclus), la fonction /api/resolve traite la saisie :
       c'est elle qui connaît PhonesData, Kimovil et GSMArena. */
    if (base) {
      return fetch(base + "/api/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: model, category: "smartphones" }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || ("HTTP " + r.status)); return d; }); });
    }
    if (typeof window !== "undefined" && !/\.github\.io$/i.test(window.location.hostname)) {
      return fetch("/api/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: model, category: "smartphones" }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || ("HTTP " + r.status)); return d; }); })
        .catch(function () {
          if (root.PhoneAnalyzerStaticResolver && typeof root.PhoneAnalyzerStaticResolver.resolve === "function") {
            return root.PhoneAnalyzerStaticResolver.resolve("https://local.invalid/" + encodeURIComponent(model));
          }
          throw new Error("Résolveur indisponible.");
        });
    }
    if (root.PhoneAnalyzerStaticResolver && typeof root.PhoneAnalyzerStaticResolver.resolve === "function") {
      return root.PhoneAnalyzerStaticResolver.resolve("https://local.invalid/" + encodeURIComponent(model));
    }
    return Promise.reject(new Error("Résolveur indisponible."));
  }
  var api = { resolveProduct: resolveProduct, resolveModel: resolveModel };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PhoneAnalyzerFetcher = api;
})(typeof window !== "undefined" ? window : globalThis);

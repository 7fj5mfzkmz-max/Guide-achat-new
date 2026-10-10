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
    if (base) {
      return fetch(base + "/api/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: model, category: "smartphones" }) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.error || ("HTTP " + r.status)); return d; }); });
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

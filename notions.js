/* Notions illustrées (accueil) : un dessin + le mot, sans définition. Les définitions vivent dans le lexique. */
(function () {
  "use strict";
  var I = {
    wave: '<path d="M6 24c5-14 9-14 13 0s9 14 13 0 9-14 13 0 5 10 7 6"/><path d="M6 40h52" opacity=".35"/>',
    drop: '<path d="M32 6c9 12 14 19 14 27a14 14 0 0 1-28 0c0-8 5-15 14-27z"/><path d="M25 34a7 7 0 0 0 6 7" opacity=".5"/>',
    pixels: '<rect x="8" y="10" width="48" height="28" rx="4"/><path d="M16 18h8v8h-8zM28 18h8v8h-8zM40 18h8v8h-8z" fill="currentColor" stroke="none" opacity=".75"/><path d="M40 30h8" opacity=".3"/>',
    battery: '<rect x="6" y="14" width="46" height="22" rx="5"/><path d="M52 21h5v8h-5"/><path d="M31 18l-7 9h8l-4 8" />',
    chip: '<rect x="16" y="12" width="32" height="26" rx="4"/><rect x="24" y="19" width="16" height="12" rx="2"/><path d="M22 6v6M32 6v6M42 6v6M22 38v6M32 38v6M42 38v6M10 20h6M10 30h6M48 20h6M48 30h6"/>',
    sun: '<circle cx="32" cy="24" r="8"/><path d="M32 6v6M32 36v6M14 24h6M44 24h6M19 11l4 4M41 33l4 4M45 11l-4 4M23 33l-4 4"/>',
    lens: '<circle cx="32" cy="24" r="15"/><circle cx="32" cy="24" r="7"/><path d="M6 24h5M53 24h5M32 4v3" opacity=".5"/>',
    grid: '<rect x="10" y="6" width="44" height="36" rx="4"/><path d="M10 18h44M10 30h44M25 6v36M40 6v36" opacity=".6"/>',
    shield: '<path d="M32 5l18 6v13c0 11-8 17-18 20-10-3-18-9-18-20V11z"/><path d="M24 25l6 6 11-12"/>',
    pin: '<path d="M32 44c-9-10-14-17-14-24a14 14 0 0 1 28 0c0 7-5 14-14 24z"/><circle cx="32" cy="20" r="5"/>',
    sound: '<path d="M12 30v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="28" width="9" height="14" rx="3"/><rect x="47" y="28" width="9" height="14" rx="3"/>',
    bolt: '<path d="M36 5L16 28h14l-4 15 22-25H34z"/>',
    weight: '<path d="M16 40h32l-4-20H20z"/><circle cx="32" cy="14" r="5"/>'
  };
  var MAP = [
    [/nits|lumens|lumin|contraste/i, "sun"], [/mah|\bwh\b|capacité|batter/i, "battery"], [/\bhz\b|fluid|fréquence/i, "wave"],
    [/ip\d\d|étanch|poussi|eau/i, "drop"], [/oled|amoled|écran|dalle/i, "pixels"], [/ram|\bgo\b|stockage|processeur|puce|cpu|gpu/i, "chip"],
    [/\bois\b|stabilis|objectif|zoom/i, "lens"], [/mpx|mégapixel|résolution|pixel|natif|4k/i, "grid"], [/\bans\b|mises à jour|garantie|sécurité/i, "shield"],
    [/gps|localis|capteur/i, "pin"], [/anc|bruit|codec|audio|son|bluetooth/i, "sound"], [/usb|\bw\b|watt|charge|puissance/i, "bolt"], [/poids|grammes|portable/i, "weight"]
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]; }); }
  window.HxNotion = function (term, cat) {
    var k = "";
    for (var i = 0; i < MAP.length; i++) if (MAP[i][0].test(term)) { k = MAP[i][1]; break; }
    var art = k ? '<svg viewBox="0 0 64 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + I[k] + "</svg>"
      : (window.GuideCategories && cat ? window.GuideCategories.icon(cat) : "");
    return '<div class="hx-notion"><span class="hx-notion-art">' + art + "</span><b>" + esc(term) + "</b></div>";
  };
})();

'use strict';
const assert = require('node:assert/strict');
const kit = require('../category-kit');
const identity = require('../phone-analyzer/identity');

const smartphones = kit.get('smartphones');
assert(smartphones, 'le profil smartphones doit être enregistré');
assert.equal(smartphones.status, 'active', 'le profil smartphones doit être actif');
assert(Array.isArray(smartphones.coreSpecs) && smartphones.coreSpecs.length > 0, 'le profil doit définir ses caractéristiques essentielles');
assert(Array.isArray(smartphones.textSpecRules) && smartphones.textSpecRules.length > 0, 'le profil doit définir ses règles de lecture texte');
assert.equal(identity.compare('Samsung Galaxy A56 5G', 'Samsung Galaxy A55 5G', smartphones).verdict, 'different', 'le kit doit contrôler les générations');
console.log('OK : profil smartphone enregistré, actif et relié aux règles d’identité/extraction.');

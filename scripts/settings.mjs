import { MODULE_ID, SETTINGS, DEFAULT_RARITY_WEIGHTS } from "./constants.mjs";
import { AttunementConfigApp } from "./config-app.mjs";

export function registerSettings() {
  game.settings.register(MODULE_ID, SETTINGS.RARITY_WEIGHTS, {
    scope: "world",
    config: false,
    type: Object,
    default: DEFAULT_RARITY_WEIGHTS
  });

  game.settings.register(MODULE_ID, SETTINGS.DEFAULT_BUDGET_NORMAL, {
    scope: "world",
    config: false,
    type: Number,
    default: 15
  });

  game.settings.register(MODULE_ID, SETTINGS.DEFAULT_BUDGET_ARTIFICER, {
    scope: "world",
    config: false,
    type: Number,
    default: 15
  });

  game.settings.registerMenu(MODULE_ID, "configMenu", {
    name: `${MODULE_ID}.settings.configMenu.name`,
    label: `${MODULE_ID}.settings.configMenu.label`,
    hint: `${MODULE_ID}.settings.configMenu.hint`,
    icon: "fa-solid fa-sun",
    type: AttunementConfigApp,
    restricted: true
  });
}

export function getRarityWeights() {
  return game.settings.get(MODULE_ID, SETTINGS.RARITY_WEIGHTS);
}

export function getDefaultBudgetNormal() {
  return game.settings.get(MODULE_ID, SETTINGS.DEFAULT_BUDGET_NORMAL);
}

export function getDefaultBudgetArtificer() {
  return game.settings.get(MODULE_ID, SETTINGS.DEFAULT_BUDGET_ARTIFICER);
}

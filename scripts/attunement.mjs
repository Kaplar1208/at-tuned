import { MODULE_ID, FLAGS, ARTIFICER_CLASS_IDENTIFIER } from "./constants.mjs";
import { getRarityWeights, getDefaultBudgetNormal, getDefaultBudgetArtificer } from "./settings.mjs";

export function getRarityWeight(item) {
  const rarity = item.system?.rarity;
  if (!rarity) return 0;
  return getRarityWeights()[rarity] ?? 0;
}

export function computeWeightedValue(actor) {
  return actor.items.reduce((total, item) => {
    if (!item.system?.attuned) return total;
    return total + getRarityWeight(item);
  }, 0);
}

export function getArtificerLevels(actor) {
  return actor.classes?.[ARTIFICER_CLASS_IDENTIFIER]?.system?.levels ?? 0;
}

export function computeDefaultBudget(actor) {
  return getArtificerLevels(actor) > 0 ? getDefaultBudgetArtificer() : getDefaultBudgetNormal();
}

export function getActorBudget(actor) {
  const override = actor.getFlag(MODULE_ID, FLAGS.BUDGET_OVERRIDE);
  return override ?? computeDefaultBudget(actor);
}

export async function syncActorMax(actor) {
  if (actor.type !== "character") return;
  const budget = getActorBudget(actor);
  if (actor.system.attributes.attunement.max === budget) return;
  await actor.update({ "system.attributes.attunement.max": budget });
}

function isPlayerCharacter(actor) {
  return actor?.type === "character" && actor.hasPlayerOwner;
}

export function registerAttunementHooks() {
  Hooks.on("preUpdateItem", (item, changes) => {
    if (changes.system?.attuned !== true) return true;
    const actor = item.actor;
    if (!actor) return true;

    const budget = getActorBudget(actor);
    const currentValue = computeWeightedValue(actor);
    const newValue = currentValue + getRarityWeight(item);

    if (newValue > budget) {
      ui.notifications.warn(
        game.i18n.format(`${MODULE_ID}.warnings.overBudget`, { budget, value: newValue })
      );
      return false;
    }
    return true;
  });

  Hooks.on("createItem", onClassItemChange);
  Hooks.on("updateItem", (item, changes) => {
    if (item.type === "class" && "levels" in (changes.system ?? {})) onClassItemChange(item);
  });
  Hooks.on("deleteItem", onClassItemChange);

  Hooks.on("ready", () => {
    if (!game.user.isGM) return;
    for (const actor of game.actors) {
      if (isPlayerCharacter(actor)) syncActorMax(actor);
    }
  });
}

function onClassItemChange(item) {
  if (item.type !== "class") return;
  const actor = item.actor;
  if (!actor?.isOwner) return;
  syncActorMax(actor);
}

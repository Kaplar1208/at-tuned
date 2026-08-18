import { MODULE_ID, SETTINGS, FLAGS, RARITIES, DEFAULT_RARITY_WEIGHTS } from "./constants.mjs";
import { getRarityWeights, getDefaultBudgetNormal, getDefaultBudgetArtificer } from "./settings.mjs";
import { getArtificerLevels, computeDefaultBudget, syncActorMax } from "./attunement.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class AttunementConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "at-tuned-config",
    tag: "form",
    window: {
      title: `${MODULE_ID}.configApp.title`,
      icon: "fa-solid fa-sun"
    },
    position: { width: 560, height: "auto" },
    form: {
      handler: AttunementConfigApp.#onSubmit,
      submitOnChange: false,
      closeOnSubmit: true
    },
    classes: ["at-tuned", "config-app"]
  };

  static PARTS = {
    form: { template: `modules/${MODULE_ID}/templates/config-app.hbs` }
  };

  async _prepareContext(_options) {
    const rarityWeights = getRarityWeights();

    const characters = game.actors
      .filter((actor) => actor.type === "character" && actor.hasPlayerOwner)
      .map((actor) => ({
        id: actor.id,
        name: actor.name,
        isArtificer: getArtificerLevels(actor) > 0,
        computedBudget: computeDefaultBudget(actor),
        override: actor.getFlag(MODULE_ID, FLAGS.BUDGET_OVERRIDE) ?? ""
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      rarities: RARITIES.map((key) => ({
        key,
        label: `${MODULE_ID}.rarity.${key}`,
        weight: rarityWeights[key] ?? DEFAULT_RARITY_WEIGHTS[key]
      })),
      defaultBudgetNormal: getDefaultBudgetNormal(),
      defaultBudgetArtificer: getDefaultBudgetArtificer(),
      characters
    };
  }

  static async #onSubmit(_event, _form, formData) {
    const data = foundry.utils.expandObject(formData.object);

    const rarityWeights = {};
    for (const key of RARITIES) {
      rarityWeights[key] = Number(data.rarityWeights?.[key] ?? DEFAULT_RARITY_WEIGHTS[key]);
    }
    await game.settings.set(MODULE_ID, SETTINGS.RARITY_WEIGHTS, rarityWeights);
    await game.settings.set(MODULE_ID, SETTINGS.DEFAULT_BUDGET_NORMAL, Number(data.defaultBudgetNormal));
    await game.settings.set(MODULE_ID, SETTINGS.DEFAULT_BUDGET_ARTIFICER, Number(data.defaultBudgetArtificer));

    for (const [actorId, override] of Object.entries(data.overrides ?? {})) {
      const actor = game.actors.get(actorId);
      if (!actor) continue;

      if (override === "" || override === null || override === undefined) {
        await actor.unsetFlag(MODULE_ID, FLAGS.BUDGET_OVERRIDE);
      } else {
        await actor.setFlag(MODULE_ID, FLAGS.BUDGET_OVERRIDE, Number(override));
      }
      await syncActorMax(actor);
    }
  }
}

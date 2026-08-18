import { MODULE_ID } from "./constants.mjs";
import { computeWeightedValue } from "./attunement.mjs";

function isLibWrapperActive() {
  return game.modules.get("lib-wrapper")?.active === true;
}

export function registerValueSync() {
  if (isLibWrapperActive()) {
    try {
      registerLibWrapperSync();
      return;
    } catch (err) {
      console.error(`${MODULE_ID} | Failed to register lib-wrapper integration, falling back to hook-based sync`, err);
    }
  }
  registerFallbackSync();
}

function registerLibWrapperSync() {
  libWrapper.register(
    MODULE_ID,
    "CONFIG.Actor.documentClass.prototype.prepareDerivedData",
    function (wrapped, ...args) {
      wrapped(...args);
      if (this.type !== "character") return;
      this.system.attributes.attunement.value = computeWeightedValue(this);
    },
    "WRAPPER"
  );
}

function resync(actor) {
  if (!actor || actor.type !== "character") return;
  const newValue = computeWeightedValue(actor);
  if (actor.system.attributes.attunement.value === newValue) return;
  actor.system.attributes.attunement.value = newValue;
  actor.sheet?.render();
}

function registerFallbackSync() {
  Hooks.on("createItem", (item) => resync(item.actor));
  Hooks.on("updateItem", (item) => resync(item.actor));
  Hooks.on("deleteItem", (item) => resync(item.actor));
  Hooks.on("updateActor", (actor) => resync(actor));
  Hooks.on("ready", () => {
    for (const actor of game.actors) resync(actor);
  });
}

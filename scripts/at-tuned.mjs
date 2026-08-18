import { MODULE_ID } from "./constants.mjs";
import { registerSettings } from "./settings.mjs";
import { registerAttunementHooks } from "./attunement.mjs";
import { registerValueSync } from "./libwrapper-bridge.mjs";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);
  registerSettings();
  registerAttunementHooks();
  registerValueSync();
});

// Fires after every module's lang.json has already been merged into game.i18n.translations,
// so overriding here always wins regardless of module load order (unlike a plain lang.json
// entry, which could get overwritten depending on which module's file merges last).
Hooks.once("i18nInit", () => {
  game.i18n.translations["TIDY5E.AttunementWarning"] = game.i18n.localize(`${MODULE_ID}.tidy5eOverrides.attunementWarning`);
});

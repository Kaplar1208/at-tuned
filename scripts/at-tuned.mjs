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

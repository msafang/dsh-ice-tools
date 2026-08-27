import Schema from "@deepseek-ai/schemastery";
//#region src/core/dispatch/index.ts
/**
* Module identity and default enable state. This file used to also host a
* dispatch service that gated optional module mounts behind a runtime
* file-backed toggle. That layer has been removed: module mounting is now
* driven by the `ice-tools` settings scope on the client, and the host half
* only registers the settings namespace itself.
*/
const MODULE_NAMES = [
	"settingsHub",
	"pluginManager",
	"chatRecovery",
	"desktopLauncher",
	"doctor",
	"sessionId",
	"skillExplorer",
	"gitGraph",
	"taskBoard"
];
/**
* Defaults for the toggle surface. Two utilities are flipped on by default
* because they are useful on every ICE Tools visit: the doctor checks the
* runtime and the session list gives the user an immediate handle on the
* current session id. The other six are off until the user opts in — they
* reach for niche utilities (skill catalogue, patch browser, git graph,
* task list, recovery log) and the empty state already hints at them.
*/
const DEFAULT_ENABLED = {
	settingsHub: true,
	pluginManager: false,
	chatRecovery: false,
	desktopLauncher: false,
	doctor: true,
	sessionId: true,
	skillExplorer: false,
	gitGraph: false,
	taskBoard: false
};
function normalizeEnabled(value) {
	const normalized = {
		settingsHub: false,
		pluginManager: false,
		chatRecovery: false,
		desktopLauncher: false,
		doctor: false,
		sessionId: false,
		skillExplorer: false,
		gitGraph: false,
		taskBoard: false
	};
	for (const name of MODULE_NAMES) if (typeof value?.[name] === "boolean") normalized[name] = value[name];
	normalized.settingsHub = true;
	return normalized;
}
//#endregion
//#region src/modules/settings-hub/index.ts
/**
* The settings schema for the `ice-tools` namespace. Schemastery is the same
* DSL the upstream SettingsProvider registers against, so the provider can
* validate writes and serialize via `toJSON()` for the configuration surface.
*
* `enabled` is a permissive dict: any module key is accepted with a boolean
* value. `normalizeEnabled` is the canonical source of truth for the
* settingsHub lock and missing-key defaults.
*/
const Config = Schema.object({ enabled: Schema.dict(Schema.boolean()) });
const defaults = { enabled: { ...DEFAULT_ENABLED } };
/** Register the top-level bilingual settings section through the host provider. */
function apply$1(ctx) {
	const settings = ctx.get("settings");
	if (settings?.register === void 0) return () => {};
	const scope = settings.register("ice-tools", Config, { base: defaults });
	scope.get();
	scope.watch(() => {
		normalizeEnabled(scope.get().enabled);
	});
	return () => {};
}
//#endregion
//#region src/index.ts
const name = "dsh-ice-tools";
const stubOnly = false;
const inject = ["settings"];
/**
* Host-side apply: registers the `ice-tools` settings namespace and nothing
* else. Optional modules previously lived behind a runtime dispatch service;
* that layer has been removed. Each module's host apply is now registered
* unconditionally when its module page exists (currently only settingsHub),
* and optional UI toggles are gated by the settings scope on the client.
*/
function apply(ctx) {
	const settingsDisposer = apply$1(ctx);
	ctx.effect(() => settingsDisposer, "dsh-ice-tools host cleanup");
}
//#endregion
export { apply, inject, name, stubOnly };

//# sourceMappingURL=index.js.map
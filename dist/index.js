//#region src/core/dsh-adapter/index.ts
/**
* Register one settings namespace through the injected host settings service.
* The provider exposes `register(ns, schema, { base })` (there is no
* `installSettingsSection` method on the service — that is a standalone
* helper in @deepseek-ai/dsh-settings), so the wiring mirrors the upstream
* helper: point the source thunk at the registered scope and forward change
* notifications through `watch`.
*/
function installSettingsSection(ctx, namespace, schema, defaults, hooks) {
	const scope = ctx.get("settings")?.register?.(namespace, schema, { base: defaults });
	if (scope === void 0) return () => {};
	hooks.setSource?.(() => scope.get());
	hooks.onChange?.();
	const offWatch = scope.watch(() => hooks.onChange?.());
	return () => {
		if (typeof offWatch === "function") offWatch();
	};
}
//#endregion
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
const DEFAULT_ENABLED = {
	settingsHub: true,
	pluginManager: false,
	chatRecovery: false,
	desktopLauncher: false,
	doctor: false,
	sessionId: false,
	skillExplorer: false,
	gitGraph: false,
	taskBoard: false
};
function normalizeEnabled(value) {
	const normalized = { ...DEFAULT_ENABLED };
	for (const name of MODULE_NAMES) if (typeof value?.[name] === "boolean") normalized[name] = value[name];
	normalized.settingsHub = true;
	return normalized;
}
//#endregion
//#region src/modules/settings-hub/index.ts
const Config = Object.assign((value) => {
	return { enabled: normalizeEnabled((value ?? {}).enabled) };
}, { toJSON: () => ({
	type: "object",
	props: {}
}) });
const defaults = { enabled: { ...DEFAULT_ENABLED } };
/** Register the top-level bilingual settings section and return its disposer. */
function apply$1(ctx) {
	let source = () => defaults;
	return installSettingsSection(ctx, "ice-tools", Config, defaults, {
		setSource: (current) => {
			source = current;
		},
		onChange: () => {
			source();
		}
	});
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
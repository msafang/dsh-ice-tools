//#region src/core/dispatch/index.ts
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
const OPTIONAL_MODULE_NAMES = MODULE_NAMES.filter((name) => name !== "settingsHub");
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
/**
* Mount only the optional modules enabled for this tick. settingsHub is
* mounted separately by the host entry and is therefore not in this result.
*/
function mount(ctx, enabled, appliers) {
	const result = {};
	for (const name of OPTIONAL_MODULE_NAMES) if (enabled[name] === true) {
		appliers[name](ctx);
		result[name] = "apply";
	} else result[name] = "skipped";
	return result;
}
/**
* Host-side service wrapper. The file-backed source is injected so this core
* module stays browser-safe when its metadata is imported by the client half.
*/
function createDispatchService(ctx, source, appliers) {
	return {
		readEnabled: () => source.read().enabled,
		setEnabled: (name, enabled) => {
			source.setEnabled(name, enabled);
		},
		mount: () => mount(ctx, source.read().enabled, appliers),
		tick: () => mount(ctx, source.read().enabled, appliers)
	};
}
//#endregion
export { normalizeEnabled as a, createDispatchService as i, MODULE_NAMES as n, OPTIONAL_MODULE_NAMES as r, DEFAULT_ENABLED as t };

//# sourceMappingURL=dispatch-Ca1LnsuV.js.map
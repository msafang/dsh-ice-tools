import { a as normalizeEnabled, i as createDispatchService, t as DEFAULT_ENABLED } from "./dispatch-Ca1LnsuV.js";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
//#region src/core/config-store/index.ts
const CONFIG_FILE_NAME = "dsh-ice-tools.json";
function resolveConfigPath(homeDir) {
	return join(homeDir ?? process.env.DSH_HOME ?? join(homedir(), ".dsh"), CONFIG_FILE_NAME);
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseConfig(value) {
	if (!isRecord(value) || !isRecord(value.enabled)) return { enabled: { ...DEFAULT_ENABLED } };
	return { enabled: normalizeEnabled(value.enabled) };
}
var ConfigStore = class {
	filePath;
	constructor(filePath = resolveConfigPath()) {
		this.filePath = filePath;
	}
	read() {
		if (!existsSync(this.filePath)) return { enabled: { ...DEFAULT_ENABLED } };
		try {
			return parseConfig(JSON.parse(readFileSync(this.filePath, "utf8")));
		} catch {
			return { enabled: { ...DEFAULT_ENABLED } };
		}
	}
	write(config) {
		const normalized = { enabled: normalizeEnabled(config.enabled) };
		mkdirSync(dirname(this.filePath), { recursive: true });
		const tempPath = `${this.filePath}.${process.pid}.tmp`;
		writeFileSync(tempPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
		renameSync(tempPath, this.filePath);
		return normalized;
	}
	setEnabled(name, enabled) {
		const next = {
			...this.read().enabled,
			[name]: enabled
		};
		next.settingsHub = true;
		return this.write({ enabled: next });
	}
	reset() {
		return this.write({ enabled: { ...DEFAULT_ENABLED } });
	}
};
//#endregion
//#region src/modules/chat-recovery/index.ts
function apply$9(ctx) {}
//#endregion
//#region src/modules/desktop-launcher/index.ts
function apply$8(ctx) {}
//#endregion
//#region src/modules/doctor/index.ts
function apply$7(ctx) {}
//#endregion
//#region src/modules/git-graph/index.ts
function apply$6(ctx) {}
//#endregion
//#region src/modules/plugin-manager/index.ts
function apply$5(ctx) {}
//#endregion
//#region src/modules/session-id/index.ts
function apply$4(ctx) {}
//#endregion
//#region src/modules/skill-explorer/index.ts
function apply$3(ctx) {}
//#endregion
//#region src/modules/task-board/index.ts
function apply$2(ctx) {}
//#endregion
//#region src/core/dsh-adapter/index.ts
/**
* Typed shim for the upstream settings service. A real DSH context supplies
* `services.settings`; tests can use the same surface without installing DSH.
*/
function installSettingsSection(ctx, options) {
	const installer = ctx.services?.settings?.installSettingsSection;
	if (installer === void 0) return options;
	return installer(options) ?? options;
}
//#endregion
//#region src/modules/settings-hub/index.ts
/** The one implemented module: register the top-level bilingual settings section. */
function apply$1(ctx) {
	installSettingsSection(ctx, {
		id: "ice-tools",
		order: 50,
		label: {
			zh: "ICE 工具",
			en: "ICE Tools"
		},
		render: () => import("./client-Byh4wnNN.js")
	});
}
//#endregion
//#region src/index.ts
const name = "dsh-ice-tools";
const stubOnly = false;
const inject = ["settings"];
const OPTIONAL_APPLIERS = {
	pluginManager: apply$5,
	chatRecovery: apply$9,
	desktopLauncher: apply$8,
	doctor: apply$7,
	sessionId: apply$4,
	skillExplorer: apply$3,
	gitGraph: apply$6,
	taskBoard: apply$2
};
function apply(ctx) {
	apply$1(ctx);
	const dispatch = createDispatchService(ctx, new ConfigStore(ctx.homeDir), OPTIONAL_APPLIERS);
	ctx.provide?.("iceToolsDispatch", dispatch);
	return dispatch.mount();
}
//#endregion
export { apply, inject, name, stubOnly };

//# sourceMappingURL=index.js.map
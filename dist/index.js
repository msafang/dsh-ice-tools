import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
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
	const disposers = [];
	for (const name of OPTIONAL_MODULE_NAMES) if (enabled[name] === true) {
		const disposer = appliers[name](ctx);
		if (typeof disposer === "function") disposers.push(disposer);
		result[name] = "apply";
	} else result[name] = "skipped";
	return {
		result,
		disposers
	};
}
/**
* Host-side service wrapper. The file-backed source is injected so this core
* module stays browser-safe when its metadata is imported by the client half.
*/
function createDispatchService(ctx, source, appliers) {
	const disposers = [];
	const disposeAll = () => {
		const current = disposers.splice(0);
		for (let index = current.length - 1; index >= 0; index -= 1) current[index]();
	};
	const mountCurrent = () => {
		disposeAll();
		const mounted = mount(ctx, source.read().enabled, appliers);
		disposers.push(...mounted.disposers);
		return mounted;
	};
	return {
		readEnabled: () => source.read().enabled,
		setEnabled: (name, enabled) => {
			source.setEnabled(name, enabled);
		},
		mount: mountCurrent,
		tick: mountCurrent,
		disposeAll
	};
}
//#endregion
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
* Keep the public helper's argument order identical to upstream settings
* registration while resolving the provider through Cordis.
*/
function installSettingsSection(ctx, namespace, schema, defaults, hooks) {
	const disposer = ctx.get("settings")?.installSettingsSection?.(ctx, namespace, schema, defaults, hooks);
	return typeof disposer === "function" ? disposer : () => {};
}
//#endregion
//#region src/modules/settings-hub/index.ts
/** The settings schema is intentionally kept at the injected adapter boundary. */
const Config = {
	type: "object",
	properties: { enabled: { type: "object" } }
};
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
	const settingsDisposer = apply$1(ctx);
	const dispatch = createDispatchService(ctx, new ConfigStore(ctx.get("homeDir")), OPTIONAL_APPLIERS);
	const unprovide = () => {
		ctx.set("iceToolsDispatch", void 0);
	};
	const mounted = dispatch.mount();
	const cleanup = [
		settingsDisposer,
		dispatch.disposeAll,
		() => {
			unprovide();
		}
	];
	ctx.effect(() => {
		return () => {
			for (let index = cleanup.length - 1; index >= 0; index -= 1) cleanup[index]();
		};
	}, "dsh-ice-tools host cleanup");
	return mounted.result;
}
//#endregion
export { apply, inject, name, stubOnly };

//# sourceMappingURL=index.js.map
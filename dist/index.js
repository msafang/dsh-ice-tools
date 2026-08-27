import { createRequire } from "node:module";
import Schema from "@deepseek-ai/schemastery";
//#region \0rolldown/runtime.js
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
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
const SkillsDefaults = {
	entries: [],
	generatedAt: 0
};
const SkillsConfig = Schema.object({
	entries: Schema.array(Schema.object({
		name: Schema.string(),
		description: Schema.string()
	})),
	generatedAt: Schema.number()
});
/** Resolve `~/.dsh/skills/` relative to the runtime home directory. */
function resolveSkillsDir(homeDir) {
	const cwd = process.cwd();
	const candidates = [
		homeDir,
		process.env["DSH_HOME"],
		cwd
	].filter((value) => typeof value === "string" && value.length > 0);
	if (candidates.length === 0) return void 0;
	return candidates[0];
}
/** Walk one level of the skills directory and produce a minimal mirror. */
function readSkillsMirror(homeDir) {
	const baseDir = resolveSkillsDir(homeDir);
	if (baseDir === void 0) return SkillsDefaults;
	const { readdirSync, readFileSync, statSync, existsSync } = __require("node:fs");
	const path = __require("node:path").join(baseDir, "skills");
	if (!existsSync(path)) return SkillsDefaults;
	if (!statSync(path).isDirectory()) return SkillsDefaults;
	const names = readdirSync(path);
	const entries = [];
	for (const name of names) {
		let description = "";
		const manifestPath = __require("node:path").join(path, name, "SKILL.md");
		if (existsSync(manifestPath)) try {
			description = extractFirstParagraph(readFileSync(manifestPath, "utf8"));
		} catch {
			description = "";
		}
		entries.push({
			name,
			description
		});
	}
	entries.sort((a, b) => a.name.localeCompare(b.name));
	return {
		entries,
		generatedAt: Date.now()
	};
}
/**
* Pull the first paragraph of a markdown manifest. The walker stops at the
* first blank line or heading so the description stays short even when the
* manifest is long.
*/
function extractFirstParagraph(text) {
	const lines = text.split(/\r?\n/);
	const collected = [];
	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.length === 0) break;
		if (trimmed.startsWith("#")) break;
		collected.push(trimmed);
	}
	return collected.join(" ").slice(0, 240);
}
/** Register the top-level bilingual settings section through the host provider. */
function apply$1(ctx) {
	const settings = ctx.get("settings");
	if (settings?.register === void 0) return () => {};
	const scope = settings.register("ice-tools", Config, { base: defaults });
	scope.get();
	scope.watch(() => {
		normalizeEnabled(scope.get().enabled);
	});
	const mirror = readSkillsMirror(ctx.get("homeDir"));
	settings.register("ice-tools-skills", SkillsConfig, { base: mirror });
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
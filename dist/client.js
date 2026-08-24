window.__ModuleLoader__.load({
	id: "dsh-ice-tools",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
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
		//#region src/i18n/en.ts
		const en = { modules: {
			settingsHub: {
				label: "Settings Hub",
				description: "Manage ICE Tools modules and sub-settings links."
			},
			pluginManager: {
				label: "Plugin Manager",
				description: "Install, enable, and manage profile plugins."
			},
			chatRecovery: {
				label: "Chat Recovery",
				description: "Provide a recovery entry for failed chats."
			},
			desktopLauncher: {
				label: "Desktop Launcher",
				description: "Provide a desktop application launch entry."
			},
			doctor: {
				label: "Doctor",
				description: "Check DSH environment and common configuration issues."
			},
			sessionId: {
				label: "Session ID",
				description: "Show and help manage the current session identifier."
			},
			skillExplorer: {
				label: "Skill Explorer",
				description: "Browse installed and available skills."
			},
			gitGraph: {
				label: "Git Graph",
				description: "View workspace Git commit relationships."
			},
			taskBoard: {
				label: "Task Board",
				description: "View and manage work tasks."
			}
		} };
		//#endregion
		//#region src/i18n/zh.ts
		const zh = { modules: {
			settingsHub: {
				label: "设置中心",
				description: "管理 ICE 工具模块和子设置入口。"
			},
			pluginManager: {
				label: "插件管理",
				description: "插件安装、启用和 profile 管理。"
			},
			chatRecovery: {
				label: "对话恢复",
				description: "为失败的对话提供恢复入口。"
			},
			desktopLauncher: {
				label: "桌面启动器",
				description: "提供桌面应用启动入口。"
			},
			doctor: {
				label: "诊断工具",
				description: "检查 DSH 环境和常见配置问题。"
			},
			sessionId: {
				label: "会话 ID",
				description: "展示和辅助管理当前会话标识。"
			},
			skillExplorer: {
				label: "技能浏览器",
				description: "浏览已安装和可用的技能。"
			},
			gitGraph: {
				label: "Git 图谱",
				description: "查看工作区 Git 提交关系。"
			},
			taskBoard: {
				label: "任务看板",
				description: "查看和管理工作任务。"
			}
		} };
		//#endregion
		//#region src/modules/settings-hub/client.ts
		function enableSettingsCard(props = {}) {
			const enabled = {
				...DEFAULT_ENABLED,
				...props.enabled
			};
			return MODULE_NAMES.map((id) => ({
				id,
				label: {
					zh: zh.modules[id].label,
					en: en.modules[id].label
				},
				description: {
					zh: zh.modules[id].description,
					en: en.modules[id].description
				},
				enabled: enabled[id],
				disabled: id === "settingsHub",
				subSettingsUrl: `/settings/ice-tools/${id}`
			}));
		}
		function renderSettingsCard(props = {}) {
			return {
				type: "ice-tools-settings-card",
				props: {
					"data-dsh-plugin": "ice-tools",
					"data-dsh-part": "settings-card",
					title: {
						zh: "ICE 工具",
						en: "ICE Tools"
					},
					toggles: enableSettingsCard(props),
					onToggle: props.onToggle,
					onOpenSubSettings: props.onOpenSubSettings
				}
			};
		}
		function dictFor(active) {
			return active === "zh" ? zh : en;
		}
		function labelFor(active, id) {
			return dictFor(active).modules[id].label;
		}
		const sectionStyle = {
			display: "flex",
			flexDirection: "column",
			gap: "8px",
			padding: "4px 0"
		};
		const rowStyle = {
			display: "flex",
			alignItems: "center",
			gap: "10px",
			padding: "8px 10px",
			borderRadius: "10px",
			cursor: "pointer"
		};
		const labelStyle = {
			fontWeight: 500,
			fontSize: "14px",
			lineHeight: "22px",
			minWidth: "120px"
		};
		const descStyle = {
			color: "var(--dsw-alias-label-secondary, #666)",
			fontSize: "13px",
			lineHeight: "20px"
		};
		/**
		* The ICE Tools settings page: one toggle row per module. Enabled state is
		* read from and written to the host-registered `ice-tools` settings namespace
		* through the injected settings scope, so toggles survive reloads.
		*/
		function IceToolsSection(props) {
			const { scope, locale } = props;
			const [settings, setSettings] = (0, react.useState)(() => scope.getSnapshot());
			const [localeSnapshot, setLocaleSnapshot] = (0, react.useState)(() => locale.getSnapshot());
			(0, react.useEffect)(() => {
				const offSettings = scope.subscribe(() => setSettings(scope.getSnapshot()));
				const offLocale = locale.subscribe(() => setLocaleSnapshot(locale.getSnapshot()));
				return () => {
					offSettings();
					offLocale();
				};
			}, [scope, locale]);
			const dict = dictFor(localeSnapshot.active);
			const enabled = {
				...DEFAULT_ENABLED,
				...settings.value?.enabled ?? {}
			};
			const writable = settings.writable;
			const toggle = (name, next) => {
				scope.set("enabled", {
					...enabled,
					settingsHub: true,
					[name]: next
				});
			};
			const rows = MODULE_NAMES.map((id) => (0, react.createElement)("label", {
				key: id,
				style: rowStyle,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "settings-row",
				"data-module": id
			}, (0, react.createElement)("input", {
				type: "checkbox",
				checked: enabled[id],
				disabled: id === "settingsHub" || !writable,
				onChange: (event) => toggle(id, event.target.checked)
			}), (0, react.createElement)("span", { style: labelStyle }, dict.modules[id].label), (0, react.createElement)("span", { style: descStyle }, dict.modules[id].description)));
			return (0, react.createElement)("section", {
				"data-dsh-plugin": "ice-tools",
				style: sectionStyle
			}, rows);
		}
		/**
		* Register the ICE Tools settings page in the canonical `settings.section`
		* slot, which the settings shell projects into its navigation and content
		* column. The `ice-tools` locale namespace is registered exactly once by the
		* client fiber's apply() (src/client/index.ts).
		*/
		function mount(ctx) {
			const scope = ctx.settingsScope.bind({
				namespace: "ice-tools",
				decode: (section) => {
					if (typeof section !== "object" || section === null) return void 0;
					return { enabled: normalizeEnabled(section.enabled) };
				}
			});
			const locale = ctx.locale;
			const injected = () => ({
				scope,
				locale
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ice-tools",
				order: 10,
				label: () => labelFor(locale.getSnapshot().active, "settingsHub"),
				inject: injected
			}, IceToolsSection));
			return () => {};
		}
		//#endregion
		//#region src/client/index.ts
		const inject = [
			"slots",
			"locale",
			"settingsScope",
			"connection"
		];
		/**
		* Client mounts for the optional modules. Modules without a `mount` yet are
		* stubs; they are listed here so that toggling their enable key takes effect
		* the next time the settings scope publishes.
		*/
		const CLIENT_MOUNTS = { settingsHub: mount };
		function disposeAll(disposers) {
			for (let index = disposers.length - 1; index >= 0; index -= 1) disposers[index]();
		}
		function apply(ctx) {
			ctx.effect(() => {
				const disposer = ctx.locale?.register("ice-tools", {
					zh,
					en
				});
				return typeof disposer === "function" ? disposer : void 0;
			}, "dsh-ice-tools client locale register");
			ctx.effect(() => {
				const bound = ctx.settingsScope.bind({
					namespace: "ice-tools",
					decode: (section) => {
						if (typeof section !== "object" || section === null) return void 0;
						return { enabled: normalizeEnabled(section.enabled) };
					}
				});
				let disposers = [];
				const remount = () => {
					disposeAll(disposers);
					const next = {
						...DEFAULT_ENABLED,
						...bound.getSnapshot().value?.enabled ?? {}
					};
					const fresh = [];
					for (const name of MODULE_NAMES) {
						if (!next[name]) continue;
						const mount = CLIENT_MOUNTS[name];
						if (mount === void 0) continue;
						const disposer = mount(ctx);
						if (typeof disposer === "function") fresh.push(disposer);
					}
					disposers = fresh;
				};
				remount();
				const off = bound.subscribe(remount);
				return () => {
					off();
					disposeAll(disposers);
				};
			}, "dsh-ice-tools client mounts");
		}
		//#endregion
		exports.apply = apply;
		exports.enableSettingsCard = enableSettingsCard;
		exports.inject = inject;
		exports.renderSettingsCard = renderSettingsCard;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
window.__ModuleLoader__.load({
	id: "dsh-ice-tools",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region src/i18n/en.ts
		const en = {
			modules: {
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
			},
			doctor: {
				title: "Doctor",
				runButton: "Run Doctor",
				running: "Running…",
				pass: "Pass",
				fail: "Fail",
				checks: {
					connection: {
						label: "Connection handle",
						detail: "Settings transport reachable from this client."
					},
					settingsDescribe: {
						label: "settings.describe RPC",
						detail: "The Host settings provider answered a describe request."
					},
					namespaceRegistered: {
						label: "ice-tools namespace",
						detail: "The Host registered the ice-tools settings namespace."
					},
					schemaSerializable: {
						label: "Schema serializable",
						detail: "The namespace schema.toJSON() returned a usable envelope."
					},
					providerWritable: {
						label: "Provider writable",
						detail: "The settings provider accepts writes from this process."
					},
					localeActive: {
						label: "Locale active",
						detail: "A locale snapshot is held in the client runtime."
					},
					enabledKeys: {
						label: "Enabled keys",
						detail: "The resolved section has every module key present."
					}
				}
			}
		};
		const zh = {
			modules: {
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
			},
			doctor: {
				title: "诊断",
				runButton: "运行诊断",
				running: "运行中…",
				pass: "通过",
				fail: "失败",
				checks: {
					connection: {
						label: "连接句柄",
						detail: "客户端可达 settings transport。"
					},
					settingsDescribe: {
						label: "settings.describe RPC",
						detail: "Host settings provider 响应了 describe 请求。"
					},
					namespaceRegistered: {
						label: "ice-tools namespace",
						detail: "Host 注册了 ice-tools settings namespace。"
					},
					schemaSerializable: {
						label: "Schema 可序列化",
						detail: "namespace schema.toJSON() 返回了可用的信封。"
					},
					providerWritable: {
						label: "Provider 可写",
						detail: "settings provider 接受本进程的写入。"
					},
					localeActive: {
						label: "Locale 已激活",
						detail: "client runtime 持有 locale 快照。"
					},
					enabledKeys: {
						label: "Enabled 键完整",
						detail: "解析后的 section 包含所有模块键。"
					}
				}
			}
		};
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
		//#region src/modules/doctor/client.ts
		/**
		* Read the full settings describe view through the loopback connection. The
		* `settings.describe` RPC accepts an optional redactSecrets flag; we pass
		* `{}` so we receive the verbatim view (the doctor inspects structure only,
		* never returns secrets).
		*/
		async function readDescribe(ctx) {
			const conn = ctx.get("connection");
			if (conn === void 0) return "connection service missing";
			const response = await conn.api.settings.describe({});
			if (!response.result.ok) return response.result.error.message;
			return response.result.value ?? {};
		}
		function checkEnabledKeys(value) {
			if (typeof value !== "object" || value === null) return {
				pass: false,
				note: `value is ${typeof value}`
			};
			const enabled = value.enabled;
			if (typeof enabled !== "object" || enabled === null) return {
				pass: false,
				note: "enabled field missing"
			};
			const missing = [];
			for (const name of MODULE_NAMES) if (typeof enabled[name] !== "boolean") missing.push(name);
			return missing.length === 0 ? {
				pass: true,
				note: `${MODULE_NAMES.length} keys present`
			} : {
				pass: false,
				note: `missing: ${missing.join(", ")}`
			};
		}
		function checkSchemaSerializable(schema) {
			if (schema === void 0 || schema === null) return {
				pass: false,
				note: "schema absent"
			};
			if (typeof schema !== "object") return {
				pass: false,
				note: `schema is ${typeof schema}`
			};
			return {
				pass: true,
				note: `shape: ${Object.keys(schema).slice(0, 3).join(", ")}`
			};
		}
		/**
		* Run the doctor once. Returns a snapshot the caller can render; the function
		* is pure with respect to the context (no long-lived listeners are created)
		* so a settings page can run it on demand without extra cleanup.
		*/
		async function runDoctor(ctx) {
			const results = [];
			const conn = ctx.get("connection");
			results.push({
				key: "connection",
				pass: conn !== void 0,
				note: conn === void 0 ? "ctx.get(\"connection\") returned undefined" : "present"
			});
			let describeView;
			if (conn === void 0) results.push({
				key: "settingsDescribe",
				pass: false,
				note: "skipped: no connection"
			});
			else {
				const outcome = await readDescribe(ctx);
				if (typeof outcome === "string") results.push({
					key: "settingsDescribe",
					pass: false,
					note: outcome
				});
				else {
					describeView = outcome;
					results.push({
						key: "settingsDescribe",
						pass: true,
						note: `namespaces: ${outcome.namespaces?.length ?? 0}`
					});
				}
			}
			const iceTools = describeView?.namespaces?.find((row) => row.ns === "ice-tools");
			results.push({
				key: "namespaceRegistered",
				pass: iceTools !== void 0,
				note: iceTools === void 0 ? "missing in describe.namespaces" : `revision: ${iceTools.revision ?? "?"}`
			});
			const schemaCheck = iceTools === void 0 ? {
				pass: false,
				note: "skipped: namespace not registered"
			} : checkSchemaSerializable(iceTools.schema);
			results.push({
				key: "schemaSerializable",
				pass: schemaCheck.pass,
				note: schemaCheck.note
			});
			const writable = describeView?.writable === true;
			results.push({
				key: "providerWritable",
				pass: writable,
				note: writable ? "describe.writable === true" : "describe.writable is not true"
			});
			const locale = ctx.locale;
			let localePass = false;
			let localeNote = "locale service missing";
			if (locale !== void 0) try {
				const snap = locale.getSnapshot();
				localePass = typeof snap.active === "string" && snap.active.length > 0;
				localeNote = `active: ${snap.active}`;
			} catch (error) {
				localePass = false;
				localeNote = `getSnapshot() threw: ${error instanceof Error ? error.message : String(error)}`;
			}
			results.push({
				key: "localeActive",
				pass: localePass,
				note: localeNote
			});
			const enabledCheck = iceTools === void 0 ? {
				pass: false,
				note: "skipped: namespace not registered"
			} : checkEnabledKeys(iceTools.value);
			results.push({
				key: "enabledKeys",
				pass: enabledCheck.pass,
				note: enabledCheck.note
			});
			return {
				results,
				ranAt: Date.now()
			};
		}
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
		const buttonStyle = {
			alignSelf: "flex-start",
			padding: "6px 12px",
			borderRadius: "8px",
			border: "1px solid var(--dsw-alias-border, #ccc)",
			background: "var(--dsw-alias-bg-elevated, #f5f5f5)",
			cursor: "pointer",
			fontSize: "13px"
		};
		const checkRowStyle = {
			display: "grid",
			gridTemplateColumns: "20px 1fr auto",
			gap: "8px",
			padding: "6px 10px",
			borderRadius: "8px",
			background: "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))",
			alignItems: "center"
		};
		const checkPassStyle = {
			color: "var(--dsw-alias-success, #0a7d2c)",
			fontWeight: 600
		};
		const checkFailStyle = {
			color: "var(--dsw-alias-danger, #b42318)",
			fontWeight: 600
		};
		const noteStyle = {
			color: "var(--dsw-alias-label-secondary, #666)",
			fontSize: "12px",
			lineHeight: "18px"
		};
		/**
		* The ICE Tools settings page: one toggle row per module. Enabled state is
		* read from and written to the host-registered `ice-tools` settings namespace
		* through the injected settings scope, so toggles survive reloads.
		*/
		function IceToolsSection(props) {
			const { scope, locale, ctx } = props;
			const [settings, setSettings] = (0, react.useState)(() => scope.getSnapshot());
			const [localeSnapshot, setLocaleSnapshot] = (0, react.useState)(() => locale.getSnapshot());
			const [doctorRun, setDoctorRun] = (0, react.useState)(void 0);
			const [doctorRunning, setDoctorRunning] = (0, react.useState)(false);
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
			const onRunDoctor = () => {
				if (ctx === void 0 || doctorRunning) return;
				setDoctorRunning(true);
				runDoctor(ctx).then((result) => {
					setDoctorRun(result);
					setDoctorRunning(false);
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
			const doctorBlock = (0, react.createElement)("div", {
				key: "doctor",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				}
			}, (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				alignItems: "center"
			} }, (0, react.createElement)("span", { style: { fontWeight: 600 } }, dict.doctor.title), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: onRunDoctor,
				disabled: doctorRunning || ctx === void 0,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "doctor-run"
			}, doctorRunning ? dict.doctor.running : dict.doctor.runButton)), doctorRun === void 0 ? (0, react.createElement)("span", { style: noteStyle }, doctorRunning ? dict.doctor.running : "") : (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "doctor-results"
			}, doctorRun.results.map((r) => (0, react.createElement)("div", {
				key: r.key,
				style: checkRowStyle,
				"data-dsh-check": r.key,
				"data-dsh-pass": r.pass ? "true" : "false"
			}, (0, react.createElement)("span", { style: r.pass ? checkPassStyle : checkFailStyle }, r.pass ? "✓" : "✗"), (0, react.createElement)("div", { style: {
				display: "flex",
				flexDirection: "column"
			} }, (0, react.createElement)("span", { style: { fontSize: "13px" } }, dict.doctor.checks[r.key].label), (0, react.createElement)("span", { style: noteStyle }, r.note)), (0, react.createElement)("span", { style: { fontSize: "12px" } }, r.pass ? dict.doctor.pass : dict.doctor.fail)))));
			return (0, react.createElement)("section", {
				"data-dsh-plugin": "ice-tools",
				style: sectionStyle
			}, rows, doctorBlock);
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
				locale,
				ctx
			});
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ice-tools",
				priority: 100,
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
		function apply(ctx) {
			ctx.effect(() => {
				const disposer = ctx.locale?.register("ice-tools", {
					zh,
					en
				});
				return typeof disposer === "function" ? disposer : void 0;
			}, "dsh-ice-tools client locale register");
			const settingsHubDisposer = mount(ctx);
			if (typeof settingsHubDisposer === "function") ctx.effect(() => settingsHubDisposer, "dsh-ice-tools settings hub");
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
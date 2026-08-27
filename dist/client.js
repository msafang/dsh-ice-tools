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
					},
					bundleHash: {
						label: "Bundle fingerprint",
						detail: "Current dist/client.js matches the locally recorded hash; no stale cache."
					},
					localeCoverage: {
						label: "Locale coverage",
						detail: "The Chinese and English dictionaries cover the same module keys."
					},
					moduleLoader: {
						label: "Module loader",
						detail: "window.__ModuleLoader__ has registered the dsh-ice-tools factory."
					},
					clipboardApi: {
						label: "Clipboard API",
						detail: "navigator.clipboard.writeText is available for the Session ID copy button."
					},
					localStorageApi: {
						label: "localStorage API",
						detail: "Read/write localStorage works; required by task board and bundle fingerprint."
					},
					fetchApi: {
						label: "fetch API",
						detail: "fetch + AbortController present; required by the connection RPC."
					}
				}
			},
			sessionId: {
				title: "Session ID",
				refresh: "Refresh",
				copy: "Copy",
				copied: "Copied",
				copyAll: "Copy all",
				copiedAll: "All session ids copied",
				copyFailed: "Copy failed",
				empty: "No sessions yet.",
				emptyFilter: "No sessions match the current filter.",
				running: "Running",
				idle: "Idle",
				filterAll: "All",
				filterRunning: "Running",
				filterIdle: "Idle",
				newCwdPlaceholder: "Working directory (optional)",
				newSession: "New session",
				created: "Session created.",
				cancel: "Cancel",
				cancelled: "Cancel request sent.",
				rename: "Rename",
				renamed: "Renamed.",
				untitled: "(untitled)"
			},
			skillExplorer: {
				title: "Skill Explorer",
				location: "Path",
				empty: "No skills."
			},
			desktopLauncher: {
				title: "Desktop Launcher",
				placeholder: "https://... or mailto:...",
				open: "Open",
				hint: "Copied to clipboard; paste in your system browser to open.",
				unsupported: "Unsupported URL scheme.",
				historyEmpty: "No history for this scheme.",
				remove: "Remove"
			},
			pluginManager: {
				title: "Plugin Manager",
				empty: "No extra patch rows.",
				copyPath: "Copy path",
				copiedPath: "Copied",
				expand: "Expand",
				collapse: "Collapse",
				noConfig: "(no config block)",
				duplicates: "Duplicate ids detected"
			},
			gitGraph: {
				title: "Git Graph",
				note: "A Host-side git subprocess service is required to render the graph."
			},
			taskBoard: {
				title: "Task Board",
				placeholder: "New task...",
				add: "Add",
				done: "Done",
				remove: "Remove",
				empty: "No tasks yet.",
				priority: "Priority",
				priorityHigh: "High",
				priorityMedium: "Medium",
				priorityLow: "Low",
				search: "Search tasks...",
				filterAll: "All",
				filterOpen: "Open",
				filterDone: "Done",
				filterOverdue: "Overdue",
				overdue: "Overdue",
				blocked: "Blocked",
				moveUp: "Move up",
				moveDown: "Move down",
				exportJson: "Export JSON",
				exportMarkdown: "Export Markdown"
			},
			chatRecovery: {
				title: "Chat Recovery",
				note: "A Host-side failure event stream is required to list recoverable sessions."
			},
			pageHints: {
				toggleGuidance: "Toggle a row above to enable its block below; untoggle to hide it.",
				resetButton: "Reset to defaults",
				resetConfirm: "Reset will clear your current toggle overrides. Continue?",
				resetDone: "Reset complete."
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
					},
					bundleHash: {
						label: "Bundle 指纹",
						detail: "当前 dist/client.js 与本地记录一致，避免缓存陈旧包。"
					},
					localeCoverage: {
						label: "双语字典覆盖",
						detail: "中文与英文字典模块键完全对齐。"
					},
					moduleLoader: {
						label: "模块加载器",
						detail: "window.__ModuleLoader__ 已注册 dsh-ice-tools 工厂。"
					},
					clipboardApi: {
						label: "剪贴板 API",
						detail: "navigator.clipboard.writeText 可用于复制会话 ID。"
					},
					localStorageApi: {
						label: "localStorage API",
						detail: "可读写 localStorage，用于任务看板与 bundle 指纹。"
					},
					fetchApi: {
						label: "fetch API",
						detail: "fetch + AbortController 可用，连接 RPC 依赖此基元。"
					}
				}
			},
			sessionId: {
				title: "会话 ID",
				refresh: "刷新",
				copy: "复制",
				copied: "已复制",
				copyAll: "复制全部",
				copiedAll: "已复制全部 id",
				copyFailed: "复制失败",
				empty: "没有会话。",
				emptyFilter: "当前过滤条件下没有会话。",
				running: "运行中",
				idle: "空闲",
				filterAll: "全部",
				filterRunning: "运行中",
				filterIdle: "空闲",
				newCwdPlaceholder: "工作目录 (可留空)",
				newSession: "新建会话",
				created: "已新建会话。",
				cancel: "取消",
				cancelled: "已发送取消请求。",
				rename: "重命名",
				renamed: "已重命名。",
				untitled: "（无标题）"
			},
			skillExplorer: {
				title: "技能浏览器",
				location: "路径",
				empty: "没有技能。"
			},
			desktopLauncher: {
				title: "桌面启动器",
				placeholder: "https://... 或 mailto:...",
				open: "打开",
				hint: "已复制到剪贴板，请在系统浏览器中打开。",
				unsupported: "不支持的 URL 协议。",
				historyEmpty: "该协议下没有历史记录。",
				remove: "删除"
			},
			pluginManager: {
				title: "插件管理",
				empty: "未发现额外 patch 行。",
				copyPath: "复制路径",
				copiedPath: "已复制",
				expand: "展开",
				collapse: "收起",
				noConfig: "（无 config 字段）",
				duplicates: "检测到重复 id"
			},
			gitGraph: {
				title: "Git 图谱",
				note: "需要 Host 提供 git 子进程服务才能渲染图谱。"
			},
			taskBoard: {
				title: "任务看板",
				placeholder: "新任务...",
				add: "添加",
				done: "完成",
				remove: "删除",
				empty: "没有任务。",
				priority: "优先级",
				priorityHigh: "高",
				priorityMedium: "中",
				priorityLow: "低",
				search: "搜索任务...",
				filterAll: "全部",
				filterOpen: "未完成",
				filterDone: "已完成",
				filterOverdue: "已逾期",
				overdue: "已逾期",
				blocked: "被阻塞",
				moveUp: "上移",
				moveDown: "下移",
				exportJson: "导出 JSON",
				exportMarkdown: "导出 Markdown"
			},
			chatRecovery: {
				title: "对话恢复",
				note: "需要 Host 提供失败会话事件流才能列出可恢复项。"
			},
			pageHints: {
				toggleGuidance: "勾选上面的选项即可启用对应工具；取消勾选则隐藏。",
				resetButton: "重置为默认",
				resetConfirm: "重置后将清除当前所有自定义 toggle 设置，确定吗？",
				resetDone: "已重置。"
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
		//#region src/modules/doctor/client.ts
		const BUNDLE_HASH_STORAGE_KEY = "dsh-ice-tools.bundleHash";
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
		/** Browser-safe SHA-256 hex digest. Returns undefined if SubtleCrypto is unavailable. */
		async function sha256Hex(text) {
			if (typeof crypto === "undefined" || crypto.subtle === void 0) return void 0;
			try {
				const bytes = new TextEncoder().encode(text);
				const buffer = await crypto.subtle.digest("SHA-256", bytes);
				const view = new Uint8Array(buffer);
				let out = "";
				for (let i = 0; i < view.length; i += 1) out += view[i].toString(16).padStart(2, "0");
				return out;
			} catch {
				return;
			}
		}
		/**
		* Pull the bundle source from the page. The module loader may expose the
		* factory at `window.__ModuleLoader__['dsh-ice-tools']`; failing that, we
		* fall back to the URL of the script tag that loaded dist/client.js so the
		* hash at least pins the source location (a server-side redeploy will flip
		* it). Both paths together let the check work in the common DSH shipping
		* setups without coupling to one host's loader shape.
		*/
		function readBundleSource() {
			if (typeof window === "undefined") return void 0;
			const entry = window.__ModuleLoader__?.["dsh-ice-tools"];
			if (typeof entry === "string") return entry;
			if (entry !== void 0 && typeof entry.source === "string") return entry.source;
			if (typeof document === "undefined") return void 0;
			const scripts = document.querySelectorAll("script[src*=\"dsh-ice-tools/client.js\"]");
			for (const script of scripts) {
				const src = script.getAttribute("src");
				if (src !== null) return `script:${src}`;
			}
		}
		async function checkBundleHash() {
			if (typeof window === "undefined") return {
				pass: false,
				note: "no window"
			};
			const source = readBundleSource();
			if (source === void 0) return {
				pass: false,
				note: "bundle source unavailable"
			};
			const hash = await sha256Hex(source);
			if (hash === void 0) return {
				pass: false,
				note: "crypto.subtle unavailable"
			};
			const stored = window.localStorage?.getItem(BUNDLE_HASH_STORAGE_KEY) ?? null;
			if (stored === null) {
				try {
					window.localStorage?.setItem(BUNDLE_HASH_STORAGE_KEY, hash);
				} catch {}
				return {
					pass: true,
					note: `fingerprint recorded (${hash.slice(0, 8)}…)`
				};
			}
			return stored === hash ? {
				pass: true,
				note: `match (${hash.slice(0, 8)}…)`
			} : {
				pass: false,
				note: `stored ${stored.slice(0, 8)}… vs current ${hash.slice(0, 8)}…`
			};
		}
		function checkLocaleCoverage() {
			const zhKeys = new Set(Object.keys(zh.modules));
			const enKeys = new Set(Object.keys(en.modules));
			const missingInEn = [];
			for (const key of zhKeys) if (!enKeys.has(key)) missingInEn.push(key);
			const missingInZh = [];
			for (const key of enKeys) if (!zhKeys.has(key)) missingInZh.push(key);
			if (missingInEn.length === 0 && missingInZh.length === 0) return {
				pass: true,
				note: `${zhKeys.size} modules in both dictionaries`
			};
			const parts = [];
			if (missingInEn.length > 0) parts.push(`missing in en: ${missingInEn.join(", ")}`);
			if (missingInZh.length > 0) parts.push(`missing in zh: ${missingInZh.join(", ")}`);
			return {
				pass: false,
				note: parts.join("; ")
			};
		}
		function checkModuleLoader() {
			if (typeof window === "undefined") return {
				pass: false,
				note: "no window"
			};
			const loader = window.__ModuleLoader__;
			if (loader === void 0) return {
				pass: false,
				note: "window.__ModuleLoader__ is undefined"
			};
			return loader["dsh-ice-tools"] !== void 0 ? {
				pass: true,
				note: "dsh-ice-tools factory registered"
			} : {
				pass: false,
				note: "loader present but dsh-ice-tools not registered"
			};
		}
		function checkClipboardApi() {
			if (typeof navigator === "undefined") return {
				pass: false,
				note: "no navigator"
			};
			if (typeof navigator.clipboard?.writeText !== "function") return {
				pass: false,
				note: "navigator.clipboard.writeText missing"
			};
			return {
				pass: true,
				note: "secure context API present"
			};
		}
		function checkLocalStorageApi() {
			if (typeof window === "undefined") return {
				pass: false,
				note: "no window"
			};
			const store = window.localStorage;
			if (store === void 0) return {
				pass: false,
				note: "window.localStorage undefined"
			};
			const probeKey = `${BUNDLE_HASH_STORAGE_KEY}.probe`;
			try {
				store.setItem(probeKey, "1");
				const read = store.getItem(probeKey);
				store.removeItem(probeKey);
				return read === "1" ? {
					pass: true,
					note: "read/write/remove round-trip ok"
				} : {
					pass: false,
					note: "round-trip mismatch"
				};
			} catch (error) {
				return {
					pass: false,
					note: `threw: ${error instanceof Error ? error.message : String(error)}`
				};
			}
		}
		function checkFetchApi() {
			if (typeof fetch !== "function") return {
				pass: false,
				note: "fetch is not a function"
			};
			if (typeof AbortController !== "function") return {
				pass: false,
				note: "AbortController is not a function"
			};
			return {
				pass: true,
				note: "fetch + AbortController present"
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
			const bundleCheck = await checkBundleHash();
			results.push({
				key: "bundleHash",
				pass: bundleCheck.pass,
				note: bundleCheck.note
			});
			const coverageCheck = checkLocaleCoverage();
			results.push({
				key: "localeCoverage",
				pass: coverageCheck.pass,
				note: coverageCheck.note
			});
			const loaderCheck = checkModuleLoader();
			results.push({
				key: "moduleLoader",
				pass: loaderCheck.pass,
				note: loaderCheck.note
			});
			const clipboardCheck = checkClipboardApi();
			results.push({
				key: "clipboardApi",
				pass: clipboardCheck.pass,
				note: clipboardCheck.note
			});
			const storageCheck = checkLocalStorageApi();
			results.push({
				key: "localStorageApi",
				pass: storageCheck.pass,
				note: storageCheck.note
			});
			const fetchCheck = checkFetchApi();
			results.push({
				key: "fetchApi",
				pass: fetchCheck.pass,
				note: fetchCheck.note
			});
			return {
				results,
				ranAt: Date.now()
			};
		}
		//#endregion
		//#region src/modules/skill-explorer/client.ts
		const KNOWN_SKILLS = [
			{
				name: "agently-mail",
				description: "Email operations through the agently-cli skill set.",
				location: "~/.dsh/skills/agently-mail"
			},
			{
				name: "manage-taskboard",
				description: "Read and write the Codex / e-taskboard task ledger.",
				location: "~/.dsh/skills/manage-taskboard"
			},
			{
				name: "qiaomu-design",
				description: "Opinionated design review and rebuild advisory skill.",
				location: "~/.dsh/skills/qiaomu-design"
			}
		];
		//#endregion
		//#region src/modules/session-id/client.ts
		function isString(value) {
			return typeof value === "string";
		}
		function asSummary(value) {
			if (typeof value !== "object" || value === null) return void 0;
			const candidate = value;
			if (!isString(candidate.sessionId)) return void 0;
			return {
				sessionId: candidate.sessionId,
				...isString(candidate.title) ? { title: candidate.title } : {},
				...isString(candidate.cwd) ? { cwd: candidate.cwd } : {},
				...typeof candidate.updatedAt === "number" ? { updatedAt: candidate.updatedAt } : {},
				...typeof candidate.running === "boolean" ? { running: candidate.running } : {},
				...typeof candidate.blank === "boolean" ? { blank: candidate.blank } : {}
			};
		}
		function unwrap(response) {
			if (response.result.ok) return {
				ok: true,
				value: response.result.value
			};
			return {
				ok: false,
				error: response.result.error.message
			};
		}
		/**
		* Pull the session list through the loopback connection. The list shape is
		* `{ items: SessionSummary[] }` per the upstream `sessions/list` contract;
		* unknown entries are dropped silently so a future Host-side addition does
		* not crash the page.
		*/
		async function listSessions(ctx) {
			const conn = ctx.get("connection");
			if (conn === void 0) return {
				sessions: [],
				error: "connection service missing"
			};
			const response = await conn.api.sessions.list({});
			if (!response.result.ok) return {
				sessions: [],
				error: response.result.error.message
			};
			const items = Array.isArray(response.result.value.items) ? response.result.value.items : [];
			const sessions = [];
			for (const item of items) {
				const summary = asSummary(item);
				if (summary !== void 0) sessions.push(summary);
			}
			return { sessions };
		}
		/**
		* Copy a string to the clipboard. Uses `navigator.clipboard.writeText` when
		* the secure-context API is available; otherwise it tries the legacy
		* `document.execCommand('copy')` fallback through a hidden textarea so the
		* feature still works in non-secure-context preview builds.
		*/
		async function copyToClipboard(text) {
			if (typeof navigator !== "undefined" && navigator.clipboard?.writeText !== void 0) try {
				await navigator.clipboard.writeText(text);
				return {
					ok: true,
					message: "clipboard.writeText"
				};
			} catch (error) {
				return {
					ok: false,
					message: `clipboard.writeText rejected: ${error instanceof Error ? error.message : String(error)}`
				};
			}
			if (typeof document === "undefined") return {
				ok: false,
				message: "no clipboard API available"
			};
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.setAttribute("readonly", "");
			textarea.style.position = "absolute";
			textarea.style.left = "-9999px";
			document.body.appendChild(textarea);
			textarea.select();
			try {
				const success = document.execCommand("copy");
				document.body.removeChild(textarea);
				return success ? {
					ok: true,
					message: "execCommand"
				} : {
					ok: false,
					message: "execCommand returned false"
				};
			} catch (error) {
				document.body.removeChild(textarea);
				return {
					ok: false,
					message: `execCommand threw: ${error instanceof Error ? error.message : String(error)}`
				};
			}
		}
		function sessionResult(response, fallback) {
			const unwrapped = unwrap(response);
			if (unwrapped.ok) return {
				ok: true,
				message: fallback
			};
			return {
				ok: false,
				message: unwrapped.error
			};
		}
		async function createSession(ctx, cwd) {
			const conn = ctx.get("connection");
			if (conn === void 0) return {
				ok: false,
				message: "connection service missing"
			};
			const trimmed = cwd.trim();
			return sessionResult(await conn.api.sessions.create(trimmed.length === 0 ? {} : { cwd: trimmed }), "session created");
		}
		async function renameSession(ctx, sessionId, title) {
			const conn = ctx.get("connection");
			if (conn === void 0) return {
				ok: false,
				message: "connection service missing"
			};
			const trimmed = title.trim();
			if (trimmed.length === 0) return {
				ok: false,
				message: "title cannot be empty"
			};
			return sessionResult(await conn.api.sessions.rename({
				sessionId,
				title: trimmed
			}), "renamed");
		}
		async function cancelSession(ctx, sessionId) {
			const conn = ctx.get("connection");
			if (conn === void 0) return {
				ok: false,
				message: "connection service missing"
			};
			return sessionResult(await conn.api.sessions.cancel({ sessionId }), "cancel sent");
		}
		/** Filter the session list by a coarse status selector. */
		function filterSessions(sessions, status) {
			if (status === "all") return sessions;
			if (status === "running") return sessions.filter((entry) => entry.running === true);
			return sessions.filter((entry) => entry.running !== true);
		}
		/** Flatten the visible sessions into a newline-joined id list. */
		function joinSessionIds(sessions) {
			return sessions.map((entry) => entry.sessionId).join("\n");
		}
		//#endregion
		//#region src/modules/desktop-launcher/client.ts
		const HISTORY_KEY = "dsh-ice-tools.launcher.history.v1";
		const HISTORY_LIMIT = 10;
		const QUICK_PRESETS = [
			{
				id: "github-issue",
				scheme: "https",
				label: {
					en: "GitHub issue",
					zh: "GitHub Issue"
				},
				placeholder: "https://github.com/owner/repo/issues/123"
			},
			{
				id: "github-pr",
				scheme: "https",
				label: {
					en: "GitHub PR",
					zh: "GitHub PR"
				},
				placeholder: "https://github.com/owner/repo/pull/456"
			},
			{
				id: "github-commit",
				scheme: "https",
				label: {
					en: "GitHub commit",
					zh: "GitHub commit"
				},
				placeholder: "https://github.com/owner/repo/commit/abc123"
			},
			{
				id: "mailto",
				scheme: "mailto",
				label: {
					en: "Email",
					zh: "邮件"
				},
				placeholder: "mailto:someone@example.com?subject=..."
			}
		];
		/**
		* Validate a URL string enough that we can copy it confidently. We accept
		* http(s) and mailto schemes; everything else (javascript:, file:, data:)
		* is rejected so the user does not accidentally ship a clipboard payload
		* that an external program would execute.
		*/
		function isLaunchableUrl(raw) {
			const trimmed = raw.trim();
			if (trimmed.length === 0) return false;
			if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
			if (trimmed.startsWith("mailto:")) return true;
			return false;
		}
		/** Detect the URL scheme without depending on the URL constructor. */
		function schemeOf(raw) {
			const trimmed = raw.trim().toLowerCase();
			if (trimmed.startsWith("https://")) return "https";
			if (trimmed.startsWith("http://")) return "http";
			if (trimmed.startsWith("mailto:")) return "mailto";
			return "other";
		}
		async function openOrCopyUrl(raw, copy) {
			const trimmed = raw.trim();
			if (!isLaunchableUrl(trimmed)) return {
				ok: false,
				message: "unsupported scheme"
			};
			return await copy(trimmed);
		}
		function safeStorage$1() {
			if (typeof window === "undefined" || window.localStorage === void 0) return void 0;
			return window.localStorage;
		}
		/**
		* Read the URL history from localStorage. Returns an empty array on any
		* failure (no window, quota, malformed JSON) so the caller can render
		* an empty-state hint without further guarding.
		*/
		function loadHistory() {
			const store = safeStorage$1();
			if (store === void 0) return [];
			const raw = store.getItem(HISTORY_KEY);
			if (raw === null) return [];
			try {
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				const entries = [];
				for (const item of parsed) {
					if (typeof item !== "object" || item === null) continue;
					const candidate = item;
					if (typeof candidate.url !== "string") continue;
					if (typeof candidate.usedAt !== "number") continue;
					const scheme = candidate.scheme;
					if (scheme !== "http" && scheme !== "https" && scheme !== "mailto" && scheme !== "other") continue;
					entries.push({
						url: candidate.url,
						scheme,
						usedAt: candidate.usedAt
					});
				}
				return entries;
			} catch {
				return [];
			}
		}
		function persistHistory(entries) {
			const store = safeStorage$1();
			if (store === void 0) return;
			try {
				store.setItem(HISTORY_KEY, JSON.stringify(entries));
			} catch {}
		}
		/**
		* Record a successful URL handoff at the front of the history list.
		* Duplicates collapse (the most recent timestamp wins) and the list is
		* capped at HISTORY_LIMIT entries.
		*/
		function recordHistory(entries, url) {
			const scheme = schemeOf(url);
			const trimmed = url.trim();
			const filtered = entries.filter((entry) => entry.url !== trimmed);
			const updated = [{
				url: trimmed,
				scheme,
				usedAt: Date.now()
			}, ...filtered].slice(0, HISTORY_LIMIT);
			persistHistory(updated);
			return updated;
		}
		/** Remove a single history entry by URL. */
		function removeHistory(entries, url) {
			const updated = entries.filter((entry) => entry.url !== url);
			persistHistory(updated);
			return updated;
		}
		//#endregion
		//#region src/modules/plugin-manager/client.ts
		/**
		* Light YAML extractor for the cordis patch format the DSH loader emits.
		* We do not depend on a YAML parser (the plugin stays runtime-dep-free);
		* this walker handles the subset we care about: top-level `insert:`
		* lists of `- id: ... -- optional name: ... -- optional config: { ... }`
		* mappings.
		*/
		function parseCordisPatch(source) {
			const rows = [];
			const unrecognized = [];
			const recordIndex = /* @__PURE__ */ new Map();
			const keywordOffsets = [];
			const keywordPattern = /\n?\s*-?\s*insert:\s*/g;
			let match;
			while ((match = keywordPattern.exec(source)) !== null) keywordOffsets.push(match.index);
			for (let i = 0; i < keywordOffsets.length; i += 1) {
				const keywordOffset = keywordOffsets[i];
				const blockStartOffset = keywordOffset + (source.slice(keywordOffset).match(/^[\s\S]*?-?\s*insert:\s*/)?.[0].length ?? 0);
				const endOffset = i + 1 < keywordOffsets.length ? keywordOffsets[i + 1] : source.length;
				const rowSegments = splitRows(source.slice(blockStartOffset, endOffset));
				let rowCursorOffset = blockStartOffset;
				for (const segment of rowSegments) {
					const idMatch = segment.match(/\n?\s*-\s*id:\s*([^\s#]+)/);
					if (idMatch === null) {
						const firstLine = segment.split("\n")[0]?.trim() ?? "";
						if (firstLine.length > 0) unrecognized.push(firstLine);
						continue;
					}
					const id = idMatch[1];
					const startLine = computeLineOf(source, rowCursorOffset);
					const nameMatch = segment.match(/\n\s*name:\s*['"]?([^'"\n#]+)['"]?/);
					const configText = extractConfig(segment);
					const configMap = parseConfigMap(configText);
					const rawConfig = configText.trim();
					const row = {
						id,
						...nameMatch === null ? {} : { name: nameMatch[1].trim() },
						kind: "insert",
						config: configMap,
						rawConfig,
						line: startLine
					};
					rows.push(row);
					recordIndex.set(id, (recordIndex.get(id) ?? 0) + 1);
					rowCursorOffset += segment.length;
				}
			}
			const duplicates = [];
			const lineById = /* @__PURE__ */ new Map();
			for (let idx = 0; idx < rows.length; idx += 1) {
				const row = rows[idx];
				const list = lineById.get(row.id) ?? [];
				list.push(row.line);
				lineById.set(row.id, list);
			}
			for (const [id, lines] of lineById.entries()) if (lines.length > 1) duplicates.push({
				id,
				lines
			});
			return {
				rows,
				unrecognized,
				duplicates
			};
		}
		function computeLineOf(source, offset) {
			let line = 1;
			for (let i = 0; i < offset && i < source.length; i += 1) if (source.charCodeAt(i) === 10) line += 1;
			return line;
		}
		/**
		* Split one insert block on every `- id:` boundary so each returned
		* segment is one row. The walker counts braces while looking for the
		* boundary, so a config block with nested `{`/`}` does not produce a
		* spurious split.
		*/
		function splitRows(block) {
			const segments = [];
			let depth = 0;
			let start = 0;
			for (let i = 0; i < block.length; i += 1) {
				const ch = block.charAt(i);
				if (ch === "{") depth += 1;
				else if (ch === "}") depth = Math.max(0, depth - 1);
				else if (depth === 0 && block.startsWith("- id:", i)) {
					if (i > start) segments.push(block.slice(start, i));
					start = i;
				}
			}
			if (start < block.length) segments.push(block.slice(start));
			return segments;
		}
		/**
		* Pull the `config:` block out of one insert segment. The walker matches
		* the loader's `config:` keyword, finds the matching `{`, and reads until
		* the matching `}` (counting braces so nested values survive).
		*/
		/**
		* Pull the `config:` block out of one insert segment. Two layouts ship in
		* the wild: a flat `{ ... }` JSON-ish form and a flat-key form written
		* under the `config:` keyword. The walker accepts both: brace-balanced
		* blocks return the inner text; flat-key blocks return the lines that
		* follow `config:` until the next sibling key (or the next `- id:`
		* boundary detected by the caller) takes over.
		*/
		function extractConfig(segment) {
			const match = segment.match(/\n\s*config:\s*([\s\S]*)/);
			if (match === null) return "";
			const body = match[1] ?? "";
			if (!body.includes("{")) return body;
			let depth = 0;
			let end = 0;
			let started = false;
			for (let i = 0; i < body.length; i += 1) {
				const ch = body.charAt(i);
				if (ch === "{") {
					depth += 1;
					started = true;
				} else if (ch === "}") {
					depth -= 1;
					if (started && depth === 0) {
						end = i + 1;
						break;
					}
				}
			}
			if (!started) return "";
			return body.slice(0, end);
		}
		/**
		* Parse the inner config block into a flat string map. The walker is
		* intentionally shallow: nested objects stay a stringified copy in
		* `rawConfig` so the UI can show the original text, while scalars and
		* top-level keys land in `config` so toggles and indicators have data
		* to act on.
		*/
		function parseConfigMap(raw) {
			const trimmed = raw.trim();
			const inner = trimmed.startsWith("{") ? trimmed.slice(1, trimmed.lastIndexOf("}")) : trimmed;
			const map = {};
			for (const line of inner.split("\n")) {
				const match = line.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.+?)\s*$/);
				if (match === null) continue;
				map[match[1]] = match[2];
			}
			return map;
		}
		//#endregion
		//#region src/modules/git-graph/client.ts
		function readGitGraphState() {
			return { status: "requires-host" };
		}
		//#endregion
		//#region src/modules/task-board/client.ts
		const TASK_STORAGE_KEY = "dsh-ice-tools.tasks.v1";
		const TASK_TEMPLATES = [
			{
				id: "bug",
				title: "Fix bug",
				priority: "high"
			},
			{
				id: "review",
				title: "Review PR",
				priority: "medium",
				dueOffsetDays: 1
			},
			{
				id: "docs",
				title: "Update docs",
				priority: "low",
				dueOffsetDays: 7
			},
			{
				id: "test",
				title: "Write test",
				priority: "medium",
				dueOffsetDays: 3
			}
		];
		const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
		function safeStorage() {
			const g = typeof globalThis !== "undefined" ? globalThis : void 0;
			const store = g?.window?.localStorage ?? g?.localStorage;
			if (store === void 0) return void 0;
			return store;
		}
		function isValidIsoDate(value) {
			return typeof value === "string" && ISO_DATE.test(value);
		}
		function todayIso() {
			const now = /* @__PURE__ */ new Date();
			return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		}
		function isoOffsetDays(days) {
			const now = /* @__PURE__ */ new Date();
			now.setDate(now.getDate() + days);
			return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		}
		function isOverdue(task, today = todayIso()) {
			if (task.done) return false;
			if (!isValidIsoDate(task.dueDate)) return false;
			return task.dueDate < today;
		}
		/** A task is blocked when any of its blocker IDs is still open in the task list. */
		function isBlocked(task, allTasks) {
			const ids = task.blockedBy;
			if (ids === void 0 || ids.length === 0) return false;
			for (const id of ids) {
				const blocker = allTasks.find((t) => t.id === id);
				if (blocker !== void 0 && !blocker.done) return true;
			}
			return false;
		}
		function loadTasks() {
			const store = safeStorage();
			if (store === void 0) return [];
			const raw = store.getItem(TASK_STORAGE_KEY);
			if (raw === null) return [];
			try {
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed)) return [];
				const tasks = [];
				for (const item of parsed) {
					if (typeof item !== "object" || item === null) continue;
					const candidate = item;
					if (typeof candidate.id !== "string" || typeof candidate.title !== "string") continue;
					if (typeof candidate.createdAt !== "number") continue;
					const priority = candidate.priority === "high" || candidate.priority === "medium" || candidate.priority === "low" ? candidate.priority : "medium";
					const done = candidate.done === true;
					const order = typeof candidate.order === "number" ? candidate.order : tasks.length;
					const dueDate = isValidIsoDate(candidate.dueDate) ? candidate.dueDate : void 0;
					const blockedBy = Array.isArray(candidate.blockedBy) ? candidate.blockedBy.filter((id) => typeof id === "string") : void 0;
					tasks.push({
						id: candidate.id,
						title: candidate.title,
						done,
						createdAt: candidate.createdAt,
						priority,
						order,
						...dueDate !== void 0 ? { dueDate } : {},
						...blockedBy !== void 0 && blockedBy.length > 0 ? { blockedBy } : {}
					});
				}
				return tasks;
			} catch {
				return [];
			}
		}
		function persist(tasks) {
			const store = safeStorage();
			if (store === void 0) return;
			try {
				store.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
			} catch {}
		}
		function newId() {
			return `t${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
		}
		function addTask(tasks, title, options = {}) {
			const trimmed = title.trim();
			if (trimmed.length === 0) return tasks;
			const priority = options.priority ?? "medium";
			const dueDate = isValidIsoDate(options.dueDate) ? options.dueDate : void 0;
			const minOrder = tasks.reduce((acc, task) => Math.min(acc, task.order), 0);
			const updated = [{
				id: newId(),
				title: trimmed,
				done: false,
				createdAt: Date.now(),
				priority,
				order: minOrder - 1,
				...dueDate !== void 0 ? { dueDate } : {}
			}, ...tasks];
			persist(updated);
			return updated;
		}
		function toggleTask(tasks, id) {
			const updated = tasks.map((task) => task.id === id ? {
				...task,
				done: !task.done
			} : task);
			persist(updated);
			return updated;
		}
		function removeTask(tasks, id) {
			const updated = tasks.filter((task) => task.id !== id);
			persist(updated);
			return updated;
		}
		function setDueDate(tasks, id, dueDate) {
			const cleared = dueDate === void 0 || dueDate === "";
			const updated = tasks.map((task) => task.id === id ? cleared ? (() => {
				const { dueDate: _drop, ...rest } = task;
				return rest;
			})() : {
				...task,
				dueDate
			} : task);
			persist(updated);
			return updated;
		}
		function moveTask(tasks, id, direction) {
			const index = tasks.findIndex((task) => task.id === id);
			if (index === -1) return tasks;
			const target = index + direction;
			if (target < 0 || target >= tasks.length) return tasks;
			const next = tasks.slice();
			const swap = next[index];
			next[index] = next[target];
			next[target] = swap;
			return next.map((task, idx) => idx === index || idx === target ? {
				...task,
				order: tasks[idx].order
			} : task).map((task) => task).map((task, idx) => ({
				...task,
				order: idx
			}));
		}
		/** Filter the task list through a status selector and a search query. */
		function filterTasks(tasks, status, query, today = todayIso()) {
			const needle = query.trim().toLowerCase();
			const predicate = (task) => {
				if (status === "open" && task.done) return false;
				if (status === "done" && !task.done) return false;
				if (status === "overdue" && !isOverdue(task, today)) return false;
				if (needle.length > 0 && !task.title.toLowerCase().includes(needle)) return false;
				return true;
			};
			return tasks.filter(predicate);
		}
		/** Sort the task list: open tasks before done, higher priority first, then by order. */
		function sortTasks(tasks) {
			const priorityWeight = {
				high: 0,
				medium: 1,
				low: 2
			};
			return tasks.slice().sort((a, b) => {
				if (a.done !== b.done) return a.done ? 1 : -1;
				const pa = priorityWeight[a.priority];
				const pb = priorityWeight[b.priority];
				if (pa !== pb) return pa - pb;
				return a.order - b.order;
			});
		}
		/** Export the task list as a stable JSON string. */
		function exportJson(tasks) {
			return JSON.stringify(tasks, null, 2);
		}
		/**
		* Export the task list as a Markdown checklist. Open tasks render with
		* `- [ ]`, done tasks with `- [x]`. Each row carries a `<!-- id: ... -->`
		* comment so a future re-import can preserve identity.
		*/
		function exportMarkdown(tasks) {
			const lines = [];
			for (const task of tasks) {
				const box = task.done ? "[x]" : "[ ]";
				const due = task.dueDate === void 0 ? "" : ` (due ${task.dueDate})`;
				const priority = `[${task.priority}]`;
				lines.push(`- ${box} ${priority} ${task.title}${due} <!-- id: ${task.id} -->`);
			}
			return lines.join("\n");
		}
		//#endregion
		//#region src/modules/chat-recovery/client.ts
		function readChatRecoveryState() {
			return { status: "requires-host" };
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
			const [resetFlash, setResetFlash] = (0, react.useState)(false);
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
			const onReset = () => {
				if (typeof window !== "undefined") {
					if (!window.confirm(dict.pageHints.resetConfirm)) return;
				}
				scope.unset("enabled");
				setResetFlash(true);
				if (typeof window !== "undefined") window.setTimeout(() => setResetFlash(false), 1500);
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
			const headerRow = (0, react.createElement)("div", {
				key: "header",
				style: {
					display: "flex",
					gap: "8px",
					alignItems: "center",
					flexWrap: "wrap",
					padding: "4px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "settings-header"
			}, (0, react.createElement)("span", { style: {
				...noteStyle,
				flex: 1
			} }, dict.pageHints.toggleGuidance), resetFlash ? (0, react.createElement)("span", { style: {
				...noteStyle,
				color: "var(--dsw-alias-success, #0a7d2c)"
			} }, dict.pageHints.resetDone) : null, (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 10px",
					fontSize: "12px"
				},
				onClick: onReset,
				disabled: !writable,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "settings-reset"
			}, dict.pageHints.resetButton));
			const blockFor = (id, element) => enabled[id] ? element : null;
			return (0, react.createElement)("section", {
				"data-dsh-plugin": "ice-tools",
				style: sectionStyle
			}, headerRow, rows, blockFor("doctor", (0, react.createElement)(DoctorBlock, {
				key: "doctor",
				dict,
				ctx
			})), blockFor("sessionId", (0, react.createElement)(SessionIdBlock, {
				key: "session-id",
				dict,
				ctx
			})), blockFor("skillExplorer", (0, react.createElement)(SkillExplorerBlock, {
				key: "skill-explorer",
				dict
			})), blockFor("desktopLauncher", (0, react.createElement)(DesktopLauncherBlock, {
				key: "desktop-launcher",
				dict,
				ctx
			})), blockFor("pluginManager", (0, react.createElement)(PluginManagerBlock, {
				key: "plugin-manager",
				dict
			})), blockFor("gitGraph", (0, react.createElement)(GitGraphBlock, {
				key: "git-graph",
				dict
			})), blockFor("taskBoard", (0, react.createElement)(TaskBoardBlock, {
				key: "task-board",
				dict
			})), blockFor("chatRecovery", (0, react.createElement)(ChatRecoveryBlock, {
				key: "chat-recovery",
				dict
			})));
		}
		function DoctorBlock({ dict, ctx }) {
			const sdict = dict.doctor;
			const [doctorRun, setDoctorRun] = (0, react.useState)(void 0);
			const [doctorRunning, setDoctorRunning] = (0, react.useState)(false);
			const onRun = () => {
				if (ctx === void 0 || doctorRunning) return;
				setDoctorRunning(true);
				runDoctor(ctx).then((result) => {
					setDoctorRun(result);
					setDoctorRunning(false);
				});
			};
			return (0, react.createElement)("div", {
				key: "doctor",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "doctor"
			}, (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				alignItems: "center"
			} }, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: onRun,
				disabled: doctorRunning || ctx === void 0,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "doctor-run"
			}, doctorRunning ? sdict.running : sdict.runButton)), doctorRun === void 0 ? (0, react.createElement)("span", { style: noteStyle }, doctorRunning ? sdict.running : "") : (0, react.createElement)("div", {
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
			} }, (0, react.createElement)("span", { style: { fontSize: "13px" } }, sdict.checks[r.key].label), (0, react.createElement)("span", { style: noteStyle }, r.note)), (0, react.createElement)("span", { style: { fontSize: "12px" } }, r.pass ? sdict.pass : sdict.fail)))));
		}
		function SessionIdBlock({ dict, ctx }) {
			const sdict = dict.sessionId;
			const [sessions, setSessions] = (0, react.useState)([]);
			const [sessionsError, setSessionsError] = (0, react.useState)(void 0);
			const [sessionsRunning, setSessionsRunning] = (0, react.useState)(false);
			const [copyFlash, setCopyFlash] = (0, react.useState)(void 0);
			const [status, setStatus] = (0, react.useState)("all");
			const [newCwd, setNewCwd] = (0, react.useState)("");
			const [editingId, setEditingId] = (0, react.useState)(void 0);
			const [editingValue, setEditingValue] = (0, react.useState)("");
			const [feedback, setFeedback] = (0, react.useState)(void 0);
			const onRefresh = () => {
				if (ctx === void 0 || sessionsRunning) return;
				setSessionsRunning(true);
				listSessions(ctx).then((result) => {
					setSessions(result.sessions);
					setSessionsError(result.error);
					setSessionsRunning(false);
				});
			};
			const onCopy = (sessionId) => {
				copyToClipboard(sessionId).then((outcome) => {
					setCopyFlash(outcome.ok ? `copied:${sessionId}` : "failed");
					if (typeof window !== "undefined") window.setTimeout(() => setCopyFlash(void 0), 1500);
				});
			};
			const onCopyAll = () => {
				copyToClipboard(joinSessionIds(sessions)).then((outcome) => {
					setFeedback(outcome.ok ? sdict.copiedAll : sdict.copyFailed);
					if (typeof window !== "undefined") window.setTimeout(() => setFeedback(void 0), 1500);
				});
			};
			const onCreate = () => {
				if (ctx === void 0) return;
				createSession(ctx, newCwd).then((result) => {
					setFeedback(result.ok ? sdict.created : result.message);
					if (typeof window !== "undefined") window.setTimeout(() => setFeedback(void 0), 2e3);
					if (result.ok) {
						setNewCwd("");
						onRefresh();
					}
				});
			};
			const beginEdit = (entry) => {
				setEditingId(entry.sessionId);
				setEditingValue(entry.title ?? "");
			};
			const commitEdit = () => {
				if (ctx === void 0 || editingId === void 0) return;
				const sessionId = editingId;
				const title = editingValue;
				setEditingId(void 0);
				setEditingValue("");
				renameSession(ctx, sessionId, title).then((result) => {
					setFeedback(result.ok ? sdict.renamed : result.message);
					if (typeof window !== "undefined") window.setTimeout(() => setFeedback(void 0), 2e3);
					if (result.ok) onRefresh();
				});
			};
			const onCancel = (sessionId) => {
				if (ctx === void 0) return;
				cancelSession(ctx, sessionId).then((result) => {
					setFeedback(result.ok ? sdict.cancelled : result.message);
					if (typeof window !== "undefined") window.setTimeout(() => setFeedback(void 0), 2e3);
					if (result.ok) onRefresh();
				});
			};
			const visible = filterSessions(sessions, status);
			const list = sessionsError !== void 0 ? (0, react.createElement)("span", { style: noteStyle }, sessionsError) : sessions.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.empty) : visible.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.emptyFilter) : (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-list"
			}, visible.map((entry) => {
				const copied = copyFlash === `copied:${entry.sessionId}`;
				const editing = editingId === entry.sessionId;
				return (0, react.createElement)("div", {
					key: entry.sessionId,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "4px",
						padding: "6px 10px",
						borderRadius: "6px",
						background: "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))"
					},
					"data-dsh-session-id": entry.sessionId,
					"data-dsh-running": entry.running === true ? "true" : "false"
				}, (0, react.createElement)("div", { style: {
					display: "grid",
					gridTemplateColumns: "1fr auto auto auto",
					gap: "8px",
					alignItems: "center"
				} }, editing ? (0, react.createElement)("input", {
					type: "text",
					value: editingValue,
					style: {
						...inputStyle,
						fontFamily: "inherit"
					},
					onChange: (e) => setEditingValue(e.target.value),
					onBlur: () => commitEdit(),
					onKeyDown: (e) => {
						if (e.key === "Enter") commitEdit();
						if (e.key === "Escape") {
							setEditingId(void 0);
							setEditingValue("");
						}
					},
					autoFocus: true
				}) : (0, react.createElement)("code", {
					style: {
						fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)",
						fontSize: "12px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						cursor: "pointer"
					},
					onClick: () => beginEdit(entry),
					title: entry.sessionId
				}, entry.sessionId), (0, react.createElement)("span", { style: {
					fontSize: "11px",
					padding: "1px 6px",
					borderRadius: "4px",
					background: entry.running === true ? "var(--dsw-alias-success-bg, #d1f7e0)" : "var(--dsw-alias-bg-row, #eee)",
					color: entry.running === true ? "var(--dsw-alias-success, #0a7d2c)" : "var(--dsw-alias-label-secondary, #666)"
				} }, entry.running === true ? sdict.running : sdict.idle), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 8px",
						fontSize: "11px"
					},
					onClick: () => onCopy(entry.sessionId)
				}, copied ? sdict.copied : sdict.copy), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 8px",
						fontSize: "11px"
					},
					disabled: entry.running !== true,
					onClick: () => onCancel(entry.sessionId)
				}, sdict.cancel)), (0, react.createElement)("div", { style: {
					display: "flex",
					gap: "8px",
					alignItems: "center",
					fontSize: "11px",
					color: "var(--dsw-alias-label-secondary, #666)"
				} }, entry.title !== void 0 && entry.title.length > 0 ? (0, react.createElement)("span", {
					style: { cursor: "pointer" },
					onClick: () => beginEdit(entry)
				}, entry.title) : (0, react.createElement)("span", { style: { fontStyle: "italic" } }, sdict.untitled), entry.cwd !== void 0 ? (0, react.createElement)("span", { style: { fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)" } }, entry.cwd) : null));
			}), copyFlash === "failed" ? (0, react.createElement)("span", { style: {
				...noteStyle,
				color: "var(--dsw-alias-danger, #b42318)"
			} }, sdict.copyFailed) : null);
			return (0, react.createElement)("div", {
				key: "session-id",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-id"
			}, (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				alignItems: "center",
				flexWrap: "wrap"
			} }, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: onRefresh,
				disabled: sessionsRunning,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-refresh"
			}, sessionsRunning ? "…" : sdict.refresh), (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 8px"
				},
				onClick: onCopyAll,
				disabled: sessions.length === 0,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-copy-all"
			}, sdict.copyAll), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "4px"
			} }, [
				"all",
				"running",
				"idle"
			].map((option) => (0, react.createElement)("button", {
				key: option,
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "12px",
					background: status === option ? "var(--dsw-alias-bg-elevated, #ddd)" : void 0
				},
				onClick: () => setStatus(option),
				"data-dsh-filter": option
			}, sdict[`filter${option[0].toUpperCase()}${option.slice(1)}`])))), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px"
			} }, (0, react.createElement)("input", {
				type: "text",
				value: newCwd,
				placeholder: sdict.newCwdPlaceholder,
				style: {
					...inputStyle,
					flex: 1
				},
				onChange: (e) => setNewCwd(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter") onCreate();
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-cwd"
			}), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: onCreate,
				disabled: ctx === void 0,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "session-create"
			}, sdict.newSession)), feedback ? (0, react.createElement)("span", { style: {
				...noteStyle,
				color: "var(--dsw-alias-success, #0a7d2c)"
			} }, feedback) : null, list);
		}
		function SkillExplorerBlock({ dict }) {
			const sdict = dict.skillExplorer;
			return (0, react.createElement)("div", {
				key: "skill-explorer",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "skill-explorer"
			}, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), KNOWN_SKILLS.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.empty) : (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "skill-list"
			}, KNOWN_SKILLS.map((entry) => (0, react.createElement)("div", {
				key: entry.name,
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "2px",
					padding: "6px 10px",
					borderRadius: "8px",
					background: "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))"
				},
				"data-dsh-skill": entry.name
			}, (0, react.createElement)("span", { style: {
				fontSize: "13px",
				fontWeight: 500
			} }, entry.name), (0, react.createElement)("span", { style: noteStyle }, entry.description), (0, react.createElement)("span", { style: {
				...noteStyle,
				fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)"
			} }, `${sdict.location}: ${entry.location}`)))));
		}
		const inputStyle = {
			padding: "6px 10px",
			borderRadius: "8px",
			border: "1px solid var(--dsw-alias-border, #ccc)",
			background: "var(--dsw-alias-bg-input, #fff)",
			color: "inherit",
			fontSize: "13px"
		};
		function DesktopLauncherBlock({ dict, ctx }) {
			const sdict = dict.desktopLauncher;
			const [url, setUrl] = (0, react.useState)("");
			const [outcome, setOutcome] = (0, react.useState)("");
			const [history, setHistory] = (0, react.useState)(() => loadHistory());
			const [filter, setFilter] = (0, react.useState)("all");
			const onOpen = (raw = url) => {
				openOrCopyUrl(raw, copyToClipboard).then((result) => {
					if (result.ok) {
						setHistory(recordHistory(history, raw));
						setOutcome(sdict.hint);
					} else if (result.message === "unsupported scheme") setOutcome(sdict.unsupported);
					else setOutcome(result.message);
				});
			};
			const visible = filter === "all" ? history : history.filter((entry) => entry.scheme === filter);
			return (0, react.createElement)("div", {
				key: "desktop-launcher",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "desktop-launcher"
			}, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px"
			} }, (0, react.createElement)("input", {
				type: "text",
				value: url,
				placeholder: sdict.placeholder,
				style: {
					...inputStyle,
					flex: 1
				},
				onChange: (e) => setUrl(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter") onOpen();
				},
				"aria-label": sdict.title
			}), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: () => onOpen(),
				disabled: !isLaunchableUrl(url)
			}, sdict.open)), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				flexWrap: "wrap"
			} }, QUICK_PRESETS.map((preset) => (0, react.createElement)("button", {
				key: preset.id,
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 8px",
					fontSize: "12px"
				},
				onClick: () => setUrl(preset.placeholder),
				title: preset.placeholder,
				"data-dsh-preset": preset.id
			}, preset.label[activeLocale(ctx)] ?? preset.label.en))), history.length > 0 ? (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "launcher-history"
			}, (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "4px",
				flexWrap: "wrap"
			} }, [
				"all",
				"https",
				"http",
				"mailto"
			].map((option) => (0, react.createElement)("button", {
				key: option,
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "12px",
					background: filter === option ? "var(--dsw-alias-bg-elevated, #ddd)" : void 0
				},
				onClick: () => setFilter(option),
				"data-dsh-filter": option
			}, option))), visible.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.historyEmpty) : (0, react.createElement)("div", { style: {
				display: "flex",
				flexDirection: "column",
				gap: "2px"
			} }, visible.map((entry) => (0, react.createElement)("div", {
				key: entry.url,
				style: {
					display: "grid",
					gridTemplateColumns: "1fr auto auto",
					gap: "8px",
					alignItems: "center",
					padding: "4px 8px",
					borderRadius: "6px",
					background: "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))",
					fontSize: "12px"
				},
				"data-dsh-history-url": entry.url
			}, (0, react.createElement)("code", {
				style: {
					fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)",
					overflow: "hidden",
					textOverflow: "ellipsis"
				},
				onClick: () => setUrl(entry.url)
			}, entry.url), (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "12px"
				},
				onClick: () => onOpen(entry.url)
			}, sdict.open), (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "12px"
				},
				onClick: () => setHistory(removeHistory(history, entry.url)),
				"aria-label": sdict.remove
			}, "×"))))) : null, outcome ? (0, react.createElement)("span", { style: noteStyle }, outcome) : null);
		}
		function localeForPreset() {
			if (typeof navigator === "undefined") return "en";
			return (navigator.language?.toLowerCase() ?? "en").startsWith("zh") ? "zh" : "en";
		}
		function activeLocale(ctx) {
			if (ctx === void 0) return localeForPreset();
			const runtime = ctx.locale;
			if (runtime === void 0) return localeForPreset();
			try {
				return runtime.getSnapshot().active.toLowerCase().startsWith("zh") ? "zh" : "en";
			} catch {
				return localeForPreset();
			}
		}
		function PluginManagerBlock({ dict }) {
			const sdict = dict.pluginManager;
			const parsed = parseCordisPatch(CORDIS_PATCH_SOURCE);
			const [expanded, setExpanded] = (0, react.useState)({});
			const [copiedPath, setCopiedPath] = (0, react.useState)(false);
			const duplicateIds = new Set(parsed.duplicates.map((entry) => entry.id));
			const onCopyPath = () => {
				copyToClipboard(PATCH_PATH).then((outcome) => {
					setCopiedPath(outcome.ok);
					if (typeof window !== "undefined") window.setTimeout(() => setCopiedPath(false), 1500);
				});
			};
			return (0, react.createElement)("div", {
				key: "plugin-manager",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "plugin-manager"
			}, (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				alignItems: "center",
				flexWrap: "wrap"
			} }, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("span", {
				style: {
					...noteStyle,
					fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "plugin-source"
			}, PATCH_PATH), (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "11px"
				},
				onClick: onCopyPath,
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "plugin-copy-path"
			}, copiedPath ? sdict.copiedPath : sdict.copyPath)), parsed.duplicates.length > 0 ? (0, react.createElement)("div", {
				style: {
					...noteStyle,
					color: "var(--dsw-alias-danger, #b42318)"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "plugin-duplicates"
			}, `${sdict.duplicates}: ${parsed.duplicates.map((entry) => `${entry.id} (${entry.lines.join(", ")})`).join("; ")}`) : null, parsed.rows.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.empty) : (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "plugin-rows"
			}, parsed.rows.map((row, index) => {
				const isExpanded = expanded[`${row.id}-${index}`] === true;
				const isDuplicate = duplicateIds.has(row.id);
				return (0, react.createElement)("div", {
					key: `${row.id}-${index}`,
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "4px",
						padding: "6px 10px",
						borderRadius: "6px",
						background: isDuplicate ? "rgba(180, 35, 24, 0.08)" : "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))"
					},
					"data-dsh-row-id": row.id,
					"data-dsh-row-line": row.line,
					"data-dsh-row-duplicate": isDuplicate ? "true" : "false"
				}, (0, react.createElement)("div", { style: {
					display: "grid",
					gridTemplateColumns: "1fr auto auto",
					gap: "8px",
					alignItems: "center"
				} }, (0, react.createElement)("span", {
					style: {
						fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)",
						fontSize: "12px",
						cursor: "pointer"
					},
					onClick: () => setExpanded((current) => ({
						...current,
						[`${row.id}-${index}`]: !isExpanded
					}))
				}, row.id), (0, react.createElement)("span", { style: {
					...noteStyle,
					fontSize: "11px"
				} }, `L${row.line}`), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 8px",
						fontSize: "11px"
					},
					onClick: () => setExpanded((current) => ({
						...current,
						[`${row.id}-${index}`]: !isExpanded
					})),
					"aria-label": isExpanded ? sdict.collapse : sdict.expand
				}, isExpanded ? "−" : "+")), row.name !== void 0 ? (0, react.createElement)("span", { style: {
					fontSize: "11px",
					color: "var(--dsw-alias-label-secondary, #666)"
				} }, row.name) : null, isExpanded ? (0, react.createElement)("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "2px",
						marginTop: "4px"
					},
					"data-dsh-plugin": "ice-tools",
					"data-dsh-part": "plugin-row-config"
				}, Object.keys(row.config).length === 0 ? (0, react.createElement)("span", { style: {
					...noteStyle,
					fontStyle: "italic"
				} }, sdict.noConfig) : Object.entries(row.config).map(([key, value]) => (0, react.createElement)("div", {
					key,
					style: {
						display: "grid",
						gridTemplateColumns: "120px 1fr",
						gap: "8px",
						fontSize: "11px",
						fontFamily: "var(--dsw-alias-font-mono, ui-monospace, monospace)"
					}
				}, (0, react.createElement)("span", { style: { color: "var(--dsw-alias-label-secondary, #666)" } }, key), (0, react.createElement)("span", null, value)))) : null);
			})));
		}
		function GitGraphBlock({ dict }) {
			const sdict = dict.gitGraph;
			const state = readGitGraphState();
			return (0, react.createElement)("div", {
				key: "git-graph",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "git-graph"
			}, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("span", { style: noteStyle }, state.status === "requires-host" ? sdict.note : ""));
		}
		function TaskBoardBlock({ dict }) {
			const sdict = dict.taskBoard;
			const [tasks, setTasks] = (0, react.useState)(() => loadTasks());
			const [draft, setDraft] = (0, react.useState)("");
			const [priority, setPriority] = (0, react.useState)("medium");
			const [status, setStatus] = (0, react.useState)("all");
			const [query, setQuery] = (0, react.useState)("");
			const onAdd = () => {
				setTasks(addTask(tasks, draft, { priority }));
				setDraft("");
			};
			const onTemplate = (template) => {
				const options = template.dueOffsetDays === void 0 ? { priority: template.priority } : {
					priority: template.priority,
					dueDate: isoOffsetDays(template.dueOffsetDays)
				};
				setTasks(addTask(tasks, template.title, options));
			};
			const filtered = sortTasks(filterTasks(tasks, status, query));
			return (0, react.createElement)("div", {
				key: "task-board",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "task-board"
			}, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px"
			} }, (0, react.createElement)("input", {
				type: "text",
				value: draft,
				placeholder: sdict.placeholder,
				style: {
					...inputStyle,
					flex: 1
				},
				onChange: (e) => setDraft(e.target.value),
				onKeyDown: (e) => {
					if (e.key === "Enter") onAdd();
				}
			}), (0, react.createElement)("select", {
				value: priority,
				style: inputStyle,
				onChange: (e) => setPriority(e.target.value),
				"aria-label": sdict.priority
			}, (0, react.createElement)("option", { value: "high" }, sdict.priorityHigh), (0, react.createElement)("option", { value: "medium" }, sdict.priorityMedium), (0, react.createElement)("option", { value: "low" }, sdict.priorityLow)), (0, react.createElement)("button", {
				type: "button",
				style: buttonStyle,
				onClick: onAdd,
				disabled: draft.trim().length === 0
			}, sdict.add)), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				flexWrap: "wrap"
			} }, TASK_TEMPLATES.map((template) => (0, react.createElement)("button", {
				key: template.id,
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 8px",
					fontSize: "12px"
				},
				onClick: () => onTemplate(template),
				"data-dsh-template": template.id
			}, template.title))), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px",
				flexWrap: "wrap"
			} }, (0, react.createElement)("input", {
				type: "text",
				value: query,
				placeholder: sdict.search,
				style: {
					...inputStyle,
					flex: 1,
					minWidth: "120px"
				},
				onChange: (e) => setQuery(e.target.value),
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "task-search"
			}), [
				"all",
				"open",
				"done",
				"overdue"
			].map((option) => (0, react.createElement)("button", {
				key: option,
				type: "button",
				style: {
					...buttonStyle,
					padding: "2px 8px",
					fontSize: "12px",
					background: status === option ? "var(--dsw-alias-bg-elevated, #ddd)" : void 0
				},
				onClick: () => setStatus(option),
				"data-dsh-filter": option
			}, sdict[`filter${option[0].toUpperCase()}${option.slice(1)}`]))), (0, react.createElement)("div", { style: {
				display: "flex",
				gap: "8px"
			} }, (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 8px",
					fontSize: "12px"
				},
				onClick: () => downloadExport(tasks, "json")
			}, sdict.exportJson), (0, react.createElement)("button", {
				type: "button",
				style: {
					...buttonStyle,
					padding: "4px 8px",
					fontSize: "12px"
				},
				onClick: () => downloadExport(tasks, "markdown")
			}, sdict.exportMarkdown)), filtered.length === 0 ? (0, react.createElement)("span", { style: noteStyle }, sdict.empty) : (0, react.createElement)("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "4px"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "task-list"
			}, filtered.map((task, idx) => {
				const overdueFlag = isOverdue(task);
				const blockedFlag = isBlocked(task, tasks);
				return (0, react.createElement)("div", {
					key: task.id,
					style: {
						display: "grid",
						gridTemplateColumns: "auto auto 1fr auto auto auto auto auto",
						gap: "8px",
						alignItems: "center",
						padding: "4px 8px",
						borderRadius: "6px",
						background: overdueFlag ? "rgba(180, 35, 24, 0.08)" : "var(--dsw-alias-bg-row, rgba(127,127,127,0.05))"
					},
					"data-dsh-task": task.id,
					"data-dsh-priority": task.priority,
					"data-dsh-overdue": overdueFlag ? "true" : "false",
					"data-dsh-blocked": blockedFlag ? "true" : "false"
				}, (0, react.createElement)("input", {
					type: "checkbox",
					checked: task.done,
					disabled: blockedFlag && !task.done,
					onChange: () => setTasks(toggleTask(tasks, task.id))
				}), (0, react.createElement)("span", { style: {
					fontSize: "11px",
					fontWeight: 600,
					padding: "2px 6px",
					borderRadius: "4px",
					color: "#fff",
					background: priorityColor(task.priority)
				} }, sdict[`priority${task.priority[0].toUpperCase()}${task.priority.slice(1)}`]), (0, react.createElement)("span", { style: {
					fontSize: "13px",
					textDecoration: task.done ? "line-through" : "none",
					color: overdueFlag ? "var(--dsw-alias-danger, #b42318)" : task.done ? "var(--dsw-alias-label-secondary, #666)" : "inherit"
				} }, task.title), (0, react.createElement)("input", {
					type: "date",
					value: task.dueDate ?? "",
					style: {
						...inputStyle,
						padding: "2px 6px",
						fontSize: "12px"
					},
					onChange: (e) => {
						const value = e.target.value;
						setTasks(setDueDate(tasks, task.id, value === "" ? void 0 : value));
					}
				}), (0, react.createElement)("span", { style: {
					fontSize: "11px",
					color: "var(--dsw-alias-label-secondary, #666)"
				} }, overdueFlag ? sdict.overdue : blockedFlag ? sdict.blocked : ""), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 4px",
						fontSize: "11px"
					},
					disabled: idx === 0,
					onClick: () => setTasks(moveTask(tasks, task.id, -1)),
					"aria-label": sdict.moveUp
				}, "↑"), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 4px",
						fontSize: "11px"
					},
					disabled: idx === filtered.length - 1,
					onClick: () => setTasks(moveTask(tasks, task.id, 1)),
					"aria-label": sdict.moveDown
				}, "↓"), (0, react.createElement)("button", {
					type: "button",
					style: {
						...buttonStyle,
						padding: "2px 6px",
						fontSize: "12px"
					},
					onClick: () => setTasks(removeTask(tasks, task.id))
				}, sdict.remove));
			})));
		}
		function priorityColor(priority) {
			if (priority === "high") return "#b42318";
			if (priority === "medium") return "#a86b00";
			return "#5a6b73";
		}
		function downloadExport(tasks, format) {
			if (typeof window === "undefined") return;
			const content = format === "json" ? exportJson(tasks) : exportMarkdown(tasks);
			const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `dsh-ice-tools-tasks.${format}`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		}
		function ChatRecoveryBlock({ dict }) {
			const sdict = dict.chatRecovery;
			const state = readChatRecoveryState();
			return (0, react.createElement)("div", {
				key: "chat-recovery",
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "8px 0"
				},
				"data-dsh-plugin": "ice-tools",
				"data-dsh-part": "chat-recovery"
			}, (0, react.createElement)("span", { style: { fontWeight: 600 } }, sdict.title), (0, react.createElement)("span", { style: noteStyle }, state.status === "requires-host" ? sdict.note : ""));
		}
		const PATCH_PATH = "~/.dsh/profiles/web/cordis.patch.yml";
		const CORDIS_PATCH_SOURCE = `- insert:
    - id: tool-subagent-codex
      name: '@deepseek-ai/dsh-tool-subagent'
      config:
        provider: codex
        toolName: subagent_codex
        backgroundMode: one-shot
        maxDepth: provider-managed`;
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
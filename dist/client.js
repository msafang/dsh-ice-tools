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
//#endregion
//#region src/modules/chat-recovery/client.ts
const mount$9 = () => {};
//#endregion
//#region src/modules/desktop-launcher/client.ts
const mount$8 = () => {};
//#endregion
//#region src/modules/doctor/client.ts
const mount$7 = () => {};
//#endregion
//#region src/modules/git-graph/client.ts
const mount$6 = () => {};
//#endregion
//#region src/modules/plugin-manager/client.ts
const mount$5 = () => {};
//#endregion
//#region src/modules/session-id/client.ts
const mount$4 = () => {};
//#endregion
//#region src/modules/skill-explorer/client.ts
const mount$3 = () => {};
//#endregion
//#region src/modules/task-board/client.ts
const mount$2 = () => {};
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
/** Browser mount shim; DSH can render the returned element or register it in the settings slot. */
function mount$1(ctx) {
	const service = ctx.services?.iceToolsDispatch;
	const card = renderSettingsCard({
		enabled: service?.readEnabled?.(),
		onToggle: (name, enabled) => service?.setEnabled?.(name, enabled)
	});
	ctx.slots?.settings?.register?.(card);
	return card;
}
//#endregion
//#region src/client/index.ts
const CLIENT_MOUNTS = {
	settingsHub: mount$1,
	pluginManager: mount$5,
	chatRecovery: mount$9,
	desktopLauncher: mount$8,
	doctor: mount$7,
	sessionId: mount$4,
	skillExplorer: mount$3,
	gitGraph: mount$6,
	taskBoard: mount$2
};
function mount(ctx, input) {
	const serviceEnabled = ctx.services?.iceToolsDispatch?.readEnabled?.();
	const enabled = {
		...DEFAULT_ENABLED,
		...serviceEnabled,
		...input
	};
	const mounted = [];
	const skipped = [];
	const settingsCard = CLIENT_MOUNTS.settingsHub(ctx);
	mounted.push("settingsHub");
	for (const name of OPTIONAL_MODULE_NAMES) if (enabled[name] === true) {
		CLIENT_MOUNTS[name](ctx);
		mounted.push(name);
	} else skipped.push(name);
	return {
		mounted,
		skipped,
		settingsCard
	};
}
//#endregion
export { enableSettingsCard, mount, renderSettingsCard };

//# sourceMappingURL=client.js.map
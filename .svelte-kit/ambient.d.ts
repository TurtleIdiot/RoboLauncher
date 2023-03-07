
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const COLORTERM: string;
	export const XDG_CONFIG_DIRS: string;
	export const XDG_SESSION_PATH: string;
	export const XDG_MENU_PREFIX: string;
	export const TERM_PROGRAM_VERSION: string;
	export const NODE: string;
	export const npm_package_devDependencies_autoprefixer: string;
	export const LC_ADDRESS: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const LC_NAME: string;
	export const SSH_AUTH_SOCK: string;
	export const npm_package_private: string;
	export const npm_package_dependencies_daisyui: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const SSH_AGENT_PID: string;
	export const GTK_RC_FILES: string;
	export const NO_AT_BRIDGE: string;
	export const GDK_CORE_DEVICE_EVENTS: string;
	export const XCURSOR_SIZE: string;
	export const EDITOR: string;
	export const MACOSX_DEPLOYMENT_TARGET: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const npm_package_devDependencies_vite: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const npm_package_dependencies__tauri_apps_api: string;
	export const TAURI_PLATFORM: string;
	export const PNPM_HOME: string;
	export const SYSTEMD_EXEC_PID: string;
	export const npm_package_scripts_build: string;
	export const _: string;
	export const OMF_PATH: string;
	export const XAUTHORITY: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const VSCODE_INJECTION: string;
	export const GTK2_RC_FILES: string;
	export const HOME: string;
	export const SSH_ASKPASS: string;
	export const LANG: string;
	export const LC_PAPER: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_version: string;
	export const TAURI_PLATFORM_VERSION: string;
	export const GIT_ASKPASS: string;
	export const XDG_SEAT_PATH: string;
	export const TAURI_TARGET_TRIPLE: string;
	export const INVOCATION_ID: string;
	export const npm_package_devDependencies__tauri_apps_cli: string;
	export const MANAGERPID: string;
	export const TAURI_ARCH: string;
	export const INIT_CWD: string;
	export const npm_package_dependencies_zod: string;
	export const CHROME_DESKTOP: string;
	export const KDE_SESSION_UID: string;
	export const npm_package_scripts_preview: string;
	export const npm_lifecycle_script: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const XDG_SESSION_CLASS: string;
	export const LC_IDENTIFICATION: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const npm_package_type: string;
	export const USER: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const KDE_SESSION_VERSION: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const LC_TELEPHONE: string;
	export const LC_MEASUREMENT: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies__sveltejs_adapter_auto: string;
	export const npm_package_devDependencies_svelte: string;
	export const XDG_RUNTIME_DIR: string;
	export const TAURI_FAMILY: string;
	export const LC_TIME: string;
	export const npm_package_scripts_dev: string;
	export const npm_package_dependencies__tailwindcss_typography: string;
	export const TAURI_DEBUG: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const JOURNAL_STREAM: string;
	export const XCURSOR_THEME: string;
	export const GTK3_MODULES: string;
	export const XDG_DATA_DIRS: string;
	export const GDK_BACKEND: string;
	export const KDE_FULL_SESSION: string;
	export const PATH: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const ORIGINAL_XDG_CURRENT_DESKTOP: string;
	export const TAURI_PLATFORM_TYPE: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const npm_config_registry: string;
	export const OMF_CONFIG: string;
	export const npm_package_devDependencies_postcss: string;
	export const npm_node_execpath: string;
	export const npm_package_scripts_tauri: string;
	export const LC_NUMERIC: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		npm_command: string;
		SESSION_MANAGER: string;
		COLORTERM: string;
		XDG_CONFIG_DIRS: string;
		XDG_SESSION_PATH: string;
		XDG_MENU_PREFIX: string;
		TERM_PROGRAM_VERSION: string;
		NODE: string;
		npm_package_devDependencies_autoprefixer: string;
		LC_ADDRESS: string;
		npm_package_devDependencies_tailwindcss: string;
		LC_NAME: string;
		SSH_AUTH_SOCK: string;
		npm_package_private: string;
		npm_package_dependencies_daisyui: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		SSH_AGENT_PID: string;
		GTK_RC_FILES: string;
		NO_AT_BRIDGE: string;
		GDK_CORE_DEVICE_EVENTS: string;
		XCURSOR_SIZE: string;
		EDITOR: string;
		MACOSX_DEPLOYMENT_TARGET: string;
		XDG_SEAT: string;
		PWD: string;
		npm_package_devDependencies_vite: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		npm_package_dependencies__tauri_apps_api: string;
		TAURI_PLATFORM: string;
		PNPM_HOME: string;
		SYSTEMD_EXEC_PID: string;
		npm_package_scripts_build: string;
		_: string;
		OMF_PATH: string;
		XAUTHORITY: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		VSCODE_INJECTION: string;
		GTK2_RC_FILES: string;
		HOME: string;
		SSH_ASKPASS: string;
		LANG: string;
		LC_PAPER: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_version: string;
		TAURI_PLATFORM_VERSION: string;
		GIT_ASKPASS: string;
		XDG_SEAT_PATH: string;
		TAURI_TARGET_TRIPLE: string;
		INVOCATION_ID: string;
		npm_package_devDependencies__tauri_apps_cli: string;
		MANAGERPID: string;
		TAURI_ARCH: string;
		INIT_CWD: string;
		npm_package_dependencies_zod: string;
		CHROME_DESKTOP: string;
		KDE_SESSION_UID: string;
		npm_package_scripts_preview: string;
		npm_lifecycle_script: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		XDG_SESSION_CLASS: string;
		LC_IDENTIFICATION: string;
		TERM: string;
		npm_package_name: string;
		npm_package_type: string;
		USER: string;
		VSCODE_GIT_IPC_HANDLE: string;
		KDE_SESSION_VERSION: string;
		PAM_KWALLET5_LOGIN: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		LC_TELEPHONE: string;
		LC_MEASUREMENT: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		PNPM_SCRIPT_SRC_DIR: string;
		npm_execpath: string;
		npm_package_devDependencies__sveltejs_adapter_auto: string;
		npm_package_devDependencies_svelte: string;
		XDG_RUNTIME_DIR: string;
		TAURI_FAMILY: string;
		LC_TIME: string;
		npm_package_scripts_dev: string;
		npm_package_dependencies__tailwindcss_typography: string;
		TAURI_DEBUG: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		JOURNAL_STREAM: string;
		XCURSOR_THEME: string;
		GTK3_MODULES: string;
		XDG_DATA_DIRS: string;
		GDK_BACKEND: string;
		KDE_FULL_SESSION: string;
		PATH: string;
		npm_package_devDependencies__sveltejs_kit: string;
		ORIGINAL_XDG_CURRENT_DESKTOP: string;
		TAURI_PLATFORM_TYPE: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		npm_config_registry: string;
		OMF_CONFIG: string;
		npm_package_devDependencies_postcss: string;
		npm_node_execpath: string;
		npm_package_scripts_tauri: string;
		LC_NUMERIC: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: string]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}

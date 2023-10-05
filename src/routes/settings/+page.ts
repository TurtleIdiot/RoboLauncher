import type { ICustomEnv } from "$lib/config";

import { get } from "svelte/store";
import { getConfig } from "$lib/config";
import { installDir } from "$lib/stores";
import { invoke } from "@tauri-apps/api/tauri";

export async function load() {
    let config = getConfig();
	let directory = get(installDir);
	let wineversion: string

	try {
		if (await invoke("check_cmd_exists", { command: "wine", args: [ "--help" ] })) {
			wineversion = await invoke("start_cmd", { runtime: "wine", env: {}, args: [ "--version" ], wait: true })
		} else {
			wineversion = "Not found"
		}
	} catch (err) {
		console.warn(err)
		wineversion = "Error checking version"
	}

	return { config, directory, wineversion: wineversion.trim() }
}

export const prerender = true;
export const ssr = false;
export const csr = true;
import { get } from "svelte/store";
import { configSchema, type IConfig } from "$lib/config";
import { installDir, settings } from "$lib/stores";
import { invoke } from "@tauri-apps/api/tauri";

export async function load() {
	//@ts-ignore
    let config: IConfig = get(settings)
	//@ts-ignore
	config = configSchema.parse(config)
	let directory = get(installDir);
	let wineversion: string
	console.log(config)

	try {
		if (await invoke("check_cmd_exists", { command: "wine", args: [ "--help" ] })) {
			wineversion = await invoke("start_cmd", { command: "wine", env: {}, args: [ "--version" ], wait: true })
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
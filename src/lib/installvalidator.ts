import { z } from "zod";
import { installDir } from "./stores";
import { get } from "svelte/store";
import { invoke } from "@tauri-apps/api/tauri";

const gameConfigSchema = z.object({
	gameVersion: z.string().regex(/(\d+\.?){3}/g),
	verified: z.boolean()
})

export interface IValidationResult {
	installDir: boolean,
	game: boolean,
	gameVerify: boolean,
	gameVersion: string | null,
	prefix: boolean,
	runtime: boolean
}

async function bluk_exists(paths: { path: string, directory: boolean }[]) { // returns bool, paths: [ { path: String, directory: true } ]
    for (let entry of paths) {
        let exists: [ boolean, boolean ] = await invoke("path_exists", { path: entry.path })
        if (!exists[0]) return false
        if (exists[1] != entry.directory) return false
    }
    return true
}

async function checkInstallDir(): Promise<[boolean, string | null]> {
	if (get(installDir) == "") {
		return [false, "No install path defined"]
	}
	let dirExists: [ boolean, boolean ] = await invoke("path_exists", { path: get(installDir) })
	if (!dirExists[0]) {
		return [false, "Unable to access install path"]
	}
	if (!dirExists[1]) {
		return [false, "Install path is not a directory"]
	}
	return [true, null]
}

export async function validateInstall(): Promise<[IValidationResult, string | null]> {
	let result: IValidationResult = {
		installDir: false,
		game: false,
		gameVerify: false,
		gameVersion: null,
		prefix: false,
		runtime: false
	}
	let errmessage = null

	// validate dir
	let [dirValid, dirError] = await checkInstallDir()
	result.installDir = dirValid
	if (!dirValid) {
		errmessage = dirError
		return [ result, dirError ]
	}

	let installDirValue = get(installDir)
	// validate game config
	let rawgameconfig: [string, boolean] = await invoke("read_file", { path: `${installDirValue}/gameconfig.json` })
	if (rawgameconfig[1]) {
		let gameconfig = JSON.parse(rawgameconfig[0])
		if (gameConfigSchema.safeParse(gameconfig).success) {
			result.gameVersion = gameconfig.gameVersion
			let gamefolderexists: [ boolean, boolean ] = await invoke("path_exists", { path: `${installDirValue}/game` })

			if (gamefolderexists[0] && gamefolderexists[1]) {
				result.game = true
				result.gameVerify = gameconfig.verified
			} else {
				errmessage = "Game folder inaccessible. Check permissions and/or reinstall"
			}
		} else {
			errmessage = "Malformed game config. Try reinstalling"
		}
	} else {
		errmessage = "Error reading game config. Check permissions and/or reinstall"
	}

	// validate prefix and runtime
	let prefixexists: [ boolean, boolean ] = await invoke("path_exists", { path: `${installDirValue}/prefix` })
	if (prefixexists[0]) {
		if (prefixexists[1]) {
			result.prefix = true
		} else {
			errmessage = "Wine prefix is not a folder. Repair the prefix"
		}
	} else {
		errmessage = "Prefix inaccessible, try repairing"
	}

	let runtimesvalid = await bluk_exists([
        { path: `${installDirValue}/runtimes`, directory: true },
        { path: `${installDirValue}/runtimes/proton`, directory: true },
        //{ path: `${installDirValue}/runtimes/dxvk`, directory: true },
        { path: `${installDirValue}/runtimes/eac_runtime`, directory: true },
    ])
    if (runtimesvalid) {
        result.runtime = true
    } else {
        errmessage = "Runtimes not found or inaccessible. Check permissions and/or reinstall runtimes"
    }


	return [ result, errmessage ]
}

export async function getLatestVersion(): Promise<string> {
    let res: string = await invoke("make_cors_request", { url: "https://patcher-production.robocraft.org/Builds/builds_index.json" })
    if (!res) throw new Error("Buildindex response is empty")
	
    let buildindex: object = JSON.parse(res)
	let parsedindex = z.object({
		AvailableBuilds: z.string().regex(/(\d+\.?){3}/g).array()
	}).parse(buildindex)
    var latest: string = parsedindex.AvailableBuilds[parsedindex.AvailableBuilds.length - 1]

    return latest
}
import { invoke } from "@tauri-apps/api/tauri";
import { z } from "zod";

async function bluk_exists(paths) { // returns bool, paths: [ { path: String, directory: true } ]
    for (let entry of paths) {
        let exists = await invoke("path_exists", { path: entry.path })
        if (!exists[0]) return false
        if (exists[1] != entry.directory) return false
    }
    return true
}

//maks JSON.parse awaitable
function JSONparse(data) {
    return new Promise((resolve, reject) => {
        try {
            let res = JSON.parse(data)
            resolve(res)
        } catch(err) {
            reject(err)
        }
    })
}

/*
Return schema:
{
    buttonText: "",
    errorMsg: "" | null,
    vaild: {
        installDir: false
    }
}
*/
export async function checkInstall(installDir) {
    let response = {
        buttonText: "Play",
        buttonEnabled: true,
        errorMsg: null,
        valid: {
            prefix: false,
            gameInstall: false,
            gameVerification: false,
            runtime: false,
        },
        gameVersion: null
    }
    
    let confdata = await invoke("read_file", { path: `${installDir}/gameconfig.json` })
    let config = null;

    if (!confdata[1]) {
        response.errorMsg = "Error reading config. Ensure correct permissions are set and/or reinstall the game"
        response.buttonText = "Install"
    } else {
        config = await JSONparse(confdata[0])
            .catch(console.log)
        if (!config) {
            response.errorMsg = "Malformed config. Please try reinstalling the game"
            response.buttonText = "Install"
        } else if (z.object({ gameVersion: z.string().regex(/(\d+\.?){3}/g), verified: z.boolean() }).safeParse(config).success == false) {
            response.errorMsg = "Malformed config. Please try reinstalling the game"
            response.buttonText = "Install"
        } else {
            let gamefolderexists = await invoke("path_exists", { path: `${installDir}/game` })
            if (gamefolderexists[0] && gamefolderexists[1]) {
                response.valid.gameInstall = true
                response.gameVersion = config.gameVersion
                if (config.verified) {
                    response.valid.gameVerification = true
                } else {
                    response.buttonText = "Verify"
                }
            } else {
                response.errorMsg = "Game folder inaccessible or is not a folder. Check permissions or reinstall game"
                response.buttonText = "Install"
            }
        }
    }

    let prefixvalid = await bluk_exists([
        { path: `${installDir}/prefix`, directory: true }/*,
        { path: `${installDir}/prefix/dosdevices`, directory: true },
        { path: `${installDir}/prefix/drive_c`, directory: true },
        { path: `${installDir}/prefix/system.reg` },
        { path: `${installDir}/prefix/user.reg` },
        { path: `${installDir}/prefix/userdef.reg` },*/
    ])
    if (prefixvalid) {
        response.valid.prefix = true
    } else {
        response.buttonText = "Repair"
        response.errorMsg = "Wine prefix does not exist, is inaccessebile, or is not a valid prefix. Check permissions and/or recreate wine prefix"
    }

    let runtimesvalid = await bluk_exists([
        { path: `${installDir}/runtimes`, directory: true },
        { path: `${installDir}/runtimes/proton`, directory: true },
        { path: `${installDir}/runtimes/dxvk`, directory: true },
        { path: `${installDir}/runtimes/eac_runtime`, directory: true },
    ])
    if (runtimesvalid) {
        response.valid.runtime = true
    } else {
        response.buttonText = "Install"
        response.errorMsg = "Runtimes not found or inaccessible. Check permissions or reinstall runtimes"
    }
    return response
}

export async function checkInstallDir(installDir) {
    if (!installDir) {
        // @ts-ignore
        return [false, null]
    }
    let dirExists = await invoke("path_exists", { path: installDir })
    if (!dirExists[0]) {
        // @ts-ignore
        return [false, "Unable to access install directory. Ensure it exists and correct permissions are set"]
    }
    if (!dirExists[1]) {
        // @ts-ignore
        return [false, "Current install directory is not a folder. Select a valid folder"]
    }
    // @ts-ignore
    return [true, null]
}

export async function getLatestVersion() {
    let res = await invoke("make_cors_request", { url: "https://patcher-production.robocraft.org/Builds/builds_index.json" })
    if (!res) throw new Error("Buildindex response is empty")
    let buildindex = JSON.parse(res)
    if (z.object({ AvailableBuilds: z.array(z.string().regex(/(\d+\.?){3}/g)) }).safeParse(buildindex).success == false) throw new Error(`Buildindex malformed\n${buildindex}`)
    var latest = buildindex.AvailableBuilds[buildindex.AvailableBuilds.length - 1]

    return latest
}
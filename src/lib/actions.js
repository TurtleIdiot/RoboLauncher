import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { z } from "zod";

const repos = {
    dxvk: "doitsujin/dxvk",
    proton: "GloriousEggroll/wine-ge-custom",
    eac_runtime: "lutris/buildbot"
}
const regex = {
    dxvk: /^dxvk.+tar\.[xg]z$/g,
    proton: /^.*lutris-GE-Proton.+tar\.[xg]z$/g,
    eac_runtime: /eac_runtime\.tar\.[xg]z/g
}
const builds_baseurl = "https://patcher-production.robocraft.org/Builds"

function pause(installDir, args) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, args.ms);
    })
}

function createFolder(installDir, args) {
    return new Promise(async (resolve, reject) => {
        if (args.tryDelete) await invoke("remove_dir", { path: `${installDir}/${args.path}` })
        let res = await invoke("create_dir", { path: `${installDir}/${args.path}` })
        if (!res) reject(`Error creating folder $installDir/${args.path}`)
        resolve()
    })
}

function extract(installDir, args) {
    return new Promise((resolve, reject) => {
        if (args.source.endsWith(".tar.xz")) {
            invoke("unpack_xz", { srcpath: `${installDir}/${args.source}`, destpath: `${installDir}/${args.dest}` })
                .then(resolve)
                .catch(reject)
        } else if (args.source.endsWith(".tar.gz")) {
            invoke("unpack_gz", { srcpath: `${installDir}/${args.source}`, destpath: `${installDir}/${args.dest}` })
                .then(resolve)
                .catch(reject)
        } else if (!args.source.endsWith(".tar.xz") && !args.source.endsWith(".tar.gz")) {
            reject("Invalid tarball format")
        }
    })
}

function downloadFile(installDir, args) {
    return new Promise((resolve, reject) => {
        if (args.filesize){
            invoke("download_file", { window: args.window, url: args.url, path: `${installDir}/${args.path}`, filesize: args.filesize})
                .then(resolve)
                .catch(reject)
        } else {
            invoke("download_file", { window: args.window, url: args.url, path: `${installDir}/${args.path}`})
                .then(resolve)
                .catch(reject)
        }
    })
}

function runCmd(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("start_cmd", { runtime: `${installDir}/${args.runtime}`, args: args.args, env: args.env, wait: args.wait })
            .then(resolve)
            .catch(reject)
    })
}

function deleteFile(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("remove_file", { path: `${installDir}/${args.path}` })
            .then((res) => {
                if (res || !args.throw) {
                    resolve()
                } else {
                    reject(`Error deleting file $installDir/${args.path}`)
                }
            })
    })
}

function copy(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("copy", { src: `${installDir}/${args.source}`, dest: `${installDir}/${args.dest}` })
            .then((res) => {
                if (res) {
                    resolve()
                } else {
                    reject(`Error copying $installDir/${args.source} -> $installDir/${args.dest}`)
                }
            })
    })
}

function rename(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("rename", { src: `${installDir}/${args.source}`, dest: `${installDir}/${args.dest}` })
            .then((res) => {
                if (res) {
                    resolve()
                } else {
                    reject(`Error renaming $installDir/${args.source} -> $installDir/${args.dest}`)
                }
            })
    })
}

function createFile(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("create_file", { path: `${installDir}/${args.path}`, data: args.data })
            .then((res) => {
                if (res) {
                    resolve()
                } else {
                    reject(`Error creating file $installDir/${args.path}`)
                }
            })
    })
}

async function writeFile(installDir, args) {
    let res = await invoke("write_file", { path: `${installDir}/${args.path}`, data: args.data })
    if (!res) throw new Error(`Error creating file $installDir/${args.path}`)
    return true
}

function verifyFile(installDir, args) {
    return new Promise((resolve, reject) => {
        invoke("sha1filehash", { path: `${installDir}/${args.path}`})
            .then((hash) => {
                if (hash.startsWith(args.expectedHash)) {
                    resolve(true)
                } else {
                    console.log(hash)
                    resolve(false)
                }
        })
        .catch(reject)
    })
}

/* Response schema
[ isInstall: bool, [{
    action: function,
    args: {},
    desc: string
    awaitProgress: bool,
    isHashAction: bool
}, ...]]
*/
export async function createActionSet(installDir, validity, latestversion) {
    let actionset = []

    if (validity.gameInstall && validity.gameVerification && validity.runtime && validity.prefix) {
        let env = {
            "WINEPREFIX": `${installDir}/prefix`,
            "PROTON_USE_WINED3D": "0",
            "PROTON_ENABLE_NVAPI": "1",
            "PROTON_EAC_RUNTIME": `${installDir}/runtimes/eac_runtime/v2/`,
        }
        let runprefs = localStorage.getItem("prefs")
        if (runprefs !== null) {
            let prefs = JSON.parse(runprefs)
            if (prefs.MANGOHUD) env["MANGOHUD"] = "1"
            if (!prefs.ESYNC) env["PROTON_NO_ESYNC"] = "1"
            if (!prefs.FSYNC) env["PROTON_NO_FSYNC"] = "1"
            if (prefs.FSR) {
                env["WINE_FULLSCREEN_FSR"] = "1"
                env["WINE_FULLSCREEN_FSR_STRENGTH"] = Math.abs((runprefs.FSR_STRENGTH/25) - 5).toString()
            }
        }
        return [false, [ { action: runCmd, args: {
            runtime: "runtimes/proton/bin/wine",
            args: [ `${installDir}/game/StartRobocraft2.exe` ],
            env: env,
            wait: true
        }} ]]
    }

    if (!validity.runtime) {
        actionset.push({ action: createFolder, args: { path: `runtimes`, tryDelete: true }, desc: "Creating runtimes folder" })
        let entries = Object.entries(repos)
        let dl_assets = []
        for (let [rname, repo] of entries) {
            // r_m is shorthand for runtime_manifest
            let r_m = await fetch(`https://api.github.com/repos/${repo}/releases/latest`)
            if (!r_m.ok) throw new Error(`HTTP ${r_m.status}: ${r_m.text()}`)
            // @ts-ignore
            let manifest = await r_m.json()
            let asset_index = null;
            // @ts-ignore
            for (let i = 0; i < manifest.assets.length; i++) {
                let asset = manifest.assets[i]
                if (asset.name.match(regex[rname]) !== null) {
                    asset_index = i
                    break
                }
            }
            if (asset_index == null) throw new Error(`Unable to get asset info for ${rname}`)
            dl_assets.push([rname, manifest.assets[asset_index]])
        }
        for (let asset of dl_assets) {
            let asset_name = asset[1].name
            let asset_url = asset[1].browser_download_url
            let asset_size = asset[1].size
            if (asset_name === null || asset_url === null) throw new Error(`Unable to get name or url for ${asset[0]}`)

            actionset.push({ action: downloadFile, args: { window: appWindow, url: asset_url, path: `runtimes/${asset_name}`,
                filesize: ( asset_size == null ? 0 : asset_size) }, desc: `Downloading ${asset[0]}`, awaitProgress: true })
            // delay needed because otherwise extracting tarballs wil fail if your computer is too fast
            actionset.push({ action: pause, args: { ms: 2000 }, desc: `Downloading ${asset[0]}` })
        }
        for (let asset of dl_assets) {
            let asset_name = asset[1].name
            actionset.push({ action: extract, args: { source: `runtimes/${asset_name}`, dest: "runtimes" }, desc: `Extracting ${asset[0]}`})

            // wine-lutris-GE-Proton suddently loses the "wine-" bit when extraxted and the original asset name has to be kept, hence the mess of a ternary
            actionset.push({ action: rename,
                args: { source: `runtimes/${(asset[0] == "proton" ? asset_name.replace(/^wine-/g, "") : asset_name).slice(0,-7)}`, dest: `runtimes/${asset[0]}` },
                desc: `Moving ${asset[0]}` })
            actionset.push({ action: deleteFile, args: { path: `runtimes/${asset_name}` }, desc: `Deleting ${asset[0]}.${asset_name.slice(-6)}`})
        }
    }

    if (!validity.prefix) {
        actionset.push({ action: createFolder, args: { path: `prefix`, tryDelete: true }, desc: "Creating prefix folder" })
        actionset.push({ action: runCmd, args: {
            runtime: "runtimes/proton/bin/wineboot",
            args: ["-u"],
            env: { "WINEPREFIX": `${installDir}/prefix` },
            wait: true
        }, desc: "Configuring wine" })
        const dxvkDirs = ["x64", "x32"]; const wineDirs = ["system32", "syswow64"]
        const files = ["d3d9", "d3d10core", "d3d11", "dxgi"];
        for (let file of files) {
            for (let i = 0; i < 2; i++) {
                actionset.push({ action: deleteFile, args: { path: `prefix/drive_c/windows/${wineDirs[i]}/${file}.dll` }, desc: `Deleting stock ${wineDirs[i]} ${file}.dll`})
                actionset.push({ action: copy, args: {
                    source: `runtimes/dxvk/${dxvkDirs[i]}/${file}.dll`, dest: `prefix/drive_c/windows/${wineDirs[i]}/${file}.dll`
                }, desc: `Copying patched ${wineDirs[i]} ${file}.dll` })
            }
            actionset.push({ action: runCmd, args: {
                runtime: "runtimes/proton/bin/wine",
                args: ["reg", "add", `HKEY_CURRENT_USER\\Software\\Wine\\DllOverrides`, "/v", file, "/t", "REG_SZ", "/d", "native,builtin"],
                env: { "WINEPREFIX": `${installDir}/prefix` },
                wait: true
            }, desc: `Adding ${file}.dll override to registry` })
        }
    }

    if (validity.gameVerification && !validity.gameInstall) validity.gameVerification = false

    // returns here to avoid any unnecessary http request shenanigans
    if (validity.gameInstall && validity.gameVerification) return [true, actionset]

    let res = await invoke("make_cors_request", { url: `${builds_baseurl}/build_${latestversion}.json` })
    if (!res) throw new Error("Build manifest response is empty")
    let buildmanifest = JSON.parse(res)
    if (z.object({ Entries: z.array(z.object({ RelativePath: z.string(), Size: z.number(), Hash: z.string() })) }).safeParse(buildmanifest).success === false) {
        throw new Error("Build manifest malformed")
    }

    if (!validity.gameInstall) {
        actionset.push({ action: createFolder, args: { path: "game", tryDelete: true }, desc: "Creating game folder" })
        actionset.push({ action: deleteFile, args: { path: "gameconfig.json", throw: false }, desc: "Deleting gameconfig.json"})
        let createdfolders = []
        for (let entry of buildmanifest.Entries) {

            // this regex will only match if a folder is specified e.g: "file.exe" = no match, "folder/file.exe" = matches folder
            let match = entry.RelativePath.match(/.+(?=\/.+$)/gm)
            console.log(match, entry.RelativePath)
            if (match !== null) {
                let folderpath = match[0]
                if (!createdfolders.includes(folderpath)) {
                    createdfolders.push(folderpath)
                    actionset.push({ action: createFolder, args: { path: `game/${folderpath}`, tryDelete: true }, desc: `Creating game/${folderpath}`})
                }
            }

            actionset.push({ action: downloadFile, args:{
                window: appWindow, url: `${builds_baseurl}/${latestversion}/Game/${entry.RelativePath}`, path: `game/${entry.RelativePath}`, filesize: entry.Size
            }, desc: `Downloading ${entry.RelativePath.slice(match ? match[0].length+1 : 0)}`, awaitProgress: true})
        }
        actionset.push({ action: deleteFile, args: { path: "gameconfig.json", throw: false }, desc: "Deleting gameconfig.json"})
        actionset.push({ action: createFile, args: { path: "gameconfig.json", data: `{"gameVersion":"${latestversion}","verified":false}` }, desc: "Writing gameconfig.json"})
    }

    if (!validity.gameVerification) {
        actionset.push({ action: deleteFile, args: { path: "gameconfig.json", throw: false }, desc: "Deleting gameconfig.json"})
        actionset.push({ action: createFile, args: { path: "gameconfig.json", data: `{"gameVersion":"${latestversion}","verified":false}` }, desc: "Writing gameconfig.json"})
        actionset.push({ action: pause, args: { ms: 2000 }, desc: `Preparing for verification` })
        for (let entry of buildmanifest.Entries) {
            actionset.push({ action: verifyFile, args: { path: `game/${entry.RelativePath}`, expectedHash: entry.Hash }, desc: `Verifying ${entry.RelativePath}`,
                isHashAction: true})
        }
    }
    return [true, actionset]
}
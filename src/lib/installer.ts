import { get } from "svelte/store";

// stupid stupid workaround because vite does SSR regardless of settings and it fucks with tauri module imports
// also this workaround breaks intellisense >:(
import { invoke } from "./tauriFix";

let appWindow = {
	once: async (event: string, callback: Function) => {
		return () => {}
	}
}

import { getLatestVersion } from "./installvalidator";
import { installDir, stepCounter, progressBarStatus } from "./stores";
import { z } from "zod";

const repos: { [index: string]: string } = {
    //dxvk: "doitsujin/dxvk",
    proton: "GloriousEggroll/wine-ge-custom",
    eac_runtime: "lutris/buildbot"
}
const regex = {
    //dxvk: /^dxvk.+tar\.[xg]z$/g,
    proton: /^.*lutris-GE-Proton.+tar\.[xg]z$/g,
    eac_runtime: /eac_runtime\.tar\.[xg]z/g
}

interface IStepCounts {
	installRuntimes: number,
	configurePrefix: number,
	installGame: number,
	verifyGameFiles: number
}

interface IGitHubAsset {
	name: string,
	size: number,
	browser_download_url: string
}

interface IGameBuildManifest {
	Entries: {
		RelativePath: string,
		Size: number,
		LastWriting: string,
		Hash: string,
		Attributes: number
	}[]
}

const gameBuildManifestSchema = z.object({
	Entries: z.object({
		RelativePath: z.string(),
		Size: z.number(),
		LastWriting: z.string(),
		Hash: z.string(),
		Attributes: z.number()
	}).array()
})

export async function initialise(): Promise<void> {
	// horrendous workaround part 2: electric boogaloo
	if (!import.meta.env.SSR) {
		const api = await import('@tauri-apps/api');
		//@ts-ignore
		appWindow = api.window.appWindow
	}
}

function wait(ms: number): Promise<any> {
	return new Promise((resolve, _) => {
		setTimeout(resolve, ms)
	})
}

let buildsCache: { [index: string]: IGameBuildManifest } = {}

const builds_baseurl = "https://patcher-production.robocraft.org/Builds"

async function getBuildManifest(version: string): Promise<IGameBuildManifest> {
	if (buildsCache[version]) return buildsCache[version]

	let res: string = await invoke("make_cors_request", { url: `${builds_baseurl}/build_${version}.json` })
    if (!res || res == "") throw new Error("Build manifest response is empty")
    let buildmanifest: IGameBuildManifest = JSON.parse(res)
    if (!gameBuildManifestSchema.safeParse(buildmanifest).success) {
        throw new Error("Build manifest malformed")
    }

	buildsCache[version] = buildmanifest
	return buildmanifest
}

export async function getStepCounts(): Promise<IStepCounts> {
	// Make folder and then Download, extract, move and del archive for each repo
	let installRuntimes = 1 + (Object.entries(repos).length * 4)
	let configurePrefix = 2 // only make folder and wineboot -u

	let latestversion = await getLatestVersion()
	let res: string = await invoke("make_cors_request", { url: `${builds_baseurl}/build_${latestversion}.json` })
	let rawbuildmanifest: object = JSON.parse(res)
	let buildmanifest = z.object({
		Entries: z.object({
			RelativePath: z.string(),
			Size: z.number(), Hash: z.string()
		}).array()
	}).parse(rawbuildmanifest)
	
	let installGame = 3 // initial value, increases for each file/folder
	let verifyGameFiles = 4
	let trackedfolders: string[] = []
	for (let entry of buildmanifest.Entries) {
		let match = entry.RelativePath.match(/.+(?=\/.+$)/gm)
        if (match) {
            if (!trackedfolders.includes(match[0])) {
				installGame++
				trackedfolders.push(match[0])
			}
        }
		installGame++
		verifyGameFiles++
	}

	return { installRuntimes, configurePrefix, installGame, verifyGameFiles }
}

export async function installRuntimes() {
	const directory = get(installDir)
	const api = await import('@tauri-apps/api');

	stepCounter.step("Creating runtimes folder")
	await invoke("remove_dir", { path: `${directory}/runtimes` })

    let res = await invoke("create_dir", { path: `${directory}/runtimes` })
	if (!res) throw new Error("Unable to create runtimes direcotry")

	let dl_assets: { name: string, asset: IGitHubAsset }[] = []
	for (let [repoName, repo] of Object.entries(repos) ) {
		let manifestraw = await fetch(`https://api.github.com/repos/${repo}/releases/latest`)
        if (!manifestraw.ok) throw new Error(`HTTP ${manifestraw.status}: ${manifestraw.text()}`)
		let manifest: { assets: IGitHubAsset[] } = await manifestraw.json()

		let asset_index: number | undefined = undefined
		for (let i = 0; i < manifest.assets.length; i++) {
			let asset = manifest.assets[i]
			//@ts-ignore
			if (asset.name.match(regex[repoName])) {
				asset_index = i
				break
			}
		}
		
		if (asset_index == undefined) throw new Error(`Unable to get asset info for ${repoName}`)
		dl_assets.push({ name: repoName, asset: manifest.assets[asset_index] })
	}

	for (let dlInfo of dl_assets) {
		stepCounter.step(`Downloading ${dlInfo.name}`)
		progressBarStatus.set(1)

		await invoke("download_file", {
			window: appWindow,
			url: dlInfo.asset.browser_download_url,
			path: `${directory}/runtimes/${dlInfo.asset.name}`,
			filesize: dlInfo.asset.size || 0
		})
		progressBarStatus.set(0)
		await wait(1000)
	}

	for (let dlInfo of dl_assets) {
		stepCounter.step(`Extracting ${dlInfo.name}`)
		let extension = dlInfo.asset.name.slice(-2)
		if (dlInfo.asset.name.match(/\.tar\.[xg]z$/g) && (extension == "xz" || extension == "gz")) {
			progressBarStatus.set(2)
			await invoke(`unpack_${extension}`, {
				srcpath: `${directory}/runtimes/${dlInfo.asset.name}`,
				destpath: `${directory}/runtimes`
			})
			progressBarStatus.set(0)
		} else {
			throw new Error(`Invalid tarball format: ${dlInfo.asset.name}`)
		}

		// wine-lutris-GE-Proton suddently loses the "wine-" bit when extraxted and the original asset name has to be kept, so cue replacement shenanigans
		if (dlInfo.name == "proton") {
			dlInfo.asset.name = dlInfo.asset.name.replace(/^wine\-/g, "")
		}

		stepCounter.step(`Moving ${dlInfo.name}`)
		let ok: boolean = await invoke("rename", {
			src: `${directory}/runtimes/${dlInfo.asset.name.slice(0,-7)}`,
			dest: `${directory}/runtimes/${dlInfo.name}`
		})
		if (!ok) throw new Error(`Error moving ${dlInfo.asset.name.slice(0,-7)}`)
		
		stepCounter.step(`Deleting tarball ${dlInfo.asset.name}`)
		await invoke("remove_file", { path: `${directory}/runtime/${dlInfo.asset.name}` })
	}
}

export async function configurePrefix() {
	const directory = get(installDir)

	stepCounter.step("Creating prefix folder")
	await invoke("remove_dir", { path: `${directory}/prefix` })

    let res = await invoke("create_dir", { path: `${directory}/prefix` })
	if (!res) throw new Error("Unable to create prefix direcotry")

	stepCounter.step("Configuring wine prefix")
	await invoke("start_cmd", {
		command: `${directory}/runtimes/proton/bin/wineboot`,
		args: ["-u"],
		env: { "WINEPREFIX": `${directory}/prefix` },
		wait: true
	})
}

export async function installGame(version: string) {
	const directory = get(installDir)
	let buildmanifest = await getBuildManifest(version)

	stepCounter.step("Creating game folder")
	await invoke("remove_dir", { path: `${directory}/game` })

    let res = await invoke("create_dir", { path: `${directory}/game` })
	if (!res) throw new Error("Unable to create game direcotry")

	stepCounter.step("Removing gameconfig.json")
	await invoke("remove_file", { path: `${directory}/gameconfig.json` })

	let createdFolders: string[] = []
	for (let entry of buildmanifest.Entries) {
		let match = entry.RelativePath.match(/.+(?=\/.+$)/gm)
        if (match) {
			let folderpath = match[0]
            if (!createdFolders.includes(folderpath)) {
				stepCounter.step(`Creating folder game/${folderpath}`)
				createdFolders.push(folderpath)
				let res = await invoke("create_dir", { path: `${directory}/game/${folderpath}` })
				if (!res) throw new Error(`Error creating game/${folderpath}`)
			}
        }

		stepCounter.step(`Downloading game/${entry.RelativePath}`)
		progressBarStatus.set(1)
		await invoke("download_file", {
			window: appWindow,
			url: `${builds_baseurl}/${version}/Game/${entry.RelativePath}`,
			path: `${directory}/game/${entry.RelativePath}`,
			filesize: entry.Size || 0
		})
		progressBarStatus.set(0)
	}

	stepCounter.step("Writing gameconfig.json")
	await invoke("create_file", { path: `${directory}/gameconfig.json`, data:`{"gameVersion":"${version}","verified":false}` })
}

export async function verifyGameFiles(version: string) {
	const directory = get(installDir)
	let buildmanifest = await getBuildManifest(version)

	stepCounter.step("Removing gameconfig.json")
	await invoke("remove_file", { path: `${directory}/gameconfig.json` })

	stepCounter.step("Writing gameconfig.json")
	await invoke("create_file", { path: `${directory}/gameconfig.json`, data:`{"gameVersion":"${version}","verified":false}` })
	
	let verified = true
	for (let entry of buildmanifest.Entries) {
		stepCounter.step(`Verifying game/${entry.RelativePath}`)
		let filehash: string = await invoke("sha1filehash", { path: `${directory}/game/${entry.RelativePath}` })
		if (!filehash.startsWith(entry.Hash)) throw new Error(`File game/${entry.RelativePath} cannot be verified`)
	}
	if (verified) {
		stepCounter.step("Removing gameconfig.json")
		await invoke("remove_file", { path: `${directory}/gameconfig.json` })

		stepCounter.step("Writing gameconfig.json")
		await invoke("create_file", { path: `${directory}/gameconfig.json`, data:`{"gameVersion":"${version}","verified":true}` })
	}
}
import { get } from "svelte/store";
import { installDir, settings, toastMessage } from "./stores";
import { configSchema, type IConfig } from "./config";
import { invoke } from "./tauriFix";

const valueMappings = {
	wined3d: "PROTON_USE_WINED3D",
	nvapi: "PROTON_ENABLE_NVAPI",
	hidenvgpu: "PROTON_HIDE_NVIDIA_GPU",
	fsr: "WINE_FULLSCREEN_FSR",
	fsrstrength: "WINE_FULLSCREEN_FSR_STRENGTH", // will be mapped to invert
	esync: "PROTON_NO_ESYNC", // value mapping will be flipped via custom mapping
	fsync: "PROTON_NO_FSYNC", // same as esync
	mangohud: "MANGOHUD"
}

const customTransforms = {
	esync: (value: boolean) => {return (value ? "0" : "1" )},
	fsync: (value: boolean) => {return (value ? "0" : "1" )},
	fsrstrength: (value: number) => {return (5 - value).toString()}
}

function generateEnvironment(configOverride?: IConfig): { [key: string]: string } {
	let directory = get(installDir)
	//@ts-ignore
    let config: IConfig = get(settings)
	//@ts-ignore
	config = configSchema.parse(config)
	if (configOverride) config = configOverride
	let env = {
		"WINEPREFIX": `${directory}/prefix`,
		"PROTON_EAC_RUNTIME": `${directory}/runtimes/eac_runtime/v2`,
		"GST_PLUGIN_SYSTEM_PATH_1_0": `${directory}/runtimes/proton/lib64/gstreamer-1.0/:${directory}/runtimes/proton/lib/gstreamer-1.0`, // intro video breaks without this
		"PROTON_USE_WINED3D": "0",
		"WINEDLLOVERRIDES": "d3d10core,d3d11,d3d9,dxgi=n,b" // used for DXVK
	}
	if (config.graphics.wined3d) env.WINEDLLOVERRIDES = ""

	for (let subConf in config) {
		if (subConf == "customenv") continue
		//@ts-ignore
		for (let setting in config[subConf]) {
			if (setting == "gamemode") continue
			//@ts-ignore
			let value: boolean | number = config[subConf][setting]
			//@ts-ignore
			let envName: string = valueMappings[setting] || setting
			//@ts-ignore
			let transform = customTransforms[setting]
			if (transform != (null || undefined)) {
				//@ts-ignore
				env[envName] = transform(value)
			} else {
				let newValue = ""
				switch(typeof(value)) {
					case "boolean":
						newValue = (value ? "1" : "0")
						break;
					default:
						newValue = value.toString()
				}
				//@ts-ignore
				env[envName] = newValue
			}
		}
	}

	for (let custom of config.customenv) {
		//@ts-ignore
		env[custom.key] = custom.value
	}
	return env
}

export async function runGame() {
	//@ts-ignore
    let config: IConfig = get(settings)
	//@ts-ignore
	config = configSchema.parse(config)
	let directory = get(installDir)

	let command = `${directory}/runtimes/proton/bin/wine`
	let env = generateEnvironment()
	let args = [`${directory}/game/StartRobocraft2.exe`]

	if (config.runner.gamemode) {
		if (await invoke("check_cmd_exists", { command: "gamemoderun", args: [] })) {
			args.splice(0, 0, command)
			command = "gamemoderun"
		} else {
			toastMessage.set({
				message: `gamemode not installed. Launching without gamemode...`,
				background: "variant-filled-warning"
			})
		}
	}
	console.log(command, env)
	await invoke("start_cmd", { command, env, args, wait: true })
}

export async function stopGame() {
	let directory = get(installDir)

	let env = generateEnvironment()
	let command = `${directory}/runtimes/proton/bin/wineserver`
	
	await invoke("start_cmd", { command, env: { WINEPREFIX: env.WINEPREFIX }, args: ["-k"], wait: true })
}
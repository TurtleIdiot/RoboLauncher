import { get } from "svelte/store";
import { z } from "zod";

import { settings } from "./stores";

export interface ICustomEnv {
	key: string,
	value: string
}

export interface Iconfig {
	graphics: { [index: string]: number | boolean },
	runner: { [index: string]: boolean },
	customenv: ICustomEnv[]
}

interface IConfigMeta {
	[index: string]: {
		name: string,
		description: string
	}
}

export const configSchema = z.object({
	graphics: z.object({
		wined3d: z.boolean().default(false),
		nvapi: z.boolean().default(false),
		hidenvgpu: z.boolean().default(false),
		fsr: z.boolean().default(false),
		fsrstrength: z.number().gte(0).lte(5).default(3)
	}),
	runner: z.object({
		esync: z.boolean().default(true),
		fsync: z.boolean().default(true),
		mangohud: z.boolean().default(false),
		gamemode: z.boolean().default(false),
		usesyswine: z.boolean().default(false)
	}),
	customenv: z.object({
		key: z.string().regex(/[a-zA-Z_][a-zA-Z0-9_]*/g),
		value: z.string()
	}).optional().array()
})

export const configMeta: IConfigMeta = {
	wined3d: { name: "Enable WineD3D", description: "Forces wine/proton to use WineD3D instead of DXVK. May cause visual bugs or lag" },
	nvapi: { name: "Enable NVAPI", description: "Enables Nvidia's NVAPI GPU support library" },
	hidenvgpu: { name: "Hide NVIDIA GPU", description: "Forces proton to report Nvidia GPUs as AMD GPUs" },
	fsr: { name: "Enable AMD FSR", description: "Enables AMD FidelityFX Super Resolution. May increase performance" },
	fsrstrength: { name: "FSR sharpening strength", description: "AMD FSR Sharpening strength" },
	esync: { name: "Enable ESYNC", description: "Enables eventfd-based synchronisation. Increases multicore performance" },
	fsync: { name: "Enable FSYNC", description: "Enables futex-based synchronisation. Inreases multicore performance. Requires Linux 5.16+" },
	mangohud: { name: "Enable MangoHUD", description: "Displays FPS + other information. MangoHUD must be installed" },
	gamemode: { name: "Enable Feral GameMode", description: "Requests a set of temporary optimisations be applied. Gamemode must be installed" },
	usesyswine: { name: "Use system Wine", description: "Uses the system-wide version of wine. May break certain proton-specific functionality" }
}

export function getConfig(): Iconfig {
	let config: Iconfig = { graphics: {}, runner: {}, customenv: [] }
	let rawconfig = get(settings)
	if (rawconfig === "") {
		//@ts-ignore
		config = configSchema.parse({ graphics: {}, runner: {}, customenv: [] })
	} else {
		config = JSON.parse(rawconfig)
		//@ts-ignore
		config = configSchema.parse(config)
	}
	return config
}

export function saveConfig(newconfig: object) {
	let parsed = configSchema.parse(newconfig)
	settings.set(JSON.stringify(parsed))
}
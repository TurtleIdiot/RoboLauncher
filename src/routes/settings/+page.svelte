<script lang="ts">
	import type { ModalComponent, ModalSettings, PopupSettings } from "@skeletonlabs/skeleton";
    import { open } from "@tauri-apps/api/dialog";
	import { AppBar, RangeSlider, LightSwitch, getToastStore, getModalStore } from "@skeletonlabs/skeleton";

	import { saveConfig, configMeta, configSchema } from "$lib/config";
	import { installDir } from "$lib/stores.js";
	import OptionInfoModal from "$lib/OptionInfoModal.svelte";

	const modalStore = getModalStore();
	const toastStore = getToastStore()

	export let data;
	let unique = {}

    async function selectDirectory() {
        let selected = await open({
            multiple: false,
            directory: true
        })
        // @ts-ignore
        if (selected !== null) data.directory = selected
    }

    function save() {
        if (data.directory !== "") {
            let directory = data.directory.trim()
            directory = directory.replace(/\/{1}$/g, "")
            installDir.set(directory)
        }

		for (let i = 0; i < data.config.customenv.length; i++) {
			let v = data.config.customenv[i]
			let env = { key: v.key.trim(), value: v.value.trim() }
			if (env.key == "" && env.value == "") {
				data.config.customenv.splice(i,1)
				i--
				unique = {}
				continue
			}
			if (!env.key.match(/[a-zA-Z_][a-zA-Z0-9_]*/g)) {
				return toastStore.trigger({
					message: `Invalid environment variable name ${env.key}`,
					background: "variant-filled-error"
				})
			}
			if (env.value == "") {
				return toastStore.trigger({
					message: `Env key value cannot be empty`,
					background: "variant-filled-error"
				})
			}
			data.config.customenv[i] = env
		}

		try {
			saveConfig(data.config)
			toastStore.trigger({
				message: `Settings saved`
			})
		} catch (err) {
			console.warn(err)
			toastStore.trigger({
				message: `Error occurred saving settings`,
				background: "variant-filled-error"
			})
		}
    }

	function addEnv() {
		if (data.config.customenv.length > 0) {
			let last = data.config.customenv[data.config.customenv.length -1]
			if (last.key == "" && last.value == "") return
		}
		data.config.customenv.push({ key: "", value: "" })
		unique = {}
	}
	function removeEnv(i: number) {
		data.config.customenv.splice(i, 1)
		unique = {}
	}

	function showDescriptionModal(title: string, options: { [index: string]: any }) {
		let info = []
		for (let option in options) {
			info.push([ configMeta[option].name, configMeta[option].description ])
		}
		let modalcomp: ModalComponent = {
			ref: OptionInfoModal,
			props: { title, info }
		}
		let modal: ModalSettings = {
			type: "component",
			component: modalcomp
		}
		modalStore.trigger(modal)
	}
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<a href="/" class="btn-icon">
			<i class="fa-solid fa-chevron-left"/>
		</a>
	</svelte:fragment>
	Settings
	<svelte:fragment slot="trail">
		<LightSwitch />
		<button type="button" class="btn variant-filled-secondary" on:click={save}>Save</button>
	</svelte:fragment>
</AppBar>

<div class="w-5/6 mx-auto my-2 flex flex-col gap-3">
	<p>Install Directory</p>
	<div class="input-group input-group-divider grid-cols-[1fr_auto]">
    	<input type="text" placeholder="Full directory path here..." bind:value={data.directory}/>
		<button class="variant-ghost" on:click={selectDirectory}>
    	    <!-- fontawesome folder open solid -->
    	    <i class="fa-solid fa-folder-open"></i>
    	</button>
	</div>
    <div class="card p-2 variant-ghost">
		<header class="card-header flex flex-row justify-between">
			<h3 class="h3">Runner options</h3>
			<button type="button" class="btn-icon variant-filled" on:click={()=>showDescriptionModal("Runner options", data.config.runner)}>
				<i class="fa-solid fa-question"/>
			</button>
		</header>
		<section class="p-4 gap-2">
			{#each Object.entries(data.config.runner) as [rOptionIndex, _]}
				<label class="flex items-center space-x-2 my-1">
					<input class="checkbox" type="checkbox" bind:checked={data.config.runner[rOptionIndex]} />
					<p>{configMeta[rOptionIndex].name}{rOptionIndex == "usesyswine" ? ` (${data.wineversion})` : ""}</p>
				</label>
			{/each}
		</section>
	</div>

	<div class="card p-2 variant-ghost">
		<header class="card-header flex flex-row justify-between">
			<h3 class="h3">Graphics options</h3>
			<button type="button" class="btn-icon variant-filled" on:click={()=>showDescriptionModal("Graphics options", data.config.graphics)}>
				<i class="fa-solid fa-question"/>
			</button>
		</header>
		<section class="p-4 gap-2">
			{#each Object.entries(data.config.graphics) as [gOptionIndex, gValue]}
				{#if gOptionIndex == "fsrstrength"}
					<div class="mt-4">
						<RangeSlider name="range-slider" bind:value={data.config.graphics[gOptionIndex]} min={0} max={5} step={1} ticked>
							<p>{configMeta[gOptionIndex].name}</p>
							<div class="flex justify-between items-center">
								<div class="text-xs">Min.</div>
								<div class="text-xs">Max.</div>
							</div>
						</RangeSlider>
					</div>
				{:else}
					<label class="flex items-center space-x-2 my-1">
						<input class="checkbox" type="checkbox" bind:checked={data.config.graphics[gOptionIndex]} />
						<p>{configMeta[gOptionIndex].name}</p>
					</label>
				{/if}
			{/each}
		</section>
	</div>

	<div class="card p-2 variant-ghost">
		<header class="card-header flex flex-row justify-between">
			<h3 class="h3">Custom environment variables</h3>
			<button type="button" class="btn-icon variant-filled-primary" on:click={addEnv}>
				<i class="fa-solid fa-plus" />
			</button>
		</header>
		<section class="p-4">
			<p class="text-s text- my-2">
				Env variables may only contain characters: <code class="code">a-z</code>, <code class="code">A-Z</code>, <code class="code">0-9</code>, <code class="code">_</code>
			</p>
			<div class="table-container">
				<table class="table">
					<thead>
						<tr>
							<th>Key</th>
							<th>Value</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{#key unique}
						{#each data.config.customenv as _, i}
							<tr>
								<td><input class="input" type="text" bind:value={data.config.customenv[i].key}/></td>
								<td><input class="input" type="text" bind:value={data.config.customenv[i].value}/></td>
								<td>
									<button type="button" class="btn-icon variant-filled-error" on:click={() => removeEnv(i)}>
										<i class="fa-solid fa-delete-left" />
									</button>
								</td>
							</tr>
						{/each}
						{/key}
					</tbody>
				</table>
			</div>
		</section>
	</div>
</div>
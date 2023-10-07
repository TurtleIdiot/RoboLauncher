<script lang="ts">
	import { goto } from "$app/navigation"
	import { getToastStore, type ToastSettings, ProgressBar, popup, type PopupSettings } from "@skeletonlabs/skeleton"
	import { appWindow } from '@tauri-apps/api/window';
	import { ActionType, buttonStatus, installing, stepCounter, installDir, progressBarStatus, toastMessage } from "$lib/stores"
	import * as dispatcher from "$lib/dispatcher";
	import { onDestroy } from "svelte";

	interface IDownloadStatus {
		percentage: number,
		transfer_rate: number
	}

	const toastStore = getToastStore()

	export let data

	let mainBtnClass = "filled-secondary"
	$: {
		let ftype = $buttonStatus.enabled ? "filled" : "ghost"
		let colour = $buttonStatus.actionType == ActionType.Play ? "primary" : "secondary"
		mainBtnClass = `${ftype}-${colour}`
	}

	const popupFeatured: PopupSettings = {
		event: "click",
		target: "popupFeatured",
		placement: "bottom"
	}

	let progress = 0
	let speed = 0
	let speedValues: number[] = [0]

	appWindow.listen("PROGRESS", ({event, payload}: { event: any, payload: IDownloadStatus }) => {
        progress = payload.percentage
        speedValues.push(payload.transfer_rate / 100000)
		let trunc = speedValues.slice(-100)
		let total = trunc.reduce((acc, current) => acc + current)
		speed = Math.round(total / Math.min(speedValues.length, 100)) /10
    })

	if (data.errMessage) {
		let t: ToastSettings = {
			message: data.errMessage,
			background: "variant-filled-warning",
			autohide: false
		}
		if (!data.validationData.installDir) {
			t.action = {
				label: "Open settings",
				response: () => goto("/settings")
			}
		}
		toastStore.trigger(t)
	}

	let unsub = toastMessage.subscribe((m) => {
		if (m.message == "") return
		toastStore.trigger(m)
		toastMessage.set({message: ""})
	})
	onDestroy(() => {
		unsub()
	})
</script>

<div class="flex flex-col mx-2 my-2 h-full">
	<h1 class="text-center text-7xl my-2"><strong>RoboLauncher</strong></h1>
	<h1 class="w-fit mx-auto text-xl mb-16">The (unofficial) robocraft linux launcher</h1>

	<div class=" w-80 mx-auto gap-4">
		<div class="flex flex-row mb-2">
			<button
				type="button"
				disabled={!$buttonStatus.enabled}
				class="btn btn-xl variant-{mainBtnClass} flex-grow"
				on:click={dispatcher.auto}>{$buttonStatus.text}</button>
			{#if $buttonStatus.showOtherOptions}
				<button type="button" class="btn-icon btn-icon-xl variant-ghost ml-2 flex-shrink-0" use:popup={popupFeatured}>
					<i class="fa-solid fa-ellipsis-vertical" />
				</button>
				<div class="card p-2 w-max shadow-xl" data-popup="popupFeatured">
						<div class="btn-group-vertical bg-initial">
							<a href="/settings">Settings</a>
							<button on:click={() => dispatcher.reinstall(dispatcher.ResetType.Game)}>Reinstall game</button>
							<button on:click={() => dispatcher.reinstall(dispatcher.ResetType.Verification)}>Re-verify files</button>
							<button on:click={() => dispatcher.reinstall(dispatcher.ResetType.Runtimes)}>Reinstall runtimes</button>
							<button on:click={() => dispatcher.reinstall(dispatcher.ResetType.Prefix)}>Reconfigure prefix</button>
						</div>
					<div class="arrow bg-surface-100-800-token" />
				</div>
			{/if}
		</div>
		<div class="flex flex-row justify-between">
			<p>Current: {data.validationData.gameVersion || "N/A"}</p>
			<p>Latest: {data.latestVersion}</p>
		</div>
		<p class="mb-2">Install path: {data.validationData.installDir ? $installDir : "N/A"}</p>
		{#if $installing}
			<ProgressBar label="Overall prograss" value={$stepCounter.step} max={$stepCounter.total} />
			<div class="flex flex-row w-full justify-between my-2">
				<p class="flex-grow truncate w-max">{$stepCounter.description}</p>
				<p class="flex-shrink ml-1">{$stepCounter.step}/{$stepCounter.total}</p>
			</div>
			{#if $progressBarStatus != 0}
				<ProgressBar label="File prograss" value={$progressBarStatus == 1 ? progress : undefined} max={100} />
				{#if $progressBarStatus == 1}
					<div class="flex flex-row justify-between mt-2">
						<p>{progress}%</p>
						<p>{speed} MB/s</p>
					</div>
				{/if}
			{/if}
		{/if}
	</div>
</div>

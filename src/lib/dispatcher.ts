import { validateInstall, getLatestVersion } from "./installvalidator";
import type { IValidationResult } from "./installvalidator";
import { buttonStatus, ActionType, stepCounter, installing, toastMessage } from "./stores";
import * as installer from "./installer"
import * as runner from "./runner"
import { getToastStore } from "@skeletonlabs/skeleton";

let running = false

export enum ResetType {
	Game = 0,
	Verification = 1,
	Runtimes = 2,
	Prefix = 3
}

function isGameOutdated(currentVer: string, latestVer: string) {
	let current = currentVer.split(".")
	let latest = latestVer.split(".")
	for (let i = 0; i < 3; i++) {
		if (parseInt(latest[i]) > parseInt(current[i])) {
			return true
		}
	}
	return false
}

export async function autoSetButtonStatus(data?: IValidationResult): Promise<void> {
	buttonStatus.reset()
	if (!data) {
		let [newdata,err] = await validateInstall()
		data = newdata
	}
	if (!data.installDir) return

	buttonStatus.setEnabled(true)

	if (data.game && data.prefix && data.runtime && data.gameVerify && data.gameVersion) {
		let latest = await getLatestVersion()
		if (!isGameOutdated(data.gameVersion, latest)) {
			buttonStatus.setText("Play")
			buttonStatus.setActionType(ActionType.Play)
		} else {
			buttonStatus.setText("Update")
		}
		return
	}

	if (!data.gameVerify) buttonStatus.setText("Verify")

	if (!data.prefix) buttonStatus.setText("Configure")

	if (!(data.game && data.runtime && data.gameVersion)) buttonStatus.setText("Install")
}


export async function auto() {
	let [data, err] = await validateInstall()
	let latestVersion = await getLatestVersion()
	if (data.gameVersion) {
		let updateNeeded = isGameOutdated(data.gameVersion!, latestVersion)
		if (updateNeeded) {
			data.game = false,
			data.gameVerify = false
		}
	}

	if (data.game && data.prefix && data.runtime && data.gameVerify && data.gameVersion) {
		try {
			if (running) {
				await runner.stopGame()
			} else {
				buttonStatus.setText("Stop")
				buttonStatus.setOtherOptionsEnabled(false)
				buttonStatus.setActionType(ActionType.Cancel)
				running = true
				await runner.runGame()
			}
		} catch (err) {
			console.error(err)
			toastMessage.set({
				message: `Error: ${err}`,
				autohide: false,
				background: "variant-filled-error"
			})
		}
		running = false
	} else {

		await installer.initialise()
		stepCounter.reset()
		// do gam install
		let stepcount = await installer.getStepCounts()
		let totalsteps = 0

		if (!data.runtime) totalsteps += stepcount.installRuntimes
		if (!data.prefix) totalsteps += stepcount.configurePrefix
		if (!data.game) totalsteps += stepcount.installGame
		if (!data.gameVerify) totalsteps += stepcount.verifyGameFiles

		stepCounter.setTotal(totalsteps)
		installing.set(true)
		buttonStatus.setEnabled(false)
		buttonStatus.setText("Installing...")

		try {

			if (!data.runtime) await installer.installRuntimes()
			if (!data.prefix) await installer.configurePrefix()
			if (!data.game) await installer.installGame(latestVersion)
			if (!data.gameVerify) await installer.verifyGameFiles(latestVersion)
		} catch (err) {

			console.error(err)
			toastMessage.set({
				message: `Error: ${err}`,
				autohide: false,
				background: "variant-filled-error"
			})
			
		}
		installing.set(false)
	}
	autoSetButtonStatus()
}

export async function reinstall(type: ResetType) {
	await installer.initialise()
	stepCounter.reset()
	let latestVersion = await getLatestVersion()
	let steps = await installer.getStepCounts()
	let total = 0

	switch(type) {
		case ResetType.Game:
			total = steps.installGame + steps.verifyGameFiles
			break;
		case ResetType.Verification:
			total = steps.verifyGameFiles
			break;
		case ResetType.Runtimes:
			total = steps.installRuntimes
			break;
		case ResetType.Prefix:
			total = steps.configurePrefix
			break;
	}

	stepCounter.setTotal(total)
	installing.set(true)
	buttonStatus.setEnabled(false)
	buttonStatus.setText("Installing...")
	try {
		switch(type) {
			case ResetType.Game:
				await installer.installGame(latestVersion)
				await installer.verifyGameFiles(latestVersion)
				break;
			case ResetType.Verification:
				await installer.verifyGameFiles(latestVersion)
				break;
			case ResetType.Runtimes:
				await installer.installRuntimes()
				break;
			case ResetType.Prefix:
				await installer.configurePrefix()
				break;
		}
	} catch (err) {
		toastMessage.set({
			message: `Error: ${err}`,
			autohide: false,
			background: "variant-filled-error"
		})
		
	}
	installing.set(false)
	autoSetButtonStatus()
}
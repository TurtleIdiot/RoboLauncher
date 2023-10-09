import { localStorageStore, type ToastSettings } from '@skeletonlabs/skeleton';

import { writable } from 'svelte/store';
import type { Writable } from "svelte/store";
import { defaultValues } from './config';

interface IButtonStatus {
	enabled: boolean,
	text: string,
	showOtherOptions: boolean,
	actionType: ActionType
}

export enum ActionType {
	Configure = 0,
	Play = 1,
	Cancel = 2
}

function createCounter() {
	const { subscribe, set, update } = writable({
		step: 0,
		total: 0,
		description: ""
	})
	return {
		subscribe,
		step: (desc: string) => update((n) => {
			n.step = n.step + 1
			n.description = desc
			return n
		}),
		setTotal: (total: number) => update((n) => {
			n.total = total
			return n
		}),
		reset: () => set({ step: 0, total: 0, description: "" })
	}
}

function createButtonStatus() {
	const { subscribe, set, update }: Writable<IButtonStatus> = writable({
		enabled: false,
		text: "Install",
		showOtherOptions: true,
		actionType: 0,
	})
	return {
		subscribe,
		set,
		setEnabled: (enabled: boolean) => update((n) => {
			n.enabled = enabled
			return n
		}),
		setText: (newtext: string) => update((n) => {
			n.text = newtext
			return n
		}),
		setOtherOptionsEnabled: (enabled: boolean) => update((n) => {
			n.showOtherOptions = enabled
			return n
		}),
		setActionType: (actiontype: ActionType) => update((n) => {
			n.actionType = actiontype
			return n
		}),
		reset: () => set({
			enabled: false,
			text: "Install",
			showOtherOptions: true,
			actionType: 0
		})
	}
}

export const disclaimerStore: Writable<boolean> = localStorageStore("disclaimerAccepted", false)

export const installDir: Writable<string> = localStorageStore("installDir", "")

export const settings: Writable<object> = localStorageStore("settings", defaultValues)

export const stepCounter = createCounter()

// 0: no progress bar, 1: use PROGRESS ipc signal, 2: indeterminate
export const progressBarStatus: Writable<number> = writable(0)

export const buttonStatus = createButtonStatus()

export const installing: Writable<boolean> = writable(false)

export const toastMessage: Writable<ToastSettings> = writable({ message: "" })
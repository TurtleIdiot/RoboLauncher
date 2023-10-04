import { localStorageStore } from '@skeletonlabs/skeleton';

import type { Writable } from "svelte/store";

export const disclaimerStore: Writable<boolean> = localStorageStore("disclaimerAccepted", false)

export const installDir: Writable<string> = localStorageStore("installDir", "")

export const settings: Writable<string> = localStorageStore("settings", "")
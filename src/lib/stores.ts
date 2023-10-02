import { localStorageStore } from '@skeletonlabs/skeleton';

import type { Writable } from "svelte/store";
import { boolean } from 'zod';

export const disclaimerStore: Writable<boolean> = localStorageStore("disclaimerAccepted", false)
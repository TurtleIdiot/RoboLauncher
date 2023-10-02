import { redirect } from "@sveltejs/kit";

import { get } from "svelte/store";
import { disclaimerStore } from "$lib/stores";

export function load() {
    if (!get(disclaimerStore)) {
        throw redirect(307, "/disclaimer")
    }
}

export const prerender = true;
export const ssr = false;
export const csr = true;
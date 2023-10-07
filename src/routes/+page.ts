export const prerender = false;
export const ssr = false;
export const csr = true;

import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation";

import { get } from "svelte/store";
import { disclaimerStore, buttonStatus } from "$lib/stores";
import { validateInstall, getLatestVersion } from "$lib/installvalidator";
import { autoSetButtonStatus } from "$lib/dispatcher";

export async function load() {
    if (!get(disclaimerStore)) {
        throw redirect(307, "/disclaimer")
    }

	let [ validationData, errMessage ] = await validateInstall();

	await autoSetButtonStatus(validationData)
	let latestVersion = await getLatestVersion()

	return { validationData, errMessage, latestVersion }
}
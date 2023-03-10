<script>
    import LaunchPanel from "$lib/LaunchPanel.svelte";
    import { onMount } from "svelte";
    import { goto } from '$app/navigation';

    if (localStorage.getItem("disclaimerAccepted") !== "true") goto("/disclaimer", { replaceState: true })
    let dirSet = (localStorage.getItem("installDir") !== null)
    let errormsg = null;
    let infomsg = null;
    onMount(() => {
        infomsg = null;
        errormsg = null
    })
</script>

<div class="flex flex-col mx-2 my-2 h-full">
    <h1 class="text-center text-white text-7xl my-2"><strong>RoboLauncher</strong></h1>
    <h1 class="w-fit mx-auto text-white text-xl mb-16">The (unofficial) robocraft linux launcher</h1>
    
    <div class="w-fit mx-auto">
        <LaunchPanel
            on:error={(event) => {errormsg = event.detail; setTimeout(() => {errormsg = null}, 10000)}}
            on:warning={(event) => {infomsg = event.detail; setTimeout(() => {infomsg = null}, 10000)}}/>
    </div>
</div>

{#if !dirSet || infomsg !== null}
    <div>
        <div class="alert alert-warning shadow-lg fixed {errormsg !== null ? "bottom-20": "bottom-0"}">
            <div>
                <!-- fontawesome solid triangle exclamation -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
                <span>{!dirSet ? "You do not have an install directory set" : infomsg}</span>
            </div>
            <div class="flex-none">
                {#if !dirSet}
                    <a class="btn btn-sm" href="settings">OPEN SETTINGS</a>
                {:else if infomsg !== null}
                    <button class="btn btn-sm" on:click={() => {infomsg = null}}>CLOSE</button>
                {/if}
            </div>
        </div>
    </div>
{/if}

{#if errormsg !== null}
    <div>
        <div class="alert alert-error shadow-lg fixed bottom-2">
            <div>
                <!-- fontawesome solid triangle exclamation -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg>
                <span>{errormsg}</span>
            </div>
            <div class="flex-none">
                <button class="btn btn-sm" on:click={() => {errormsg = null}}>CLOSE</button>
            </div>
        </div>
    </div>
{/if}


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
    <h1 class="text-center text-7xl my-2"><strong>RoboLauncher</strong></h1>
    <h1 class="w-fit mx-auto text-xl mb-16">The (unofficial) robocraft linux launcher</h1>
    
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
                <i class="fa-solid fa-triangle-exclamation"></i>
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
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{errormsg}</span>
            </div>
            <div class="flex-none">
                <button class="btn btn-sm" on:click={() => {errormsg = null}}>CLOSE</button>
            </div>
        </div>
    </div>
{/if}


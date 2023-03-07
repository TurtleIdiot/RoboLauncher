<script>
    import { createEventDispatcher } from 'svelte';
    import { checkInstall, checkInstallDir, getLatestVersion } from "./installchecker";
    import { createActionSet } from "./actions";
    import { invoke } from '@tauri-apps/api';
    import { appWindow } from '@tauri-apps/api/window';

    const dispatch = createEventDispatcher();
    let installDir = localStorage.getItem("installDir")

    let primaryBtnEnabled = false;
    let buttontext = "Loading...";
    let running = false;
    let installing = false;
    let installDirValid = false;
    let status = {
        valid: {
            prefix: false,
            gameInstall: false,
            gameVerification: false,
            runtime: false
        },
        gameVersion: null
    };
    let latest = null;

    let step = { current: 0, total: 0 }
    let download_running = false;
    let progress = 0;
    let speed = 0;

    $: primaryBtnEnabled = !(running || installing);

    appWindow.listen("PROGRESS", ({event, payload}) => {
        progress = payload.percentage
        speed = Math.floor(payload.transfer_rate / 100000) /10
    })

    function handleRunError(err) {
        dispatch("error", err)
        running = false
        installing = false
    }
    function reinstall_game() {
        launch({ valid: { prefix: true, gameInstall: false, gameVerification: false, runtime: true }})
    }
    function reinstall_runtimes() {
        launch({ valid: { prefix: true, gameInstall: true, gameVerification: true, runtime: false }})
    }
    function recreate_prefix() {
        if (!status.valid.runtime) handleRunError("Runtimes not installed or inaccessible. Please ensure runtimes are installed before recreating the prefix")
        launch({ valid: { prefix: false, gameInstall: true, gameVerification: true, runtime: true }})
    }
    function verify_files() {
        if (!status.valid.runtime) handleRunError("Game not installed or inaccessible. Install the game first")
        launch({ valid: { prefix: true, gameInstall: true, gameVerification: false, runtime: true }, version: status.gameVersion})
    }

    async function launch(override) {
        buttontext = "Running..."
        let [o_valid, o_ver] = [null, null]
        if (override) {
            o_valid = override.valid
            o_ver = override.version
        }
        // @ts-ignore
        let [isInstall, actions] = await createActionSet(installDir, ( o_valid ? o_valid : status.valid ), ( o_ver ? o_ver : latest ))
        let allVerified = true;
        let unverified = "";
        if (isInstall) {
            installing = true
        } else {
            running = true
        }
        step = { current: 0, total: actions.length, desc: "" }
        if (localStorage.getItem("freshInstall") === "1") localStorage.removeItem("freshInstall")
        // @ts-ignore
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i]
            
            step.desc = action.desc
            download_running = false
            if (action.awaitProgress){
                download_running = true;
                progress = 0;
                speed = 0;
                await action.action(installDir, action.args)
                    .catch(handleRunError)
                const unlisten = await appWindow.once("FINISH", ({event, payload}) => {
                }); unlisten()
                download_running = false;
            } else {
                let res = await action.action(installDir, action.args)
                    .catch(handleRunError)
                if (action.isHashAction) {
                    if (!res) {
                        allVerified = false
                        unverified = action.args.path
                        break
                    }
                }
            }
            step.current = step.current + 1
            if (!installing && !running) break
        }
        if (installing) {
            if (allVerified) {
                let success = await invoke("write_file", { path: `${installDir}/gameconfig.json`, data: `{"gameVersion":"${latest}", "verified":true}` })
                    .catch((err) => {dispatch("error", `Error witing gameconfig.json: ${err}`)})
                if (!success) {
                    dispatch("error", `Error writing gameconfig.json. Check permissions and verify again`)
                }
            } else {
                dispatch("error", `File ${unverified} failed verification. Please try verifying again or reinstalling`)
            }
        }

        installing = false
        running = false
        precheck()
    }
    
    async function precheck() {
        latest = await getLatestVersion()
            .catch((err) => dispatch("info", err))
        if (!latest) return

        let [success, err] = await checkInstallDir(installDir);
        // @ts-ignore
        installDirValid = success
        if (!success) {
            if (err) {
                dispatch("warning", err)
            }
            buttontext = "Install"
            primaryBtnEnabled = false
            return
        }
        buttontext = "Install"
        if (localStorage.getItem("freshInstall") === "1") return primaryBtnEnabled = true
        let res = await checkInstall(installDir)
        status.valid = res.valid
        status.gameVersion = res.gameVersion
        if (res.errorMsg) {
            dispatch("warning", res.errorMsg)
        }
        primaryBtnEnabled = res.buttonEnabled
        buttontext = res.buttonText
        if (status.gameVersion !== null) {
            let currentver = status.gameVersion.split(".")
            let latestver = latest.split(".")
            for (let i = 0; i < 3; i++) {
                if (parseInt(latestver[i]) > parseInt(currentver[i])) {
                    buttontext = "Update"
                    status.valid.gameInstall = false
                    status.valid.gameVerification = false
                    break
                }
            }
        }
        console.log("precheck done")
    }
    precheck()
</script>

<div class="flex flex-row w-fit">
    <button class="btn btn-lg btn-wide btn-primary { primaryBtnEnabled ? "" : "btn-disabled"} mr-1"
        on:click={() => {launch().catch(handleRunError)}}>
        {buttontext}
    </button>
    {#if installing}
        <div class="tooltip tooltip-bottom" data-tip="Stop update/install">
            <button class="btn btn-lg btn-outline btn-error ml-1" on:click={() => {installing = false}}>
                <i class="fa-solid fa-x"></i>
            </button>
        </div>
    {:else}
        <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-lg btn-accent { running ? "btn-disabled" : "btn-outline" } ml-1">
                <i class="fa-solid fa-ellipsis-vertical" />
            </label>
            <ul tabindex="0" class="dropdown-content menu mt-1 p-2 shadow bg-base-200 rounded-box w-52">
              <li><a href="settings" on:click={()=>{dispatch("error",null)}}>Settings</a></li>
              <li><button on:click={reinstall_game}>Reinstall game</button></li>
              <li><button on:click={reinstall_runtimes}>Reinstall runtimes</button></li>
              <li><button on:click={recreate_prefix}>Reset wine prefix</button></li>
              <li><button on:click={verify_files}>Verify files</button></li>
            </ul>
        </div>
    {/if}
</div>

<div class="flex flex-row w-full justify-between">
    <p>Current: { status.gameVersion === null ? "n/a" : status.gameVersion }</p>
    <p>Latest: { latest ? latest : "..."}</p>
</div>

{#if installDir !== null}<p class="">Install folder: {installDir}</p>{/if}

{#if installing}
    <progress class="progress progress-secondary w-full" value="{step.current}" max="{step.total}"></progress>
    <p>{step.current}/{step.total}</p>
    <p class="truncate w-72">{step.desc}</p>
    {#if download_running}
        <progress class="progress progress-secondary w-full" value="{progress}" max="100" />
        <div class="flex flex-row w-full justify-between">
            <p>{progress}%</p>
            <p>{speed} MB/s</p>
        </div>
    {/if}
{/if}
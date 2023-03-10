<script>
    import { open } from "@tauri-apps/api/dialog";

    let directory = "";
    let configDir = localStorage.getItem("installDir")
    if (configDir !== null) directory = configDir
    let config
    if (localStorage.getItem("prefs") !== null) {
        config = JSON.parse(localStorage.getItem("prefs"))
    } else {
        config = {
            ESYNC: true, FSYNC: true, FSR: false, FSR_STRENGTH: 0, MANGOHUD: false
        }
    }

    async function selectDirectory() {
        let selected = await open({
            multiple: false,
            directory: true
        })
        // @ts-ignore
        if (selected !== null) directory = selected
    }

    function save() {
        if (directory !== "") {
            directory = directory.trim()
            directory = directory.replace(/\/{1}$/g, "")
            if (localStorage.getItem("installDir") != directory) localStorage.setItem("freshInstall", "1")
            localStorage.setItem("installDir", directory)
            localStorage.setItem("prefs", JSON.stringify(config))
        }
    }
</script>

<div class="navbar bg-base-200 mb-2">
    <div class="flex-none">
        <a class="btn btn-square btn-ghost" href="/">
            <!-- fontawesome solid chevron left -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
        </a>
    </div>
    <div class="flex-1 ml-2">
      <h1 class="text-xl">Settings</h1>
    </div>
    <div class="flex-none">
        <button class="btn btn-primary" on:click={save}>
            Save
        </button>
    </div>
</div>

<div class="flex flex-column mx-auto mb-4">
    <div class="flex flex-row w-5/6 mx-auto">
        <div class="form-control w-full mr-2">
            <label class="label"><span class="label-text">Install directory</span></label>
            <input type="text" placeholder="Full directory path here..." class="input input-bordered w-full" bind:value={directory}/>
        </div>
        <div class="tooltip tooltip-right mt-auto" data-tip="Browse">
            <button class="btn" on:click={selectDirectory}>
                <!-- fontawesome folder open solid -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M88.7 223.8L0 375.8V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H416c35.3 0 64 28.7 64 64v32H144c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224H544c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480H32c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z"/></svg>
            </button>
        </div>
    </div>
</div>
<div class="w-5/6 mx-auto">
    <div class="form-control w-1/2">
        <label class="label cursor-pointer">
            <span class="label-text">
                <div class="tooltip tooltip-right" data-tip="Aims to reduce overhead in CPU-intensive games. May improve performance">
                    Enable Esync
                </div>
            </span> 
            <input type="checkbox" class="toggle" bind:checked={config.ESYNC} />
        </label>
    </div>
    <div class="form-control w-1/2">
        <label class="label cursor-pointer">
            <span class="label-text">
                <div class="tooltip tooltip-right" data-tip="Aims to reduce overhead in CPU-intensive games on supported kernels. May improve performance">
                    Enable Fsync
                </div>
            </span> 
            <input type="checkbox" class="toggle" bind:checked={config.FSYNC} />
        </label>
    </div>
    <div class="form-control w-1/2">
        <label class="label cursor-pointer">
            <span class="label-text">
                <div class="tooltip tooltip-right" data-tip="AMD's FSR helps boots framerates by upscaling lower resolutions in fullscreen mode. May improve performance">
                    Enable FSR
                </div>
            </span> 
            <input type="checkbox" class="toggle" bind:checked={config.FSR} />
        </label>
    </div>
    <div class="w-1/2">
        <p class="label-text pl-1 my-1">FSR sharpening strength</p>
        <input type="range" min="0" max="125" bind:value={config.FSR_STRENGTH} class="range mt-1" step="25" />
        <div class="w-full flex justify-between text-xs px-2 mb-1">
            <span>Min</span>
            <span>|</span>
            <span class="ml-2 mr-1">|</span>
            <span class="mr-2 ml-1">|</span>
            <span>|</span>
            <span>Max</span>
        </div>
    </div>
    <div class="form-control w-1/2">
        <label class="label cursor-pointer">
            <span class="label-text">
                <div class="tooltip tooltip-right" data-tip="Enables Mangohud for FPS, CPU usage and GPU usage display. Mangohud needs to be installed separately">
                    Enable Mangohud
                </div>
            </span> 
            <input type="checkbox" class="toggle" bind:checked={config.MANGOHUD} />
        </label>
    </div>
</div>

<a href="https://github.com/TurtleIdiot/RoboLauncher" target="_blank" rel="noreferrer" class="absolute bottom-2 right-2">
    <svg class="fill-white aspect-square w-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
</a>
<script>
    import { exit } from '@tauri-apps/api/process';
    import { goto } from '$app/navigation';
	import { disclaimerStore } from '$lib/stores';

    function acceptDisclaimer() {
        disclaimerStore.set(true)
        goto("/", { replaceState: true })
    }
</script>

<div class="w-2/3 flex flex-col justify-center mx-auto mt-32 card bg-neutral text-neutral-content">
    <header class="card-header">
		<h1 class="h1 text-center"><strong><i>HEY, WAIT UP!</i></strong></h1>
	</header>
	<section class="p-4">
    	<p>This launcher is <strong><i>NOT</i></strong> official!<br/>This is a fan project and while it does aim to be feature-complete and maintained, it is not affiliated with FreeJam or Robocraft 2</p>
    	<p>This launcher is and always will be free and open source. If you paid for this, you got scammed</p>
    	<p>To get the offical launcher or if you're on windows, visit the official site <span><a href="https://www.robocraft2.com/" target="_blank" rel="noreferrer" class="link">here</a></span></p>
    </section>

	<footer class="card-footer flex justify-end">
        <button class="btn" on:click={() => {exit(0)}}>Quit</button>
        <button class="btn variant-filled" on:click={acceptDisclaimer}>OK, I understand</button>
    </footer>
</div>
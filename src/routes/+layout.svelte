<script lang="ts">
	import './styles.css';
	import "$lib/fa/fontawesome.min.js"
	import "$lib/fa/solid.min.js"
	import "$lib/fa/brands.min.js"

	import { initializeStores, Toast, Modal, storePopup, autoModeWatcher } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	initializeStores();
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<svelte:head>{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}</svelte:head>
<Modal />
<Toast />
<slot />
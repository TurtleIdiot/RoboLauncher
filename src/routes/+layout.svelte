<script lang="ts">
	import './styles.css';
	import "$lib/fa/fontawesome.min.js"
	import "$lib/fa/solid.min.js"
	import "$lib/fa/brands.min.js"

	import { initializeStores, Toast, Modal, storePopup } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

	
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
	initializeStores();
</script>

<Modal />
<Toast />
<slot />
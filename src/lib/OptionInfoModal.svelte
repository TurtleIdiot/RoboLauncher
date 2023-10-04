<script lang="ts">

	export let info: [ string, string ][]
	export let title: string

	import { getModalStore } from '@skeletonlabs/skeleton';
	const modalStore = getModalStore();
</script>

{#if $modalStore[0]}
	<div class="modal-example-form card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">{title}</header>
		<article>
			<ul>
				{#each info as [ name, description ]}
					<li class="my-2"><strong>{name}</strong>: {description}</li>
				{/each}
			</ul>
		</article>
		<footer class="modal-footer flex flex-row justify-end">
			<button class="btn variant-filled" on:click={modalStore.close}>Close</button>
		</footer>
	</div>
{/if}
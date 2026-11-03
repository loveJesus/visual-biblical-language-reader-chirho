<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import InformationPageChirho from '$lib/site-chirho/InformationPageChirho.svelte';
	import type { PageData } from './$types';
	let { data: dataChirho }: { data: PageData } = $props();
</script>

<InformationPageChirho idChirho={dataChirho.id_chirho} />

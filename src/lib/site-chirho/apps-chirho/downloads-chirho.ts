// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';

// Set a URL only after its public listing is available. The positions and component stay the same.
export const APP_STORES_CHIRHO: readonly {
	id_chirho: 'apple-chirho' | 'google-chirho';
	name_chirho: string;
	platform_chirho: string;
	url_chirho: string | null;
}[] = [
	{
		id_chirho: 'apple-chirho',
		name_chirho: 'App Store',
		platform_chirho: 'iPhone · iPad',
		url_chirho: null
	},
	{
		id_chirho: 'google-chirho',
		name_chirho: 'Google Play',
		platform_chirho: 'Android',
		url_chirho: null
	}
];
const DOWNLOAD_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		title_chirho: 'Read on your phone or tablet',
		body_chirho:
			'Native apps for iPhone, iPad and Android are on their way. You can use the reader in your browser today.',
		group_chirho: 'Hinneh apps',
		soon_chirho: 'Coming soon',
		download_chirho: 'Download'
	},
	es: {
		title_chirho: 'Lee en tu teléfono o tableta',
		body_chirho:
			'Las aplicaciones nativas para iPhone, iPad y Android están en camino. Ya puedes usar el lector en tu navegador.',
		group_chirho: 'Aplicaciones de Hinneh',
		soon_chirho: 'Próximamente',
		download_chirho: 'Descargar'
	}
});
export function downloadTChirho(keyChirho: keyof typeof DOWNLOAD_MESSAGES_CHIRHO.en) {
	return translateChirho(DOWNLOAD_MESSAGES_CHIRHO, localeStateChirho.currentChirho, keyChirho);
}

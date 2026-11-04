// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';
import { SHARE_IMAGE_PATH_CHIRHO } from '$lib/site-chirho';

export const CONTACT_EMAIL_CHIRHO = 'lovejesus@lovejesus.software';
export const FREE_MINISTRY_URL_CHIRHO = 'https://sellingjesus.org/';
export const SOFTWARE_URL_CHIRHO = 'https://loveJesus.software/';
export const SOURCE_CODE_URL_CHIRHO =
	'https://github.com/loveJesus/visual-biblical-language-reader-chirho';
export const SHARE_PATH_CHIRHO = SHARE_IMAGE_PATH_CHIRHO;
export const SITE_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		title_chirho: 'Hinneh · Behold the Bible in Hebrew and Greek',
		description_chirho:
			'Behold the Bible in its original Hebrew and Greek, word by word. Colors and small symbols show the grammar; pictures and recorded pronunciation help each word come clear.',
		home_chirho: 'Hinneh home',
		reader_chirho: 'Reader',
		about_chirho: 'About',
		sources_chirho: 'Sources',
		privacy_chirho: 'Privacy',
		terms_chirho: 'Terms',
		contact_chirho: 'Contact',
		navigation_chirho: 'Main navigation',
		footer_navigation_chirho: 'Information',
		language_chirho: 'Interface language',
		english_chirho: 'Use English',
		spanish_chirho: 'Usar español',
		mark_chirho: 'Hinneh · “behold”',
		heading_lead_chirho: 'Behold',
		heading_rest_chirho: 'the Bible in the original languages.',
		introduction_chirho:
			'The Word of God, set fully before you in Hebrew and Greek. Colors and small symbols show how each word works; pictures and sound help its meaning come clear as you read.',
		start_chirho: 'Use it here',
		free_chirho: 'Free to use. Freely given.',
		free_reason_chirho: 'Why freely given? · Selling Jesus',
		source_code_chirho: 'Open source · GPLv3 or later',
		learn_chirho: 'How to read with Hinneh',
		scope_chirho: '66 books · Hebrew and Greek · English and Spanish interface · Free, no account',
		prayer_text_chirho: 'Open thou mine eyes, that I may behold wondrous things out of thy law.',
		prayer_version_chirho: 'KJV',
		aids_eyebrow_chirho: 'Helps beside the text',
		aids_title_chirho: 'Colors, symbols, art and sound.',
		toc_chirho: 'On this page',
		art_pending_chirho: 'Imaginative illustration · AI-assisted, awaiting review',
		art_label_chirho: 'Imaginative illustration · AI-assisted',
		art_open_chirho: 'Read this verse',
		footer_chirho:
			'A free Christian project to help readers behold Scripture in its original languages.',
		updated_chirho: 'Updated November 3, 2026',
		back_chirho: 'Open the reader',
		contact_note_chirho: 'Questions, corrections or privacy requests',
		skip_chirho: 'Skip to content'
	},
	es: {
		title_chirho: 'Hinneh · He aquí la Biblia en hebreo y griego',
		description_chirho:
			'Contempla la Biblia en su hebreo y griego originales, palabra por palabra. Colores y pequeños símbolos muestran la gramática; imágenes y pronunciación grabada ayudan a que cada palabra se aclare.',
		home_chirho: 'Inicio de Hinneh',
		reader_chirho: 'Lector',
		about_chirho: 'Acerca de',
		sources_chirho: 'Fuentes',
		privacy_chirho: 'Privacidad',
		terms_chirho: 'Condiciones',
		contact_chirho: 'Contacto',
		navigation_chirho: 'Navegación principal',
		footer_navigation_chirho: 'Información',
		language_chirho: 'Idioma de la interfaz',
		english_chirho: 'Use English',
		spanish_chirho: 'Usar español',
		mark_chirho: 'Hinneh · «he aquí»',
		heading_lead_chirho: 'He aquí',
		heading_rest_chirho: 'la Biblia en sus idiomas originales.',
		introduction_chirho:
			'La Palabra de Dios, plenamente delante de ti en hebreo y griego. Colores y pequeños símbolos muestran cómo funciona cada palabra; imágenes y sonido ayudan a que su sentido se aclare mientras lees.',
		start_chirho: 'Úsalo aquí',
		free_chirho: 'De uso gratuito. Dado gratuitamente.',
		free_reason_chirho: '¿Por qué dar gratuitamente? · Selling Jesus',
		source_code_chirho: 'Código abierto · GPLv3 o posterior',
		learn_chirho: 'Cómo leer con Hinneh',
		scope_chirho: '66 libros · Hebreo y griego · Interfaz en inglés y español · Gratis, sin cuenta',
		prayer_text_chirho: 'Abre mis ojos, y miraré las maravillas de tu ley.',
		prayer_version_chirho: 'RV 1909',
		aids_eyebrow_chirho: 'Ayudas junto al texto',
		aids_title_chirho: 'Colores, símbolos, arte y sonido.',
		toc_chirho: 'En esta página',
		art_pending_chirho: 'Ilustración imaginativa · Con ayuda de IA, pendiente de revisión',
		art_label_chirho: 'Ilustración imaginativa · Con ayuda de IA',
		art_open_chirho: 'Leer este versículo',
		footer_chirho:
			'Un proyecto cristiano gratuito para ayudar a contemplar las Escrituras en sus idiomas originales.',
		updated_chirho: 'Actualizado el 3 de noviembre de 2026',
		back_chirho: 'Abrir el lector',
		contact_note_chirho: 'Preguntas, correcciones o solicitudes de privacidad',
		skip_chirho: 'Saltar al contenido'
	}
});
export function siteTChirho(keyChirho: keyof typeof SITE_MESSAGES_CHIRHO.en) {
	return translateChirho(SITE_MESSAGES_CHIRHO, localeStateChirho.currentChirho, keyChirho);
}
export interface InformationSectionChirho {
	title_chirho: string;
	paragraphs_chirho: readonly string[];
	links_chirho?: readonly { label_chirho: string; href_chirho: string }[];
}
export interface InformationPageChirho {
	title_chirho: string;
	// Optional display eyebrow and heading; the page title remains the browser and share title.
	eyebrow_chirho?: string;
	heading_chirho?: string;
	description_chirho: string;
	lead_chirho: string;
	sections_chirho: readonly InformationSectionChirho[];
}
const PROJECT_LICENSES_CHIRHO: Record<LocaleChirho, InformationSectionChirho> = {
	en: {
		title_chirho: 'Free software and shared media',
		paragraphs_chirho: [
			'Hinneh’s original application and native-app code is open source under the GNU General Public License, version 3 or any later version. You may study, share and improve it under that license.',
			'Hinneh-created illustrations, word pictures and branding artwork are dedicated to the public domain under CC0 1.0 Universal, to the extent of the rights we hold. You may copy, adapt and share them, including commercially, without permission or required attribution. Credit is welcome, but optional.',
			'The rights we hold in our pronunciation recordings are shared under Creative Commons Attribution 4.0. Credit “Hinneh — L.J. (Love Jesus), https://hinneh.us/”, link that license and indicate changes when reusing recordings.',
			'The Bible texts, source data and adapted grammar help retain their own terms. The artwork dedication and recording license cover only rights we hold; they do not grant rights to an underlying voice model or another person’s identity. Public-domain material remains public domain.'
		],
		links_chirho: [
			{ label_chirho: 'Source code on GitHub', href_chirho: SOURCE_CODE_URL_CHIRHO },
			{ label_chirho: 'GPLv3 or later', href_chirho: 'https://www.gnu.org/licenses/gpl-3.0.html' },
			{
				label_chirho: 'Artwork: CC0 1.0',
				href_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
			},
			{
				label_chirho: 'Recordings: CC BY 4.0',
				href_chirho: 'https://creativecommons.org/licenses/by/4.0/'
			}
		]
	},
	es: {
		title_chirho: 'Software libre y archivos compartidos',
		paragraphs_chirho: [
			'El código original de Hinneh y sus aplicaciones nativas es abierto bajo la Licencia Pública General de GNU, versión 3 o cualquier versión posterior. Puedes estudiarlo, compartirlo y mejorarlo conforme a esa licencia.',
			'Las ilustraciones, imágenes de palabras y obras de identidad visual creadas para Hinneh se dedican al dominio público bajo CC0 1.0 Universal, hasta donde permiten nuestros derechos. Puedes copiarlas, adaptarlas y compartirlas, incluso comercialmente, sin permiso ni atribución obligatoria. Se agradece el crédito, pero es opcional.',
			'Los derechos que poseemos sobre las grabaciones de pronunciación se comparten bajo Creative Commons Atribución 4.0. Acredita «Hinneh — L.J. (Love Jesus), https://hinneh.us/», enlaza esa licencia e indica los cambios al reutilizar grabaciones.',
			'Los textos bíblicos, datos y ayudas gramaticales adaptadas conservan sus propias condiciones. La dedicación de las obras y la licencia de grabaciones cubren solo nuestros derechos; no conceden derechos sobre el modelo de voz ni sobre la identidad de otra persona. El material de dominio público sigue siendo de dominio público.'
		],
		links_chirho: [
			{ label_chirho: 'Código fuente en GitHub', href_chirho: SOURCE_CODE_URL_CHIRHO },
			{
				label_chirho: 'GPLv3 o posterior',
				href_chirho: 'https://www.gnu.org/licenses/gpl-3.0.html'
			},
			{
				label_chirho: 'Ilustraciones: CC0 1.0',
				href_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
			},
			{
				label_chirho: 'Grabaciones: CC BY 4.0',
				href_chirho: 'https://creativecommons.org/licenses/by/4.0/'
			}
		]
	}
};
type PageLocalesChirho = Record<LocaleChirho, InformationPageChirho>;
export const INFORMATION_PAGES_CHIRHO = {
	'about-chirho': {
		en: {
			title_chirho: 'About Hinneh',
			eyebrow_chirho: 'About Hinneh',
			heading_chirho: 'See Scripture more clearly, word by word.',
			description_chirho:
				'How Hinneh helps you read the Bible in Hebrew and Greek: colors and symbols for grammar, word pictures, pronunciation and word meanings.',
			lead_chirho:
				'The Bible is the treasure. Hinneh sets its Hebrew and Greek before you and helps you notice how each word is built, what it means and how it sounds.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.en,
				{
					title_chirho: 'Why Hinneh exists',
					paragraphs_chirho: [
						'Hinneh is a free, independent Christian project by L.J. (Love Jesus). Our desire is to help people read Scripture closely, understand it and know Jesus Christ.',
						'You do not need an account, a purchase or a language course to begin. Open a verse, take your time and look closer.'
					]
				},
				{
					title_chirho: 'Freely received, freely given',
					paragraphs_chirho: [
						'The reader, grammar helps, word pictures and available recordings are free to use. No account or subscription is required. We offer this work freely to help people read Scripture and know Jesus Christ.'
					],
					links_chirho: [
						{
							label_chirho: 'Selling Jesus · Why ministry should be freely given',
							href_chirho: FREE_MINISTRY_URL_CHIRHO
						}
					]
				},
				{
					title_chirho: 'Built on shared work',
					paragraphs_chirho: [
						'The text, morphology, word meanings and grammar notes come from carefully attributed published work. Each passage carries its own sources and notes, and the Sources page credits the people and projects behind them.'
					]
				}
			]
		},
		es: {
			title_chirho: 'Acerca de Hinneh',
			eyebrow_chirho: 'Acerca de Hinneh',
			heading_chirho: 'Ver las Escrituras con más claridad, palabra por palabra.',
			description_chirho:
				'Cómo Hinneh te ayuda a leer la Biblia en hebreo y griego: colores y símbolos para la gramática, imágenes de palabras, pronunciación y significados.',
			lead_chirho:
				'La Biblia es el tesoro. Hinneh pone delante de ti su hebreo y su griego, y te ayuda a notar cómo se forma cada palabra, qué significa y cómo suena.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.es,
				{
					title_chirho: 'Por qué existe Hinneh',
					paragraphs_chirho: [
						'Hinneh es un proyecto cristiano gratuito e independiente de L.J. (Love Jesus). Deseamos ayudar a las personas a leer las Escrituras con atención, entenderlas y conocer a Jesucristo.',
						'No necesitas una cuenta, una compra ni un curso de idiomas para empezar. Abre un versículo, tómate tu tiempo y mira más de cerca.'
					]
				},
				{
					title_chirho: 'De gracia recibimos, de gracia damos',
					paragraphs_chirho: [
						'El lector, las ayudas gramaticales, las imágenes y las grabaciones disponibles son de uso gratuito. No necesitas una cuenta ni una suscripción. Ofrecemos este trabajo gratuitamente para ayudar a leer las Escrituras y conocer a Jesucristo.'
					],
					links_chirho: [
						{
							label_chirho: 'Selling Jesus · Por qué el ministerio debe darse gratuitamente',
							href_chirho: FREE_MINISTRY_URL_CHIRHO
						}
					]
				},
				{
					title_chirho: 'Gracias al trabajo compartido',
					paragraphs_chirho: [
						'El texto, la morfología, los significados de las palabras y las notas gramaticales proceden de obras publicadas y atribuidas con cuidado. Cada pasaje incluye sus fuentes y notas, y la página Fuentes reconoce a las personas y proyectos que lo hacen posible.'
					]
				}
			]
		}
	},
	'privacy-chirho': {
		en: {
			title_chirho: 'Privacy',
			description_chirho:
				'How Hinneh handles reading preferences, web requests and illustration reports.',
			lead_chirho: 'Read without an account. Keep the information we ask for small.',
			sections_chirho: [
				{
					title_chirho: 'Reading and preferences',
					paragraphs_chirho: [
						'The reader does not require registration. It does not include an advertising or behavioral-analytics SDK.',
						'Your browser stores choices such as interface language, Greek rendition and illustration preference. These preferences stay in browser storage; clearing this site’s browser data removes them. The selected passage and language may also appear in a shared link.',
						'The iOS app stores language and pronunciation preferences on your device and restores the last passage locally. Downloaded resources may remain in a bounded device cache, and playback uses temporary verified audio files. These local preferences and files are not uploaded. The app does not record your voice or request new speech generation. Deleting the app removes its local data.'
					]
				},
				{
					title_chirho: 'Hosting and media',
					paragraphs_chirho: [
						'Cloudflare delivers the website and media. Loading a page or recording sends normal connection information, including your IP address and the requested URL, to the hosting provider. Cloudflare may process request and security information under its own policies.',
						'Security-event records can retain IP addresses and requested paths after a request ends. Retention varies by Cloudflare service and plan. These records support security and abuse prevention; Hinneh does not use them for advertising or to build personal reading profiles.',
						'Playing a saved recording requests an existing media file. It does not send your reading to a speech-generation provider or create a new paid recording. A device-voice fallback, where offered, uses the matching local device voice.'
					],
					links_chirho: [
						{
							label_chirho: 'Cloudflare privacy policy',
							href_chirho: 'https://www.cloudflare.com/privacypolicy/'
						}
					]
				},
				{
					title_chirho: 'Illustration reports',
					paragraphs_chirho: [
						'An illustration report contains the image identity, verse, selected issue and time. We do not ask for your name, email or a free-text message in that form. Reports are kept privately for review and duplicate prevention; there is no fixed automatic deletion period.',
						'Cloudflare Turnstile checks the report before it is accepted. A verification token is sent to Cloudflare and is not kept in the illustration report. A temporary rate-limit key derived from the connection’s IP address helps prevent abuse; the report itself does not store that IP address. The hosting and challenge providers may still process connection information.'
					],
					links_chirho: [
						{
							label_chirho: 'Cloudflare Turnstile privacy addendum',
							href_chirho: 'https://www.cloudflare.com/turnstile-privacy-policy/'
						}
					]
				},
				{
					title_chirho: 'External links and questions',
					paragraphs_chirho: [
						'Lexicon pages, source projects and other linked sites have their own privacy practices. Following a link opens that service; it is not part of Hinneh’s local reading preferences.',
						'For privacy questions or requests, contact L.J. using the email below. Please do not include sensitive personal information in an illustration report.'
					]
				}
			]
		},
		es: {
			title_chirho: 'Privacidad',
			description_chirho:
				'Cómo gestiona Hinneh las preferencias, las solicitudes web y los informes de ilustraciones.',
			lead_chirho: 'Lee sin una cuenta. Pedimos la menor información posible.',
			sections_chirho: [
				{
					title_chirho: 'Lectura y preferencias',
					paragraphs_chirho: [
						'El lector no requiere registro. No incluye un SDK de publicidad ni de análisis del comportamiento.',
						'Tu navegador guarda opciones como el idioma, la variante griega y la preferencia de ilustraciones. Permanecen en el almacenamiento del navegador; al borrar los datos de este sitio se eliminan. El pasaje y el idioma también pueden aparecer en un enlace compartido.',
						'La aplicación de iOS guarda en tu dispositivo las preferencias de idioma y pronunciación, y restaura localmente el último pasaje. Los recursos descargados pueden permanecer en una caché limitada; la reproducción usa archivos de audio temporales y verificados. Estas preferencias y archivos locales no se suben al servidor. La aplicación no graba tu voz ni solicita nuevas grabaciones sintetizadas. Al eliminar la aplicación se borran sus datos locales.'
					]
				},
				{
					title_chirho: 'Alojamiento y archivos',
					paragraphs_chirho: [
						'Cloudflare distribuye el sitio y sus archivos. Al cargar una página o grabación se envía al proveedor información normal de conexión, incluida la dirección IP y la URL solicitada. Cloudflare puede procesar información de solicitudes y seguridad según sus políticas.',
						'Los registros de eventos de seguridad pueden conservar direcciones IP y rutas solicitadas después de finalizar la petición. La conservación varía según el servicio y el plan de Cloudflare. Estos registros sirven para la seguridad y la prevención de abusos; Hinneh no los usa para publicidad ni para crear perfiles personales de lectura.',
						'Reproducir una grabación guardada solicita un archivo existente. No envía tu lectura a un proveedor de síntesis ni crea una grabación de pago. Cuando se ofrece una voz del dispositivo como alternativa, se usa una voz local del idioma correspondiente.'
					],
					links_chirho: [
						{
							label_chirho: 'Política de privacidad de Cloudflare',
							href_chirho: 'https://www.cloudflare.com/privacypolicy/'
						}
					]
				},
				{
					title_chirho: 'Informes de ilustraciones',
					paragraphs_chirho: [
						'Un informe contiene la identidad de la imagen, el versículo, el problema elegido y la hora. El formulario no pide tu nombre, correo ni un mensaje libre. Los informes se conservan de forma privada para revisarlos y evitar duplicados; no hay un plazo fijo de borrado automático.',
						'Cloudflare Turnstile verifica el informe antes de aceptarlo. El token se envía a Cloudflare y no se guarda en el informe. Una clave temporal derivada de la IP limita el abuso; el informe no almacena la IP. Los proveedores de alojamiento y verificación pueden procesar información de conexión.'
					],
					links_chirho: [
						{
							label_chirho: 'Anexo de privacidad de Cloudflare Turnstile',
							href_chirho: 'https://www.cloudflare.com/turnstile-privacy-policy/'
						}
					]
				},
				{
					title_chirho: 'Enlaces externos y consultas',
					paragraphs_chirho: [
						'Los léxicos, proyectos de fuentes y demás sitios enlazados tienen sus propias prácticas de privacidad. Al seguir un enlace accedes a ese servicio.',
						'Para consultas o solicitudes de privacidad, escribe a L.J. mediante el correo que aparece abajo. No incluyas información personal sensible en un informe de ilustración.'
					]
				}
			]
		}
	},
	'terms-chirho': {
		en: {
			title_chirho: 'Terms of use',
			description_chirho:
				'Using Hinneh responsibly and respecting the rights of its source materials.',
			lead_chirho: 'Hinneh is offered freely for reading, learning and teaching.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.en,
				{
					title_chirho: 'Using the reader',
					paragraphs_chirho: [
						'You may use Hinneh to read and study Scripture. No account or purchase is required for the current reader.',
						'Use the service responsibly. Do not disrupt it, bypass access controls or rate limits, submit abusive or automated reports, or attempt to access private data.'
					]
				},
				{
					title_chirho: 'Text, data and media rights',
					paragraphs_chirho: [
						'Source texts, linguistic data, glosses, artwork and audio can have different rights and licenses. Consult the Sources page and each passage’s source records before redistributing material.',
						'These terms do not restrict rights already granted by a source’s license or public-domain status. They do not grant one blanket license to every image, recording or other item in Hinneh. Preserve required attributions and notices.'
					]
				},
				{
					title_chirho: 'Learning aids and corrections',
					paragraphs_chirho: [
						'Grammar cues, meanings, illustrations and pronunciation are study aids. AI-generated media and draft analyses can be wrong. Check important questions against the original text and reliable language resources.',
						'The service is provided as available. Content and features may be corrected, replaced or removed. Uninterrupted access and the accuracy of every interpretation or recording are not guaranteed. An illustration report requests review; it does not promise a replacement or a completion date.'
					]
				},
				{
					title_chirho: 'Changes and contact',
					paragraphs_chirho: [
						'This page may be updated as the service changes. The date above identifies this version. Questions about use, corrections or source rights can be sent to L.J. at the address below.'
					]
				}
			]
		},
		es: {
			title_chirho: 'Condiciones de uso',
			description_chirho:
				'Usar Hinneh de forma responsable y respetar los derechos de sus fuentes.',
			lead_chirho: 'Hinneh se ofrece gratuitamente para leer, aprender y enseñar.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.es,
				{
					title_chirho: 'Uso del lector',
					paragraphs_chirho: [
						'Puedes utilizar Hinneh para leer y estudiar las Escrituras. El lector actual no requiere cuenta ni compra.',
						'Usa el servicio de forma responsable. No lo interrumpas, eludas controles o límites, envíes informes abusivos o automáticos ni intentes acceder a datos privados.'
					]
				},
				{
					title_chirho: 'Derechos de textos, datos y archivos',
					paragraphs_chirho: [
						'Los textos, datos lingüísticos, glosas, ilustraciones y audios pueden tener derechos y licencias distintos. Consulta Fuentes y los registros de cada pasaje antes de redistribuir material.',
						'Estas condiciones no restringen derechos ya concedidos por una licencia o por el dominio público. Tampoco conceden una licencia única para todas las imágenes, grabaciones u otros elementos de Hinneh. Conserva las atribuciones y avisos exigidos.'
					]
				},
				{
					title_chirho: 'Ayudas y correcciones',
					paragraphs_chirho: [
						'Las marcas gramaticales, significados, ilustraciones y pronunciaciones son ayudas de estudio. Los archivos generados por IA y los análisis provisionales pueden contener errores. Comprueba las cuestiones importantes con el texto original y recursos lingüísticos fiables.',
						'El servicio se ofrece según su disponibilidad. Su contenido y funciones pueden corregirse, sustituirse o retirarse. No se garantiza el acceso ininterrumpido ni la exactitud de cada interpretación o grabación. Un informe de ilustración solicita revisión; no promete una sustitución ni una fecha.'
					]
				},
				{
					title_chirho: 'Cambios y contacto',
					paragraphs_chirho: [
						'Esta página puede actualizarse cuando cambie el servicio. La fecha indica esta versión. Envía a L.J. las preguntas sobre uso, correcciones o derechos mediante el correo que aparece abajo.'
					]
				}
			]
		}
	},
	'sources-chirho': {
		en: {
			title_chirho: 'Sources and credits',
			description_chirho: 'The text editions, language data and published resources behind Hinneh.',
			lead_chirho: 'The words come first. Their sources stay visible.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.en,
				{
					title_chirho: 'Hebrew text and morphology',
					paragraphs_chirho: [
						'Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb',
						'The WLC Hebrew text is public domain. OSHB lemmas and morphology are CC BY 4.0. Adapted here: source XML is converted to verse and token records, teaching cues and visual reading aids; original source text is retained. No endorsement is implied.',
						'Hebrew lexical files credit the Open Scriptures Hebrew Bible Project under CC BY 4.0. Exact revisions, hashes, adaptations and source cautions appear with each passage.'
					],
					links_chirho: [
						{
							label_chirho: 'Open Scriptures Hebrew Bible',
							href_chirho: 'https://github.com/openscriptures/morphhb'
						},
						{
							label_chirho: 'Hebrew Lexicon',
							href_chirho: 'https://github.com/openscriptures/HebrewLexicon'
						},
						{
							label_chirho: 'CC BY 4.0',
							href_chirho: 'https://creativecommons.org/licenses/by/4.0/'
						}
					]
				},
				{
					title_chirho: 'Greek text and meanings',
					paragraphs_chirho: [
						'The New Testament reader uses the public-domain Nestle 1904 text through biblicalhumanities.org. Its morphological analysis and lemmas are dedicated under CC0 by Ulrik Sandborg-Petersen and biblicalhumanities.org.',
						'English Greek-word meanings come from Berean Interlinear Bible glosses, via biblicalhumanities.org, where the extraction is stated to be public domain. This is provenance, not Global Bible Tools approval. Edition-specific passages and withheld glosses remain noted.'
					],
					links_chirho: [
						{
							label_chirho: 'Nestle 1904 source and glosses',
							href_chirho: 'https://github.com/biblicalhumanities/Nestle1904'
						},
						{
							label_chirho: 'Berean terms',
							href_chirho: 'https://berean.bible/terms.htm'
						}
					]
				},
				{
					title_chirho: 'Reviewed gloss exports',
					paragraphs_chirho: [
						'Approved Global Bible Tools exports supply English Old Testament and available Spanish word meanings. GBT dedicates these layers under CC0 in its published attribution statement. The data repository does not carry a separate LICENSE file.',
						'English New Testament permission-only GBT glosses are not imported. Missing approved meanings remain missing; a word gloss is not a full-verse translation.'
					],
					links_chirho: [
						{
							label_chirho: 'Global Bible Tools data',
							href_chirho: 'https://github.com/globalbibletools/data'
						},
						{
							label_chirho: 'CC0 1.0',
							href_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
						}
					]
				},
				{
					title_chirho: 'Grammar, illustrations and audio',
					paragraphs_chirho: [
						'Hebrew grammar help draws on unfoldingWord Hebrew Grammar. Adapted help text is credited to unfoldingWord under CC BY-SA 4.0; the compact cue layout is Hinneh’s teaching convention.',
						'Optional IPA guides reuse the Hebrew pronunciation analysis and the chosen Greek teaching convention. Hebrew syllable analysis uses HavarotJS by Charles Loder (MIT). Greek sounds follow the cited pronunciation references; these are word-level teaching transcriptions, not a reconstruction of ancient pitch.',
						'Verse scenes and word pictures are AI-assisted and retain their review labels. Pronunciation clips are AI-generated study aids, with profile, source binding and review information retained. A fluent voice or attractive image does not certify linguistic accuracy.'
					],
					links_chirho: [
						{
							label_chirho: 'unfoldingWord Hebrew Grammar',
							href_chirho: 'https://uhg.readthedocs.io/en/stable/'
						},
						{
							label_chirho: 'CC BY-SA 4.0',
							href_chirho: 'https://creativecommons.org/licenses/by-sa/4.0/'
						},
						{
							label_chirho: 'HavarotJS · MIT',
							href_chirho: 'https://github.com/charlesLoder/havarotjs'
						},
						{
							label_chirho: 'Greek pronunciation rules / Κανόνες προφοράς',
							href_chirho: 'https://blogs.sch.gr/4dimgala/kanones-proforas-tis-ellinikis-glossas/'
						},
						{
							label_chirho: 'Greek breathing marks',
							href_chirho: 'https://dcc.dickinson.edu/grammar/age/breathing-marks'
						}
					]
				}
			]
		},
		es: {
			title_chirho: 'Fuentes y créditos',
			description_chirho:
				'Las ediciones, datos lingüísticos y recursos publicados que utiliza Hinneh.',
			lead_chirho: 'Las palabras primero. Sus fuentes siempre visibles.',
			sections_chirho: [
				PROJECT_LICENSES_CHIRHO.es,
				{
					title_chirho: 'Texto y morfología hebreos',
					paragraphs_chirho: [
						'Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb',
						'El texto hebreo WLC es de dominio público. Los lemas y la morfología de OSHB se ofrecen bajo CC BY 4.0. Adaptación: conversión del XML a registros de versículos y palabras, marcas gramaticales y ayudas visuales, conservando el texto original. No se implica respaldo del proyecto original.',
						'Los archivos léxicos acreditan al Open Scriptures Hebrew Bible Project bajo CC BY 4.0. Cada pasaje conserva revisiones, hashes, adaptaciones y advertencias de las fuentes.'
					],
					links_chirho: [
						{
							label_chirho: 'Open Scriptures Hebrew Bible',
							href_chirho: 'https://github.com/openscriptures/morphhb'
						},
						{
							label_chirho: 'Hebrew Lexicon',
							href_chirho: 'https://github.com/openscriptures/HebrewLexicon'
						},
						{
							label_chirho: 'CC BY 4.0',
							href_chirho: 'https://creativecommons.org/licenses/by/4.0/'
						}
					]
				},
				{
					title_chirho: 'Texto griego y significados',
					paragraphs_chirho: [
						'El Nuevo Testamento utiliza el texto Nestle 1904 de dominio público mediante biblicalhumanities.org. Ulrik Sandborg-Petersen y biblicalhumanities.org dedican su morfología y lemas bajo CC0.',
						'Los significados griegos en inglés proceden de Berean Interlinear Bible, mediante biblicalhumanities.org, donde la extracción se declara de dominio público. Esta atribución no es aprobación de Global Bible Tools. Se conservan las notas de edición y de glosas retenidas.'
					],
					links_chirho: [
						{
							label_chirho: 'Fuente Nestle 1904 y glosas',
							href_chirho: 'https://github.com/biblicalhumanities/Nestle1904'
						},
						{
							label_chirho: 'Condiciones de Berean',
							href_chirho: 'https://berean.bible/terms.htm'
						}
					]
				},
				{
					title_chirho: 'Exportaciones de glosas revisadas',
					paragraphs_chirho: [
						'Las exportaciones aprobadas de Global Bible Tools aportan significados en inglés del Antiguo Testamento y los disponibles en español. Su declaración pública de atribución dedica estas capas bajo CC0; el repositorio no incluye un archivo LICENSE independiente.',
						'No se importan las glosas GBT del Nuevo Testamento en inglés que requieren permiso. Los significados aprobados que faltan siguen sin estar disponibles. Una glosa de palabra no equivale a una traducción del versículo completo.'
					],
					links_chirho: [
						{
							label_chirho: 'Datos de Global Bible Tools',
							href_chirho: 'https://github.com/globalbibletools/data'
						},
						{
							label_chirho: 'CC0 1.0',
							href_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
						}
					]
				},
				{
					title_chirho: 'Gramática, ilustraciones y audio',
					paragraphs_chirho: [
						'La ayuda gramatical hebrea utiliza unfoldingWord Hebrew Grammar. El texto adaptado se atribuye a unfoldingWord bajo CC BY-SA 4.0. La disposición de marcas es una convención didáctica de Hinneh.',
						'Las guías AFI opcionales reutilizan el análisis de pronunciación hebrea y la convención griega elegida. El análisis de sílabas hebreas utiliza HavarotJS de Charles Loder (MIT). Los sonidos griegos siguen las fuentes citadas; son transcripciones didácticas por palabra, no una reconstrucción del tono antiguo.',
						'Las escenas e imágenes de palabras utilizan IA y conservan sus estados de revisión. Las pronunciaciones son ayudas de estudio generadas por IA; se mantiene la información de perfil, fuente y revisión. Una voz fluida o una imagen atractiva no certifican exactitud lingüística.'
					],
					links_chirho: [
						{
							label_chirho: 'unfoldingWord Hebrew Grammar',
							href_chirho: 'https://uhg.readthedocs.io/en/stable/'
						},
						{
							label_chirho: 'CC BY-SA 4.0',
							href_chirho: 'https://creativecommons.org/licenses/by-sa/4.0/'
						},
						{
							label_chirho: 'HavarotJS · MIT',
							href_chirho: 'https://github.com/charlesLoder/havarotjs'
						},
						{
							label_chirho: 'Greek pronunciation rules / Κανόνες προφοράς',
							href_chirho: 'https://blogs.sch.gr/4dimgala/kanones-proforas-tis-ellinikis-glossas/'
						},
						{
							label_chirho: 'Greek breathing marks',
							href_chirho: 'https://dcc.dickinson.edu/grammar/age/breathing-marks'
						}
					]
				}
			]
		}
	}
} satisfies Record<string, PageLocalesChirho>;
export type InformationIdChirho = keyof typeof INFORMATION_PAGES_CHIRHO;
export function isInformationIdChirho(valueChirho: string): valueChirho is InformationIdChirho {
	return Object.hasOwn(INFORMATION_PAGES_CHIRHO, valueChirho);
}

// Exact canonical bytes copied from the pinned corpus (static/content-chirho/): the WLC through
// OSHB, and Nestle 1904. Never retype or normalize them; references resolve through the registry.
export const HINNEH_HEBREW_CHIRHO = 'הִנֵּה'; // H2009 lexical form
export const SCRIPTURE_QUOTES_CHIRHO = {
	prayer_chirho: {
		osis_chirho: 'Ps.119.18',
		lang_chirho: 'he',
		text_chirho: 'גַּל־עֵינַ֥י וְאַבִּ֑יטָה נִ֝פְלָא֗וֹת מִתּוֹרָתֶֽךָ׃'
	},
	isaiah_chirho: {
		osis_chirho: 'Isa.7.14',
		lang_chirho: 'he',
		text_chirho: 'הִנֵּ֣ה הָעַלְמָ֗ה'
	},
	matthew_chirho: {
		osis_chirho: 'Matt.1.23',
		lang_chirho: 'grc',
		text_chirho: 'Ἰδοὺ ἡ παρθένος'
	}
} as const;

export type AidKindChirho = 'colors' | 'symbols' | 'art' | 'sound';
const AID_KINDS_CHIRHO: readonly string[] = [
	'colors',
	'symbols',
	'art',
	'sound'
] satisfies AidKindChirho[];
export function isAidKindChirho(valueChirho: string): valueChirho is AidKindChirho {
	return AID_KINDS_CHIRHO.includes(valueChirho);
}
export interface AidChirho {
	kind_chirho: AidKindChirho;
	title_chirho: string;
	body_chirho: string;
}
// The four helps beside the text. Statements follow the reader's cue derivation and legend:
// background = gender, underline = number, outline = word class, marks = state/stem/form.
export const READING_AIDS_CHIRHO: Record<LocaleChirho, readonly AidChirho[]> = {
	en: [
		{
			kind_chirho: 'colors',
			title_chirho: 'Colors',
			body_chirho:
				'A word’s background shows its grammatical gender, and a line beneath it marks plural or dual.'
		},
		{
			kind_chirho: 'symbols',
			title_chirho: 'Symbols',
			body_chirho:
				'Small marks above a word give a noun’s state or a verb’s stem and form; in Greek, case, tense and voice, person and mood. Tap a mark to learn what it means.'
		},
		{
			kind_chirho: 'art',
			title_chirho: 'Art',
			body_chirho:
				'A picture beneath a word illustrates one of its senses, and its outline shows the word class. Proverbs, John and Genesis also have illustrated verse scenes.'
		},
		{
			kind_chirho: 'sound',
			title_chirho: 'Sound',
			body_chirho:
				'Tap a word’s speaker to hear it pronounced. The saved recordings are AI-generated study aids, still under review.'
		}
	],
	es: [
		{
			kind_chirho: 'colors',
			title_chirho: 'Colores',
			body_chirho:
				'El fondo de una palabra muestra su género gramatical, y una línea debajo marca el plural o el dual.'
		},
		{
			kind_chirho: 'symbols',
			title_chirho: 'Símbolos',
			body_chirho:
				'Pequeñas marcas sobre la palabra indican el estado de un sustantivo o el tema y la forma de un verbo; en griego, el caso, el tiempo y la voz, la persona y el modo. Toca una marca para ver qué significa.'
		},
		{
			kind_chirho: 'art',
			title_chirho: 'Arte',
			body_chirho:
				'Una imagen bajo la palabra ilustra uno de sus sentidos, y su contorno muestra la clase de palabra. Proverbios, Juan y Génesis tienen además escenas ilustradas de sus versículos.'
		},
		{
			kind_chirho: 'sound',
			title_chirho: 'Sonido',
			body_chirho:
				'Toca el altavoz de una palabra para oír su pronunciación. Las grabaciones guardadas son ayudas de estudio generadas con IA, todavía en revisión.'
		}
	]
};

export type GuideStepKindChirho = 'passage' | 'text' | AidKindChirho | 'closer';
export interface GuideStepChirho {
	kind_chirho: GuideStepKindChirho;
	title_chirho: string;
	body_chirho: string;
}
export interface AboutGuideChirho {
	name_title_chirho: string;
	name_body_chirho: string;
	steps_title_chirho: string;
	steps_lead_chirho: string;
	steps_chirho: readonly GuideStepChirho[];
	facts_title_chirho: string;
	facts_chirho: readonly { title_chirho: string; body_chirho: string }[];
	sources_link_chirho: string;
}
// About's reading walkthrough. Coverage stays honest: "most", "some" and named books, no totals.
export const ABOUT_GUIDE_CHIRHO: Record<LocaleChirho, AboutGuideChirho> = {
	en: {
		name_title_chirho: 'Why “Hinneh”',
		name_body_chirho:
			'“Hinneh” is the Hebrew word for “behold”: a call to stop and look. Isaiah uses it to announce a sign, and Matthew carries the same call into Greek as he proclaims Immanuel, “God with us.”',
		steps_title_chirho: 'How a verse opens up',
		steps_lead_chirho:
			'Every passage in the reader is laid out the same way, from the text itself to the helps around it.',
		steps_chirho: [
			{
				kind_chirho: 'passage',
				title_chirho: 'Open a passage',
				body_chirho:
					'Choose any book, chapter and verse. A fresh visit opens the chapter of Proverbs that matches the day of the month; a link to a particular verse opens that verse.'
			},
			{
				kind_chirho: 'text',
				title_chirho: 'Read the text itself',
				body_chirho:
					'Hebrew reads from right to left and Greek from left to right, with the letters, vowels and accents of published editions: the Westminster Leningrad Codex and the Nestle 1904 Greek New Testament. The teaching marks sit around the words, and the exact source text can be revealed beneath each verse.'
			},
			{
				kind_chirho: 'colors',
				title_chirho: 'Notice the colors',
				body_chirho:
					'A blue background marks a masculine word and pink a feminine one; in Greek, neuter has its own pale tint. A yellow line beneath a word marks plural, and a green line marks dual. Grammatical gender belongs to the word; it does not tell the sex of a person or thing.'
			},
			{
				kind_chirho: 'symbols',
				title_chirho: 'Read the small marks',
				body_chirho:
					'In Hebrew, a centered i or ii gives a noun’s state. A number from 1 to 7 at the upper left gives a verb’s stem, and a letter at the upper right gives its form, such as P qatal, I yiqtol or Y wayyiqtol. In Greek, a centered roman numeral gives case; the upper left shows tense and voice, and the upper right person and mood. Hover, focus or tap any mark for its explanation. The codes are Hinneh’s teaching conventions; the Hebrew explanations adapt unfoldingWord Hebrew Grammar.'
			},
			{
				kind_chirho: 'art',
				title_chirho: 'See the picture',
				body_chirho:
					'Most words have a small picture beneath them. It illustrates one sense of the word as a memory aid; it does not define the word or explain where it came from. The outline shows the word class: teal for nouns, purple for verbs, orange for adjectives, gray for particles and dashed where the class is unresolved. A general picture can serve every occurrence of a word, so it may not fit a particular verse, and a double border means other reviewed meanings are available. Proverbs, John and Genesis also have illustrated scenes beside their verses.'
			},
			{
				kind_chirho: 'sound',
				title_chirho: 'Hear it spoken',
				body_chirho:
					'Tap the small speaker on a word to hear its saved pronunciation. Hebrew is voiced in a modern Israeli pronunciation and Greek in a modern one; Modern with Aspirates and Erasmian renditions are labelled where they have been recorded. The divine name is read in the traditional way, as Adonai, or Elohim where the text indicates it. These AI-generated recordings are study aids still under review, not reconstructions of how the words first sounded.'
			},
			{
				kind_chirho: 'closer',
				title_chirho: 'Look closer',
				body_chirho:
					'Select a word to open its card, with its meaning, morphology, lexicon entry and source notes. Word meanings are glosses in the original word order, not a sentence translation.'
			}
		],
		facts_title_chirho: 'What to expect',
		facts_chirho: [
			{
				title_chirho: 'The whole text',
				body_chirho:
					'All 66 books are here in Hebrew and Greek, following their pinned source editions and verse numbering. Aramaic passages are identified and are not read with a Hebrew voice.'
			},
			{
				title_chirho: 'Helps still growing',
				body_chirho:
					'Most words already have a picture and a saved recording, and more are added over time. Verse scenes cover Proverbs, John and Genesis; Spanish word meanings cover some books so far. Anything missing is shown as missing.'
			},
			{
				title_chirho: 'AI-assisted, clearly labelled',
				body_chirho:
					'Pictures, scenes and recordings are made with AI assistance and can contain mistakes. Their review states are shown, and “Report image issue” sends an illustration for review.'
			},
			{
				title_chirho: 'Meanings with their sources',
				body_chirho:
					'Word meanings name their source and approval state. Hinneh does not blend unreviewed machine text into an unmarked translation.'
			}
		],
		sources_link_chirho: 'Sources and credits'
	},
	es: {
		name_title_chirho: 'Por qué «Hinneh»',
		name_body_chirho:
			'«Hinneh» es la palabra hebrea para «he aquí»: un llamado a detenerse y mirar. Isaías la usa para anunciar una señal, y Mateo lleva el mismo llamado al griego al proclamar a Emanuel, «Dios con nosotros».',
		steps_title_chirho: 'Cómo se abre un versículo',
		steps_lead_chirho:
			'Cada pasaje del lector se presenta de la misma manera, desde el texto mismo hasta las ayudas que lo rodean.',
		steps_chirho: [
			{
				kind_chirho: 'passage',
				title_chirho: 'Abre un pasaje',
				body_chirho:
					'Elige cualquier libro, capítulo y versículo. Una visita nueva abre el capítulo de Proverbios que corresponde al día del mes; un enlace a un versículo concreto abre ese versículo.'
			},
			{
				kind_chirho: 'text',
				title_chirho: 'Lee el texto mismo',
				body_chirho:
					'El hebreo se lee de derecha a izquierda y el griego de izquierda a derecha, con las letras, vocales y acentos de ediciones publicadas: el Westminster Leningrad Codex y el Nuevo Testamento griego Nestle 1904. Las marcas didácticas rodean las palabras, y el texto exacto de la fuente puede mostrarse bajo cada versículo.'
			},
			{
				kind_chirho: 'colors',
				title_chirho: 'Observa los colores',
				body_chirho:
					'Un fondo azul marca una palabra masculina y uno rosa una femenina; en griego, el neutro tiene su propio tono pálido. Una línea amarilla bajo la palabra marca el plural, y una verde el dual. El género gramatical pertenece a la palabra; no indica el sexo de una persona o cosa.'
			},
			{
				kind_chirho: 'symbols',
				title_chirho: 'Lee las marcas pequeñas',
				body_chirho:
					'En hebreo, una i o ii centrada indica el estado de un sustantivo. Un número del 1 al 7 arriba a la izquierda indica el tema del verbo, y una letra arriba a la derecha su forma, como P qatal, I yiqtol o Y wayyiqtol. En griego, un numeral romano centrado indica el caso; arriba a la izquierda aparecen el tiempo y la voz, y arriba a la derecha la persona y el modo. Pasa el cursor, enfoca o toca cualquier marca para ver su explicación. Los códigos son convenciones didácticas de Hinneh; las explicaciones hebreas adaptan unfoldingWord Hebrew Grammar.'
			},
			{
				kind_chirho: 'art',
				title_chirho: 'Mira la imagen',
				body_chirho:
					'La mayoría de las palabras tienen debajo una pequeña imagen. Ilustra uno de sus sentidos para ayudarte a recordarla; no define la palabra ni explica su origen. El contorno indica la clase de palabra: verde azulado para sustantivos, morado para verbos, naranja para adjetivos, gris para partículas y discontinuo cuando la clase no está resuelta. Una imagen general puede servir para todas las apariciones de una palabra, así que quizá no encaje en un versículo concreto; un borde doble indica que hay otros significados revisados. Proverbios, Juan y Génesis tienen además escenas ilustradas junto a sus versículos.'
			},
			{
				kind_chirho: 'sound',
				title_chirho: 'Escúchalo',
				body_chirho:
					'Toca el pequeño altavoz de una palabra para oír su pronunciación guardada. El hebreo se oye con pronunciación israelí moderna y el griego con pronunciación moderna; las variantes Moderno con aspiradas y Erasmiano se identifican donde hay grabaciones. El nombre divino se lee de forma tradicional, como Adonai, o Elohim cuando el texto lo indica. Estas grabaciones generadas con IA son ayudas de estudio todavía en revisión, no reconstrucciones de cómo sonaban originalmente las palabras.'
			},
			{
				kind_chirho: 'closer',
				title_chirho: 'Mira más de cerca',
				body_chirho:
					'Selecciona una palabra para abrir su tarjeta, con su significado, morfología, entrada del léxico y notas de la fuente. Los significados son glosas en el orden de las palabras originales, no una traducción de la oración.'
			}
		],
		facts_title_chirho: 'Qué esperar',
		facts_chirho: [
			{
				title_chirho: 'Todo el texto',
				body_chirho:
					'Los 66 libros están aquí en hebreo y griego, según sus ediciones de origen fijadas y su numeración de versículos. Los pasajes en arameo se identifican y no se leen con una voz hebrea.'
			},
			{
				title_chirho: 'Ayudas que siguen creciendo',
				body_chirho:
					'La mayoría de las palabras ya tienen imagen y grabación guardada, y se añaden más con el tiempo. Las escenas de versículos cubren Proverbios, Juan y Génesis; los significados en español cubren por ahora algunos libros. Lo que falta se indica claramente.'
			},
			{
				title_chirho: 'Con ayuda de IA, bien identificado',
				body_chirho:
					'Las imágenes, escenas y grabaciones se hacen con ayuda de IA y pueden contener errores. Se muestran sus estados de revisión, y «Informar de un problema» envía una ilustración a revisión.'
			},
			{
				title_chirho: 'Significados con su fuente',
				body_chirho:
					'Los significados indican su fuente y su estado de aprobación. Hinneh no mezcla texto automático sin revisar en una traducción sin identificar.'
			}
		],
		sources_link_chirho: 'Fuentes y créditos'
	}
};

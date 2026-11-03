// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.mediachirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.publishedRecordsChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho
import us.hinneh.readerchirho.withChirho

/** Scene and word-picture selection over the repository's published Proverbs 26 and John 1 media. */
class MediaSelectionTestChirho {
    private val catalogueChirho = bundledCatalogueChirho()

    @Test
    fun publishedVerseShowsItsSceneAndAPictureUnderEveryWord() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val mediaChirho = worldChirho.mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho)
        val sceneChirho = requireNotNull(mediaChirho.sceneChirho).standardChirho
        assertTrue(sceneChirho.artReviewChirho in setOf("pending", "approved"))
        assertTrue(TrustedOriginChirho.isTrustedPathChirho(sceneChirho.assetPathChirho, ResourceKindChirho.ARTWORK_CHIRHO))
        for (wordChirho in loadedChirho.verseChirho.wordsChirho) assertNotNull(wordChirho.textChirho, mediaChirho.picturesChirho[wordChirho.idChirho])
        assertTrue("contextual pictures override general ones", mediaChirho.picturesChirho.values.any { !it.generalChirho })
        for (pictureChirho in mediaChirho.picturesChirho.values) {
            assertTrue(TrustedOriginChirho.isTrustedPathChirho(pictureChirho.recordChirho.assetPathChirho, ResourceKindChirho.ARTWORK_CHIRHO))
        }
    }

    @Test
    fun onlySelectedVersesOfferTheReducedRepresentation() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val pairChirho = requireNotNull(worldChirho.mediaChirho.verseMediaChirho(worldChirho.loadedChirho("John.1.2"), catalogueChirho).sceneChirho)
        val reducedChirho = requireNotNull(pairChirho.reducedChirho)
        assertNotEquals(pairChirho.standardChirho.sha256Chirho, reducedChirho.sha256Chirho)
        val sharedChirho = requireNotNull(worldChirho.mediaChirho.verseMediaChirho(worldChirho.loadedChirho("John.1.1"), catalogueChirho).sceneChirho)
        assertNull(sharedChirho.reducedChirho)
    }

    @Test
    fun oneUntrustedSceneWithholdsTheChaptersScenes() {
        val rawChirho = publishedRecordsChirho("media-chirho/john-chirho/chapter-01-chirho.json", "scenes_chirho", "John.1.3")
        assertNotNull(MediaSelectionChirho.scenesChirho(rawChirho, catalogueChirho))
        val untrustedChirho = rawChirho.map { it.withChirho("asset_path_chirho", "https://example.org/scene.webp") }
        assertNull(MediaSelectionChirho.scenesChirho(untrustedChirho, catalogueChirho))
        val unreviewedChirho = rawChirho.map { it.withChirho("art_review_chirho", "unknown") }
        assertNull(MediaSelectionChirho.scenesChirho(unreviewedChirho, catalogueChirho))
        val pairChirho = publishedRecordsChirho("media-chirho/john-chirho/chapter-01-chirho.json", "scenes_chirho", "John.1.2")
        val sameImageChirho = pairChirho.map { sceneChirho ->
            if ((sceneChirho["variant_chirho"] as? JsonPrimitive)?.content == "representation_reduced") {
                sceneChirho.withChirho("sha256_chirho", (pairChirho.first { it != sceneChirho }["sha256_chirho"] as JsonPrimitive).content)
            } else {
                sceneChirho
            }
        }
        assertNull("a reduced image identical to its standard one is refused", MediaSelectionChirho.scenesChirho(sameImageChirho, catalogueChirho))
    }

    @Test
    fun anInvalidContextualRecordFallsBackToGeneralPicturesOnly() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val verseChirho = loadedChirho.verseChirho
        val contextualChirho = publishedRecordsChirho("media-chirho/proverbs-chirho/chapter-26-chirho.json", "icons_chirho", "Prov.26.1")
        assertNotNull(MediaSelectionChirho.contextualChirho(contextualChirho, verseChirho))
        val brokenChirho: List<JsonObject> = contextualChirho.mapIndexed { indexChirho, iconChirho ->
            if (indexChirho == 0) iconChirho.withChirho("sense_review_chirho", "machine_guess") else iconChirho
        }
        assertNull(MediaSelectionChirho.contextualChirho(brokenChirho, verseChirho))
        // Records for words that are not in this verse are dropped before validation, as on the website.
        val foreignChirho = contextualChirho + contextualChirho.first().withChirho("token_id_chirho", "zzzzz").withChirho("sense_review_chirho", "machine_guess")
        assertEquals(MediaSelectionChirho.contextualChirho(contextualChirho, verseChirho), MediaSelectionChirho.contextualChirho(foreignChirho, verseChirho))
        // Changed source text unpins reused art instead of attaching it to a different word.
        val pinnedChirho = contextualChirho.map {
            it.withChirho("context_text_chirho", "אחר").withChirho("context_gloss_chirho", "other").withChirho("context_canonical_text_chirho", "אחר")
        }
        assertEquals(emptyMap<String, WordPictureChirho>(), MediaSelectionChirho.contextualChirho(pinnedChirho, verseChirho))
    }

    @Test
    fun lemmaKeysKeepHebrewAugmentsAndExactGreekFormsDistinct() {
        assertEquals("H7950\u0000", MediaSelectionChirho.lemmaKeyChirho("H7950", null, null))
        assertNotEquals(MediaSelectionChirho.lemmaKeyChirho("H1254", "a", null), MediaSelectionChirho.lemmaKeyChirho("H1254", "b", null))
        assertNotEquals(MediaSelectionChirho.lemmaKeyChirho("G3056", null, "λόγος"), MediaSelectionChirho.lemmaKeyChirho("G3056", null, "Λόγος"))
        assertNull(MediaSelectionChirho.lemmaKeyChirho("G3056", "a", "λόγος"))
        assertNull(MediaSelectionChirho.lemmaKeyChirho("H0", null, null))
        assertNull(MediaSelectionChirho.lemmaKeyChirho("oshb:unresolved:x", null, null))
    }
}

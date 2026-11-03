// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct MediaTestsChirho {
    func proverbsChirho() async throws -> (VerseDisplayChirho, VerifiedChapterChirho, MediaChapterChirho) {
        let (lessonChirho, chapterChirho) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let mediaChirho = try DecodingChirho.decodeChirho(
            MediaChapterChirho.self, FixtureChirho.dataChirho("prov-26-1-media-chirho"))
        return (VerseDisplayChirho(lessonChirho), chapterChirho, mediaChirho)
    }

    @Test func contextualPicturesWinOverGeneralOnesAndKeepDistinctAlternativesChirho() async throws {
        let (verseChirho, _, mediaChirho) = try await proverbsChirho()
        let selectedChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
        #expect(selectedChirho.sceneChirho?.lessonIdChirho == "Prov.26.1")
        #expect(selectedChirho.picturesChirho.count == verseChirho.wordsChirho.count)
        #expect(selectedChirho.picturesChirho.values.allSatisfy { $0.assignmentChirho == .contextualChirho })
        for pictureChirho in selectedChirho.picturesChirho.values {
            let hashesChirho = [pictureChirho.recordChirho.sha256Chirho]
                + pictureChirho.alternativesChirho.map(\.sha256Chirho)
            #expect(Set(hashesChirho).count == hashesChirho.count, "one picture per distinct meaning")
        }
        let generalOnlyChirho = MediaRulesChirho.selectChirho(MediaChapterChirho(
            schemaVersionChirho: 1, bookIdChirho: "Prov", chapterChirho: 26, scenesChirho: [], iconsChirho: [],
            lemmaIconsChirho: mediaChirho.lemmaIconsChirho), verseChirho)
        #expect(!generalOnlyChirho.picturesChirho.isEmpty)
        #expect(generalOnlyChirho.picturesChirho.values.allSatisfy {
            $0.assignmentChirho == .generalChirho && $0.alternativesChirho.isEmpty
        }, "a general picture never claims a sense or shows alternatives")
    }

    @Test func greekGeneralPicturesNeverCrossCanonicallyEquivalentFormsChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("john-1-1-chirho", "John", 1, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let wordChirho = try #require(verseChirho.wordsChirho.first { $0.textChirho == "Λόγος" })
        // The source writes λόγος with U+1F79 (oxia); NFC turns it into U+03CC (tonos).
        let exactChirho = wordChirho.lexicalFormChirho
        #expect(exactChirho.unicodeScalars.contains("\u{1F79}"))
        let tonosChirho = exactChirho.precomposedStringWithCanonicalMapping
        let decomposedChirho = exactChirho.decomposedStringWithCanonicalMapping
        #expect(tonosChirho == exactChirho && decomposedChirho == exactChirho,
                "Swift String equality treats all three forms as one")
        #expect(!ExactTextChirho.equalChirho(tonosChirho, exactChirho))
        #expect(!ExactTextChirho.equalChirho(decomposedChirho, exactChirho))
        func pictureChirho(_ formChirho: String, _ shaChirho: String) throws -> [String: Any] {
            ["id_chirho": "general-chirho", "lesson_id_chirho": "John.1.2", "token_id_chirho": "John.1.2!2",
             "lemma_id_chirho": wordChirho.lemmaIdChirho, "lemma_augment_chirho": NSNull(),
             "lexical_form_chirho": formChirho, "sense_id_chirho": "sense-chirho", "contextual_meaning_chirho": "word",
             "asset_path_chirho": "/assets-chirho/icons-chirho/x-chirho.webp", "alt_chirho": "a spoken word",
             "width_chirho": 128, "height_chirho": 128, "sha256_chirho": shaChirho,
             "sense_review_chirho": "agent_reviewed", "art_review_chirho": "pending",
             "evidence_refs_chirho": ["nestle1904-morph-chirho"], "display_authority_chirho": "general"]
        }
        func generalChirho(_ formsChirho: [String]) throws -> [String: WordPictureChirho] {
            let defaultsChirho = try formsChirho.enumerated().map { offsetChirho, formChirho in
                try DecodingChirho.decodeChirho(IconRecordChirho.self, FixtureChirho.jsonChirho(
                    pictureChirho(formChirho, String(repeating: "\(offsetChirho + 1)", count: 64))))
            }
            return MediaRulesChirho.generalPicturesChirho(defaultsChirho, verseChirho)
        }
        #expect(try generalChirho([tonosChirho])[wordChirho.idChirho] == nil, "a tonos form does not lend its picture")
        #expect(try generalChirho([decomposedChirho])[wordChirho.idChirho] == nil, "nor does a decomposed form")
        let ownChirho = try generalChirho([tonosChirho, exactChirho])[wordChirho.idChirho]
        #expect(ownChirho?.recordChirho.sha256Chirho == String(repeating: "2", count: 64),
                "the exact form keeps its own picture beside an equivalent-looking one")
    }

    @Test func aPictureWhoseReviewedContextChangedIsWithheldChirho() async throws {
        let (verseChirho, _, mediaChirho) = try await proverbsChirho()
        var objectChirho = try #require(try FixtureChirho.objectChirho("prov-26-1-media-chirho") as? [String: Any])
        var iconsChirho = try #require(objectChirho["icons_chirho"] as? [[String: Any]])
        for indexChirho in iconsChirho.indices {
            iconsChirho[indexChirho]["context_text_chirho"] = "שלג"
            iconsChirho[indexChirho]["context_gloss_chirho"] = "snow"
            iconsChirho[indexChirho]["context_canonical_text_chirho"] = "changed verse"
        }
        objectChirho["icons_chirho"] = iconsChirho
        objectChirho["lemma_icons_chirho"] = []
        let changedChirho = try DecodingChirho.decodeChirho(MediaChapterChirho.self, FixtureChirho.jsonChirho(objectChirho))
        #expect(MediaRulesChirho.selectChirho(changedChirho, verseChirho).picturesChirho.isEmpty)
        #expect(!MediaRulesChirho.selectChirho(mediaChirho, verseChirho).picturesChirho.isEmpty)
    }

    @Test func mediaFromAnotherChapterOrWithAWrongCountIsRefusedChirho() async throws {
        let (_, _, mediaChirho) = try await proverbsChirho()
        let bookChirho = FixtureChirho.bookChirho("Prov")
        let entryChirho = MediaSummaryEntryChirho(
            numberChirho: 26, pathChirho: "/media-chirho/proverbs-chirho/chapter-26-chirho.json",
            sha256Chirho: String(repeating: "a", count: 64), sceneCountChirho: mediaChirho.scenesChirho.count,
            iconCountChirho: mediaChirho.iconsChirho.count, lemmaIconCountChirho: mediaChirho.lemmaIconsChirho?.count)
        #expect(throws: Never.self) { try MediaRulesChirho.validChapterChirho(mediaChirho, bookChirho, entryChirho) }
        let wrongChirho = MediaSummaryEntryChirho(
            numberChirho: 25, pathChirho: entryChirho.pathChirho, sha256Chirho: entryChirho.sha256Chirho,
            sceneCountChirho: entryChirho.sceneCountChirho, iconCountChirho: entryChirho.iconCountChirho,
            lemmaIconCountChirho: entryChirho.lemmaIconCountChirho)
        #expect(throws: RemoteErrorChirho.self) { try MediaRulesChirho.validChapterChirho(mediaChirho, bookChirho, wrongChirho) }
    }
}

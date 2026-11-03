// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct TeachingTestsChirho {
    func hebrewTokenChirho(_ fieldsChirho: [String: Any]) throws -> HebrewTokenChirho {
        var baseChirho: [String: Any] = [
            "id_chirho": "x", "text_chirho": "דבר", "segments_chirho": ["דבר"], "start_chirho": 0, "end_chirho": 3,
            "raw_morphology_chirho": "HVpqp3ms", "lemma_id_chirho": "H1696", "lemma_augment_chirho": NSNull(),
            "lexical_form_chirho": "דָּבַר", "pos_chirho": "verb", "gender_chirho": "masculine",
            "number_chirho": "singular", "state_chirho": "na", "root_text_chirho": NSNull(),
            "root_entry_id_chirho": NSNull(), "root_status_chirho": "unresolved", "root_note_chirho": "n",
            "gloss_chirho": "spoke", "analysis_chirho": "a", "source_note_chirho": "s"
        ]
        baseChirho.merge(fieldsChirho) { $1 }
        return try DecodingChirho.decodeChirho(HebrewTokenChirho.self, FixtureChirho.jsonChirho(baseChirho))
    }

    @Test func hebrewVerbMarksFollowTheSourcedStemAndFormChirho() throws {
        let weqatalChirho = CuesChirho.hebrewChirho(try hebrewTokenChirho([
            "verb_stem_chirho": "piel", "verb_form_chirho": "weqatal"]))
        #expect((weqatalChirho.leftChirho, weqatalChirho.rightChirho) == ("3", "W"))
        #expect(weqatalChirho.shadeChirho == .masculineChirho)
        let weyiqtolChirho = CuesChirho.hebrewChirho(try hebrewTokenChirho([
            "verb_stem_chirho": "qal", "verb_form_chirho": "yiqtol", "verb_construction_chirho": "weyiqtol"]))
        #expect(weyiqtolChirho.rightChirho == "E")
        let mismatchedChirho = CuesChirho.hebrewChirho(try hebrewTokenChirho([
            "verb_form_chirho": "qatal", "verb_construction_chirho": "weyiqtol"]))
        #expect(mismatchedChirho.rightChirho.isEmpty, "a construction needs its own underlying form")
        let codedChirho = CuesChirho.hebrewChirho(try hebrewTokenChirho(["verb_code_chirho": "5M"]))
        #expect((codedChirho.leftChirho, codedChirho.rightChirho) == ("5", "M"))
        let nounChirho = CuesChirho.hebrewChirho(try hebrewTokenChirho([
            "pos_chirho": "noun", "state_chirho": "construct", "number_chirho": "dual", "verb_code_chirho": "5M"]))
        #expect(nounChirho.centerChirho == "ii" && nounChirho.leftChirho.isEmpty && nounChirho.underlineChirho == .dualChirho)
    }

    @Test func greekMarksFollowTheNestleParseChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("john-1-1-chirho", "John", 1, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let wasChirho = try #require(verseChirho.wordsChirho.first { $0.textChirho == "ἦν" })
        #expect(wasChirho.cuesChirho.leftChirho == "Ia")
        #expect(wasChirho.cuesChirho.rightChirho == "3I")
        let wordChirho = try #require(verseChirho.wordsChirho.first { $0.textChirho == "Λόγος" })
        #expect(wordChirho.cuesChirho.centerChirho == "i")
        #expect(wordChirho.cuesChirho.shadeChirho == .masculineChirho)
        #expect(MorphologyChirho.summaryChirho(wordChirho, .spanishChirho)
                    == "sustantivo, nominativo, singular, masculino")
    }

    @Test func everyMarkOnRealWordsHasAReadingKeyEntryInBothLanguagesChirho() async throws {
        for (nameChirho, bookChirho, chapterChirho, verseNumberChirho) in [
            ("prov-26-1-chirho", "Prov", 26, 1), ("prov-qere-chirho", "Prov", 3, 15), ("john-1-1-chirho", "John", 1, 1)
        ] {
            let (lessonChirho, _) = try await FixtureChirho.lessonChirho(nameChirho, bookChirho, chapterChirho,
                                                                          verseNumberChirho)
            for wordChirho in VerseDisplayChirho(lessonChirho).wordsChirho {
                let idsChirho = MorphologyChirho.legendIdsChirho(wordChirho, .sharedChirho)
                let itemsChirho = MorphologyChirho.legendChirho(wordChirho)
                #expect(itemsChirho.count == idsChirho.count, "\(wordChirho.idChirho): \(idsChirho)")
                #expect(itemsChirho.allSatisfy { $0.spanishAvailableChirho })
            }
        }
    }

    @Test func hebrewSummaryNamesEachSourcedCategoryChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let snowChirho = try #require(VerseDisplayChirho(lessonChirho).wordsChirho.first)
        #expect(MorphologyChirho.summaryChirho(snowChirho, .englishChirho).hasPrefix("noun; gender "))
        #expect(MorphologyChirho.summaryChirho(snowChirho, .spanishChirho).hasPrefix("sustantivo; género "))
    }

    @Test func bothInterfaceCataloguesAreCompleteAndShareTheirPlaceholdersChirho() {
        let englishChirho = Mirror(reflecting: MessagesChirho.englishChirho).children
        let spanishChirho = Mirror(reflecting: MessagesChirho.spanishChirho).children
        #expect(englishChirho.count == spanishChirho.count)
        for (englishFieldChirho, spanishFieldChirho) in zip(englishChirho, spanishChirho) {
            let englishTextChirho = englishFieldChirho.value as? String ?? ""
            let spanishTextChirho = spanishFieldChirho.value as? String ?? ""
            #expect(!englishTextChirho.isEmpty && !spanishTextChirho.isEmpty, "\(englishFieldChirho.label ?? "")")
            #expect(placeholdersChirho(englishTextChirho) == placeholdersChirho(spanishTextChirho),
                    "\(englishFieldChirho.label ?? "")")
        }
        #expect(MessagesChirho.fillChirho(MessagesChirho.spanishChirho.loadingChirho, ["reference_chirho": "Juan 3:16"])
                    == "Cargando Juan 3:16…")
        #expect(LocaleChirho.preferredChirho(["es-MX", "en-US"]) == .spanishChirho)
        #expect(LocaleChirho.preferredChirho(["en-GB"]) == .englishChirho)
    }

    func placeholdersChirho(_ textChirho: String) -> Set<String> {
        Set(textChirho.matches(of: /\{[a-z_]+\}/).map { String($0.output) })
    }
}

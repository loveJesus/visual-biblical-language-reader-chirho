// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct AudioTestsChirho {
    func clipsChirho(_ nameChirho: String) throws -> [ClipChirho] {
        try DecodingChirho.decodeChirho([ClipChirho].self, FixtureChirho.dataChirho(nameChirho))
    }

    @Test func eachHebrewWordGetsItsExactSpokenRecordingChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let audioChirho = AudioRulesChirho.selectChirho(try clipsChirho("prov-26-1-audio-chirho"), verseChirho)
        #expect(audioChirho.wordClipsChirho.count == verseChirho.wordsChirho.count)
        for wordChirho in verseChirho.wordsChirho {
            let clipChirho = try #require(audioChirho.wordClipsChirho[wordChirho.idChirho])
            #expect(ExactTextChirho.equalChirho(clipChirho.textChirho, wordChirho.spokenTextChirho))
            #expect(clipChirho.pronunciationChirho == "israeli_hebrew")
        }
        #expect(audioChirho.verseClipChirho?.recipeIdChirho == AudioRulesChirho.connectedRecipeChirho,
                "the connected reading is preferred over the spaced trials")
    }

    @Test func greekRenditionsFollowTheWebsiteAcceptanceRulesChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("john-1-1-chirho", "John", 1, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let catalogueChirho = try clipsChirho("john-1-1-audio-chirho")
        let roughChirho = verseChirho.wordsChirho.filter {
            GreekRenditionChirho.hasRoughBreathingChirho($0.spokenTextChirho)
        }
        #expect(!roughChirho.isEmpty, "the fixture must exercise rough breathing (ὁ)")
        let aspiratedChirho = AudioRulesChirho.selectChirho(catalogueChirho, verseChirho, .modernAspiratesChirho)
        for wordChirho in verseChirho.wordsChirho {
            if roughChirho.contains(wordChirho) {
                #expect(aspiratedChirho.wordClipsChirho[wordChirho.idChirho] == nil,
                        "a rough-breathing word gets no bulk modern stand-in under the aspirated rendition")
            } else {
                #expect(aspiratedChirho.wordClipsChirho[wordChirho.idChirho]?.pronunciationChirho == "modern_greek")
            }
        }
        #expect(aspiratedChirho.verseClipChirho?.pronunciationChirho == "modern_greek_aspirates")
        let modernChirho = AudioRulesChirho.selectChirho(catalogueChirho, verseChirho, .modernChirho)
        #expect(modernChirho.wordClipsChirho.count == verseChirho.wordsChirho.count)
        #expect(modernChirho.verseClipChirho?.pronunciationChirho == "modern_greek")
        let erasmianChirho = AudioRulesChirho.selectChirho(catalogueChirho, verseChirho, .erasmianChirho)
        #expect(erasmianChirho.wordClipsChirho.isEmpty, "Erasmian never borrows a modern recording")
        #expect(erasmianChirho.verseClipChirho?.pronunciationChirho == "erasmian_greek")
        #expect(GreekRenditionChirho.hasRoughBreathingChirho("ὁ") && !GreekRenditionChirho.hasRoughBreathingChirho("Λόγος"))
        #expect(GreekRenditionChirho.hasRoughBreathingChirho("\u{1F41}"), "precomposed omicron with dasia")
    }

    @Test func rejectedOrMisboundRecordingsNeverPlayChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        var clipsChirho = try clipsChirho("prov-26-1-audio-chirho")
        let rejectedShaChirho = try #require(AudioRulesChirho.rejectedChirho.first)
        clipsChirho = clipsChirho.map { clipChirho in
            guard clipChirho.tokenIdChirho == verseChirho.wordsChirho[0].idChirho else { return clipChirho }
            return ClipChirho(
                lessonIdChirho: clipChirho.lessonIdChirho, tokenIdChirho: clipChirho.tokenIdChirho,
                languageChirho: clipChirho.languageChirho, textChirho: clipChirho.textChirho,
                canonicalSha256Chirho: clipChirho.canonicalSha256Chirho,
                synthesisTextChirho: clipChirho.synthesisTextChirho, ipaChirho: clipChirho.ipaChirho,
                recipeIdChirho: clipChirho.recipeIdChirho, pronunciationChirho: clipChirho.pronunciationChirho,
                voiceNameChirho: clipChirho.voiceNameChirho,
                assetPathChirho: "/audio-chirho/sha256-chirho/\(rejectedShaChirho)-chirho.mp3",
                sha256Chirho: rejectedShaChirho, bytesChirho: clipChirho.bytesChirho,
                durationChirho: clipChirho.durationChirho, startOffsetChirho: nil, endOffsetChirho: nil,
                reviewChirho: "approved")
        }
        let audioChirho = AudioRulesChirho.selectChirho(clipsChirho, verseChirho)
        #expect(audioChirho.wordClipsChirho[verseChirho.wordsChirho[0].idChirho] == nil,
                "a rejected recording stays silent even when relabelled approved")
        #expect(audioChirho.wordClipsChirho.count == verseChirho.wordsChirho.count - 1)
        let (otherChirho, _) = try await FixtureChirho.lessonChirho("prov-qere-chirho", "Prov", 3, 15)
        #expect(AudioRulesChirho.selectChirho(try self.clipsChirho("prov-26-1-audio-chirho"),
                                              VerseDisplayChirho(otherChirho)).wordClipsChirho.isEmpty,
                "recordings of another verse never attach to this one")
    }
}

@Suite struct PassageTestsChirho {
    @Test func freshVisitsOpenTheDayOfTheMonthInProverbsChirho() throws {
        var calendarChirho = Calendar(identifier: .gregorian)
        calendarChirho.timeZone = try #require(TimeZone(identifier: "America/New_York"))
        let dateChirho = try #require(calendarChirho.date(from: DateComponents(year: 2026, month: 11, day: 3, hour: 23)))
        #expect(PassageChirho.dailyChirho(dateChirho, calendarChirho: calendarChirho)
                    == PassageChirho(bookIdChirho: "Prov", chapterChirho: 3, verseChirho: 1))
        let booksChirho = FixtureChirho.booksChirho
        #expect(PassageChirho.parseChirho("John.3.16", booksChirho)?.idChirho == "John.3.16")
        #expect(PassageChirho.parseChirho("John.22.1", booksChirho) == nil)
        #expect(PassageChirho.parseChirho("John.03.16", booksChirho) == nil)
        #expect(PassageChirho.parseChirho("Nope.1.1", booksChirho) == nil)
    }

    @Test func neighboursCrossChaptersAndBooksAndSkipEditionGapsChirho() async throws {
        let transportChirho = FakeTransportChirho()
        let booksChirho = FixtureChirho.booksChirho
        func manifestChirho(_ bookIdChirho: String, _ versesChirho: [Int: [Int]]) throws -> Data {
            let bookChirho = FixtureChirho.bookChirho(bookIdChirho)
            return try FixtureChirho.jsonChirho([
                "schema_version_chirho": 1, "book_id_chirho": bookIdChirho, "language_chirho": bookChirho.languageChirho,
                "chapters_chirho": (1...bookChirho.chapterCountChirho).map { numberChirho -> [String: Any] in
                    let numbersChirho = versesChirho[numberChirho] ?? [1, 2]
                    return ["number_chirho": numberChirho, "verse_count_chirho": numbersChirho.count,
                            "verse_numbers_chirho": numbersChirho,
                            "path_chirho": "/content-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(numberChirho),
                            "sha256_chirho": String(repeating: "b", count: 64)]
                }
            ] as [String: Any])
        }
        await transportChirho.setChirho("/content-chirho/ruth-chirho/manifest-chirho.json",
                                        try manifestChirho("Ruth", [1: [1, 3, 4], 4: [1, 2, 22]]))
        await transportChirho.setChirho("/content-chirho/judges-chirho/manifest-chirho.json", try manifestChirho("Judg", [:]))
        await transportChirho.setChirho("/content-chirho/1-samuel-chirho/manifest-chirho.json", try manifestChirho("1Sam", [:]))
        let clientChirho = ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
        func stepChirho(_ textChirho: String, _ directionChirho: StepChirho) async throws -> String? {
            try await clientChirho.neighbourChirho(
                try #require(PassageChirho.parseChirho(textChirho, booksChirho)), directionChirho, booksChirho)?.idChirho
        }
        #expect(try await stepChirho("Ruth.1.1", .nextChirho) == "Ruth.1.3", "an edition gap is skipped")
        #expect(try await stepChirho("Ruth.1.4", .nextChirho) == "Ruth.2.1")
        #expect(try await stepChirho("Ruth.2.1", .previousChirho) == "Ruth.1.4")
        #expect(try await stepChirho("Ruth.4.22", .nextChirho) == "1Sam.1.1")
        #expect(try await stepChirho("Ruth.1.1", .previousChirho) == "Judg.21.2")
    }
}

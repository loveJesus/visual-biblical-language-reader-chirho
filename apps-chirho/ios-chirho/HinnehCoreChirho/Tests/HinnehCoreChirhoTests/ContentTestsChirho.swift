// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct ContentTestsChirho {
    @Test func hebrewVerseKeepsExactTextRunsAndQereChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-qere-chirho", "Prov", 3, 15)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        #expect(verseChirho.scriptChirho == .hebrewChirho)
        // Every displayed word is exactly the canonical text at its published UTF-16 span.
        for wordChirho in verseChirho.wordsChirho {
            let sliceChirho = try #require(ExactTextChirho.sliceChirho(
                verseChirho.canonicalTextChirho, wordChirho.startChirho, wordChirho.endChirho))
            #expect(ExactTextChirho.equalChirho(sliceChirho, wordChirho.textChirho))
        }
        let qereWordChirho = try #require(verseChirho.wordsChirho.first { $0.idChirho == "20brh" })
        #expect(qereWordChirho.hebrewChirho?.qereChirho.isEmpty == false)
        #expect(!ExactTextChirho.equalChirho(qereWordChirho.spokenTextChirho, qereWordChirho.textChirho),
                "the spoken form follows the qere; the displayed text stays the ketiv")
        #expect(surfacesMatchCanonicalChirho(verseChirho))
    }

    /// Words with their attached punctuation hold exactly the canonical text's non-space scalars.
    func surfacesMatchCanonicalChirho(_ verseChirho: VerseDisplayChirho) -> Bool {
        let inkChirho = { (textChirho: String) in textChirho.unicodeScalars.filter { !$0.properties.isWhitespace } }
        return inkChirho(verseChirho.canonicalTextChirho)
            .elementsEqual(inkChirho(verseChirho.wordsChirho.map(\.surfaceChirho).joined()))
    }

    @Test func hebrewPunctuationStaysWithTheWordItFollowsChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        #expect(surfacesMatchCanonicalChirho(verseChirho))
        let firstChirho = try #require(verseChirho.wordsChirho.first)
        #expect(firstChirho.surfaceChirho.hasSuffix(" \u{05C0}"), "paseq follows its word, set apart by a space")
        #expect(!firstChirho.textChirho.contains("\u{05C0}"), "the word's exact text stays the source span")
        #expect(verseChirho.wordsChirho.contains { $0.surfaceChirho.hasSuffix("\u{05BE}") }, "maqaf joins its word")
        #expect(verseChirho.wordsChirho.last?.surfaceChirho.hasSuffix("\u{05C3}") == true, "sof pasuq ends the line")
    }

    @Test func greekVerseAttachesPunctuationToItsWordChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("john-1-1-chirho", "John", 1, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        #expect(verseChirho.scriptChirho == .greekChirho)
        #expect(verseChirho.wordsChirho.first?.textChirho == "Ἐν")
        let surfacesChirho = verseChirho.wordsChirho.map(\.surfaceChirho).joined(separator: " ")
        #expect(surfacesChirho.unicodeScalars.elementsEqual(
            verseChirho.canonicalTextChirho.trimmingCharacters(in: .whitespaces).unicodeScalars),
                "words plus attached punctuation must rebuild the canonical verse")
        #expect(surfacesMatchCanonicalChirho(verseChirho))
    }

    @Test func aCanonicallyEquivalentButDifferentSpanIsRefusedChirho() async throws {
        var verseChirho = try #require(try FixtureChirho.objectChirho("john-1-1-chirho") as? [String: Any])
        var tokensChirho = try #require(verseChirho["tokens_chirho"] as? [[String: Any]])
        let textChirho = try #require(tokensChirho[1]["text_chirho"] as? String)
        let decomposedChirho = textChirho.decomposedStringWithCanonicalMapping
        #expect(decomposedChirho == textChirho, "Swift's == would accept the decomposed form")
        #expect(!ExactTextChirho.equalChirho(decomposedChirho, textChirho))
        tokensChirho[1]["text_chirho"] = decomposedChirho
        tokensChirho[1]["segments_chirho"] = [decomposedChirho]
        verseChirho["tokens_chirho"] = tokensChirho
        await #expect(throws: RemoteErrorChirho.self) {
            let transportChirho = FakeTransportChirho()
            try await FixtureChirho.serveChapterChirho(transportChirho, "John", 1, verseChirho, verseNumberChirho: 1)
            _ = try await ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
                .lessonChirho(FixtureChirho.bookChirho("John"), 1, 1)
        }
    }

    @Test func aChapterWhoseBytesChangedIsRefusedThenRecoveredFromAFreshManifestChirho() async throws {
        let transportChirho = FakeTransportChirho()
        try await FixtureChirho.serveChapterChirho(
            transportChirho, "Prov", 26, FixtureChirho.objectChirho("prov-26-1-chirho"), verseNumberChirho: 1)
        let bookChirho = FixtureChirho.bookChirho("Prov")
        let chapterPathChirho = "/content-chirho/proverbs-chirho/chapter-26-chirho.json"
        let goodBytesChirho = try await transportChirho.getChirho(
            try #require(OriginChirho.urlChirho(chapterPathChirho, .contentChapterChirho)), limitChirho: 1 << 22)
        // First the chapter arrives altered (a stale cache), then intact: one refetch recovers.
        await transportChirho.setChirho(chapterPathChirho, goodBytesChirho + Data(" ".utf8), goodBytesChirho)
        let clientChirho = ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
        let lessonChirho = try await clientChirho.lessonChirho(bookChirho, 26, 1)
        #expect(lessonChirho.idChirho == "Prov.26.1")
        let requestsChirho = await transportChirho.requestedChirho
        #expect(requestsChirho.filter { $0 == bookChirho.manifestPathChirho }.count == 2)
        // Always altered: refused, never shown.
        await transportChirho.setChirho(chapterPathChirho, goodBytesChirho + Data(" ".utf8))
        await #expect(throws: RemoteErrorChirho.integrityChirho) {
            _ = try await ContentClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
                .lessonChirho(bookChirho, 26, 1)
        }
    }

    @Test func manifestRulesRejectUnexpectedPathsAndNumberingChirho() throws {
        let bookChirho = FixtureChirho.bookChirho("Ruth")
        func manifestChirho(_ mutateChirho: (inout [ChapterEntryChirho]) -> Void) -> BookManifestChirho {
            var entriesChirho = (1...bookChirho.chapterCountChirho).map { numberChirho in
                ChapterEntryChirho(numberChirho: numberChirho, verseCountChirho: 3, verseNumbersChirho: nil,
                                   pathChirho: "/content-chirho/ruth-chirho/" + bookChirho.chapterFileChirho(numberChirho),
                                   sha256Chirho: String(repeating: "a", count: 64))
            }
            mutateChirho(&entriesChirho)
            return BookManifestChirho(schemaVersionChirho: 1, bookIdChirho: "Ruth", languageChirho: "he",
                                      chaptersChirho: entriesChirho)
        }
        #expect(try ContentRulesChirho.validManifestChirho(manifestChirho { _ in }, bookChirho).count == 4)
        #expect(try ContentRulesChirho.validManifestChirho(manifestChirho {
            $0[0] = ChapterEntryChirho(numberChirho: 1, verseCountChirho: 2, verseNumbersChirho: [1, 3],
                                       pathChirho: $0[0].pathChirho, sha256Chirho: $0[0].sha256Chirho)
        }, bookChirho)[0].versesChirho == [1, 3], "explicit gaps are kept, never filled")
        #expect(throws: RemoteErrorChirho.self) {
            try ContentRulesChirho.validManifestChirho(manifestChirho {
                $0[1] = ChapterEntryChirho(numberChirho: 2, verseCountChirho: 3, verseNumbersChirho: nil,
                                           pathChirho: "/content-chirho/genesis-chirho/chapter-02-chirho.json",
                                           sha256Chirho: $0[1].sha256Chirho)
            }, bookChirho)
        }
        #expect(throws: RemoteErrorChirho.self) {
            try ContentRulesChirho.validManifestChirho(manifestChirho {
                $0[0] = ChapterEntryChirho(numberChirho: 1, verseCountChirho: 2, verseNumbersChirho: [3, 2],
                                           pathChirho: $0[0].pathChirho, sha256Chirho: $0[0].sha256Chirho)
            }, bookChirho)
        }
    }
}

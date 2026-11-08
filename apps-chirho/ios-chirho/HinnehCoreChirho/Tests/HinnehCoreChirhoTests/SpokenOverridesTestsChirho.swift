// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import Foundation
import Testing
@testable import HinnehCoreChirho

private struct SpokenFixtureChirho: Decodable {
    let caseIdChirho: String
    let lessonChirho: HebrewLessonChirho
    let clipsChirho: [ClipChirho]
    let spokenVerseChirho: String
    let spokenWordsChirho: [String: String]
    let selectedWordsChirho: [String: String]
    let selectedHumanSha256Chirho: String?
}
@Suite struct SpokenOverridesTestsChirho {
    @Test func reviewedSpeechAndChangedSourceMatchWebChirho() throws {
        let fixturesChirho = try DecodingChirho.decodeChirho([SpokenFixtureChirho].self,
            FixtureChirho.dataChirho("spoken-overrides-parity-chirho"))
        #expect(fixturesChirho.count == 17)
        for fixtureChirho in fixturesChirho {
            let verseChirho = VerseDisplayChirho(.hebrewChirho(fixtureChirho.lessonChirho))
            #expect(ExactTextChirho.equalChirho(verseChirho.canonicalTextChirho, fixtureChirho.lessonChirho.canonicalTextChirho))
            #expect(ExactTextChirho.equalChirho(AudioRulesChirho.spokenVerseTextChirho(verseChirho),fixtureChirho.spokenVerseChirho),
                "\(verseChirho.idChirho) \(fixtureChirho.caseIdChirho): verse")
            for wordChirho in verseChirho.wordsChirho {
                let expectedChirho = try #require(fixtureChirho.spokenWordsChirho[wordChirho.idChirho])
                #expect(ExactTextChirho.equalChirho(wordChirho.spokenTextChirho, expectedChirho),
                    "\(verseChirho.idChirho) \(fixtureChirho.caseIdChirho): \(wordChirho.idChirho)")
                let sourceChirho = try #require(fixtureChirho.lessonChirho.tokensChirho.first { $0.idChirho == wordChirho.idChirho })
                #expect(ExactTextChirho.equalChirho(wordChirho.textChirho,sourceChirho.textChirho))
                #expect(wordChirho.hebrewChirho?.qereChirho.count == (sourceChirho.qereChirho?.count ?? 0))
            }
            let selectedChirho = AudioRulesChirho.selectChirho(fixtureChirho.clipsChirho,verseChirho)
            #expect(selectedChirho.wordClipsChirho.mapValues(\.sha256Chirho) == fixtureChirho.selectedWordsChirho,
                "\(verseChirho.idChirho) \(fixtureChirho.caseIdChirho): exact selected word identities")
            #expect(selectedChirho.verseClipChirho?.readingSourceChirho == nil ||
                selectedChirho.verseClipChirho?.sha256Chirho == fixtureChirho.selectedHumanSha256Chirho)
            if fixtureChirho.selectedHumanSha256Chirho != nil {
                #expect(selectedChirho.verseClipChirho?.sha256Chirho == fixtureChirho.selectedHumanSha256Chirho)
            }
        }
    }

    @Test func canonicalEquivalenceDoesNotCollapseAnAlteredGroupChirho() throws {
        let fixturesChirho = try DecodingChirho.decodeChirho([SpokenFixtureChirho].self,
            FixtureChirho.dataChirho("spoken-overrides-parity-chirho"))
        let originalChirho = try #require(fixturesChirho.first {
            $0.lessonChirho.idChirho == "Lam.4.3" && $0.caseIdChirho == "original-chirho"
        })
        let changedChirho = try #require(fixturesChirho.first { $0.caseIdChirho == "canonical-scalar-order-chirho" })
        #expect(originalChirho.lessonChirho.canonicalTextChirho == changedChirho.lessonChirho.canonicalTextChirho,
            "Swift considers these canonically equivalent")
        #expect(!ExactTextChirho.equalChirho(originalChirho.lessonChirho.canonicalTextChirho,
                                           changedChirho.lessonChirho.canonicalTextChirho))
        #expect(changedChirho.spokenVerseChirho.contains("כי ענים"))
        let changedVerseChirho = VerseDisplayChirho(.hebrewChirho(changedChirho.lessonChirho))
        #expect(ExactTextChirho.equalChirho(AudioRulesChirho.spokenVerseTextChirho(changedVerseChirho),changedChirho.spokenVerseChirho))
        #expect(AudioRulesChirho.selectChirho(changedChirho.clipsChirho,changedVerseChirho).verseClipChirho == nil)
    }
    @Test func aramaicAllowsOnlyValidatedHumanVerseChirho() throws {
        var lessonObjectChirho = try #require(FixtureChirho.objectChirho("prov-26-1-chirho") as? [String: Any])
        var tokensChirho = try #require(lessonObjectChirho["tokens_chirho"] as? [[String: Any]])
        tokensChirho[0]["source_language_chirho"] = "arc"
        lessonObjectChirho["tokens_chirho"] = tokensChirho
        let lessonChirho = try DecodingChirho.decodeChirho(HebrewLessonChirho.self,FixtureChirho.jsonChirho(lessonObjectChirho))
        let verseChirho = VerseDisplayChirho(.hebrewChirho(lessonChirho))
        let originalChirho = try DecodingChirho.decodeChirho([ClipChirho].self,FixtureChirho.dataChirho("prov-26-1-audio-chirho"))
        let humanObjectChirho = try HumanReadingTestsChirho().humanObjectChirho()
        let humanChirho = try DecodingChirho.decodeChirho(ClipChirho.self,FixtureChirho.jsonChirho(humanObjectChirho))
        #expect(verseChirho.hasAramaicChirho)
        let selectedChirho = AudioRulesChirho.selectChirho(originalChirho + [humanChirho],verseChirho)
        #expect(selectedChirho.verseClipChirho?.sha256Chirho == humanChirho.sha256Chirho)
        #expect(selectedChirho.verseClipChirho?.readingSourceChirho?.readerIdChirho == "rdb-chirho")
        #expect(selectedChirho.wordClipsChirho[verseChirho.wordsChirho[0].idChirho] == nil)
        #expect(AudioRulesChirho.selectChirho(originalChirho,verseChirho).verseClipChirho == nil,
            "An AI reading must not fill this Aramaic verse")
        var invalidChirho = humanObjectChirho
        var sourceChirho = try #require(invalidChirho["reading_source_chirho"] as? [String: Any])
        sourceChirho["gbt_id_chirho"] = "OT/RDB/Gen"
        invalidChirho["reading_source_chirho"] = sourceChirho
        let invalidClipChirho = try DecodingChirho.decodeChirho(ClipChirho.self,FixtureChirho.jsonChirho(invalidChirho))
        #expect(AudioRulesChirho.selectChirho(originalChirho + [invalidClipChirho],verseChirho).verseClipChirho == nil,
            "A failed human claim never becomes an AI fallback")
    }

    @Test func catalogueClientSelectsReviewedWordsAndReadingChirho() async throws {
        let fixturesChirho = try DecodingChirho.decodeChirho([SpokenFixtureChirho].self,
            FixtureChirho.dataChirho("spoken-overrides-parity-chirho"))
        let rawChirho = try #require(FixtureChirho.objectChirho("spoken-overrides-parity-chirho") as? [[String: Any]])
        for (indexChirho,fixtureChirho) in fixturesChirho.enumerated() where fixtureChirho.caseIdChirho == "original-chirho" {
            let partsChirho = fixtureChirho.lessonChirho.idChirho.split(separator: ".")
            let bookIdChirho = String(partsChirho[0])
            let chapterNumberChirho = try #require(Int(partsChirho[1]))
            let verseNumberChirho = try #require(Int(partsChirho[2]))
            let transportChirho = FakeTransportChirho()
            let sourceShaChirho = try await FixtureChirho.serveChapterChirho(transportChirho,
                bookIdChirho,chapterNumberChirho,try #require(rawChirho[indexChirho]["lesson_chirho"]),
                verseNumberChirho: verseNumberChirho)
            let bookChirho = FixtureChirho.bookChirho(bookIdChirho)
            let contentPathChirho = "/content-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(chapterNumberChirho)
            let clipsChirho = try #require(rawChirho[indexChirho]["clips_chirho"] as? [[String: Any]])
            let audioBytesChirho = try FixtureChirho.jsonChirho([
                "schema_version_chirho":1,"book_id_chirho":bookIdChirho,"chapter_chirho":chapterNumberChirho,
                "content_path_chirho":contentPathChirho,"content_sha256_chirho":sourceShaChirho,
                "clips_chirho":clipsChirho.filter { $0["reading_source_chirho"] == nil },
                "readings_chirho":clipsChirho.filter { $0["reading_source_chirho"] != nil }
            ] as [String:Any])
            let audioPathChirho = "/audio-chirho/\(bookChirho.slugChirho)/" + bookChirho.chapterFileChirho(chapterNumberChirho)
            await transportChirho.setChirho(audioPathChirho,audioBytesChirho)
            await transportChirho.setChirho("/audio-chirho/manifest-chirho.json",try FixtureChirho.jsonChirho([
                "schema_version_chirho":1,"books_chirho":[bookIdChirho:["chapters_chirho":[[
                    "number_chirho":chapterNumberChirho,"path_chirho":audioPathChirho,
                    "sha256_chirho":DigestChirho.sha256HexChirho(audioBytesChirho)
                ]]]]
            ] as [String:Any]))
            let remoteChirho = RemoteChirho(transportChirho:transportChirho)
            let chapterChirho = try await ContentClientChirho(remoteChirho:remoteChirho).chapterChirho(bookChirho,chapterNumberChirho)
            let verseChirho = VerseDisplayChirho(try chapterChirho.lessonChirho(verseNumberChirho))
            let selectedChirho = try await AudioClientChirho(remoteChirho:remoteChirho).verseAudioChirho(chapterChirho,verseChirho,.modernAspiratesChirho)
            #expect(selectedChirho.wordClipsChirho.mapValues(\.sha256Chirho) == fixtureChirho.selectedWordsChirho)
            #expect(selectedChirho.verseClipChirho?.sha256Chirho == fixtureChirho.selectedHumanSha256Chirho)
        }
    }

}

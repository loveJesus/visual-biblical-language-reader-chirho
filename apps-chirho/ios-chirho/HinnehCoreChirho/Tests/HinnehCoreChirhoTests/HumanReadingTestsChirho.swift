// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct HumanReadingTestsChirho {
    func humanObjectChirho() throws -> [String: Any] {
        let clipsChirho = try #require(FixtureChirho.objectChirho("prov-26-1-audio-chirho") as? [[String: Any]])
        var clipChirho = try #require(clipsChirho.first { $0["token_id_chirho"] is NSNull })
        let durationChirho = try #require(clipChirho["duration_chirho"] as? Double)
        for keyChirho in ["recipe_id_chirho", "ipa_chirho", "synthesis_text_chirho", "start_offset_chirho", "end_offset_chirho"] {
            clipChirho.removeValue(forKey: keyChirho)
        }
        clipChirho["voice_name_chirho"] = "Rabbi Dan Be'eri"
        clipChirho["reading_source_chirho"] = [
            "kind_chirho": "human", "reader_id_chirho": "rdb-chirho", "gbt_id_chirho": "OT/RDB/Pro",
            "package_sha256_chirho": String(repeating: "a", count: 64),
            "chapter_sha256_chirho": String(repeating: "b", count: 64),
            "timings_sha256_chirho": String(repeating: "c", count: 64),
            "start_chirho": 2.0, "end_chirho": 2 + durationChirho, "chapter_duration_chirho": 100.0,
            "attribution_chirho": HumanReadingSourceChirho.beeriAttributionChirho,
            "license_chirho": "CC BY-SA 3.0", "license_url_chirho": HumanReadingSourceChirho.beeriLicenseUrlChirho
        ] as [String: Any]
        return clipChirho
    }

    @Test func humanSourceDecodesAndWinsWithoutChangingWordsChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let originalChirho = try DecodingChirho.decodeChirho([ClipChirho].self, FixtureChirho.dataChirho("prov-26-1-audio-chirho"))
        let humanChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(humanObjectChirho()))
        #expect(humanChirho.readingSourceChirho != nil)
        let beforeChirho = AudioRulesChirho.selectChirho(originalChirho, verseChirho)
        let afterChirho = AudioRulesChirho.selectChirho(originalChirho + [humanChirho], verseChirho)
        #expect(afterChirho.verseClipChirho?.voiceNameChirho == "Rabbi Dan Be'eri")
        #expect(afterChirho.wordClipsChirho == beforeChirho.wordClipsChirho)
        for localeChirho in [LocaleChirho.englishChirho, .spanishChirho] {
            #expect(MessagesChirho.forChirho(localeChirho).voiceChirho(humanChirho) == "Rabbi Dan Be'eri")
        }
    }

    @Test func wrongHumanSourceWindowLicenseOrSynthesisRefusesChirho() throws {
        for (keyChirho, valueChirho) in [
            ("gbt_id_chirho", "OT/RDB/Gen" as Any), ("start_chirho", -1.0 as Any),
            ("license_url_chirho", "https://example.com/" as Any), ("end_chirho", 99.0 as Any)
        ] {
            var objectChirho = try humanObjectChirho()
            var sourceChirho = try #require(objectChirho["reading_source_chirho"] as? [String: Any])
            sourceChirho[keyChirho] = valueChirho
            objectChirho["reading_source_chirho"] = sourceChirho
            let clipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(objectChirho))
            #expect(!AudioRulesChirho.validShapeChirho(clipChirho, greekChirho: false))
        }
        var objectChirho = try humanObjectChirho()
        objectChirho["synthesis_text_chirho"] = "AI input"
        let clipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(objectChirho))
        #expect(!AudioRulesChirho.validShapeChirho(clipChirho, greekChirho: false))
    }

    @Test func newReadingArrayMergesWhileLegacyClipsRemainIntactChirho() async throws {
        let (lessonChirho, chapterChirho) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let legacyChirho = try #require(FixtureChirho.objectChirho("prov-26-1-audio-chirho") as? [[String: Any]])
        let bodyChirho = try FixtureChirho.jsonChirho([
            "schema_version_chirho": 1, "book_id_chirho": "Prov", "chapter_chirho": 26,
            "content_path_chirho": chapterChirho.entryChirho.pathChirho,
            "content_sha256_chirho": chapterChirho.entryChirho.sha256Chirho,
            "clips_chirho": legacyChirho, "readings_chirho": [try humanObjectChirho()]
        ] as [String: Any])
        let pathChirho = "/audio-chirho/proverbs-chirho/chapter-26-chirho.json"
        let manifestChirho = try FixtureChirho.jsonChirho([
            "schema_version_chirho": 1,
            "books_chirho": ["Prov": ["chapters_chirho": [[
                "number_chirho": 26, "path_chirho": pathChirho,
                "sha256_chirho": DigestChirho.sha256HexChirho(bodyChirho)
            ]]]]
        ] as [String: Any])
        let transportChirho = FakeTransportChirho([
            "/audio-chirho/manifest-chirho.json": [manifestChirho], pathChirho: [bodyChirho]
        ])
        let clientChirho = AudioClientChirho(remoteChirho: RemoteChirho(transportChirho: transportChirho))
        let selectedChirho = try await clientChirho.verseAudioChirho(chapterChirho, VerseDisplayChirho(lessonChirho), .modernAspiratesChirho)
        #expect(selectedChirho.verseClipChirho?.voiceNameChirho == "Rabbi Dan Be'eri")
        #expect(selectedChirho.wordClipsChirho.count == VerseDisplayChirho(lessonChirho).wordsChirho.count)
        // An old decoder sees precisely the legacy array, which contains no Be'eri reading.
        let rawChirho = try #require(JSONSerialization.jsonObject(with: bodyChirho) as? [String: Any])
        let oldClipsChirho = try DecodingChirho.decodeChirho([ClipChirho].self, FixtureChirho.jsonChirho(rawChirho["clips_chirho"]!))
        #expect(oldClipsChirho.allSatisfy { $0.readingSourceChirho == nil })
    }
}

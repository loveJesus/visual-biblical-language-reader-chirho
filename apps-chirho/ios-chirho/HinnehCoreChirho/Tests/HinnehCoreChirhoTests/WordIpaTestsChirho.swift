// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct WordIpaTestsChirho {
    private func greekFixtureChirho(nullModernChirho: Bool = false) throws -> (Data, [String: Data]) {
        let textChirho = "ὁ"
        let keyChirho = DigestChirho.sha256HexChirho(textChirho)
        let shardChirho = Int(try #require(UInt8(keyChirho.prefix(2), radix: 16)) & 7)
        var partsChirho: [String: Data] = [:]
        var pinsChirho: [[String: Any]] = []
        for indexChirho in 0..<8 {
            let nameChirho = String(format: "greek-ipa-part-%02d-chirho.json", indexChirho)
            let entriesChirho: [String: Any] = indexChirho == shardChirho ? [keyChirho: [
                "text_chirho": textChirho,
                "ipa_chirho": ["modern": nullModernChirho ? NSNull() : "o",
                               "modern_aspirates": "ho", "erasmian": "ho"] as [String: Any]
            ]] : [:]
            let bytesChirho = try FixtureChirho.jsonChirho([
                "schema_version_chirho": 1, "recipe_id_chirho": "greek-word-ipa-guide-v1-chirho",
                "part_index_chirho": indexChirho, "entries_chirho": entriesChirho
            ])
            partsChirho[nameChirho] = bytesChirho
            pinsChirho.append(["part_index_chirho": indexChirho, "file_chirho": nameChirho,
                               "sha256_chirho": DigestChirho.sha256HexChirho(bytesChirho),
                               "bytes_chirho": bytesChirho.count, "count_chirho": entriesChirho.count])
        }
        return (try FixtureChirho.jsonChirho([
            "schema_version_chirho": 1, "recipe_id_chirho": "greek-word-ipa-guide-v1-chirho",
            "kind_chirho": "teaching_guide", "language_chirho": "grc",
            "profiles_chirho": ["modern", "modern_aspirates", "erasmian"],
            "key_algorithm_chirho": "sha256-utf8-exact-chirho",
            "shard_algorithm_chirho": "first-sha256-byte-and-7-chirho",
            "part_count_chirho": 8, "form_count_chirho": 1,
            "input_sha256_chirho": DigestChirho.sha256HexChirho("synthetic-test-only-chirho"),
            "parts_chirho": pinsChirho
        ]), partsChirho)
    }

    private func guideChirho(_ manifestChirho: Data, _ partsChirho: [String: Data]) throws -> GreekIpaGuideChirho {
        try GreekIpaGuideChirho(manifestDataChirho: manifestChirho) { nameChirho in
            guard let dataChirho = partsChirho[nameChirho] else { throw RemoteErrorChirho.invalidChirho("missing fixture part") }
            return dataChirho
        }
    }

    @Test func greekUsesExactRawTextAndOnlyTheChosenProfileChirho() throws {
        let (manifestChirho, partsChirho) = try greekFixtureChirho()
        let guideChirho = try guideChirho(manifestChirho, partsChirho)
        #expect(guideChirho.valueChirho("ὁ", .modernChirho) == "o")
        #expect(guideChirho.valueChirho("ὁ", .modernAspiratesChirho) == "ho")
        #expect(guideChirho.valueChirho("ὁ", .erasmianChirho) == "ho")
        let decomposedChirho = "ὁ".decomposedStringWithCanonicalMapping
        #expect(decomposedChirho == "ὁ")
        #expect(!ExactTextChirho.equalChirho(decomposedChirho, "ὁ"))
        for textChirho in [decomposedChirho, "Ὁ", " ὁ", "ὁ ", String(repeating: "α", count: 1025)] {
            #expect(guideChirho.valueChirho(textChirho, .modernAspiratesChirho) == nil)
        }
        let (nullManifestChirho, nullPartsChirho) = try greekFixtureChirho(nullModernChirho: true)
        #expect(try self.guideChirho(nullManifestChirho, nullPartsChirho).valueChirho("ὁ", .modernChirho) == nil)
    }

    @Test func corruptedMissingForeignAndOversizedPartsAreRefusedBeforeUseChirho() throws {
        let (manifestChirho, partsChirho) = try greekFixtureChirho()
        let nameChirho = "greek-ipa-part-00-chirho.json"
        var changedChirho = partsChirho
        changedChirho[nameChirho] = Data("{}".utf8)
        #expect(throws: (any Error).self) { try guideChirho(manifestChirho, changedChirho) }
        changedChirho = partsChirho
        changedChirho.removeValue(forKey: nameChirho)
        #expect(throws: (any Error).self) { try guideChirho(manifestChirho, changedChirho) }
        var valueChirho = try #require(JSONSerialization.jsonObject(with: manifestChirho) as? [String: Any])
        var pinsChirho = try #require(valueChirho["parts_chirho"] as? [[String: Any]])
        pinsChirho[0]["file_chirho"] = "../foreign-chirho.json"
        valueChirho["parts_chirho"] = pinsChirho
        var readsChirho = 0
        #expect(throws: (any Error).self) {
            try GreekIpaGuideChirho(manifestDataChirho: FixtureChirho.jsonChirho(valueChirho)) { _ in
                readsChirho += 1
                return Data()
            }
        }
        #expect(readsChirho == 0)
        #expect(throws: (any Error).self) {
            try guideChirho(Data(repeating: 32, count: 131_073), partsChirho)
        }
    }

    @Test func repinnedChangedSourceWrongShardAndRecipeStillFailChirho() throws {
        let (manifestChirho, partsChirho) = try greekFixtureChirho()
        let keyChirho = DigestChirho.sha256HexChirho("ὁ")
        let shardChirho = Int(try #require(UInt8(keyChirho.prefix(2), radix: 16)) & 7)
        let nameChirho = String(format: "greek-ipa-part-%02d-chirho.json", shardChirho)
        for defectChirho in ["source", "shard", "recipe", "profile"] {
            let originalChirho = try #require(partsChirho[nameChirho])
            var objectChirho = try #require(JSONSerialization.jsonObject(with: originalChirho) as? [String: Any])
            var entriesChirho = try #require(objectChirho["entries_chirho"] as? [String: [String: Any]])
            if defectChirho == "source" { entriesChirho[keyChirho]?["text_chirho"] = "Ὁ" }
            if defectChirho == "profile" { entriesChirho[keyChirho]?["ipa_chirho"] = ["modern": "o"] }
            objectChirho["entries_chirho"] = entriesChirho
            if defectChirho == "shard" { objectChirho["part_index_chirho"] = (shardChirho + 1) & 7 }
            if defectChirho == "recipe" { objectChirho["recipe_id_chirho"] = "foreign-chirho" }
            let dataChirho = try FixtureChirho.jsonChirho(objectChirho)
            var manifestObjectChirho = try #require(JSONSerialization.jsonObject(with: manifestChirho) as? [String: Any])
            var pinsChirho = try #require(manifestObjectChirho["parts_chirho"] as? [[String: Any]])
            pinsChirho[shardChirho]["sha256_chirho"] = DigestChirho.sha256HexChirho(dataChirho)
            pinsChirho[shardChirho]["bytes_chirho"] = dataChirho.count
            manifestObjectChirho["parts_chirho"] = pinsChirho
            var changedChirho = partsChirho
            changedChirho[nameChirho] = dataChirho
            #expect(throws: (any Error).self) { try guideChirho(FixtureChirho.jsonChirho(manifestObjectChirho), changedChirho) }
        }
    }

    @Test func hebrewDisplaysOnlyItsAcceptedSelectedWordRecordingChirho() async throws {
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("prov-26-1-chirho", "Prov", 26, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        let clipsChirho = try DecodingChirho.decodeChirho([ClipChirho].self, FixtureChirho.dataChirho("prov-26-1-audio-chirho"))
        let audioChirho = AudioRulesChirho.selectChirho(clipsChirho, verseChirho)
        for wordChirho in verseChirho.wordsChirho {
            #expect(WordIpaChirho.valueChirho(wordChirho, verseChirho: verseChirho, audioChirho: audioChirho,
                renditionChirho: .modernChirho) == audioChirho.wordClipsChirho[wordChirho.idChirho]?.ipaChirho)
        }
        let wordChirho = try #require(verseChirho.wordsChirho.first)
        let clipChirho = try #require(audioChirho.wordClipsChirho[wordChirho.idChirho])
        #expect(WordIpaChirho.valueChirho(wordChirho, verseChirho: verseChirho, audioChirho: .emptyChirho,
            renditionChirho: .modernChirho) == nil)
        let normalizedChirho = clipChirho.textChirho.decomposedStringWithCanonicalMapping
        #expect(normalizedChirho == clipChirho.textChirho)
        #expect(!ExactTextChirho.equalChirho(normalizedChirho, clipChirho.textChirho))
        for (fieldChirho, replacementChirho) in [
            ("textChirho", normalizedChirho), ("tokenIdChirho", "foreign-chirho"),
            ("lessonIdChirho", "Prov.26.2"), ("canonicalSha256Chirho", String(repeating: "0", count: 64)),
            ("pronunciationChirho", "modern_greek")
        ] {
            var objectChirho = try #require(JSONSerialization.jsonObject(with: JSONEncoder().encode(clipChirho)) as? [String: Any])
            objectChirho[fieldChirho] = replacementChirho
            let changedChirho = try JSONDecoder().decode(ClipChirho.self, from: FixtureChirho.jsonChirho(objectChirho))
            let wrongChirho = VerseAudioChirho(wordClipsChirho: [wordChirho.idChirho: changedChirho], verseClipChirho: nil)
            #expect(WordIpaChirho.valueChirho(wordChirho, verseChirho: verseChirho, audioChirho: wrongChirho,
                renditionChirho: .modernChirho) == nil)
        }
        var sourceChirho = try #require(FixtureChirho.objectChirho("prov-26-1-chirho") as? [String: Any])
        var tokensChirho = try #require(sourceChirho["tokens_chirho"] as? [[String: Any]])
        tokensChirho[0]["source_language_chirho"] = "arc"
        sourceChirho["tokens_chirho"] = tokensChirho
        let aramaicChirho = VerseDisplayChirho(.hebrewChirho(try DecodingChirho.decodeChirho(
            HebrewLessonChirho.self, FixtureChirho.jsonChirho(sourceChirho))))
        #expect(aramaicChirho.wordsChirho[0].isAramaicChirho)
        #expect(WordIpaChirho.valueChirho(aramaicChirho.wordsChirho[0], verseChirho: aramaicChirho,
            audioChirho: audioChirho, renditionChirho: .modernChirho) == nil)
    }

    /// Optional full generated fixture, before assets land; no synthesis, normalization or network.
    @Test(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_GREEK_IPA_FIXTURE_CHIRHO"] != nil))
    func exportedGuideLoadsEveryPartAndExactRowChirho() async throws {
        let homeChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_GREEK_IPA_FIXTURE_CHIRHO"])
        let rootChirho = URL(fileURLWithPath: homeChirho, isDirectory: true)
        let manifestChirho = try Data(contentsOf: rootChirho.appendingPathComponent("greek-ipa-manifest-chirho.json"))
        let guideChirho = try GreekIpaGuideChirho(manifestDataChirho: manifestChirho) { nameChirho in
            try Data(contentsOf: rootChirho.appendingPathComponent(nameChirho))
        }
        var rowsChirho = 0
        for indexChirho in 0..<8 {
            let dataChirho = try Data(contentsOf: rootChirho.appendingPathComponent(String(format: "greek-ipa-part-%02d-chirho.json", indexChirho)))
            let objectChirho = try #require(JSONSerialization.jsonObject(with: dataChirho) as? [String: Any])
            let entriesChirho = try #require(objectChirho["entries_chirho"] as? [String: [String: Any]])
            for rowChirho in entriesChirho.values {
                let textChirho = try #require(rowChirho["text_chirho"] as? String)
                let ipaChirho = try #require(rowChirho["ipa_chirho"] as? [String: Any])
                for profileChirho in GreekRenditionChirho.allCases {
                    let expectedChirho = ipaChirho[profileChirho.rawValue] as? String
                    #expect(guideChirho.valueChirho(textChirho, profileChirho) == expectedChirho)
                }
                rowsChirho += 1
            }
        }
        #expect(rowsChirho == 19_448)
        let (lessonChirho, _) = try await FixtureChirho.lessonChirho("john-1-1-chirho", "John", 1, 1)
        let verseChirho = VerseDisplayChirho(lessonChirho)
        for wordChirho in verseChirho.wordsChirho {
            for profileChirho in GreekRenditionChirho.allCases {
                let expectedChirho = try #require(guideChirho.valueChirho(wordChirho.spokenTextChirho, profileChirho))
                #expect(WordIpaChirho.valueChirho(wordChirho, verseChirho: verseChirho,
                    audioChirho: .emptyChirho, renditionChirho: profileChirho) == expectedChirho,
                    "the actual SwiftPM resource bundle must resolve the exact guide without any recording")
            }
        }
    }
}

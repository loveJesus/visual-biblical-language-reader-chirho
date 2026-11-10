// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import Foundation
import Testing
@testable import HinnehCoreChirho

@Suite struct VerseVideoTestsChirho {
    @Test func videoRequiresExactSceneVerseAndReadingButNeverRemovesWordPicturesChirho() async throws {
        let (verseChirho, _, originalChirho) = try await MediaTestsChirho().proverbsChirho()
        let beforeChirho = MediaRulesChirho.selectChirho(originalChirho, verseChirho)
        let sceneChirho = try #require(beforeChirho.sceneChirho)
        let clipObjectChirho = try HumanReadingTestsChirho().humanObjectChirho()
        let clipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(clipObjectChirho))
        let sourceChirho = try #require(clipObjectChirho["reading_source_chirho"] as? [String: Any])
        let shaChirho = String(repeating: "d", count: 64)
        let objectChirho: [String: Any] = [
            "lesson_id_chirho": verseChirho.idChirho,
            "canonical_sha256_chirho": DigestChirho.sha256HexChirho(verseChirho.canonicalTextChirho),
            "scene_sha256_chirho": sceneChirho.sha256Chirho,
            "asset_path_chirho": "/video-chirho/sha256-chirho/\(shaChirho)-chirho.mp4",
            "sha256_chirho": shaChirho, "bytes_chirho": 1024, "duration_chirho": clipChirho.durationChirho,
            "width_chirho": 1108, "height_chirho": 832, "reading_language_chirho": "he",
            "embedded_reading_chirho": sourceChirho, "review_chirho": "pending",
            "attribution_chirho": HumanReadingSourceChirho.beeriAttributionChirho,
            "license_chirho": "CC BY-SA 3.0", "license_url_chirho": HumanReadingSourceChirho.beeriLicenseUrlChirho
        ]
        let videoChirho = try DecodingChirho.decodeChirho(VerseVideoChirho.self, FixtureChirho.jsonChirho(objectChirho))
        var mediaChirho = originalChirho
        mediaChirho.videosChirho = [videoChirho]
        let selectedChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
        #expect(selectedChirho.videoChirho == videoChirho)
        #expect(selectedChirho.picturesChirho == beforeChirho.picturesChirho)
        #expect(videoChirho.carriesChirho(clipChirho))
        var silentChirho = objectChirho
        silentChirho["reading_language_chirho"] = NSNull()
        silentChirho["embedded_reading_chirho"] = NSNull()
        silentChirho["license_chirho"] = "CC0"
        silentChirho["license_url_chirho"] = "https://creativecommons.org/publicdomain/zero/1.0/"
        let silentVideoChirho = try DecodingChirho.decodeChirho(VerseVideoChirho.self, FixtureChirho.jsonChirho(silentChirho))
        #expect(silentVideoChirho.validChirho(verseChirho, sceneChirho))
        for missingKeyChirho in ["reading_language_chirho", "embedded_reading_chirho"] {
            var missingChirho = silentChirho
            missingChirho.removeValue(forKey: missingKeyChirho)
            mediaChirho.videosChirho = [try DecodingChirho.decodeChirho(VerseVideoChirho.self, FixtureChirho.jsonChirho(missingChirho))]
            let refusedChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
            #expect(refusedChirho.videoChirho == nil)
            #expect(refusedChirho.sceneChirho == beforeChirho.sceneChirho)
            #expect(refusedChirho.picturesChirho == beforeChirho.picturesChirho)
        }
        mediaChirho.videosChirho = [silentVideoChirho, silentVideoChirho]
        let ambiguousChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
        #expect(ambiguousChirho.videoChirho == nil)
        #expect(ambiguousChirho.picturesChirho == beforeChirho.picturesChirho)

        for (keyChirho, valueChirho) in [
            ("scene_sha256_chirho", String(repeating: "e", count: 64) as Any),
            ("canonical_sha256_chirho", String(repeating: "e", count: 64) as Any),
            ("license_url_chirho", "https://example.com/" as Any),
            ("bytes_chirho", 16 * 1024 * 1024 + 1 as Any), ("duration_chirho", 121 as Any)
        ] {
            var changedChirho = objectChirho
            changedChirho[keyChirho] = valueChirho
            mediaChirho.videosChirho = [try DecodingChirho.decodeChirho(VerseVideoChirho.self, FixtureChirho.jsonChirho(changedChirho))]
            let refusedChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
            #expect(refusedChirho.videoChirho == nil)
            #expect(refusedChirho.sceneChirho == beforeChirho.sceneChirho)
            #expect(refusedChirho.picturesChirho == beforeChirho.picturesChirho)
        }
    }

    @Test func onlyBoundedContentAddressedVideosResolveChirho() {
        let pathChirho = "/video-chirho/sha256-chirho/" + String(repeating: "a", count: 64) + "-chirho.mp4"
        #expect(OriginChirho.urlChirho(pathChirho, .videoClipChirho) != nil)
        #expect(OriginChirho.urlChirho(pathChirho + "?token=unexpected", .videoClipChirho) == nil)
        #expect(OriginChirho.urlChirho(pathChirho.replacingOccurrences(of: "sha256-chirho", with: ".."), .videoClipChirho) == nil)
        #expect(ResourceKindChirho.videoClipChirho.limitChirho == 16 * 1024 * 1024)
    }
}


@Suite struct SyntheticVerseVideoTestsChirho {
    func fixtureChirho() throws -> (VerseDisplayChirho, MediaChapterChirho, [[String: Any]], [String: Any]) {
        let objectChirho = try #require(try FixtureChirho.objectChirho("synthetic-verse-video-chirho") as? [String: Any])
        let lessonChirho = try DecodingChirho.decodeChirho(GreekLessonChirho.self, FixtureChirho.jsonChirho(try #require(objectChirho["verse_chirho"])))
        let mediaChirho = try DecodingChirho.decodeChirho(MediaChapterChirho.self, FixtureChirho.jsonChirho(try #require(objectChirho["media_chirho"])))
        let clipsChirho = try #require(objectChirho["clips_chirho"] as? [[String: Any]])
        let wholeChirho = try #require(clipsChirho.first { $0["token_id_chirho"] is NSNull })
        return (VerseDisplayChirho(.greekChirho(lessonChirho)), mediaChirho, clipsChirho, wholeChirho)
    }

    func videoObjectChirho(_ verseChirho: VerseDisplayChirho, _ sceneChirho: SceneRecordChirho,
                           _ clipChirho: [String: Any]) -> [String: Any] {
        let shaChirho = String(repeating: "d", count: 64)
        return [
            "lesson_id_chirho": verseChirho.idChirho,
            "canonical_sha256_chirho": DigestChirho.sha256HexChirho(verseChirho.canonicalTextChirho),
            "scene_sha256_chirho": sceneChirho.sha256Chirho,
            "asset_path_chirho": "/video-chirho/sha256-chirho/\(shaChirho)-chirho.mp4",
            "sha256_chirho": shaChirho, "bytes_chirho": 1024,
            "duration_chirho": clipChirho["duration_chirho"] ?? NSNull(),
            "width_chirho": 1108, "height_chirho": 832,
            "reading_language_chirho": "el", "embedded_reading_chirho": NSNull(),
            "embedded_clip_chirho": Dictionary(uniqueKeysWithValues: ["sha256_chirho", "bytes_chirho", "duration_chirho", "recipe_id_chirho", "pronunciation_chirho"].map { ($0, clipChirho[$0] ?? NSNull()) }),
            "review_chirho": "pending", "attribution_chirho": "Synthetic Greek reading; Chatterbox Multilingual V3 built-in voice",
            "license_chirho": "CC BY 4.0", "license_url_chirho": "https://creativecommons.org/licenses/by/4.0/"
        ]
    }

    func decodeVideoChirho(_ objectChirho: [String: Any]) throws -> VerseVideoChirho {
        try DecodingChirho.decodeChirho(VerseVideoChirho.self, FixtureChirho.jsonChirho(objectChirho))
    }

    @Test func syntheticGreekRequiresTheExactAdmittedRenditionSelectedWholeVerseChirho() throws {
        let (verseChirho, originalChirho, rawClipsChirho, wholeChirho) = try fixtureChirho()
        let beforeChirho = MediaRulesChirho.selectChirho(originalChirho, verseChirho)
        let sceneChirho = try #require(beforeChirho.sceneChirho)
        #expect(!beforeChirho.picturesChirho.isEmpty)
        let clipsChirho = try rawClipsChirho.map { try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho($0)) }
        let selectedChirho = AudioRulesChirho.selectChirho(clipsChirho, verseChirho, .modernChirho)
        let clipChirho = try #require(selectedChirho.verseClipChirho)
        let videoChirho = try decodeVideoChirho(videoObjectChirho(verseChirho, sceneChirho, wholeChirho))
        #expect(videoChirho.validChirho(verseChirho, sceneChirho))
        #expect(videoChirho.carriesChirho(clipChirho))
        #expect(videoChirho.matchesSelectedReadingChirho(clipChirho))
        #expect(!videoChirho.matchesSelectedReadingChirho(nil), "No admitted selected verse means no synthetic video")
        #expect(GreekRenditionChirho.hasRoughBreathingChirho(verseChirho.canonicalTextChirho))
        for renditionChirho in [GreekRenditionChirho.modernAspiratesChirho, .erasmianChirho] {
            let changedChirho = AudioRulesChirho.selectChirho(clipsChirho, verseChirho, renditionChirho)
            #expect(changedChirho.verseClipChirho == nil)
            #expect(!videoChirho.matchesSelectedReadingChirho(changedChirho.verseClipChirho))
        }
        var mediaChirho = originalChirho
        mediaChirho.videosChirho = [videoChirho]
        let afterChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
        #expect(afterChirho.videoChirho == videoChirho)
        #expect(afterChirho.sceneChirho == beforeChirho.sceneChirho)
        #expect(afterChirho.picturesChirho == beforeChirho.picturesChirho)
        let roundTripChirho = try DecodingChirho.decodeChirho(VerseVideoChirho.self, JSONEncoder().encode(videoChirho))
        #expect(roundTripChirho == videoChirho)
    }

    @Test func wordSharingTheSameMp3AndOffsetWindowsNeverUnlockSyntheticVideoChirho() throws {
        let (verseChirho, mediaChirho, _, wholeChirho) = try fixtureChirho()
        let sceneChirho = try #require(MediaRulesChirho.selectChirho(mediaChirho, verseChirho).sceneChirho)
        let videoChirho = try decodeVideoChirho(videoObjectChirho(verseChirho, sceneChirho, wholeChirho))
        let wordChirho = try #require(verseChirho.wordsChirho.first)
        var sharedChirho = wholeChirho
        sharedChirho["token_id_chirho"] = wordChirho.idChirho
        sharedChirho["text_chirho"] = wordChirho.spokenTextChirho
        let wordClipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(sharedChirho))
        let admittedChirho = AudioRulesChirho.selectChirho([wordClipChirho], verseChirho, .modernChirho)
        #expect(admittedChirho.wordClipsChirho[wordChirho.idChirho] != nil)
        #expect(admittedChirho.verseClipChirho == nil)
        #expect(!videoChirho.carriesChirho(wordClipChirho), "A matching MP3 hash is insufficient for a word clip")
        var offsetChirho = wholeChirho
        offsetChirho["start_offset_chirho"] = 0.0
        offsetChirho["end_offset_chirho"] = wholeChirho["duration_chirho"]
        let windowChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(offsetChirho))
        #expect(AudioRulesChirho.validShapeChirho(windowChirho, greekChirho: true))
        #expect(!videoChirho.carriesChirho(windowChirho), "Even a full-length offset declaration is not this whole-file identity")
    }

    @Test func rawMissingTokenAndExplicitNullClaimsCannotUnlockSyntheticVideoChirho() throws {
        let (verseChirho, mediaChirho, _, wholeChirho) = try fixtureChirho()
        let sceneChirho = try #require(MediaRulesChirho.selectChirho(mediaChirho, verseChirho).sceneChirho)
        let videoChirho = try decodeVideoChirho(videoObjectChirho(verseChirho, sceneChirho, wholeChirho))
        let originalChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(wholeChirho))
        #expect(originalChirho.hasExplicitWholeFileIdentityChirho)
        var missingTokenChirho = wholeChirho
        missingTokenChirho.removeValue(forKey: "token_id_chirho")
        var changedShapesChirho = [missingTokenChirho]
        for fieldChirho in ["reading_source_chirho", "start_offset_chirho", "end_offset_chirho"] {
            var changedChirho = wholeChirho
            changedChirho[fieldChirho] = NSNull()
            changedShapesChirho.append(changedChirho)
        }
        for changedChirho in changedShapesChirho {
            let clipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(changedChirho))
            // This narrow flag must not alter the preexisting audio-admission rules.
            #expect(AudioRulesChirho.selectChirho([clipChirho], verseChirho, .modernChirho).verseClipChirho != nil)
            #expect(!clipChirho.hasExplicitWholeFileIdentityChirho)
            #expect(!videoChirho.carriesChirho(clipChirho))
        }
        let encodedChirho = try #require(try JSONSerialization.jsonObject(with: JSONEncoder().encode(originalChirho)) as? [String: Any])
        #expect(encodedChirho["hasExplicitWholeFileIdentityChirho"] == nil, "Decoder-only state never changes the wire keys")
    }

    @Test func changedSelectedIdentityOrAdmissionNeverUsesTheEmbeddedTrackChirho() throws {
        let (verseChirho, mediaChirho, _, wholeChirho) = try fixtureChirho()
        let sceneChirho = try #require(MediaRulesChirho.selectChirho(mediaChirho, verseChirho).sceneChirho)
        let videoChirho = try decodeVideoChirho(videoObjectChirho(verseChirho, sceneChirho, wholeChirho))
        let fieldsChirho: [(String, Any)] = [
            ("sha256_chirho", String(repeating: "e", count: 64)),
            ("asset_path_chirho", "/audio-chirho/sha256-chirho/" + String(repeating: "e", count: 64) + "-chirho.mp3"),
            ("bytes_chirho", (wholeChirho["bytes_chirho"] as? Int ?? 0) + 1),
            ("duration_chirho", (wholeChirho["duration_chirho"] as? Double ?? 0) + 0.01),
            ("recipe_id_chirho", "other-valid-recipe-chirho"),
            ("pronunciation_chirho", "erasmian_greek"), ("language_chirho", "he"),
            ("lesson_id_chirho", "Matt.1.2"),
            ("canonical_sha256_chirho", String(repeating: "e", count: 64)),
            ("review_chirho", "rejected"), ("voice_name_chirho", "")
        ]
        for (fieldChirho, valueChirho) in fieldsChirho {
            var changedChirho = wholeChirho
            changedChirho[fieldChirho] = valueChirho
            let clipChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(changedChirho))
            #expect(!videoChirho.carriesChirho(clipChirho), "Changed \(fieldChirho) cannot unlock video")
        }
        var sourceChangedChirho = wholeChirho
        sourceChangedChirho["text_chirho"] = "other source text"
        let unadmittedChirho = try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(sourceChangedChirho))
        let refusedChirho = AudioRulesChirho.selectChirho([unadmittedChirho], verseChirho, .modernChirho)
        #expect(refusedChirho.verseClipChirho == nil)
        #expect(!videoChirho.matchesSelectedReadingChirho(refusedChirho.verseClipChirho))
    }

    @Test func malformedMixedAndUnlicensedSyntheticClaimsPreserveTheStillChirho() throws {
        let (verseChirho, originalChirho, _, wholeChirho) = try fixtureChirho()
        let beforeChirho = MediaRulesChirho.selectChirho(originalChirho, verseChirho)
        let sceneChirho = try #require(beforeChirho.sceneChirho)
        let objectChirho = videoObjectChirho(verseChirho, sceneChirho, wholeChirho)
        var missingReadingKeyChirho = objectChirho
        missingReadingKeyChirho.removeValue(forKey: "embedded_reading_chirho")
        var mutationsChirho: [[String: Any]] = [missingReadingKeyChirho]
        for (fieldChirho, valueChirho) in [
            ("reading_language_chirho", "he" as Any), ("license_chirho", "CC0" as Any),
            ("license_url_chirho", "https://example.com/" as Any), ("embedded_clip_chirho", true as Any),
            ("embedded_reading_chirho", try #require(try HumanReadingTestsChirho().humanObjectChirho()["reading_source_chirho"]) as Any)
        ] {
            var changedChirho = objectChirho
            changedChirho[fieldChirho] = valueChirho
            mutationsChirho.append(changedChirho)
        }
        for (fieldChirho, valueChirho) in [
            ("bytes_chirho", 4_000_001 as Any), ("duration_chirho", 121 as Any),
            ("recipe_id_chirho", "bad recipe" as Any), ("pronunciation_chirho", "unknown" as Any),
            ("sha256_chirho", "6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e" as Any)
        ] {
            var descriptorChirho = try #require(objectChirho["embedded_clip_chirho"] as? [String: Any])
            descriptorChirho[fieldChirho] = valueChirho
            var changedChirho = objectChirho
            changedChirho["embedded_clip_chirho"] = descriptorChirho
            mutationsChirho.append(changedChirho)
        }
        for changedChirho in mutationsChirho {
            let videoChirho = try decodeVideoChirho(changedChirho)
            var mediaChirho = originalChirho
            mediaChirho.videosChirho = [videoChirho]
            let selectedChirho = MediaRulesChirho.selectChirho(mediaChirho, verseChirho)
            #expect(selectedChirho.videoChirho == nil)
            #expect(selectedChirho.sceneChirho == beforeChirho.sceneChirho)
            #expect(selectedChirho.picturesChirho == beforeChirho.picturesChirho)
        }
        var encodingChirho = objectChirho
        encodingChirho["duration_chirho"] = (wholeChirho["duration_chirho"] as? Double ?? 0) + 0.29
        #expect(try decodeVideoChirho(encodingChirho).validChirho(verseChirho, sceneChirho))
        encodingChirho["duration_chirho"] = (wholeChirho["duration_chirho"] as? Double ?? 0) + 0.31
        #expect(try !decodeVideoChirho(encodingChirho).validChirho(verseChirho, sceneChirho))
    }

    @Test(.enabled(if: ProcessInfo.processInfo.environment["HINNEH_LEGACY_VIDEO_FIXTURE_CHIRHO"] != nil))
    func all55ActualHumanVideosPreserveTheirReadingAndNoClipBehaviorChirho() throws {
        let pathChirho = try #require(ProcessInfo.processInfo.environment["HINNEH_LEGACY_VIDEO_FIXTURE_CHIRHO"])
        let rowsChirho = try #require(try JSONSerialization.jsonObject(with: Data(contentsOf: URL(filePath: pathChirho))) as? [[String: Any]])
        #expect(rowsChirho.count == 55)
        for (indexChirho, rowChirho) in rowsChirho.enumerated() {
            let lessonChirho = try DecodingChirho.decodeChirho(HebrewLessonChirho.self, FixtureChirho.jsonChirho(try #require(rowChirho["verse_chirho"])))
            let verseChirho = VerseDisplayChirho(.hebrewChirho(lessonChirho))
            let sceneChirho = try DecodingChirho.decodeChirho(SceneRecordChirho.self, FixtureChirho.jsonChirho(try #require(rowChirho["scene_chirho"])))
            let videoChirho = try decodeVideoChirho(try #require(rowChirho["video_chirho"] as? [String: Any]))
            let rawClipsChirho = try #require(rowChirho["clips_chirho"] as? [[String: Any]])
            let clipsChirho = try rawClipsChirho.map { try DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho($0)) }
            let selectedChirho = try #require(AudioRulesChirho.selectChirho(clipsChirho, verseChirho).verseClipChirho)
            #expect(videoChirho.embeddedClipChirho == nil)
            #expect(videoChirho.validChirho(verseChirho, sceneChirho))
            #expect(videoChirho.carriesChirho(selectedChirho))
            #expect(videoChirho.matchesSelectedReadingChirho(selectedChirho))
            #expect(videoChirho.matchesSelectedReadingChirho(nil), "Legacy embedded human reading remains self-contained")
            if indexChirho == 0 {
                var explicitNullChirho = try #require(rowChirho["video_chirho"] as? [String: Any])
                explicitNullChirho["embedded_clip_chirho"] = NSNull()
                #expect(try decodeVideoChirho(explicitNullChirho).validChirho(verseChirho, sceneChirho))
                explicitNullChirho["embedded_clip_chirho"] = true
                let malformedChirho = try decodeVideoChirho(explicitNullChirho)
                #expect(!malformedChirho.validChirho(verseChirho, sceneChirho))
                #expect(!malformedChirho.matchesSelectedReadingChirho(nil))
                #expect(throws: EncodingError.self) { try JSONEncoder().encode(malformedChirho) }
            }
            var wrongHumanChirho = try #require(rawClipsChirho.first { $0["id_chirho"] as? String == selectedChirho.lessonIdChirho || $0["sha256_chirho"] as? String == selectedChirho.sha256Chirho })
            var sourceChirho = try #require(wrongHumanChirho["reading_source_chirho"] as? [String: Any])
            sourceChirho["chapter_sha256_chirho"] = String(repeating: "e", count: 64)
            wrongHumanChirho["reading_source_chirho"] = sourceChirho
            #expect(try !videoChirho.carriesChirho(DecodingChirho.decodeChirho(ClipChirho.self, FixtureChirho.jsonChirho(wrongHumanChirho))))
        }
    }
}

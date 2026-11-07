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
